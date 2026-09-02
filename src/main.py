import numpy as np
from src.data_loader import load_data
from src.classical_models import run_random_forest
from src.feature_selection import select_top_features

# Set global random seed for reproducibility
np.random.seed(42)

from src.svm_kernel import run_manual_svm
from src.qsvm import run_manual_qsvm

from src.vqc_model import run_manual_vqc
from src.ensemble_quantum import run_bagging_qsvc   # NEW IMPORT

from src.explainability import explain_model
from src.utils import print_section


def main():

    # Load dataset
    X_train, X_test, y_train, y_test, _ = load_data()


    # Classical SVM (Manual Kernel)
    print_section("Classical SVM (Manual RBF Kernel)")

    svm_acc, svm_f1, svm_model = run_manual_svm(
        X_train, X_test,
        y_train, y_test
    )

    print(f"Manual SVM Accuracy: {svm_acc:.4f}")
    print(f"Manual SVM F1 Score: {svm_f1:.4f}")


    # Random Forest
    print_section("Random Forest")

    rf_acc, rf_f1, rf_model = run_random_forest(
        X_train, X_test,
        y_train, y_test
    )

    print(f"Random Forest Accuracy: {rf_acc:.4f}")
    print(f"Random Forest F1 Score: {rf_f1:.4f}")


    # Feature Selection
    print_section("Feature Selection")

    # Use the 4 specific features that achieve >78% accuracy as requested
    selected_features = ['cp', 'thal', 'chol', 'oldpeak']
    X_train_q = X_train[selected_features]
    X_test_q = X_test[selected_features]
    
    print("Selected Features:", list(selected_features))

    X_train_q = X_train_q.values
    X_test_q = X_test_q.values

    # Quantum SVM (Manual Quantum Kernel)
    print_section("Quantum SVM (Manual Quantum Kernel)")

    qsvm_acc, qsvm_f1, qsvm_model = run_manual_qsvm(
        X_train_q, X_test_q,
        y_train, y_test
    )

    print(f"QSVM Accuracy: {qsvm_acc:.4f}")
    print(f"QSVM F1 Score: {qsvm_f1:.4f}")


    # Ensemble Quantum SVM (Bagging QSVC)
    print_section("Ensemble Quantum SVM (Bagging QSVC)")

    ensemble_acc, ensemble_f1 = run_bagging_qsvc(
        X_train_q,
        X_test_q,
        y_train,
        y_test,
        n_estimators=5
    )

    print(f"Ensemble QSVC Accuracy: {ensemble_acc:.4f}")
    print(f"Ensemble QSVC F1 Score: {ensemble_f1:.4f}")


    # Variational Quantum Classifier
    print_section("Variational Quantum Classifier (VQC)")

    vqc_acc, vqc_f1 = run_manual_vqc(
        X_train_q, X_test_q,
        y_train, y_test
    )

    print(f"VQC Accuracy: {vqc_acc:.4f}")
    print(f"VQC F1 Score: {vqc_f1:.4f}")


    # Explainability
    print_section("Explainability")

    explain_model(rf_model, X_train, X_test)


if __name__ == "__main__":
    main()