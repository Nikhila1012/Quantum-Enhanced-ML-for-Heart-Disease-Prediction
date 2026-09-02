import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from scipy.optimize import minimize
from sklearn.metrics import accuracy_score, f1_score


# -----------------------------
# Feature Encoding Circuit
# -----------------------------
def feature_map(x):

    n = len(x)
    qc = QuantumCircuit(n)

    for i in range(n):
        qc.h(i)
        qc.ry(x[i], i)

    for i in range(n - 1):
        qc.cx(i, i + 1)

    return qc


# -----------------------------
# Variational Ansatz (2 Layers)
# -----------------------------
def variational_ansatz(params, n_qubits):

    qc = QuantumCircuit(n_qubits)

    p = 0

    # Layer 1
    for i in range(n_qubits):
        qc.ry(params[p], i)
        qc.rz(params[p + 1], i)
        p += 2

    for i in range(n_qubits - 1):
        qc.cx(i, i + 1)

    # Layer 2
    for i in range(n_qubits):
        qc.ry(params[p], i)
        qc.rz(params[p + 1], i)
        p += 2

    return qc


# -----------------------------
# Prediction from circuit
# -----------------------------
def predict_sample(x, params):

    n_qubits = len(x)

    qc = feature_map(x)
    qc.compose(variational_ansatz(params, n_qubits), inplace=True)

    state = Statevector.from_instruction(qc)

    probs = state.probabilities()

    # Probability of measuring qubit-0 = 1
    p1 = sum(p for i, p in enumerate(probs) if i % 2 == 1)

    return p1


# -----------------------------
# Cost function
# -----------------------------
def cost_function(params, X, y):

    preds = []

    for i in range(len(X)):
        p = predict_sample(X[i], params)
        preds.append(p)

    preds = np.array(preds)

    # Binary cross entropy
    eps = 1e-10
    loss = -np.mean(
        y * np.log(preds + eps) + (1 - y) * np.log(1 - preds + eps)
    )

    return loss


# -----------------------------
# Main VQC Function
# -----------------------------
def run_manual_vqc(X_train, X_test, y_train, y_test):

    print("Training VQC...")

    n_qubits = X_train.shape[1]

    # Number of parameters
    n_params = 4 * n_qubits

    # Random initialization
    init_params = np.random.uniform(0, 2 * np.pi, n_params)

    # Optimizer (COBYLA)
    result = minimize(
        cost_function,
        init_params,
        args=(X_train, y_train),
        method="COBYLA",
        options={"maxiter": 100}
    )

    trained_params = result.x

    # Predictions
    preds = []

    for i in range(len(X_test)):
        p = predict_sample(X_test[i], trained_params)
        preds.append(1 if p > 0.5 else 0)

    acc = accuracy_score(y_test, preds)
    f1 = f1_score(y_test, preds)

    return acc, f1