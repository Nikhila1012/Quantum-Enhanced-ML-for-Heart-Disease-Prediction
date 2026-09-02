import pandas as pd
import numpy as np
import os

def analyze_missing_values():
    DATA_DIR = "data"
    columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
    
    dfs = []
    for name in ["cleveland.csv", "hungarian.csv", "switzerland.csv", "va_long_beach.csv"]:
        path = os.path.join(DATA_DIR, name)
        if not os.path.exists(path): continue
        
        with open(path, 'r') as f:
            first_line = f.readline()
        
        if 'age' in first_line:
            df = pd.read_csv(path)
        else:
            df = pd.read_csv(path, names=columns)
        dfs.append(df)

    combined = pd.concat(dfs, ignore_index=True)
    combined.replace("?", np.nan, inplace=True)
    
    print(f"Total rows: {len(combined)}")
    missing = combined.isnull().sum()
    for col, count in missing.items():
        print(f"{col}: {count} missing ({(count/len(combined))*100:.1f}%)")

if __name__ == "__main__":
    analyze_missing_values()
