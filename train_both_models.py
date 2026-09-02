import os
import sys
import joblib
import numpy as np
from sklearn.metrics import accuracy_score

# Set global random seed for reproducibility
np.random.seed(42)

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_loader import load_data
from src.svm_kernel import run_manual_svm
from src.qsvm import run_manual_qsvm

# Configuration
ALL_FEATURE_ORDER = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
PREDICTION_FEATURES = ['cp', 'thalach', 'oldpeak', 'thal']
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")


def train_and_save_svm_model(X_train, X_test, y_train, y_test):
    print("Training Classical SVM model...")
    
    # Select only the 4 features used for prediction
    X_train_sel = X_train[PREDICTION_FEATURES]
    X_test_sel = X_test[PREDICTION_FEATURES]
    
    # Train SVM (manual RBF kernel implementation)
    svm_acc, svm_f1, svm_model = run_manual_svm(
        X_train_sel, X_test_sel, y_train, y_test
    )
    
    print(f"Manual SVM Accuracy: {svm_acc:.4f}")
    print(f"Manual SVM F1 Score: {svm_f1:.4f}")
    
    # Save model
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        
    svm_path = os.path.join(MODEL_DIR, "svm_model.joblib")
    joblib.dump(svm_model, svm_path)
    print(f"SVM model saved to {svm_path}")
    
    return svm_acc


def train_and_save_qsvm_model(X_train, X_test, y_train, y_test):
    print("Training Quantum QSVM model...")
    
    # Select only the 4 features used for prediction
    X_train_sel = X_train[PREDICTION_FEATURES].values
    X_test_sel = X_test[PREDICTION_FEATURES].values
    
    # Train QSVM (manual implementation)
    qsvm_acc, qsvm_f1, qsvm_model = run_manual_qsvm(
        X_train_sel, X_test_sel, y_train, y_test
    )
    
    print(f"QSVM Accuracy: {qsvm_acc:.4f}")
    print(f"QSVM F1 Score: {qsvm_f1:.4f}")
    
    # Save model
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        
    qsvc_path = os.path.join(MODEL_DIR, "qsvc_model.joblib")
    joblib.dump(qsvm_model, qsvc_path)
    print(f"QSVM model saved to {qsvc_path}")
    
    # Also save the training data used for the precomputed kernel
    # The API will need this to compute the kernel matrix for new samples
    train_data_path = os.path.join(MODEL_DIR, "train_features.joblib")
    joblib.dump(X_train_sel, train_data_path)
    print(f"Training features for kernel saved to {train_data_path}")
    
    return qsvm_acc



def main():
    print("=== Heart Disease Prediction - SVM & QSVM Training ===")
    print()
    
    # Load data
    print("Loading data...")
    X_train, X_test, y_train, y_test, scaler = load_data()
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Features: {X_train.shape[1]}")
    print()
    
    print(f"Using features: {PREDICTION_FEATURES}")
    print()
    
    # Train QSVM model (primary)
    qsvm_acc = train_and_save_qsvm_model(X_train, X_test, y_train, y_test)
    print()
    
    # Train SVM model (backup)
    svm_acc = train_and_save_svm_model(X_train, X_test, y_train, y_test)
    print()
    
    # Summary
    print("=== Training Summary ===")
    print(f"Quantum QSVM Accuracy: {qsvm_acc:.4f}")
    print(f"Classical SVM Accuracy: {svm_acc:.4f}")
    print()
    print("Models saved successfully!")
    print("- qsvc_model.joblib (QSVM - Primary)")
    print("- svm_model.joblib (SVM - Backup)")
    print()
    print("API will use QSVM as primary model with SVM as backup.")


if __name__ == "__main__":
    main()
