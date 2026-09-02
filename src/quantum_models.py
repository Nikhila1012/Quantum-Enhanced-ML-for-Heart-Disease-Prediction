# import joblib
# import os
# from qiskit.circuit.library import ZZFeatureMap
# from qiskit_machine_learning.kernels import FidelityQuantumKernel
# from qiskit_machine_learning.algorithms import QSVC
# from sklearn.metrics import accuracy_score, f1_score

# MODEL_DIR = "saved_models"
# QSVC_PATH = os.path.join(MODEL_DIR,"qsvc_model.joblib")

# def build_qsvc(num_features):
#     feature_map = ZZFeatureMap(
#         feature_dimension=num_features,
#         reps=1,                 
#         entanglement="linear"
#     )

#     quantum_kernel = FidelityQuantumKernel(
#         feature_map=feature_map
#     )

#     return QSVC(
#         quantum_kernel=quantum_kernel,
#         probability=True
#     )


# def train_qsvc(X_train, y_train):
#     model = build_qsvc(X_train.shape[1])
#     model.fit(X_train, y_train)
#     return model


# def evaluate_qsvc(model, X_test, y_test):
#     y_pred = model.predict(X_test)
#     return accuracy_score(y_test, y_pred)


# def run_qsvc(X_train, X_test, y_train, y_test):
#     num_features = X_train.shape[1]

#     feature_map = ZZFeatureMap(
#         feature_dimension=num_features,
#         reps=1,
#         entanglement="linear"
#     )

#     kernel = FidelityQuantumKernel(feature_map=feature_map)

#     model = QSVC(quantum_kernel=kernel)
#     model.fit(X_train, y_train)

#     y_pred = model.predict(X_test)
#     acc = accuracy_score(y_test, y_pred)
#     f1 = f1_score(y_test, y_pred)

#     return acc, f1


# def save_qsvc(model):
#     os.makedirs(MODEL_DIR, exist_ok=True)
#     joblib.dump(model, QSVC_PATH)
#     print(f"QSVC saved → {QSVC_PATH}")


# def load_qsvc():
#     return joblib.load(QSVC_PATH)