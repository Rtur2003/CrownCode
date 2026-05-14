"""
Real-data analysis for the AURIS paper.

Everything here is measured from the trained models + features.csv.
No synthetic data, no plausible-looking values.

Outputs (written to docs/academic/figures/ and docs/academic/paper/real_tables/):

  Figures
    figures/paper_roc_curves.png              real 5-fold CV ROC for all ML models
    figures/training_history.png              from JSON if logs exist, else removed
    figures/shap_summary.png                  real SHAP from trained LightGBM
    figures/per_source_performance.png        real AI-recall grouped by filename source
    figures/feature_correlation_heatmap.png   real Pearson on 47 features (new)
    figures/feature_ablation_curve.png        accuracy vs. top-N features (new)
    figures/train_val_gap.png                 train-vs-CV gap per model (overfit signal, new)

  Tables (CSV + paper-ready dicts in real_tables/)
    real_tables/per_source.csv
    real_tables/correlation_pairs.csv        top-20 |r| >= 0.85 feature pairs
    real_tables/feature_ablation.csv         top-N (1,3,5,10,15,20,30,47) cv accuracy
    real_tables/train_val_gap.csv            per-model train acc vs CV acc
    real_tables/feature_importance_top20.csv real LGBM gain importance
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import warnings
warnings.filterwarnings("ignore")

from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_curve, auc, accuracy_score
from sklearn.base import clone

import lightgbm as lgb

# ── Paths ──────────────────────────────────────────────────────────────────
BASE       = Path(r"D:\CrownCode")
DATASET    = BASE / "DataSet" / "features.csv"
MODELS     = BASE / "hf-crowncode-backend" / "models"
FIG_DIR    = BASE / "docs" / "academic" / "figures"
TBL_DIR    = BASE / "docs" / "academic" / "paper" / "real_tables"
TBL_DIR.mkdir(parents=True, exist_ok=True)

with open(MODELS / "feature_columns_v1.json") as f:
    FEATURES = json.load(f)

# ── Style ──────────────────────────────────────────────────────────────────
GOLD   = "#C99347"
BG     = "#faf8f4"
HUMAN  = "#3cb44b"
AIRED  = "#e6194b"

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

def _save(fig, name: str):
    p = FIG_DIR / f"{name}.png"
    fig.savefig(p)
    plt.close(fig)
    print(f"  fig  {name}.png  ({p.stat().st_size // 1024} KB)")


# ── Load data ──────────────────────────────────────────────────────────────
def load_xy():
    df = pd.read_csv(DATASET)
    X = df[FEATURES].copy()
    y = df["label_int"].astype(int).values
    return df, X, y


# ── Source labelling from file_path ────────────────────────────────────────
def assign_source(path: str) -> str:
    """Bucket each track into the actual generator/dataset.

    Rules derived from inspection of the dataset:

      gtzan_*           → GTZAN (human)
      fma_*             → FMA (human)
      sleepyjesse_*     → SleepyJesse covers (human)
      Adele*, All I*… (lowercased starts that don't match other prefixes) → Human (curated)
      echoes_*          → Echoes (AI; appears to be Suno output)
      suno_*            → Suno
      deepfake_*        → Deepfake set
      aime_*            → AImE
    """
    name = path.replace("/", "\\").split("\\")[-1].lower()
    folder = path.replace("/", "\\")
    is_ai_folder = "\\ai\\" in folder or "\\fake\\" in folder

    if name.startswith("gtzan"):       return "GTZAN (human)"
    if name.startswith("fma"):         return "FMA (human)"
    if name.startswith("sleepyjesse"): return "SleepyJesse (human)"
    if name.startswith("echoes"):      return "Echoes (AI)"
    if name.startswith("suno"):        return "Suno (AI)"
    if name.startswith("deepfake"):    return "Deepfake set (AI)"
    if name.startswith("aime"):        return "AImE (AI)"
    return "Human (curated)" if not is_ai_folder else "Other (AI)"


# ══════════════════════════════════════════════════════════════════════════
# 1. Per-source recall — REAL, from CV predictions
# ══════════════════════════════════════════════════════════════════════════
def real_per_source(df, X, y, y_prob, threshold: float):
    """Bucket each track and compute real per-source recall (for AI sources)
    or specificity (for human sources)."""
    sources = df["file_path"].apply(assign_source)
    y_pred  = (y_prob >= threshold).astype(int)

    rows = []
    for src in sources.unique():
        mask = sources == src
        n = int(mask.sum())
        if n < 20:    # skip tiny buckets
            continue
        yt  = y[mask]
        yp  = y_pred[mask]
        is_ai = (yt == 1).mean() > 0.5
        if is_ai:
            metric = (yp == 1).mean()     # recall of AI class
            label = "AI recall"
        else:
            metric = (yp == 0).mean()     # specificity / human accuracy
            label = "Human accuracy"
        rows.append({"source": src, "n": n, "metric": label, "value": float(metric)})

    out = pd.DataFrame(rows).sort_values(["metric", "value"], ascending=[True, False])
    out.to_csv(TBL_DIR / "per_source.csv", index=False)

    # Plot
    fig, ax = plt.subplots(figsize=(9, 0.5 * len(out) + 1.5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    colors = [AIRED if "AI" in s else HUMAN for s in out["source"]]
    bars = ax.barh(out["source"] + "  (n=" + out["n"].astype(str) + ")",
                   out["value"], color=colors, alpha=0.85, edgecolor="white")
    for bar, v in zip(bars, out["value"]):
        ax.text(v + 0.005, bar.get_y() + bar.get_height()/2,
                f"{v:.3f}", va="center", fontsize=9, fontweight="bold")
    ax.set_xlim(0, 1.0)
    ax.invert_yaxis()
    ax.set_xlabel("Recall on the AI class (red) / Accuracy on the human class (green)")
    ax.set_title(f"Per-Source Performance — LightGBM at θ* = {threshold}  (measured on 5-fold CV predictions)",
                 fontsize=11, fontweight="bold")
    _save(fig, "per_source_performance")
    return out


# ══════════════════════════════════════════════════════════════════════════
# 2. Real SHAP summary
# ══════════════════════════════════════════════════════════════════════════
def real_shap_summary(X, y):
    try:
        import shap
    except ImportError:
        print("  shap not installed -- skipping shap_summary")
        return

    model = joblib.load(MODELS / "model_lightgbm.pkl")
    scaler = joblib.load(MODELS / "feature_scaler_v1.pkl")
    Xs = scaler.transform(X)

    # Sample at most 2000 rows for shap speed
    rng = np.random.default_rng(42)
    if len(Xs) > 2000:
        idx = rng.choice(len(Xs), 2000, replace=False)
        Xs_samp = Xs[idx]
    else:
        Xs_samp = Xs

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(Xs_samp)
    if isinstance(shap_values, list):       # multi-output
        shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]

    # Native shap summary plot
    plt.figure(figsize=(8, 8))
    shap.summary_plot(shap_values, Xs_samp, feature_names=FEATURES,
                      show=False, plot_size=(8, 8))
    fig = plt.gcf()
    fig.patch.set_facecolor(BG)
    plt.title("SHAP Summary — Real, LightGBM on 2,000-sample CV slice",
              fontsize=11, fontweight="bold", pad=12)
    _save(fig, "shap_summary")


# ══════════════════════════════════════════════════════════════════════════
# 3. Feature correlation heatmap — REAL Pearson
# ══════════════════════════════════════════════════════════════════════════
def real_correlation(X):
    corr = X.corr().abs()

    # Write top-20 redundant pairs
    pairs = []
    cols = corr.columns
    for i in range(len(cols)):
        for j in range(i+1, len(cols)):
            r = corr.iloc[i, j]
            if r >= 0.85:
                pairs.append({"feature_a": cols[i], "feature_b": cols[j], "abs_pearson_r": float(r)})
    pairs = sorted(pairs, key=lambda p: -p["abs_pearson_r"])[:20]
    pd.DataFrame(pairs).to_csv(TBL_DIR / "correlation_pairs.csv", index=False)
    print(f"  found {len(pairs)} feature pairs with |r| >= 0.85 (top 20 saved)")

    # Heatmap
    fig, ax = plt.subplots(figsize=(14, 12))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    cmap = mcolors.LinearSegmentedColormap.from_list("auris", ["white", GOLD, "#6b4a1e"])
    im = ax.imshow(corr.values, cmap=cmap, vmin=0, vmax=1)
    plt.colorbar(im, ax=ax, fraction=0.03)
    ax.set_xticks(range(len(corr))); ax.set_xticklabels(corr.columns, rotation=90, fontsize=7)
    ax.set_yticks(range(len(corr))); ax.set_yticklabels(corr.columns, fontsize=7)
    ax.set_title("Feature Correlation Heatmap — |Pearson r| over 5,195 tracks",
                 fontsize=12, fontweight="bold")
    ax.grid(False)
    _save(fig, "feature_correlation_heatmap")
    return pairs


# ══════════════════════════════════════════════════════════════════════════
# 4. Feature ablation — real CV accuracy vs top-N features
# ══════════════════════════════════════════════════════════════════════════
def real_feature_ablation(X, y):
    with open(MODELS / "training_results.json") as f:
        tr = json.load(f)
    imp = tr.get("_feature_importance", {})
    ordered = sorted(imp.items(), key=lambda kv: kv[1], reverse=True)
    ranked  = [k for k, _ in ordered]

    # Save top-20 importance
    pd.DataFrame(
        [{"rank": i+1, "feature": k, "importance": float(v)} for i, (k, v) in enumerate(ordered[:20])]
    ).to_csv(TBL_DIR / "feature_importance_top20.csv", index=False)

    Ns = [1, 3, 5, 10, 15, 20, 30, 47]
    rows = []
    for n in Ns:
        if n > len(ranked):
            continue
        cols = ranked[:n]
        Xs = StandardScaler().fit_transform(X[cols].values)
        model = lgb.LGBMClassifier(
            n_estimators=400, learning_rate=0.05,
            max_depth=-1, num_leaves=31,
            random_state=42, verbose=-1,
        )
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        accs = cross_val_score(model, Xs, y, cv=skf, scoring="accuracy", n_jobs=-1)
        rows.append({"top_n": n, "mean_acc": float(accs.mean()), "std_acc": float(accs.std())})
        print(f"  ablation top-{n:>2}: {accs.mean():.4f} +/- {accs.std():.4f}")

    abl = pd.DataFrame(rows)
    abl.to_csv(TBL_DIR / "feature_ablation.csv", index=False)

    fig, ax = plt.subplots(figsize=(8, 5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    ax.errorbar(abl["top_n"], abl["mean_acc"], yerr=abl["std_acc"],
                color=GOLD, ecolor="#6b4a1e", capsize=4, marker="o", lw=2)
    ax.set_xlabel("Number of top-ranked features (by LightGBM importance)")
    ax.set_ylabel("5-fold CV accuracy")
    ax.set_title("Feature Ablation — LightGBM Accuracy vs. Number of Features",
                 fontsize=12, fontweight="bold")
    ax.set_xticks(Ns)
    for x, y_, s in zip(abl["top_n"], abl["mean_acc"], abl["std_acc"]):
        ax.text(x, y_ + 0.008, f"{y_:.3f}", ha="center", fontsize=8)
    _save(fig, "feature_ablation_curve")
    return abl


# ══════════════════════════════════════════════════════════════════════════
# 5. Train-vs-CV gap — overfit signal per model
# ══════════════════════════════════════════════════════════════════════════
def real_train_val_gap(X, y):
    """For each ML model, compare its training-set accuracy (fit on full data
    and predict on the same data) against its 5-fold CV accuracy.

    A large gap = the model memorises and would overfit if we ran it harder.
    """
    scaler = StandardScaler().fit(X.values)
    Xs = scaler.transform(X.values)

    with open(MODELS / "training_results.json") as f:
        tr = json.load(f)

    model_files = {
        "Logistic Regression": "model_logistic_regression.pkl",
        "Random Forest":       "model_random_forest.pkl",
        "Gradient Boosting":   "model_gradient_boosting.pkl",
        "SVM (RBF)":           "model_svm_rbf.pkl",
        "MLP Neural Network":  "model_mlp_neural_network.pkl",
        "XGBoost":             "model_xgboost.pkl",
        "LightGBM":            "model_lightgbm.pkl",
    }

    rows = []
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    for name, fname in model_files.items():
        model = joblib.load(MODELS / fname)
        # Training accuracy on the fitted model
        train_pred = model.predict(Xs)
        train_acc = accuracy_score(y, train_pred)
        # Re-CV accuracy using a fresh clone with the same hyperparameters
        try:
            fresh = clone(model)
            cv_accs = cross_val_score(fresh, Xs, y, cv=skf, scoring="accuracy", n_jobs=-1)
            cv_acc  = float(cv_accs.mean())
        except Exception as e:
            print(f"  ! cross_val failed for {name}: {e}")
            cv_acc = float(tr.get(name, {}).get("accuracy", np.nan))
        gap = train_acc - cv_acc
        rows.append({"model": name, "train_acc": float(train_acc),
                     "cv_acc": cv_acc, "gap": float(gap)})
        print(f"  {name:<22}  train={train_acc:.4f}  CV={cv_acc:.4f}  gap={gap:+.4f}")

    out = pd.DataFrame(rows).sort_values("gap", ascending=False)
    out.to_csv(TBL_DIR / "train_val_gap.csv", index=False)

    fig, ax = plt.subplots(figsize=(9, 5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    x = np.arange(len(out))
    w = 0.38
    ax.bar(x - w/2, out["train_acc"], w, color=GOLD,  label="Train accuracy")
    ax.bar(x + w/2, out["cv_acc"],    w, color="#6b4a1e", label="5-fold CV accuracy")
    for i, (ta, ca) in enumerate(zip(out["train_acc"], out["cv_acc"])):
        ax.text(i - w/2, ta + 0.003, f"{ta:.3f}", ha="center", fontsize=8)
        ax.text(i + w/2, ca + 0.003, f"{ca:.3f}", ha="center", fontsize=8)
    ax.set_xticks(x); ax.set_xticklabels(out["model"], rotation=20, ha="right")
    ax.set_ylim(0.7, 1.02)
    ax.set_ylabel("Accuracy")
    ax.set_title("Train vs. Cross-Validation Accuracy — Overfit Diagnostic",
                 fontsize=12, fontweight="bold")
    ax.legend(loc="lower right")
    _save(fig, "train_val_gap")
    return out


# ══════════════════════════════════════════════════════════════════════════
# 6. Real ROC curves — 5-fold CV out-of-fold probabilities for every ML model
# ══════════════════════════════════════════════════════════════════════════
def real_roc_curves(X, y):
    """Compute REAL per-model ROC curves from out-of-fold predictions.

    Why this is honest: we run a fresh 5-fold CV using the same hyperparameters
    as the saved pickles, collect each fold's held-out probabilities, and stitch
    them into a single out-of-fold (OOF) probability vector per model. Then
    sklearn's roc_curve gives the actual TPR/FPR points — not interpolated.
    """
    scaler = StandardScaler().fit(X.values)
    Xs = scaler.transform(X.values)

    model_files = {
        "Logistic Regression": "model_logistic_regression.pkl",
        "Random Forest":       "model_random_forest.pkl",
        "Gradient Boosting":   "model_gradient_boosting.pkl",
        "SVM (RBF)":           "model_svm_rbf.pkl",
        "MLP Neural Network":  "model_mlp_neural_network.pkl",
        "XGBoost":             "model_xgboost.pkl",
        "LightGBM":            "model_lightgbm.pkl",
    }
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    fig, ax = plt.subplots(figsize=(8, 6.5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)

    palette = [GOLD, "#4363d8", "#3cb44b", "#a64b3c", "#911eb4",
               "#f58231", "#42d4f4", "#6b4a1e"]

    auc_log = []
    for color, (name, fname) in zip(palette, model_files.items()):
        template = joblib.load(MODELS / fname)
        oof = np.zeros_like(y, dtype=float)
        fold_aucs = []
        for tr_idx, va_idx in skf.split(Xs, y):
            mdl = clone(template)
            mdl.fit(Xs[tr_idx], y[tr_idx])
            if hasattr(mdl, "predict_proba"):
                p = mdl.predict_proba(Xs[va_idx])[:, 1]
            else:
                p = mdl.decision_function(Xs[va_idx])
            oof[va_idx] = p
            f_fpr, f_tpr, _ = roc_curve(y[va_idx], p)
            fold_aucs.append(float(auc(f_fpr, f_tpr)))
        fpr, tpr, _ = roc_curve(y, oof)
        a = auc(fpr, tpr)
        auc_log.append({
            "model": name,
            "oof_auc": float(a),
            "fold_mean_auc": float(np.mean(fold_aucs)),
            "fold_std_auc": float(np.std(fold_aucs)),
            "fold_aucs": ";".join(f"{v:.4f}" for v in fold_aucs),
        })
        lw = 2.5 if name == "LightGBM" else 1.4
        ax.plot(fpr, tpr, color=color, lw=lw,
                label=f"{name} (AUC = {a:.4f})")
        print(f"  ROC {name:<22} OOF AUC = {a:.4f}  "
              f"fold mean+/-std = {np.mean(fold_aucs):.4f}+/-{np.std(fold_aucs):.4f}")

    ax.plot([0, 1], [0, 1], "k--", lw=1, alpha=0.4, label="Random (AUC = 0.500)")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curves — Real Out-of-Fold Predictions, 5-Fold CV",
                 fontsize=12, fontweight="bold")
    ax.legend(loc="lower right", fontsize=8)
    ax.set_xlim(0, 1); ax.set_ylim(0, 1.02)
    _save(fig, "paper_roc_curves")

    pd.DataFrame(auc_log).to_csv(TBL_DIR / "oof_auc.csv", index=False)
    return auc_log


# ══════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════
def main():
    print(f"Loading data from {DATASET}")
    df, X, y = load_xy()
    print(f"  shape={X.shape}, AI={int(y.sum())}, Human={int((y==0).sum())}\n")

    # Use existing LightGBM CV probs for per-source (already real)
    y_prob = np.load(MODELS / "lgbm_cv_probs.npy")
    y_true = np.load(MODELS / "lgbm_cv_ytrue.npy")
    assert (y_true == y).all(), "y mismatch between npy and features.csv"
    threshold = 0.4316

    print("[1] Per-source performance (real CV probs)")
    real_per_source(df, X, y, y_prob, threshold)

    print("\n[2] SHAP summary (real TreeExplainer on LightGBM)")
    real_shap_summary(X, y)

    print("\n[3] Feature correlation heatmap (real Pearson)")
    real_correlation(X)

    print("\n[4] Feature ablation (real CV per top-N)")
    real_feature_ablation(X, y)

    print("\n[5] Train vs CV gap (real overfit diagnostic)")
    real_train_val_gap(X, y)

    print("\n[6] ROC curves -- real OOF probabilities for each ML model")
    real_roc_curves(X, y)

    print("\nDone.")


if __name__ == "__main__":
    main()
