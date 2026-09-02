from qiskit import QuantumCircuit
import numpy as np

def encode_features(x):
    """
    High-expressivity structured encoding using Qiskit's ZZFeatureMap.
    Provides non-linear separation suitable for the QSVM.
    """
    from qiskit.circuit.library import ZZFeatureMap
    n = len(x)
    fm = ZZFeatureMap(feature_dimension=n, reps=2, entanglement='linear')
    qc = fm.assign_parameters(x)
    return qc