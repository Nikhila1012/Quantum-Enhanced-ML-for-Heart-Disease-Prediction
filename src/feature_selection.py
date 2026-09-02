import numpy as np
from sklearn.feature_selection import mutual_info_classif
from sklearn.feature_selection import RFE
from sklearn.svm import SVC


def select_top_features(X_train, X_test, y_train, k=4):

    # ---------- Step 1: Mutual Information ----------
    mi = mutual_info_classif(X_train, y_train, random_state=42)

    mi_indices = np.argsort(mi)[::-1]

    top_k = min(max(k, 12), X_train.shape[1]) # Allow at least k, or 12 for initial filter
    mi_indices = mi_indices[:top_k]

    X_train_mi = X_train.iloc[:, mi_indices]
    X_test_mi = X_test.iloc[:, mi_indices]


    # ---------- Step 2: RFE using Linear SVM ----------
    svm = SVC(kernel="linear", random_state=42)

    rfe = RFE(
        estimator=svm,
        n_features_to_select=k
    )

    rfe.fit(X_train_mi, y_train)

    selected_mask = rfe.support_

    X_train_selected = X_train_mi.iloc[:, selected_mask]
    X_test_selected = X_test_mi.iloc[:, selected_mask]

    selected_features = X_train_selected.columns

    return X_train_selected, X_test_selected, selected_features