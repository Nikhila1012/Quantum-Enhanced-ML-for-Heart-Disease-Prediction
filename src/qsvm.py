from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, f1_score
from .qsvc_kernel import compute_quantum_kernel_matrix


def run_manual_qsvm(X_train, X_test, y_train, y_test):

    print("Computing Quantum Kernel Matrix...")

    K_train = compute_quantum_kernel_matrix(X_train, X_train)
    K_test = compute_quantum_kernel_matrix(X_test, X_train)

    svm = SVC(kernel="precomputed", C=10.0, random_state=42)

    svm.fit(K_train, y_train)

    y_pred = svm.predict(K_test)

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    return acc, f1, svm