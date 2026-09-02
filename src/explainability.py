import shap 
import matplotlib.pyplot as plt
import numpy as np

def explain_model(model, X_train, X_test, feature_names=None):
    """
    Generate SHAP explanations for the model.
    
    Args:
        model: Trained model to explain
        X_train: Training data for SHAP explainer background
        X_test: Test data to explain
        feature_names: List of feature names
        
    Returns:
        dict: SHAP values and related data in JSON-serializable format
    """
    # Use TreeExplainer for tree-based models or KernelExplainer for others
    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test)
    except:
        # Fallback to KernelExplainer for models without tree structure
        explainer = shap.KernelExplainer(model.predict, X_train)
        shap_values = explainer.shap_values(X_test)
    
    # Save summary plot (existing functionality)
    import warnings
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", category=FutureWarning)
        shap.summary_plot(
            shap_values,
            X_test,
            feature_names=feature_names,
            show=False
        )
    plt.savefig("shap_summary.png", dpi=150, bbox_inches='tight')
    plt.close()
    print("SHAP explanation saved as shap_summary.png")
    
    # Return SHAP values in JSON-serializable format
    return {
        'shap_values': shap_values.tolist() if hasattr(shap_values, 'tolist') else shap_values,
        'feature_names': feature_names,
        'mean_shap_values': np.abs(shap_values).mean(axis=0).tolist() if hasattr(np.abs(shap_values).mean(axis=0), 'tolist') else np.abs(shap_values).mean(axis=0).tolist(),
    }


def calculate_single_prediction_shap(model, X_train, input_data, feature_names, scaler=None):
    """
    Calculate SHAP values for a single prediction.
    
    Args:
        model: Trained model (or a prediction function)
        X_train: Training data for background (numpy array or DataFrame)
        input_data: Single sample to explain (numpy array)
        feature_names: List of feature names
        scaler: Fitted scaler (optional)
        
    Returns:
        list: List of dicts with feature, shap_value, base_value, and actual_value
    """
    import warnings
    warnings.filterwarnings('ignore')
    
    # Extract prediction function
    if callable(model):
        predict_fn = model
    else:
        predict_fn = model.predict

    try:
        # Convert to numpy array if DataFrame
        if hasattr(X_train, 'values'):
            X_train_np = X_train.values
        else:
            X_train_np = X_train
        
        # Use a small background to speed up quantum simulations
        n_background = min(5, len(X_train_np))
        background = X_train_np[:n_background]
        
        # Create KernelExplainer
        explainer = shap.KernelExplainer(predict_fn, background)

        
        # Reduced nsamples for quantum simulation speed
        print(f"[SHAP] Calculating with nsamples=40")
        print(f"[SHAP] Input data shape: {input_data.shape}")
        print(f"[SHAP] Input values: {input_data}")
        
        shap_values = explainer.shap_values(input_data.reshape(1, -1), nsamples=40)
        
        print(f"[SHAP] Raw SHAP output type: {type(shap_values)}")
        if isinstance(shap_values, list):
            print(f"[SHAP] List length: {len(shap_values)}")
            for i, sv in enumerate(shap_values):
                print(f"[SHAP] Class {i} shape: {sv.shape}")
                print(f"[SHAP] Class {i} values: {sv[0] if len(sv.shape) > 1 else sv}")
        
        # Handle different SHAP value formats
        if isinstance(shap_values, list):
            # For binary classification, take the positive class values
            shap_vals = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
        else:
            shap_vals = shap_values[0] if len(shap_values.shape) > 1 else shap_values
        
        print(f"[SHAP] Extracted SHAP values: {shap_vals}")
        print(f"[SHAP] Number of features: {len(shap_vals)}")
        for i, feat_name in enumerate(feature_names):
            print(f"[SHAP] Feature {i} ({feat_name}): {shap_vals[i]:.6f}")
        
        # Get base value (expected value)
        base_value = explainer.expected_value
        if isinstance(base_value, list):
            base_value = base_value[1]  # Take positive class for binary
        
        # Build contribution list
        contributions = []
        for i, feat_name in enumerate(feature_names):
            contributions.append({
                'feature': feat_name,
                'shap_value': float(shap_vals[i]),
                'base_value': float(base_value),
                'actual_value': float(input_data[i])
            })
        
        # Sort by absolute SHAP value (most important first)
        contributions.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        return contributions
        
    except Exception as e:
        print(f"Error calculating SHAP values: {e}")
        import traceback
        traceback.print_exc()
        # Return empty contributions on error
        return [{'feature': feat, 'shap_value': 0.0, 'base_value': 0.0, 'actual_value': 0.0} for feat in feature_names]