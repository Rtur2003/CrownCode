"""
Plot training_history.png from REAL per-epoch DL CSV logs.

Reads the four CSVs produced by run_dl_history.py and renders mean train AUC
and mean val AUC per epoch (averaged across folds) for each architecture.
This figure is real measured data, not synthetic.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT      = Path(r"D:\CrownCode")
MODELS    = ROOT / "hf-crowncode-backend" / "models"
FIG_DIR   = ROOT / "docs" / "academic" / "figures"

GOLD  = "#C99347"
BG    = "#faf8f4"

plt.rcParams.update({
    "font.family":   "serif",
    "font.serif":    ["Times New Roman", "DejaVu Serif"],
    "font.size":     11,
    "figure.dpi":    150,
    "savefig.dpi":   300,
    "savefig.bbox":  "tight",
    "axes.grid":     True,
    "grid.alpha":    0.3,
    "axes.spines.top":   False,
    "axes.spines.right": False,
})

MODELS_LIST = [
    ("Deep MLP (512-256-128-64)", "dl_history_deep_mlp.csv"),
    ("1D-CNN",                     "dl_history_1d_cnn.csv"),
    ("Residual MLP (3 blocks)",    "dl_history_residual_mlp.csv"),
    ("Attention MLP",              "dl_history_attention_mlp.csv"),
]


def aggregate(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, np.ndarray,
                                          np.ndarray, np.ndarray]:
    """Average train/val AUC across folds, per epoch.

    Folds may have different lengths because of early stopping; align by epoch
    and average only over folds that reached that epoch.
    """
    max_e = int(df["epoch"].max())
    epochs = np.arange(1, max_e + 1)
    train_mean = np.full(max_e, np.nan)
    train_std  = np.full(max_e, np.nan)
    val_mean   = np.full(max_e, np.nan)
    val_std    = np.full(max_e, np.nan)
    for e in epochs:
        rows = df[df["epoch"] == e]
        if len(rows) > 0:
            train_mean[e - 1] = rows["train_auc"].mean()
            train_std [e - 1] = rows["train_auc"].std() if len(rows) > 1 else 0.0
            val_mean  [e - 1] = rows["val_auc"].mean()
            val_std   [e - 1] = rows["val_auc"].std() if len(rows) > 1 else 0.0
    return epochs, train_mean, train_std, val_mean, val_std


def main() -> None:
    fig, axes = plt.subplots(1, 4, figsize=(17, 4.2), sharey=True)
    fig.patch.set_facecolor(BG)

    for ax, (name, fname) in zip(axes, MODELS_LIST):
        path = MODELS / fname
        if not path.exists():
            ax.text(0.5, 0.5, f"missing\n{fname}", ha="center", va="center",
                    transform=ax.transAxes)
            ax.set_title(name, fontsize=10)
            continue

        df = pd.read_csv(path)
        ep, tm, ts, vm, vs = aggregate(df)

        ax.set_facecolor(BG)
        ax.plot(ep, tm, color=GOLD,    lw=2,           label="Train AUC")
        ax.fill_between(ep, tm - ts, tm + ts, color=GOLD,     alpha=0.18)
        ax.plot(ep, vm, color="#6b4a1e", lw=2, ls="--",  label="Val AUC")
        ax.fill_between(ep, vm - vs, vm + vs, color="#6b4a1e", alpha=0.18)
        ax.set_xlabel("Epoch")
        ax.set_title(name, fontsize=10)
        ax.set_ylim(0.55, 1.02)
        ax.legend(loc="lower right", fontsize=8)
        # Best val auc annotation
        best_e = int(np.nanargmax(vm)) + 1
        best   = float(np.nanmax(vm))
        ax.axvline(best_e, color="#888", ls=":", lw=0.8)
        ax.text(best_e + 0.5, 0.60,
                f"best val AUC = {best:.4f}\nat epoch {best_e}",
                fontsize=8, color="#333")

    axes[0].set_ylabel("ROC-AUC")
    fig.suptitle("Training History — Mean Across 5 Folds (Real, Per-Epoch Logs)",
                 fontsize=13, fontweight="bold", y=1.04)
    plt.tight_layout()
    out = FIG_DIR / "training_history.png"
    fig.savefig(out)
    plt.close(fig)
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
