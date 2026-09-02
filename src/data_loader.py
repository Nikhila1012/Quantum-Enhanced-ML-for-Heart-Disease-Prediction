import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from imblearn.over_sampling import SMOTE

def load_data(test_size=0.2, random_state=42):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    
    columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
    
    # Load each dataset
    # Cleveland often has headers in some versions, but UCI original doesn't. 
    # Checking for header to be safe.
    cleveland_path = os.path.join(DATA_DIR, "cleveland.csv")
    cleveland = pd.read_csv(cleveland_path)
    if list(cleveland.columns) != columns:
        # If columns don't match, it might be missing headers or have different ones
        cleveland = pd.read_csv(cleveland_path, names=columns, header=0 if 'age' in open(cleveland_path).readline() else None)
    
    # Others are direct downloads from UCI and don't have headers
    hungarian = pd.read_csv(os.path.join(DATA_DIR, "hungarian.csv"), names=columns)
    switzerland = pd.read_csv(os.path.join(DATA_DIR, "switzerland.csv"), names=columns)
    va = pd.read_csv(os.path.join(DATA_DIR, "va_long_beach.csv"), names=columns)

    # Combine datasets
    df = pd.concat([cleveland, hungarian, switzerland, va], ignore_index=True)

    # Replace missing values
    df.replace("?", np.nan, inplace=True)
    
    # Convert to numeric first (to allow median calculation)
    df = df.apply(pd.to_numeric)
    
    # Impute missing values with median
    df.fillna(df.median(), inplace=True)
    
    # Binarize target (0: no disease, 1-4: disease)
    df['target'] = df['target'].apply(lambda x: 1 if x > 0 else 0)

    X = df.drop("target", axis=1)
    y = df["target"]

    scaler = MinMaxScaler()
    X_scaled = pd.DataFrame(
        scaler.fit_transform(X) * np.pi,
        columns=X.columns
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )
    
    # Apply SMOTE to balancing training data
    smote = SMOTE(random_state=random_state)
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

    return X_train_res, X_test, y_train_res.values, y_test.values, scaler