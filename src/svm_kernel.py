import numpy as np
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, f1_score


# Manual RBF kernel calculation
def rbf_kernel_manual(X1, X2, gamma=1.0):
    """
    Computes the RBF kernel matrix between X1 and X2.
    Optimized with numpy broadcasting.
    """
    # Convert to numpy if they are DataFrames
    x1 = X1.values if hasattr(X1, 'values') else X1
    x2 = X2.values if hasattr(X2, 'values') else X2
    
    # Ensure they are 2D
    if x1.ndim == 1: x1 = x1.reshape(1, -1)
    if x2.ndim == 1: x2 = x2.reshape(1, -1)
    
    # Compute squared Euclidean distance using broadcasting: 
    # ||a-b||^2 = ||a||^2 + ||b||^2 - 2*a.b
    dist_sq = (np.sum(x1**2, axis=1, keepdims=True) + 
               np.sum(x2**2, axis=1) - 
               2 * np.dot(x1, x2.T))
    
    return np.exp(-gamma * dist_sq)



def run_manual_svm(X_train, X_test, y_train, y_test):

    print("Computing Classical Kernel Matrix...")

    K_train = rbf_kernel_manual(X_train, X_train)
    K_test = rbf_kernel_manual(X_test, X_train)

    svm = SVC(kernel="precomputed")

    svm.fit(K_train, y_train)

    y_pred = svm.predict(K_test)

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    return acc, f1, svm