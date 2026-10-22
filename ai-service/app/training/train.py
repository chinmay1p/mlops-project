import os
import sys
import pickle
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import precision_recall_curve, auc
from imblearn.over_sampling import SMOTE

# Add parent path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.features.feature_engineering import build_features, CANDIDATE_FEATURE_COLS

# 1. Load Dataset
data_path = os.path.join(os.path.dirname(__file__), "..", "data", "cleaned_transactions.csv")
print(f"Loading data from {data_path}...")
df = pd.read_csv(data_path, parse_dates=["trans_date_trans_time", "dob"])

# 2. Feature Extraction & Clean NaN
df = build_features(df).dropna(subset=[c for c in CANDIDATE_FEATURE_COLS if c in df.columns and c != "merchant_fraud_rate"])
feature_cols = [c for c in CANDIDATE_FEATURE_COLS if c in df.columns and c != "merchant_fraud_rate"]

X = df[feature_cols].astype(float).fillna(0.0)
y = df["is_fraud"].astype(int)

# 3. Train / Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# 4. Handle Imbalance with SMOTE
print("Applying SMOTE...")
X_train_res, y_train_res = SMOTE(random_state=42).fit_resample(X_train, y_train)

# 5. Define Candidate Pipelines & Hyperparameter Grids
models = {
    "logistic_regression": {
        "pipeline": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(max_iter=1000, random_state=42))
        ]),
        "params": {
            "classifier__C": [0.1, 1.0, 10.0]
        }
    },
    "random_forest": {
        "pipeline": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", RandomForestClassifier(random_state=42, n_jobs=-1))
        ]),
        "params": {
            "classifier__n_estimators": [100, 200],
            "classifier__max_depth": [10, 20]
        }
    },
    "xgboost": {
        "pipeline": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", XGBClassifier(eval_metric="logloss", random_state=42))
        ]),
        "params": {
            "classifier__n_estimators": [100, 200],
            "classifier__max_depth": [3, 6]
        }
    }
}

# 6. Tune & Train Each Model with GridSearchCV
best_overall_score = -1
best_overall_pipeline = None
best_model_name = ""

for name, config in models.items():
    print(f"\nTuning and training {name}...")
    grid = GridSearchCV(config["pipeline"], config["params"], cv=3, scoring="average_precision", n_jobs=-1)
    grid.fit(X_train_res, y_train_res)

    y_proba = grid.predict_proba(X_test)[:, 1]
    precision, recall, _ = precision_recall_curve(y_test, y_proba)
    score = auc(recall, precision)

    print(f"Best Params for {name}: {grid.best_params_}")
    print(f"PR-AUC: {score:.4f}")

    if score > best_overall_score:
        best_overall_score = score
        best_overall_pipeline = grid.best_estimator_
        best_model_name = name

print(f"\n Winner: {best_model_name} with PR-AUC = {best_overall_score:.4f}")

# 7. Save Best Tuned Pipeline
model_save_path = os.path.join(os.path.dirname(__file__), "..", "models", "fraud_model.pkl")
os.makedirs(os.path.dirname(model_save_path), exist_ok=True)

with open(model_save_path, "wb") as f:
    pickle.dump(best_overall_pipeline, f)

print(f"Tuned pipeline saved to '{model_save_path}'")

# 8. Quick Verification: Reload & Predict
with open(model_save_path, "rb") as f:
    loaded_pipeline = pickle.load(f)

sample_pred = loaded_pipeline.predict(X_test.iloc[:1])
sample_proba = loaded_pipeline.predict_proba(X_test.iloc[:1])[:, 1]
print(f"Sample prediction: {sample_pred[0]} (fraud probability: {sample_proba[0]:.4f})")
