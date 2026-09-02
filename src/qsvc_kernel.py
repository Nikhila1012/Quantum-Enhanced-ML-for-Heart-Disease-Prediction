import numpy as np
from qiskit.quantum_info import Statevector
from .quantum_encoding import encode_features


def quantum_kernel(x1, x2):

    qc1 = encode_features(x1)
    qc2 = encode_features(x2)

    state1 = Statevector.from_instruction(qc1)
    state2 = Statevector.from_instruction(qc2)

    overlap = np.abs(state1.data.conj().dot(state2.data)) ** 2

    return overlap


# Cache for statevectors of the training set to avoid redundant expensive computations
_TRAIN_STATEVECTORS_CACHE = None
_TRAIN_FEATURES_CACHE_HASH = None

def compute_quantum_kernel_matrix(X1, X2):
    """
    Computes the quantum kernel matrix between two sets of data points.
    Optimized to pre-compute statevectors only once per unique point and cache the training set.
    """
    global _TRAIN_STATEVECTORS_CACHE, _TRAIN_FEATURES_CACHE_HASH
    
    # Pre-compute statevectors for X1
    statevectors1 = [Statevector.from_instruction(encode_features(x)) for x in X1]
    
    # Check if X2 is the training set and if it's cached
    x2_hash = hash(X2.tobytes()) if hasattr(X2, 'tobytes') else id(X2)
    
    if _TRAIN_FEATURES_CACHE_HASH == x2_hash and _TRAIN_STATEVECTORS_CACHE is not None:
        statevectors2 = _TRAIN_STATEVECTORS_CACHE
    else:
        statevectors2 = [Statevector.from_instruction(encode_features(x)) for x in X2]
        # Only cache if it's a large set (likely the training set)
        if len(X2) > 100:
            _TRAIN_STATEVECTORS_CACHE = statevectors2
            _TRAIN_FEATURES_CACHE_HASH = x2_hash
    
    n1 = len(X1)
    n2 = len(X2)
    K = np.zeros((n1, n2))
    
    for i in range(n1):
        s1 = statevectors1[i]
        for j in range(n2):
            s2 = statevectors2[j]
            # Kernel is |<s1|s2>|^2
            overlap = np.abs(s1.data.conj().dot(s2.data)) ** 2
            K[i, j] = overlap
            
    return K
