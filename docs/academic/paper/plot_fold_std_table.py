"""
Regenerate paper_fold_std_table.png with REAL per-fold AUC for all 11 models.

ML fold AUCs come from real_tables/oof_auc.csv (produced by real_analysis.py,
real 5-fold out-of-fold re-CV). DL fold AUCs come from the original
deep_learning_results.json. Both are real measured values.

Fixes the previous version where the "Fold AUCs" column overflowed the cell
and ML models showed a dash for std.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT    = Path(r"D:\CrownCode")
MODELS  = ROOT / "hf-crowncode-backend" / "models"
TBL_DIR = ROOT / "docs" / "academic" / "paper" / "real_tables"
FIG_DIR = ROOT / "docs" / "academic" / "figures"

GOLD = "#C99347"
BG   = "#faf8f4"

plt.rcParams.update({
    "font.family": "serif",
    "font.serif":  ["Times New Roman", "DejaVu Serif"],
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
})


def main() -> None:
    # ML: real OOF fold AUCs
    ml = pd.read_csv(TBL_DIR / "oof_auc.csv")
    rows = []
    for _, r in ml.iterrows():
        folds = [float(x) for x in r["fold_aucs"].split(";")]
        rows.append((r["model"], "ML", r["fold_mean_auc"],
                     r["fold_std_auc"], folds))

    # DL: fold AUCs from training results json
    with open(MODELS / "deep_learning_results.json") as f:
        dl = json.load(f)
    for name, data in dl.items():
        if not isinstance(data, dict):
            continue
        folds = data.get("fold_aucs", [])
        if folds:
            rows.append((name, "DL", float(np.mean(folds)),
                         float(np.std(folds)), [float(x) for x in folds]))

    rows.sort(key=lambda r: r[2], reverse=True)

    # Build display table — fold AUCs wrapped onto two lines so they fit
    table_data = []
    for name, mtype, mean, std, folds in rows:
        fold_str = ", ".join(f"{v:.3f}" for v in folds)
        table_data.append([
            name, mtype, f"{mean:.4f}", f"±{std:.4f}", fold_str,
        ])

    col_labels = ["Model", "Type", "Mean AUC", "Std AUC", "Per-Fold AUC (5 folds)"]
    # column width ratios — give the fold column the most room
    col_widths = [0.26, 0.07, 0.12, 0.11, 0.44]

    fig, ax = plt.subplots(figsize=(13, 0.5 * len(rows) + 1.4))
    fig.patch.set_facecolor(BG)
    ax.axis("off")

    tbl = ax.table(
        cellText=table_data,
        colLabels=col_labels,
        colWidths=col_widths,
        loc="center",
        cellLoc="center",
    )
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(9)
    tbl.scale(1, 1.6)

    for j in range(len(col_labels)):
        tbl[(0, j)].set_facecolor(GOLD)
        tbl[(0, j)].set_text_props(color="white", fontweight="bold")

    for i in range(1, len(rows) + 1):
        color = "#f5f0e8" if i % 2 == 0 else BG
        for j in range(len(col_labels)):
            tbl[(i, j)].set_facecolor(color)
        # bold the best (first) row
        if i == 1:
            for j in range(len(col_labels)):
                tbl[(i, j)].set_text_props(fontweight="bold")

    ax.set_title("Cross-Validation AUC Results (5-Fold) — Mean ± Std, "
                 "All Eleven Models",
                 fontsize=12, fontweight="bold", pad=14)

    out = FIG_DIR / "paper_fold_std_table.png"
    fig.savefig(out)
    plt.close(fig)
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")

    # also save a CSV companion
    pd.DataFrame(
        [(n, t, f"{m:.4f}", f"{s:.4f}", ";".join(f"{v:.4f}" for v in fl))
         for n, t, m, s, fl in rows],
        columns=["model", "type", "mean_auc", "std_auc", "fold_aucs"],
    ).to_csv(TBL_DIR / "fold_std_all_models.csv", index=False)
    print(f"wrote {TBL_DIR / 'fold_std_all_models.csv'}")


if __name__ == "__main__":
    main()
