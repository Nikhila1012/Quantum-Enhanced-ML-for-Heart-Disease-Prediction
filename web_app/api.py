from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import sys
import os
import requests

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.data_loader import load_data
from src.explainability import calculate_single_prediction_shap
from src.qsvc_kernel import compute_quantum_kernel_matrix
from src.svm_kernel import rbf_kernel_manual


# Ollama configuration
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'phi:latest')

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # This should be the project root (Q_H)
print(f"BASE_DIR is: {BASE_DIR}")
WEB_DIR = os.path.join(BASE_DIR, 'web_app', 'react-app', 'dist')

app = Flask(__name__, static_folder=WEB_DIR, static_url_path='')
CORS(app)

# Load model and scaler
model = None  # Primary model (QSVM)
backup_model = None  # Backup model (SVM)
scaler = None
X_train = None  # Training data for SHAP explanations
X_train_kernel = None # Training features specifically for kernel computation


def load_model():
    global model, backup_model, scaler, X_train, X_train_kernel

    try:
        # Load primary model (QSVM) - quantum enhanced model
        primary_model_path = os.path.join(BASE_DIR, "saved_models", "qsvc_model.joblib")
        print(f"Attempting to load primary QSVM model from: {primary_model_path}")
        model = joblib.load(primary_model_path)
        
        # Load backup model (SVM) - classical model
        backup_model_path = os.path.join(BASE_DIR, "saved_models", "svm_model.joblib")
        print(f"Attempting to load backup SVM model from: {backup_model_path}")
        backup_model = joblib.load(backup_model_path)
        
        # Load training data for SHAP explanations
        X_train, _, _, _, scaler = load_data()
        
        # Load training features specifically for kernel computation (from train_both_models.py)
        train_features_path = os.path.join(BASE_DIR, "saved_models", "train_features.joblib")
        if os.path.exists(train_features_path):
            X_train_kernel = joblib.load(train_features_path)
            print("Kernel training features loaded successfully")
        
        print("Primary and backup models and scaler loaded successfully")
        print(f"Training data shape: {X_train.shape}")
    except Exception as e:
        print(f"Error loading models: {e}")
        import traceback
        traceback.print_exc()
        model = None
        backup_model = None
        scaler = None
        X_train = None
        X_train_kernel = None




# Serve frontend files (index + static assets)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # If requested file exists in the dist folder, serve it directly
    target = path or 'index.html'
    file_path = os.path.join(WEB_DIR, target)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(WEB_DIR, target)
    # For SPA routes, return index.html
    return send_from_directory(WEB_DIR, 'index.html')

# Feature order (all 13 features)
ALL_FEATURE_ORDER = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']

# Features used for prediction (4 features)
PREDICTION_FEATURES = ['cp', 'thalach', 'oldpeak', 'thal']

# Features available in the home page UI (10 features - excluding restecg, slope, ca)
HOME_PAGE_FEATURES = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'thalach', 'exang', 'oldpeak', 'thal']

# Feature display names
FEATURE_LABELS = {
    'age': 'Age', 'sex': 'Gender', 'cp': 'Chest Pain Type', 'trestbps': 'Blood Pressure',
    'chol': 'Cholesterol', 'fbs': 'Blood Sugar', 'restecg': 'Resting ECG',
    'thalach': 'Max Heart Rate', 'exang': 'Exercise Induced Angina', 'oldpeak': 'Heart Stress During Exercise',
    'slope': 'ST Slope', 'ca': 'Major Vessels', 'thal': 'Heart Blood Flow'
}

def qsvm_predict(X):
    """Wrapper for QSVM prediction that handles kernel computation"""
    K = compute_quantum_kernel_matrix(X, X_train_kernel)
    return model.predict(K)

def svm_predict(X):
    """Wrapper for SVM prediction that handles kernel computation"""
    K = rbf_kernel_manual(X, X_train_kernel)
    return backup_model.predict(K)

@app.route('/predict', methods=['POST'])
def predict():
    global model, scaler, X_train_kernel, backup_model
    if model is None or scaler is None or X_train_kernel is None:
        print("Models/features missing, attempting to load...")
        load_model()
        if model is None or scaler is None or X_train_kernel is None:
            status = {
                'model': 'loaded' if model is not None else 'missing',
                'scaler': 'loaded' if scaler is not None else 'missing',
                'X_train_kernel': 'loaded' if X_train_kernel is not None else 'missing'
            }
            return jsonify({'error': f'Model load failed. Status: {status}'}), 500
    
    try:
        data = request.json
        
        # Extract all 13 features (with robustness for missing ones)
        all_features = []
        for f in ALL_FEATURE_ORDER:
            if f in data:
                all_features.append(data[f])
            else:
                default_val = 0 if f in ['restecg', 'slope', 'ca'] else 0
                all_features.append(default_val)
                
        all_features_array = np.array([all_features])
        all_features_scaled = scaler.transform(all_features_array) * np.pi
        
        # Select prediction features
        feature_indices = {f: i for i, f in enumerate(ALL_FEATURE_ORDER)}
        selected_indices = [feature_indices[f] for f in PREDICTION_FEATURES]
        prediction_input = all_features_scaled[:, selected_indices]
        
        prediction = None
        probability = 0.5
        K_input = None
        raw_decision = 0
        
        # Try primary model (QSVM)
        try:
            print("Making QSVM prediction...")
            K_input = compute_quantum_kernel_matrix(prediction_input, X_train_kernel)
            raw_decision = float(model.decision_function(K_input)[0])
        except Exception as e:
            print(f"Primary QSVM failed: {e}")
            if backup_model is not None:
                print("Using backup SVM model...")
                K_input = rbf_kernel_manual(prediction_input, X_train_kernel)
                raw_decision = float(backup_model.decision_function(K_input)[0])
            else:
                raise e

        # Apply Clinical Biases for safety and better clinical alignment
        biased_decision = raw_decision
        
        # 1. Typical Angina (CP=1) bias (+0.5) - counteracts dataset bias
        if data.get('cp') == 1:
            biased_decision += 0.5
            print("Applied Clinical Bias for Typical Angina (+0.5)")
            
        # 2. Thalassemia (6=Fixed, 7=Reversible) bias (+0.4) - strong risk indicators
        if data.get('thal') in [6, 7]:
            biased_decision += 0.4
            print(f"Applied Clinical Bias for Thalassemia {data.get('thal')} (+0.4)")
            
        # 3. High ST Depression (oldpeak > 2.0) bias (+0.4) - indicates heart stress
        if data.get('oldpeak', 0) > 2.0:
            biased_decision += 0.4
            print(f"Applied Clinical Bias for High ST Depression (+0.4)")
            
        # Synchronize prediction and probability: Both now use biased_decision
        prediction = 1 if biased_decision > 0 else 0
        
        # Calculate probability using Temperature Scaling and Sigmoid
        try:
            from scipy.special import expit
            CONFIDENCE_TEMPERATURE = 2.0
            probability = float(expit(biased_decision / CONFIDENCE_TEMPERATURE))
        except Exception as prob_e:
            print(f"Probability calculation failed: {prob_e}")
            probability = 0.8 if prediction == 1 else 0.2
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability)
        })

    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Prediction error: {error_details}")
        return jsonify({
            'error': str(e),
            'details': error_details
        }), 400


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok', 
        'primary_model_loaded': model is not None,
        'backup_model_loaded': backup_model is not None,
        'models_status': {
            'primary': 'loaded' if model is not None else 'missing',
            'backup': 'loaded' if backup_model is not None else 'missing'
        }
    })

@app.route('/explain', methods=['POST'])
def explain():
    """Calculate SHAP values for a single prediction"""
    global model, scaler, X_train, X_train_kernel, backup_model
    if (model is None and backup_model is None) or scaler is None or X_train is None or X_train_kernel is None:
        print("Models/features missing, attempting to load...")
        load_model()
        if (model is None and backup_model is None) or scaler is None or X_train is None or X_train_kernel is None:
            return jsonify({'error': 'Model or training data not loaded. Check saved_models directory.'}), 500
    
    try:
        data = request.json
        
        # Consistent extraction of features
        all_features = []
        for f in ALL_FEATURE_ORDER:
            if f in data:
                all_features.append(data[f])
            else:
                default_val = 0 if f in ['restecg', 'slope', 'ca'] else 0
                all_features.append(default_val)
                
        all_features_array = np.array([all_features])
        all_features_scaled = scaler.transform(all_features_array) * np.pi
        
        # Select prediction features
        feature_indices = {f: i for i, f in enumerate(ALL_FEATURE_ORDER)}
        selected_indices = [feature_indices[f] for f in PREDICTION_FEATURES]
        prediction_input = all_features_scaled[0, selected_indices]
        
        # Choose the prediction function for SHAP (must be kernel-aware)
        if model is not None:
            predict_fn = qsvm_predict
        else:
            predict_fn = svm_predict
            
        print(f"Calculating SHAP for features: {PREDICTION_FEATURES}")
        shap_contributions = calculate_single_prediction_shap(
            predict_fn, 
            X_train[PREDICTION_FEATURES], 
            prediction_input,
            PREDICTION_FEATURES,
            scaler
        )
        
        # Map to format expected by frontend
        shap_dict = {contrib['feature']: contrib for contrib in shap_contributions}
        
        # Build final contributions list (including heuristic ones if needed by UI)
        all_contributions = []
        
        # 1. Real SHAP values for the 4 model features
        shap_scale_factor = 2.5
        for feat in PREDICTION_FEATURES:
            if feat in shap_dict:
                contrib = shap_dict[feat]
                raw_shap = float(contrib['shap_value'])
                scaled_shap = raw_shap * shap_scale_factor
                
                all_contributions.append({
                    'feature': feat,
                    'display_name': FEATURE_LABELS.get(feat, feat),
                    'contribution': scaled_shap,
                    'value': float(contrib['actual_value']),
                    'shap_value': raw_shap,
                    'base_value': float(contrib['base_value'])
                })
        
        # 2. Heuristic estimates for other features available in UI
        other_ui_features = [f for f in HOME_PAGE_FEATURES if f not in PREDICTION_FEATURES]
        for feat in other_ui_features:
            if feat in data:
                val = data[feat]
                contribution = calculate_heuristic_val(feat, val)
                all_contributions.append({
                    'feature': feat,
                    'display_name': FEATURE_LABELS.get(feat, feat),
                    'contribution': contribution,
                    'value': float(val),
                    'shap_value': contribution,
                    'base_value': 0.0
                })

        # Apply normalization/percentage logic
        total_abs_impact = sum(abs(c['contribution']) for c in all_contributions)
        if total_abs_impact > 0:
            for c in all_contributions:
                c['normalized_percentage'] = (abs(c['contribution']) / total_abs_impact) * 100
        else:
            for c in all_contributions:
                c['normalized_percentage'] = 100.0 / len(all_contributions) if all_contributions else 0

        # Sort by importance
        all_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
        
        return jsonify({
            'contributions': all_contributions,
            'success': True
        })
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

def calculate_heuristic_val(feature, value):
    """Simple heuristic for risk contribution of auxiliary features"""
    if feature == 'age':
        return 0.15 if value > 50 else -0.05
    if feature == 'sex':
        return 0.1 if value == 1 else -0.1
    if feature == 'trestbps':
        return 0.12 if value > 140 else -0.04
    if feature == 'chol':
        return 0.1 if value > 240 else -0.05
    if feature == 'fbs':
        return 0.08 if value == 1 else -0.02
    if feature == 'exang':
        return 0.12 if value == 1 else -0.08
    return 0.0

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        prediction = data.get('prediction')
        probability = data.get('probability')
        input_data = data.get('inputData', {})
        contributions = data.get('contributions', [])
        
        print(f"Received chat request: {user_message[:50]}...")
        
        # Build system prompt and context
        system_prompt = build_system_prompt()
        context = build_chat_context(prediction, probability, input_data, contributions)
        
        # Combine into full prompt
        full_prompt = f"{system_prompt}\n\n{context}\n\nUser: {user_message}\n\nAssistant:"
        
        # Call Ollama API
        try:
            response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 500
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('response', '').strip()
                print(f"Ollama response received: {ai_response[:50]}...")
                return jsonify({'response': ai_response})
            else:
                print(f"Ollama error: {response.status_code}")
                # Fallback response
                fallback = generate_fallback_response(user_message, prediction, probability, input_data)
                return jsonify({'response': fallback})
                
        except requests.exceptions.ConnectionError:
            print("Ollama connection error")
            fallback = generate_fallback_response(user_message, prediction, probability, input_data)
            return jsonify({'response': fallback + "\n\n(Note: Ollama is not running. Please start it with: ollama run phi)"})
        except Exception as e:
            print(f"Ollama request error: {e}")
            fallback = generate_fallback_response(user_message, prediction, probability, input_data)
            return jsonify({'response': fallback})
        
    except Exception as e:
        print(f"Chat error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def build_system_prompt():
    """Build the system prompt for the Heart Health AI Assistant"""
    return """You are a Heart Health AI Assistant.

CRITICAL INSTRUCTIONS:
1. You are NOT a medical doctor. Always remind users to consult healthcare professionals for medical decisions.
2. Only answer questions related to heart health, cardiovascular disease, predictions, SHAP values, and health precautions.
3. If asked about unrelated topics, politely redirect to heart health topics.
4. Provide accurate, helpful information about:
   - Explaining heart disease predictions and risk factors
   - Interpreting SHAP values and feature contributions
   - Heart health education and information
   - Lifestyle changes and precautions for heart health
   - Answering questions about cardiovascular health
5. Be empathetic, clear, and concise in your responses.
6. Always include a disclaimer that you are an AI assistant, not a medical doctor.

Remember: Your purpose is to help users understand their heart health data and provide general educational information."""

def build_chat_context(prediction, probability, input_data, contributions):
    """Build context about the prediction for the AI"""
    context = ""
    
    # Add prediction context if available
    if prediction is not None and probability is not None:
        risk_level = "High" if prediction == 1 else "Low"
        context += f"Current Prediction Context:\n"
        context += f"- Risk Level: {risk_level}\n"
        context += f"- Probability: {probability*100:.1f}%\n"
        
        if input_data:
            context += "- Key Patient Data:\n"
            key_features = ['age', 'cp', 'thalach', 'oldpeak', 'thal', 'chol']
            for feat in key_features:
                if feat in input_data:
                    context += f"  * {feat}: {input_data[feat]}\n"
        
        if contributions:
            context += "- Feature Contributions (SHAP values):\n"
            for contrib in contributions[:5]:
                direction = "increases" if contrib['contribution'] > 0 else "decreases"
                context += f"  * {contrib['feature']}: {direction} risk (value: {contrib['value']})\n"
        
        context += "\n"
    
    return context

def generate_fallback_response(user_message, prediction, probability, input_data):
    """Generate a fallback response when Ollama is unavailable"""
    message_lower = user_message.lower()
    
    disclaimer = "\n\nDisclaimer: I am an AI assistant, not a medical doctor. Please consult healthcare professionals for medical decisions."
    
    if 'explain' in message_lower and 'prediction' in message_lower:
        if prediction is not None:
            risk = "HIGH" if prediction == 1 else "LOW"
            return f"""Based on your health data analysis:

**Risk Level: {risk}**
**Probability: {probability*100:.1f}%**

This prediction is based on key factors including chest pain type, maximum heart rate, ST depression, and thalassemia results. The quantum-enhanced model has analyzed these features to determine your cardiovascular risk profile.

Please consult a healthcare professional for a comprehensive medical evaluation.{disclaimer}"""
        else:
            return f"Please make a prediction first by entering your health data on the Home page, then I can explain your results.{disclaimer}"
    
    elif 'shap' in message_lower or 'contribution' in message_lower:
        return f"""**SHAP Values Explanation:**

SHAP (SHapley Additive exPlanations) values show how each feature contributes to your prediction:

- **Positive values** (red bars) increase heart disease risk
- **Negative values** (green bars) decrease heart disease risk

Key factors typically include:
- Chest Pain Type (cp): Typical angina increases risk significantly
- Max Heart Rate (thalach): Lower values indicate higher risk
- ST Depression (oldpeak): Higher values suggest ischemia
- Thalassemia (thal): Fixed/reversible defects increase risk

The longer the bar, the more that feature influenced your prediction.{disclaimer}"""
    
    elif 'precaution' in message_lower or 'prevent' in message_lower:
        return f"""**Heart Disease Precautions:**

1. **Diet:**
   - Eat more fruits, vegetables, and whole grains
   - Reduce saturated fats and sodium
   - Limit processed foods and sugar

2. **Exercise:**
   - 150 minutes of moderate activity per week
   - Include both cardio and strength training
   - Stay active throughout the day

3. **Lifestyle:**
   - Quit smoking
   - Limit alcohol consumption
   - Manage stress through meditation/yoga
   - Maintain healthy sleep habits

4. **Medical:**
   - Regular health checkups
   - Monitor blood pressure and cholesterol
   - Take prescribed medications
   - Control diabetes if applicable{disclaimer}"""
    
    elif 'improve' in message_lower or 'better' in message_lower:
        return f"""**How to Improve Heart Health:**

**Immediate Actions:**
- Start walking 30 minutes daily
- Replace sugary drinks with water
- Add one serving of vegetables to each meal
- Practice deep breathing for stress relief

**Long-term Changes:**
- Gradually transition to Mediterranean diet
- Build consistent exercise routine
- Achieve and maintain healthy weight
- Develop strong social connections

**Monitor Progress:**
- Track blood pressure regularly
- Get annual cholesterol checks
- Note improvements in energy levels
- Celebrate small victories!

Remember: Small, consistent changes lead to significant health improvements over time.{disclaimer}"""
    
    else:
        return f"""I'm currently unable to connect to the AI service. However, I can help with these common topics:
- Type "Explain my prediction" for prediction details
- Type "What do the SHAP values mean?" for feature explanations  
- Type "Heart disease precautions" for prevention tips
- Type "How to improve heart disease?" for lifestyle advice

For medical emergencies, please contact your healthcare provider immediately.{disclaimer}"""

if __name__ == '__main__':
    load_model()
    app.run(debug=True, port=8000)
# Hot reload trigger

# ZZFeatureMap reload

# Performance optimization reload
