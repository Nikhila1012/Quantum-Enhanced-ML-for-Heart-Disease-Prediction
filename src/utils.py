# import numpy as np
# from sklearn.decomposition import PCA
# from sklearn.preprocessing import MinMaxScaler

# def apply_pca(X_train, X_test, n_components):
#     """
#     Apply PCA and scale features to [-pi, pi] for quantum models
#     """

#     # PCA
#     pca = PCA(n_components=n_components)
#     X_train_pca = pca.fit_transform(X_train)
#     X_test_pca = pca.transform(X_test)

#     # Quantum-friendly scaling
#     scaler = MinMaxScaler(feature_range=(-np.pi, np.pi))
#     X_train_pca = scaler.fit_transform(X_train_pca)
#     X_test_pca = scaler.transform(X_test_pca)

#     return X_train_pca, X_test_pca, pca.explained_variance_ratio_

def print_section(title):
    print("\n" + "=" * 45)
    print(title)
    print("=" * 45)






