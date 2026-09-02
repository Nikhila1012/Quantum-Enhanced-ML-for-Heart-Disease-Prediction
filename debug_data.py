import pandas as pd
import numpy as np
import os

def load_data_debug():
    # Work from current directory (root)
    DATA_DIR = "data"
    
    columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
    
    datasets = {}
    for name in ["cleveland.csv", "hungarian.csv", "switzerland.csv", "va_long_beach.csv"]:
        path = os.path.join(DATA_DIR, name)
        if not os.path.exists(path):
            print(f"Error: {path} not found")
            continue
        
        # Check if file has header
        with open(path, 'r') as f:
            first_line = f.readline()
        
        if 'age' in first_line:
            df = pd.read_csv(path)
        else:
            df = pd.read_csv(path, names=columns)
            
        datasets[name] = df
        print(f"{name} initial shape: {df.shape}")

    # Combine
    df_combined = pd.concat(datasets.values(), ignore_index=True)
    print(f"Combined shape: {df_combined.shape}")

    # Handle missing values
    df_combined.replace("?", np.nan, inplace=True)
    print(f"Missing values per column:\n{df_combined.isnull().sum()}")
    
    df_clean = df_combined.dropna()
    print(f"Clean shape after dropna: {df_clean.shape}")

if __name__ == "__main__":
    load_data_debug()
