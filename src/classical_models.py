from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
def run_random_forest(X_train, X_test, y_train, y_test):
    rf = RandomForestClassifier(
        n_estimators=200,
        random_state=42
    )
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    return acc, f1, rf