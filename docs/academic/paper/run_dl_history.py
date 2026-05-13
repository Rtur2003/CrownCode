"""
Re-train the four DL architectures with per-epoch metric logging.

Loads model classes from app.training.train_deep_classifiers so the
architectures stay identical to the originally reported models, but adds a
CSVLogger-style sidecar that writes train_loss / train_auc / val_auc for
every epoch of every fold.

Outputs (one CSV per architecture):
  hf-crowncode-backend/models/dl_history_deep_mlp.csv
  hf-crowncode-backend/models/dl_history_1d_cnn.csv
  hf-crowncode-backend/models/dl_history_residual_mlp.csv
  hf-crowncode-backend/models/dl_history_attention_mlp.csv

Each CSV row: model, fold, epoch, train_loss, train_auc, val_auc
"""

from __future__ import annotations

import csv
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
    ("Deep MLP (512-256-128-64)", DeepMLP,           "dl_history_deep_mlp.csv"),
    ("1D-CNN",                    Conv1DClassifier,  "dl_history_1d_cnn.csv"),
    ("Residual MLP (3 blocks)",   ResidualMLP,       "dl_history_residual_mlp.csv"),
    ("Attention MLP",             AttentionMLP,      "dl_history_attention_mlp.csv"),
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
    return X, y, feature_cols


def train_with_history(
    model_class: type, X: np.ndarray, y: np.ndarray,
) -> list[dict]:
    """Run the same 5-fold CV as the original trainer, but capture per-epoch
    metrics. Returns a list of dict rows (one per fold-epoch)."""
    cv = StratifiedKFold(n_splits=N_FOLDS, shuffle=True, random_state=SEED)
    rows: list[dict] = []

    for fold, (tr_idx, va_idx) in enumerate(cv.split(X, y)):
        set_seed(SEED + fold)
        X_tr_raw, X_v_raw = X[tr_idx], X[va_idx]
        y_tr, y_v = y[tr_idx], y[va_idx]

        scaler = StandardScaler()
        X_tr = scaler.fit_transform(X_tr_raw)
        X_v  = scaler.transform(X_v_raw)

        n_feat = X.shape[1]
        model = model_class(n_feat).to(DEVICE)
        optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
            optimizer, mode="max", factor=0.5, patience=5
        )
        n_pos = max(int(y_tr.sum()), 1)
        n_neg = len(y_tr) - n_pos
        pos_weight = torch.tensor([n_neg / n_pos], dtype=torch.float32).to(DEVICE)
        criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

        train_X_t = torch.tensor(X_tr, dtype=torch.float32)
        train_y_t = torch.tensor(y_tr, dtype=torch.float32)
        loader = DataLoader(
            TensorDataset(train_X_t, train_y_t),
            batch_size=BATCH_SIZE, shuffle=True,
        )
        val_X_t = torch.tensor(X_v, dtype=torch.float32).to(DEVICE)

        best_auc = 0.0
        patience_ctr = 0
        for epoch in range(1, EPOCHS + 1):
            model.train()
            batch_losses = []
            for bx, by in loader:
                bx, by = bx.to(DEVICE), by.to(DEVICE)
                optimizer.zero_grad()
                logits = model(bx)
                loss = criterion(logits, by)
                loss.backward()
                optimizer.step()
                batch_losses.append(loss.item())
            train_loss = float(np.mean(batch_losses))

            # Train AUC (on training partition) and Val AUC
            model.eval()
            with torch.no_grad():
                t_probs = torch.sigmoid(model(train_X_t.to(DEVICE))).cpu().numpy()
                v_probs = torch.sigmoid(model(val_X_t)).cpu().numpy()
            train_auc = float(roc_auc_score(y_tr, t_probs))
            val_auc   = float(roc_auc_score(y_v,  v_probs))
            scheduler.step(val_auc)

            rows.append({
                "fold":       fold + 1,
                "epoch":      epoch,
                "train_loss": round(train_loss, 6),
                "train_auc":  round(train_auc, 6),
                "val_auc":    round(val_auc, 6),
            })

            if val_auc > best_auc:
                best_auc = val_auc
                patience_ctr = 0
            else:
                patience_ctr += 1
                if patience_ctr >= PATIENCE:
                    break

        print(f"    fold {fold + 1}: best val AUC = {best_auc:.4f}  "
              f"(epochs run = {epoch})")
    return rows


def main() -> None:
    set_seed(SEED)
    print(f"Loading {FEATURES_CSV}")
    X, y, feats = load_data()
    print(f"  X={X.shape}  y AI={int(y.sum())}  Human={int((y == 0).sum())}  "
          f"device={DEVICE}\n")

    for name, model_class, out_csv in MODELS:
        print(f"[{name}]")
        t0 = time.time()
        rows = train_with_history(model_class, X, y)
        path = OUT_DIR / out_csv
        with open(path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=["fold", "epoch", "train_loss",
                                              "train_auc", "val_auc"])
            w.writeheader()
            w.writerows(rows)
        print(f"  wrote {path}  ({len(rows)} rows)  "
              f"elapsed={time.time() - t0:.1f}s\n")

    print("Done.")


if __name__ == "__main__":
    main()
