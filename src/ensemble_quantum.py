import numpy as np
from sklearn.utils import resample

# import the new QSVC implementation
from .qsvm import run_manual_qsvm


def run_bagging_qsvc(
    X_train,
    X_test,
    y_train,
    y_test,
    n_estimators=5
):

    accs = []
    f1s = []

    for i in range(n_estimators):

        print(f"  → Training QSVC model {i+1}/{n_estimators}")

        # Bootstrap sampling
        X_res, y_res = resample(
            X_train,
            y_train,
            replace=True,
            random_state=i
        )

        # Run manual QSVC
        acc, f1, _ = run_manual_qsvm(
            X_res,
            X_test,
            y_res,
            y_test
        )

        accs.append(acc)
        f1s.append(f1)

    mean_acc = np.mean(accs)
    std_acc = np.std(accs)
    mean_f1 = np.mean(f1s)

    print(f"Bagging QSVC Mean Accuracy: {mean_acc:.4f}")
    print(f"Bagging QSVC Std Dev: {std_acc:.4f}")
    print(f"Bagging QSVC Mean F1 Score: {mean_f1:.4f}")

    return mean_acc, mean_f1