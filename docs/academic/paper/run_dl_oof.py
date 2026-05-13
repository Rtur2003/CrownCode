"""
Generate real out-of-fold (OOF) probabilities for the four DL architectures.

Identical to the original 5-fold CV pipeline in train_deep_classifiers, but
records every fold's validation predictions into a single OOF probability
vector per model. Saves one NPY per architecture under models/.

Outputs:
  hf-crowncode-backend/models/dl_oof_deep_mlp.npy
  hf-crowncode-backend/models/dl_oof_1d_cnn.npy
  hf-crowncode-backend/models/dl_oof_residual_mlp.npy
  hf-crowncode-backend/models/dl_oof_attention_mlp.npy

Each has shape (5195,) — same row order as features.csv.
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score
import pandas as pd

ROOT = Path(r"D:\CrownCode")
sys.path.insert(0, str(ROOT / "hf-crowncode-backend"))

from app.training.train_deep_classifiers import (  # noqa: E402
    DeepMLP, Conv1DClassifier, ResidualMLP, AttentionMLP,
    SEED, N_FOLDS, EPOCHS, PATIENCE, BATCH_SIZE, LR, DEVICE,
)


FEATURES_CSV = ROOT / "DataSet" / "features.csv"
OUT_DIR      = ROOT / "hf-crowncode-backend" / "models"

MODELS = [
    ("Deep MLP (512-256-128-64)", DeepMLP,           "dl_oof_deep_mlp.npy"),
    ("1D-CNN",                    Conv1DClassifier,  "dl_oof_1d_cnn.npy"),
    ("Residual MLP (3 blocks)",   ResidualMLP,       "dl_oof_residual_mlp.npy"),
    ("Attention MLP",             AttentionMLP,      "dl_oof_attention_mlp.npy"),
]


def set_seed(s: int) -> None:
    np.random.seed(s)
    torch.manual_seed(s)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(s)


def load_data():
    df = pd.read_csv(FEATURES_CSV)
    feature_cols = [c for c in df.columns if c not in ("file_path", "label_int")]
    X = df[feature_cols].fillna(0.0).to_numpy(dtype=np.float32)
    y = df["label_int"].to_numpy(dtype=np.int32)
    return X, y


def cv_oof_probs(model_class: type, X: np.ndarray, y: np.ndarray) -> np.ndarray:
    cv = StratifiedKFold(n_splits=N_FOLDS, shuffle=True, random_state=SEED)
    oof = np.zeros(len(y), dtype=np.float64)

    for fold, (tr_idx, va_idx) in enumerate(cv.split(X, y)):
        set_seed(SEED + fold)
        scaler = StandardScaler()
        X_tr = scaler.fit_transform(X[tr_idx])
        X_v  = scaler.transform(X[va_idx])
        y_tr, y_v = y[tr_idx], y[va_idx]

        model = model_class(X.shape[1]).to(DEVICE)
        optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
            optimizer, mode="max", factor=0.5, patience=5
        )
        n_pos = max(int(y_tr.sum()), 1)
        n_neg = len(y_tr) - n_pos
        pos_weight = torch.tensor([n_neg / n_pos], dtype=torch.float32).to(DEVICE)
        criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

        loader = DataLoader(
            TensorDataset(
                torch.tensor(X_tr, dtype=torch.float32),
                torch.tensor(y_tr, dtype=torch.float32),
            ),
            batch_size=BATCH_SIZE, shuffle=True,
        )
        val_X = torch.tensor(X_v, dtype=torch.float32).to(DEVICE)

        best_auc = 0.0
        best_probs = None
        patience_ctr = 0
        for epoch in range(EPOCHS):
            model.train()
            for bx, by in loader:
                bx, by = bx.to(DEVICE), by.to(DEVICE)
                optimizer.zero_grad()
                criterion(model(bx), by).backward()
                optimizer.step()
            model.eval()
            with torch.no_grad():
                probs = torch.sigmoid(model(val_X)).cpu().numpy().flatten()
            auc = roc_auc_score(y_v, probs)
            scheduler.step(auc)
            if auc > best_auc:
                best_auc = auc
                best_probs = probs.copy()
                patience_ctr = 0
            else:
                patience_ctr += 1
                if patience_ctr >= PATIENCE:
                    break
        oof[va_idx] = best_probs
        print(f"    fold {fold + 1}: AUC = {best_auc:.4f}")
    return oof


def main() -> None:
    set_seed(SEED)
    print(f"Loading {FEATURES_CSV}  device={DEVICE}")
    X, y = load_data()
    print(f"  X={X.shape}  AI={int(y.sum())}  Human={int((y == 0).sum())}\n")

    for name, model_class, out_npy in MODELS:
        print(f"[{name}]")
        t0 = time.time()
        oof = cv_oof_probs(model_class, X, y)
        path = OUT_DIR / out_npy
        np.save(path, oof)
        a = roc_auc_score(y, oof)
        print(f"  wrote {path}  overall OOF AUC = {a:.4f}  "
              f"elapsed = {time.time() - t0:.1f}s\n")

    print("Done.")


if __name__ == "__main__":
    main()
