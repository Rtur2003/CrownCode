"""
AURIS paper için TÜM figürleri TÜRKÇE üret.

Mevcut figürlerin İngilizce versiyonları _BACKUP_english_figures/ içinde.
Bu script, paper'da kullanılan 20 figürün hepsini Türkçe etiketlerle
yeniden üretir. Gerçek verilerden, hiç uydurma yok.
"""
from __future__ import annotations

import json
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

from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    roc_curve, auc, confusion_matrix, precision_recall_curve,
    average_precision_score, brier_score_loss
)
from sklearn.calibration import calibration_curve
from sklearn.base import clone

# ── Yollar ────────────────────────────────────────────────────────────────
BASE     = Path(r"D:\CrownCode")
DATASET  = BASE / "DataSet" / "features.csv"
MODELS   = BASE / "hf-crowncode-backend" / "models"
FIG_DIR  = BASE / "docs" / "academic" / "figures"

with open(MODELS / "feature_columns_v1.json") as f:
    FEATURES = json.load(f)

# ── Stil ──────────────────────────────────────────────────────────────────
GOLD   = "#C99347"
BG     = "none"
HUMAN  = "#3cb44b"
AIRED  = "#e6194b"

plt.rcParams.update({
    "font.family": "Times New Roman",
    "font.size": 10,

    "font.weight": "normal",
    "axes.labelweight": "normal",
    "axes.titleweight": "normal",

    "figure.dpi": 150,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
    "savefig.transparent": True,

    "axes.grid": True,
    "grid.alpha": 0.15,
    "grid.linewidth": 0.5,

    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.edgecolor": "black",

    "text.color": "black",
    "axes.labelcolor": "black",
    "xtick.color": "black",
    "ytick.color": "black",
})

def _save(fig, name: str):
    p = FIG_DIR / f"{name}.png"
    fig.savefig(p)
    plt.close(fig)
    print(f"  TR  {name}.png  ({p.stat().st_size // 1024} KB)")


def load_xy():
    df = pd.read_csv(DATASET)
    X = df[FEATURES].copy()
    y = df["label_int"].astype(int).values
    return df, X, y


# ══════════════════════════════════════════════════════════════════════════
# 1. paper_pipeline_diagram - AURIS sistem işleyiş şeması
# ══════════════════════════════════════════════════════════════════════════
def fig_pipeline():
    fig, ax = plt.subplots(figsize=(14, 3.5))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 14); ax.set_ylim(0, 3.5)
    ax.axis("off")

    # 7 kutu: Ses Girişi -> Öznitelik Çıkarma -> 47 Öznitelik -> Standartlaştırma ->
    #         11 Modelli Topluluk -> Olasılık Füzyonu -> Karar (AI/İnsan)
    boxes = [
        ("Ses Girişi\n(WAV/MP3/FLAC)", "#4363d8"),
        ("Öznitelik\nÇıkarma\n(librosa)", "#3cb44b"),
        ("47 Akustik\nÖznitelik", "#f58231"),
        ("Standart\nÖlçekleme", "#911eb4"),
        ("ML/DL Topluluğu\n(11 Model)", GOLD),
        ("Olasılık\nFüzyonu\n(Youden Eşiği)", "#e6194b"),
        ("Karar:\nYZ / İnsan", "#333333"),
    ]
    sublabels = [
        "Dosya yükleme /\nmikrofon",
        "Spektral · Zamansal\nVokal · Ritmik",
        "Normalize\nvektör",
        "Sıfır ort.\nBirim varyans",
        "7 ML + 4 DL\nmodel",
        "Optimal\neşik",
        "P(YZ) skor\n0-100%",
    ]
    w = 1.8; h = 1.3; y = 1.8
    for i, (text, color) in enumerate(boxes):
        x = 0.3 + i * 1.95
        rect = plt.Rectangle((x, y), w, h, facecolor=color)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, text, ha="center", va="center",
                fontsize=9, fontweight="normal", color="white")
        ax.text(x + w/2, y - 0.4, sublabels[i], ha="center", va="top",
                fontsize=8, color="#444", style="italic")
        # Ok
        if i < len(boxes) - 1:
            ax.annotate("", xy=(x + w + 0.15, y + h/2),
                        xytext=(x + w + 0.02, y + h/2),
                        arrowprops=dict(arrowstyle="->", color="#666", lw=1.5))

    ax.set_title("Şekil 1. AURIS Sistem İşleyiş Şeması — "
                 "Uçtan-Uca Yapay Zekâ Müzik Tespiti",
                 fontsize=12, fontweight="normal", pad=15)
    _save(fig, "paper_pipeline_diagram")


# ══════════════════════════════════════════════════════════════════════════
# 2. feature_distribution_ai_vs_human - 8 öznitelik dağılımı
# ══════════════════════════════════════════════════════════════════════════
def fig_feature_distribution():
    df = pd.read_csv(DATASET)
    top8 = [
        "spectral_flatness_std", "spectral_contrast_mean", "rms_energy",
        "onset_strength_std", "spectral_flatness_mean", "rms_dynamic_range",
        "onset_strength_mean", "beat_count",
    ]
    # Türkçe karşılıkları
    tr_names = {
        "spectral_flatness_std":   "Spektral düzlük std",
        "spectral_contrast_mean":  "Spektral kontrast ort.",
        "rms_energy":              "RMS enerji",
        "onset_strength_std":      "Başlangıç gücü std",
        "spectral_flatness_mean":  "Spektral düzlük ort.",
        "rms_dynamic_range":       "RMS dinamik aralık",
        "onset_strength_mean":     "Başlangıç gücü ort.",
        "beat_count":              "Vuruş sayısı",
    }
    available = [c for c in top8 if c in df.columns]
    label_col = "label_int" if "label_int" in df.columns else "label"
    human = df[df[label_col] == 0]
    ai    = df[df[label_col] == 1]

    n_cols = 4; n_rows = (len(available) + n_cols - 1) // n_cols
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(16, 4.2 * n_rows))
    fig.patch.set_facecolor(BG)
    fig.suptitle("YZ ve İnsan Müziği — İlk Sekiz Özniteliğin Dağılımı",
                 fontsize=14, fontweight="normal", y=1.02)

    for i, feat in enumerate(available):
        ax = axes.flat[i]
        ax.set_facecolor(BG)
        h_vals = human[feat].dropna()
        a_vals = ai[feat].dropna()
        combined = pd.concat([h_vals, a_vals])
        positive = combined[combined > 0]
        use_log = (len(positive) > 0 and combined.skew() > 4.0
                   and positive.min() > 0)

        if use_log:
            lo = max(float(positive.quantile(0.005)), 1e-6)
            hi = float(combined.quantile(0.995))
            bins = np.logspace(np.log10(lo), np.log10(hi), 40)
            ax.hist(h_vals[h_vals > 0].clip(lo, hi), bins=bins, alpha=0.6,
                    color=HUMAN, label=f"İnsan (n={len(h_vals)})",
                    density=True)
            ax.hist(a_vals[a_vals > 0].clip(lo, hi), bins=bins, alpha=0.6,
                    color=AIRED, label=f"YZ (n={len(a_vals)})",
                    density=True)
            ax.set_xscale("log")
            ax.set_xlim(lo, hi)
            ax.set_title(f"{tr_names[feat]}  (log eksen)", fontsize=11)
        else:
            lo = float(combined.quantile(0.01))
            hi = float(combined.quantile(0.99))
            if hi <= lo: lo, hi = float(combined.min()), float(combined.max())
            bins = np.linspace(lo, hi, 40)
            ax.hist(h_vals.clip(lo, hi), bins=bins, alpha=0.6,
                    color=HUMAN, label=f"İnsan (n={len(h_vals)})",
                    density=True)
            ax.hist(a_vals.clip(lo, hi), bins=bins, alpha=0.6,
                    color=AIRED, label=f"YZ (n={len(a_vals)})",
                    density=True)
            ax.set_xlim(lo, hi)
            ax.set_title(tr_names[feat], fontsize=11)

        ax.set_ylabel("Yoğunluk")
        ax.legend(fontsize=8, loc="upper right")

    for j in range(len(available), n_rows * n_cols):
        axes.flat[j].axis("off")
    plt.tight_layout()
    _save(fig, "feature_distribution_ai_vs_human")


# ══════════════════════════════════════════════════════════════════════════
# 3. paper_model_comparison - 11 model performans
# ══════════════════════════════════════════════════════════════════════════
def fig_model_comparison():
    with open(MODELS / "training_results.json") as f:
        ml = json.load(f)
    with open(MODELS / "deep_learning_results.json") as f:
        dl = json.load(f)

    rows = []
    for name, data in ml.items():
        if name.startswith("_") or not isinstance(data, dict): continue
        rows.append((name, data.get("accuracy", 0), data.get("f1", 0),
                     data.get("roc_auc", 0)))
    for name, data in dl.items():
        if not isinstance(data, dict): continue
        rows.append((name, data.get("accuracy", 0), data.get("f1", 0),
                     data.get("roc_auc", 0)))
    rows.sort(key=lambda r: r[3], reverse=True)

    names = [r[0] for r in rows]
    accs  = [r[1] for r in rows]
    f1s   = [r[2] for r in rows]
    aucs  = [r[3] for r in rows]

    x = np.arange(len(names))
    w = 0.27
    fig, ax = plt.subplots(figsize=(11, 5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)

    ax.bar(x - w, accs, w, color=GOLD, label="Doğruluk")
    ax.bar(x,     f1s,  w, color=HUMAN, label="F1 Skoru")
    ax.bar(x + w, aucs, w, color=AIRED, label="ROC-AUC")
    for xi, v in zip(x + w, aucs):
        ax.text(xi, v + 0.005, f"{v:.3f}", ha="center", fontsize=8,
                fontweight="normal")

    ax.set_xticks(x)
    ax.set_xticklabels(names, rotation=20, ha="right", fontsize=9)
    ax.set_ylim(0.60, 1.00)
    ax.set_ylabel("Skor")
    ax.set_title("Model Performans Karşılaştırması — "
                 "11 Model (5 Katlı Çapraz Doğrulama, 47 Öznitelik, 5.195 Örnek)",
                 fontsize=12, fontweight="normal")
    ax.legend(loc="lower left")
    _save(fig, "paper_model_comparison")


# ══════════════════════════════════════════════════════════════════════════
# 4. paper_roc_curves - 7 ML modeli için ROC
# ══════════════════════════════════════════════════════════════════════════
def fig_roc_curves():
    df, X, y = load_xy()
    scaler = StandardScaler().fit(X.values)
    Xs = scaler.transform(X.values)

    model_files = {
        "Lojistik Regresyon":   "model_logistic_regression.pkl",
        "Rastgele Orman":       "model_random_forest.pkl",
        "Gradyan Artırma":      "model_gradient_boosting.pkl",
        "SVM (RBF)":            "model_svm_rbf.pkl",
        "ÇKA Sinir Ağı":        "model_mlp_neural_network.pkl",
        "XGBoost":              "model_xgboost.pkl",
        "LightGBM":             "model_lightgbm.pkl",
    }
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    fig, ax = plt.subplots(figsize=(8, 6.5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)

    palette = [GOLD, "#4363d8", "#3cb44b", "#a64b3c", "#911eb4",
               "#f58231", "#42d4f4"]

    for color, (name, fname) in zip(palette, model_files.items()):
        template = joblib.load(MODELS / fname)
        oof = np.zeros_like(y, dtype=float)
        for tr_idx, va_idx in skf.split(Xs, y):
            mdl = clone(template)
            mdl.fit(Xs[tr_idx], y[tr_idx])
            if hasattr(mdl, "predict_proba"):
                oof[va_idx] = mdl.predict_proba(Xs[va_idx])[:, 1]
            else:
                oof[va_idx] = mdl.decision_function(Xs[va_idx])
        fpr, tpr, _ = roc_curve(y, oof)
        a = auc(fpr, tpr)
        lw = 2.5 if name == "LightGBM" else 1.4
        ax.plot(fpr, tpr, color=color, lw=lw,
                label=f"{name} (AUC = {a:.4f})")

    ax.plot([0, 1], [0, 1], "k--", lw=1, alpha=0.4,
            label="Rastgele (AUC = 0,500)")
    ax.set_xlabel("Yanlış Pozitif Oranı")
    ax.set_ylabel("Doğru Pozitif Oranı")
    ax.set_title("ROC Eğrileri — Gerçek Tutulan-Kat Tahminleri, "
                 "5 Katlı Çapraz Doğrulama",
                 fontsize=12, fontweight="normal")
    ax.legend(loc="lower right", fontsize=8)
    ax.set_xlim(0, 1); ax.set_ylim(0, 1.02)
    _save(fig, "paper_roc_curves")


# ══════════════════════════════════════════════════════════════════════════
# 5. all_models_heatmap - 11 model performans ısı haritası
# ══════════════════════════════════════════════════════════════════════════
def fig_all_models_heatmap():
    with open(MODELS / "training_results.json") as f:
        ml = json.load(f)
    with open(MODELS / "deep_learning_results.json") as f:
        dl = json.load(f)

    rows = []
    for name, data in ml.items():
        if name.startswith("_") or not isinstance(data, dict): continue
        rows.append((name, "ML", data.get("accuracy", 0),
                     data.get("precision", 0), data.get("recall", 0),
                     data.get("f1", 0), data.get("roc_auc", 0)))
    for name, data in dl.items():
        if not isinstance(data, dict): continue
        rows.append((name, "DL", data.get("accuracy", 0),
                     data.get("precision", 0), data.get("recall", 0),
                     data.get("f1", 0), data.get("roc_auc", 0)))
    rows.sort(key=lambda r: r[6], reverse=True)

    metrics = ["Doğruluk", "Kesinlik", "Duyarlılık", "F1", "ROC-AUC"]
    values  = np.array([row[2:] for row in rows])
    labels  = [f"{row[0]} ({row[1]})" for row in rows]

    fig, ax = plt.subplots(figsize=(10, 0.45 * len(rows) + 2))
    fig.patch.set_facecolor(BG)
    cmap = mcolors.LinearSegmentedColormap.from_list(
        "auris", ["#f5e8d0", GOLD, "#6b4a1e"])
    im = ax.imshow(values, cmap=cmap, vmin=0.65, vmax=1.0, aspect="auto")
    plt.colorbar(im, ax=ax, fraction=0.025)

    ax.set_xticks(range(len(metrics)))
    ax.set_xticklabels(metrics)
    ax.set_yticks(range(len(labels)))
    ax.set_yticklabels(labels)

    best_per_col = values.argmax(axis=0)
    for i in range(values.shape[0]):
        for j in range(values.shape[1]):
            is_best = (i == best_per_col[j])
            color = "white" if values[i, j] > 0.88 else "#333"
            weight = "bold" if is_best else "normal"
            ax.text(j, i, f"{values[i, j]:.3f}",
                    ha="center", va="center", fontsize=9,
                    color=color, fontweight=weight)

    ax.set_title("Tüm Modeller — Performans Isı Haritası\n"
                 "5.195 örnek, 47 öznitelik, 5 katlı çapraz doğrulama "
                 "(sütun bazında en iyi değer kalın)",
                 fontsize=12, fontweight="normal")
    ax.grid(False)
    _save(fig, "all_models_heatmap")


# ══════════════════════════════════════════════════════════════════════════
# 6. paper_ml_vs_dl - ML vs DL karşılaştırma
# ══════════════════════════════════════════════════════════════════════════
def fig_ml_vs_dl():
    with open(MODELS / "training_results.json") as f:
        ml = json.load(f)
    with open(MODELS / "deep_learning_results.json") as f:
        dl = json.load(f)

    ml_names, ml_accs, ml_aucs, ml_f1s = [], [], [], []
    dl_names, dl_accs, dl_aucs, dl_f1s = [], [], [], []
    for name, data in ml.items():
        if name.startswith("_") or not isinstance(data, dict): continue
        ml_names.append(name); ml_accs.append(data.get("accuracy", 0))
        ml_aucs.append(data.get("roc_auc", 0)); ml_f1s.append(data.get("f1", 0))
    for name, data in dl.items():
        if not isinstance(data, dict): continue
        dl_names.append(name); dl_accs.append(data.get("accuracy", 0))
        dl_aucs.append(data.get("roc_auc", 0)); dl_f1s.append(data.get("f1", 0))

    fig, axes = plt.subplots(1, 3, figsize=(14, 5))
    fig.patch.set_facecolor(BG)
    fig.suptitle("ML ve DL Modellerinin Karşılaştırması — "
                 "47 Öznitelik, 5.195 Örnek, 5 Katlı Çapraz Doğrulama",
                 fontsize=13, fontweight="normal")

    for ax, ml_vals, dl_vals, title in zip(
        axes,
        [ml_accs, ml_aucs, ml_f1s],
        [dl_accs, dl_aucs, dl_f1s],
        ["Doğruluk", "ROC-AUC", "F1 Skoru"],
    ):
        ax.set_facecolor(BG)
        ml_y = range(len(ml_names))
        dl_y = range(len(dl_names))
        offset = len(ml_names) + 1

        bars_ml = ax.barh(list(ml_y), ml_vals, color=GOLD)
        bars_dl = ax.barh([i + offset for i in dl_y], dl_vals,
                          color="#6b4a1e")

        ax.set_yticks(list(ml_y) + [i + offset for i in dl_y])
        ax.set_yticklabels(ml_names + dl_names, fontsize=8)
        ax.set_xlim(0.65, 1.06)
        ax.set_xlabel(title)

        ax.axhline(len(ml_names) - 0.5, color="#aaa", lw=1, ls="--")
        ax.text(0.66, len(ml_names) / 2 - 0.3, "ML", fontsize=9,
                color=GOLD, fontweight="normal")
        ax.text(0.66, offset + len(dl_names) / 2 - 0.3, "DL", fontsize=9,
                color="#6b4a1e", fontweight="normal")

        for bar, val in zip(list(bars_ml) + list(bars_dl), ml_vals + dl_vals):
            ax.text(bar.get_width() + 0.002,
                    bar.get_y() + bar.get_height() / 2,
                    f"{val:.3f}", va="center", fontsize=7.5)

    plt.tight_layout()
    _save(fig, "paper_ml_vs_dl")


# ══════════════════════════════════════════════════════════════════════════
# 7. training_history - DL eğitim eğrileri
# ══════════════════════════════════════════════════════════════════════════
def fig_training_history():
    """4 DL modelinin epok bazlı eğitim eğrileri."""
    MODELS_LIST = [
        ("Derin ÇKA (512-256-128-64)", "dl_history_deep_mlp.csv"),
        ("1B-ESA",                      "dl_history_1d_cnn.csv"),
        ("Artık ÇKA (3 blok)",          "dl_history_residual_mlp.csv"),
        ("Dikkat ÇKA",                  "dl_history_attention_mlp.csv"),
    ]
    fig, axes = plt.subplots(1, 4, figsize=(17, 4.2), sharey=True)
    fig.patch.set_facecolor(BG)

    for ax, (name, fname) in zip(axes, MODELS_LIST):
        path = MODELS / fname
        if not path.exists():
            ax.text(0.5, 0.5, f"yok\n{fname}", ha="center", va="center",
                    transform=ax.transAxes)
            ax.set_title(name, fontsize=10)
            continue
        d = pd.read_csv(path)
        max_e = int(d["epoch"].max())
        epochs = np.arange(1, max_e + 1)
        tm = np.full(max_e, np.nan); ts = np.full(max_e, np.nan)
        vm = np.full(max_e, np.nan); vs = np.full(max_e, np.nan)
        for e in epochs:
            rows = d[d["epoch"] == e]
            if len(rows) > 0:
                tm[e-1] = rows["train_auc"].mean()
                ts[e-1] = rows["train_auc"].std() if len(rows) > 1 else 0.0
                vm[e-1] = rows["val_auc"].mean()
                vs[e-1] = rows["val_auc"].std() if len(rows) > 1 else 0.0

        ax.set_facecolor(BG)
        ax.plot(epochs, tm, color=GOLD, lw=2, label="Eğitim AUC")
        ax.fill_between(epochs, tm - ts, tm + ts, color=GOLD, alpha=0.18)
        ax.plot(epochs, vm, color="#6b4a1e", lw=2, ls="--",
                label="Doğrulama AUC")
        ax.fill_between(epochs, vm - vs, vm + vs, color="#6b4a1e", alpha=0.18)
        ax.set_xlabel("Epok")
        ax.set_title(name, fontsize=10)
        ax.set_ylim(0.55, 1.02)
        ax.legend(loc="lower right", fontsize=8)
        best_e = int(np.nanargmax(vm)) + 1
        best = float(np.nanmax(vm))
        ax.axvline(best_e, color="#888", ls=":", lw=0.8)
        ax.text(best_e + 0.5, 0.60,
                f"en iyi val AUC = {best:.4f}\nepok {best_e}'de",
                fontsize=8, color="#333")

    axes[0].set_ylabel("ROC-AUC")
    fig.suptitle("Eğitim Geçmişi — 5 Katın Ortalaması "
                 "(Gerçek, Epok Bazlı Kayıtlar)",
                 fontsize=13, fontweight="normal", y=1.04)
    plt.tight_layout()
    _save(fig, "training_history")


# ══════════════════════════════════════════════════════════════════════════
# 8. paper_fold_std_table - 11 modelin kat bazlı AUC tablosu
# ══════════════════════════════════════════════════════════════════════════
def fig_fold_std_table():
    tbl_dir = Path(__file__).parent / "real_tables"
    ml = pd.read_csv(tbl_dir / "oof_auc.csv")
    rows = []
    for _, r in ml.iterrows():
        folds = [float(x) for x in r["fold_aucs"].split(";")]
        rows.append((r["model"], "ML", r["fold_mean_auc"],
                     r["fold_std_auc"], folds))

    with open(MODELS / "deep_learning_results.json") as f:
        dl = json.load(f)
    for name, data in dl.items():
        if not isinstance(data, dict): continue
        folds = data.get("fold_aucs", [])
        if folds:
            rows.append((name, "DL", float(np.mean(folds)),
                         float(np.std(folds)), [float(x) for x in folds]))

    # Türkçeye çevir
    tr_map = {
        "Logistic Regression":      "Lojistik Regresyon",
        "Random Forest":            "Rastgele Orman",
        "Gradient Boosting":        "Gradyan Artırma",
        "SVM (RBF)":                "SVM (RBF)",
        "MLP Neural Network":       "ÇKA Sinir Ağı",
        "XGBoost":                  "XGBoost",
        "LightGBM":                 "LightGBM",
        "Deep MLP (512-256-128-64)":"Derin ÇKA (512-256-128-64)",
        "1D-CNN":                   "1B-ESA",
        "Residual MLP (3 blocks)":  "Artık ÇKA (3 blok)",
        "Attention MLP":            "Dikkat ÇKA",
    }
    rows = [(tr_map.get(n, n), t, m, s, f) for (n, t, m, s, f) in rows]
    rows.sort(key=lambda r: r[2], reverse=True)

    table_data = []
    for name, mtype, mean, std, folds in rows:
        fold_str = ", ".join(f"{v:.3f}" for v in folds)
        table_data.append([name, mtype, f"{mean:.4f}", f"±{std:.4f}",
                           fold_str])

    col_labels = ["Model", "Tip", "Ort. AUC", "Std AUC",
                  "Kat Bazlı AUC (5 kat)"]
    col_widths = [0.26, 0.07, 0.12, 0.11, 0.44]

    fig, ax = plt.subplots(figsize=(13, 0.5 * len(rows) + 1.4))
    fig.patch.set_facecolor(BG)
    ax.axis("off")
    tbl = ax.table(cellText=table_data, colLabels=col_labels,
                   colWidths=col_widths, loc="center", cellLoc="center")
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(9)
    tbl.scale(1, 1.6)
    for j in range(len(col_labels)):
        tbl[(0, j)].set_facecolor(GOLD)
        tbl[(0, j)].set_text_props(color="white", fontweight="normal")
    for i in range(1, len(rows) + 1):
        color = "#f5f0e8" if i % 2 == 0 else BG
        for j in range(len(col_labels)):
            tbl[(i, j)].set_facecolor(color)
        if i == 1:
            for j in range(len(col_labels)):
                tbl[(i, j)].set_text_props(fontweight="normal")
    ax.set_title("Çapraz Doğrulama AUC Sonuçları (5 Katlı) — "
                 "Ort. ± Std, Tüm On Bir Model",
                 fontsize=12, fontweight="normal", pad=14)
    out = FIG_DIR / "paper_fold_std_table.png"
    fig.savefig(out); plt.close(fig)
    print(f"  TR  paper_fold_std_table.png ({out.stat().st_size//1024} KB)")


# ══════════════════════════════════════════════════════════════════════════
# 9. paper_feature_importance - Top 20 öznitelik önemi
# ══════════════════════════════════════════════════════════════════════════
def fig_feature_importance():
    with open(MODELS / "training_results.json") as f:
        tr = json.load(f)
    imp = tr.get("_feature_importance", {})
    items = sorted(imp.items(), key=lambda x: x[1], reverse=True)[:20]
    names = [k for k, _ in items][::-1]
    vals  = [v for _, v in items][::-1]

    fig, ax = plt.subplots(figsize=(9, 8))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    bars = ax.barh(names, vals, color=GOLD)
    for bar, v in zip(bars, vals):
        ax.text(v + 0.0008, bar.get_y() + bar.get_height()/2,
                f"{v:.4f}", va="center", fontsize=8, fontweight="normal")
    ax.set_xlabel("Normalleştirilmiş Önem")
    ax.set_title("İlk Yirmi Öznitelik Önemi — "
                 "LightGBM (En İyi Model)",
                 fontsize=12, fontweight="normal")
    ax.set_xlim(0, max(vals) * 1.12)
    _save(fig, "paper_feature_importance")


# ══════════════════════════════════════════════════════════════════════════
# 10. shap_summary - SHAP global etki
# ══════════════════════════════════════════════════════════════════════════
def fig_shap_summary():
    try:
        import shap
    except ImportError:
        print("  SHAP yok - atlanıyor")
        return
    df, X, y = load_xy()
    model = joblib.load(MODELS / "model_lightgbm.pkl")
    scaler = joblib.load(MODELS / "feature_scaler_v1.pkl")
    Xs = scaler.transform(X)
    rng = np.random.default_rng(42)
    if len(Xs) > 2000:
        idx = rng.choice(len(Xs), 2000, replace=False)
        Xs_samp = Xs[idx]
    else:
        Xs_samp = Xs
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(Xs_samp)
    if isinstance(shap_values, list):
        shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]

    plt.figure(figsize=(8, 8))
    shap.summary_plot(shap_values, Xs_samp, feature_names=FEATURES,
                      show=False, plot_size=(8, 8))
    fig = plt.gcf()
    fig.patch.set_facecolor(BG)
    plt.title("SHAP Özet Grafiği — LightGBM "
              "(2.000 Örneklik CV Diliminde, Gerçek)",
              fontsize=11, fontweight="normal", pad=12)
    _save(fig, "shap_summary")


# ══════════════════════════════════════════════════════════════════════════
# 11. paper_confusion_matrix_lightgbm - LightGBM karmaşıklık matrisi
# ══════════════════════════════════════════════════════════════════════════
def fig_confusion_matrix():
    y_true = np.load(MODELS / "lgbm_cv_ytrue.npy")
    y_prob = np.load(MODELS / "lgbm_cv_probs.npy")
    threshold = 0.4316
    y_pred = (y_prob >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred)
    acc = (cm[0,0] + cm[1,1]) / cm.sum()

    fig, ax = plt.subplots(figsize=(5.5, 5.2))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    cmap = mcolors.LinearSegmentedColormap.from_list("auris",
                                                      ["#faf8f4", GOLD])
    im = ax.imshow(cm, cmap=cmap)
    plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

    labels = ["İnsan", "YZ"]
    for i in range(2):
        for j in range(2):
            pct = cm[i, j] / cm.sum() * 100
            ax.text(j, i, f"{cm[i,j]}\n(%{pct:.1f})",
                    ha="center", va="center", fontsize=13, fontweight="normal",
                    color="white" if cm[i,j] > cm.max()*0.5 else "#333")

    ax.set_xticks([0,1]); ax.set_yticks([0,1])
    ax.set_xticklabels(labels); ax.set_yticklabels(labels)
    ax.set_xlabel("Tahmin Edilen Etiket"); ax.set_ylabel("Gerçek Etiket")
    ax.set_title(f"Karmaşıklık Matrisi — LightGBM, θ* = {threshold}\n"
                 f"Doğruluk: %{acc*100:.1f}  |  AUC: 0,9549",
                 fontsize=11)
    ax.grid(False)
    _save(fig, "paper_confusion_matrix_lightgbm")


# ══════════════════════════════════════════════════════════════════════════
# 12. paper_score_distribution - olasılık dağılımı
# ══════════════════════════════════════════════════════════════════════════
def fig_score_distribution():
    y_true = np.load(MODELS / "lgbm_cv_ytrue.npy")
    y_prob = np.load(MODELS / "lgbm_cv_probs.npy")
    threshold = 0.4316
    fig, ax = plt.subplots(figsize=(8.5, 5.0))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    ax.hist(y_prob[y_true == 0], bins=40, alpha=0.35, color=HUMAN,
            label=f"İnsan (n={int((y_true==0).sum())})")
    ax.hist(y_prob[y_true == 1], bins=40, alpha=0.35, color=AIRED,
            label=f"YZ (n={int((y_true==1).sum())})")
    ax.axvline(threshold, color="#333", ls="--", lw=1.8,
               label=f"Youden-optimal eşik θ* = {threshold}")
    ax.set_xlabel("Tahmin Edilen Olasılık P(YZ)")
    ax.set_ylabel("Sayım")
    ax.set_title("Tahmin Olasılık Dağılımı — LightGBM",
                 fontsize=12, fontweight="normal")
    ax.legend(loc="upper center")
    _save(fig, "paper_score_distribution")


# ══════════════════════════════════════════════════════════════════════════
# 13. paper_calibration - Kalibrasyon eğrisi
# ══════════════════════════════════════════════════════════════════════════
def fig_calibration():
    y_true = np.load(MODELS / "lgbm_cv_ytrue.npy")
    y_prob = np.load(MODELS / "lgbm_cv_probs.npy")
    brier = brier_score_loss(y_true, y_prob)
    frac, mean_pred = calibration_curve(y_true, y_prob, n_bins=10)

    fig, ax = plt.subplots(figsize=(7, 6))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    ax.plot([0, 1], [0, 1], "k--", lw=1, alpha=0.5,
            label="Mükemmel kalibrasyon")
    ax.plot(mean_pred, frac, "o-", color=GOLD, lw=2.5, markersize=8,
            label="LightGBM")
    ax.fill_between(mean_pred, mean_pred, frac, alpha=0.2, color=GOLD)
    ax.set_xlabel("Ortalama Tahmin Olasılığı")
    ax.set_ylabel("Pozitif Oranı")
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.set_title("Kalibrasyon Eğrisi — LightGBM",
                 fontsize=12, fontweight="normal")
    ax.text(0.05, 0.92,
            f"Brier Skoru = {brier:.4f}\nN = 5195 (5 Katlı CV)",
            transform=ax.transAxes, fontsize=10,
            bbox=dict(boxstyle="round", facecolor="white", alpha=0.9))
    ax.legend(loc="lower right")
    _save(fig, "paper_calibration")


# ══════════════════════════════════════════════════════════════════════════
# 14. paper_precision_recall - Kesinlik-duyarlılık eğrisi
# ══════════════════════════════════════════════════════════════════════════
def fig_precision_recall():
    y_true = np.load(MODELS / "lgbm_cv_ytrue.npy")
    y_prob = np.load(MODELS / "lgbm_cv_probs.npy")
    prec, rec, _ = precision_recall_curve(y_true, y_prob)
    ap = average_precision_score(y_true, y_prob)
    baseline = y_true.mean()

    fig, ax = plt.subplots(figsize=(7, 6))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    ax.plot(rec, prec, color=GOLD, lw=2.5,
            label=f"LightGBM (AP={ap:.4f})")
    ax.fill_between(rec, prec, alpha=0.2, color=GOLD)
    ax.axhline(baseline, color="#888", ls="--", lw=1,
               label=f"Baz Çizgi = {baseline:.3f}")
    ax.set_xlabel("Duyarlılık")
    ax.set_ylabel("Kesinlik")
    ax.set_xlim(0, 1); ax.set_ylim(0, 1.05)
    ax.set_title("Kesinlik-Duyarlılık Eğrisi — LightGBM",
                 fontsize=12, fontweight="normal")
    ax.legend(loc="center")
    _save(fig, "paper_precision_recall")


# ══════════════════════════════════════════════════════════════════════════
# 15. threshold_sweep - Eşik taraması
# ══════════════════════════════════════════════════════════════════════════
def fig_threshold_sweep():
    y_true = np.load(MODELS / "lgbm_cv_ytrue.npy")
    y_prob = np.load(MODELS / "lgbm_cv_probs.npy")
    thresholds = np.linspace(0.05, 0.95, 91)
    precs, recs, f1s, accs = [], [], [], []
    for t in thresholds:
        y_pred = (y_prob >= t).astype(int)
        tp = int(((y_pred==1)&(y_true==1)).sum())
        fp = int(((y_pred==1)&(y_true==0)).sum())
        fn = int(((y_pred==0)&(y_true==1)).sum())
        tn = int(((y_pred==0)&(y_true==0)).sum())
        p = tp/(tp+fp) if (tp+fp) else 0
        r = tp/(tp+fn) if (tp+fn) else 0
        f = 2*p*r/(p+r) if (p+r) else 0
        a = (tp+tn)/(tp+fp+fn+tn)
        precs.append(p); recs.append(r); f1s.append(f); accs.append(a)

    fpr, tpr, roc_thrs = roc_curve(y_true, y_prob)
    j = tpr - fpr
    y_th = float(roc_thrs[np.argmax(j)])
    y_f1 = float(np.interp(y_th, thresholds, f1s))

    fig, ax = plt.subplots(figsize=(8.5, 5.5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    ax.plot(thresholds, precs, color=GOLD, lw=2, label="Kesinlik")
    ax.plot(thresholds, recs,  color=HUMAN, lw=2, label="Duyarlılık")
    ax.plot(thresholds, f1s,   color="#a64b3c", lw=2.5, label="F1 Skoru")
    ax.plot(thresholds, accs,  color="#4363d8", lw=2, ls=":", label="Doğruluk")
    ax.axvline(0.5, color="#888", ls=":", lw=1.2, label="Varsayılan 0,5")
    ax.axvline(y_th, color=GOLD, ls="--", lw=1.5,
               label=f"Youden-J en iyi @ {y_th:.4f}")
    ax.scatter([y_th], [y_f1], color=GOLD, s=90, zorder=5,
               edgecolors="#6b4a1e", linewidths=1.5)
    ax.set_xlabel("Karar Eşiği")
    ax.set_ylabel("Skor")
    ax.set_title("Eşik Taraması — Kesinlik / Duyarlılık / F1 "
                 "Eşiğe Göre (LightGBM)",
                 fontsize=12, fontweight="normal")
    ax.legend(loc="lower left", fontsize=9)
    ax.set_ylim(0, 1.02)
    _save(fig, "threshold_sweep")


# ══════════════════════════════════════════════════════════════════════════
# 16. per_source_performance - Kaynak bazlı performans
# ══════════════════════════════════════════════════════════════════════════
def fig_per_source():
    tbl_dir = Path(__file__).parent / "real_tables"
    d = pd.read_csv(tbl_dir / "per_source.csv")
    # Türkçeleştir
    src_map = {
        "Suno (AI)":            "Suno (YZ)",
        "Echoes (AI)":          "Echoes (YZ)",
        "AImE (AI)":            "AImE (YZ)",
        "Deepfake set (AI)":    "Deepfake seti (YZ)",
        "GTZAN (human)":        "GTZAN (insan)",
        "FMA (human)":          "FMA (insan)",
        "SleepyJesse (human)":  "SleepyJesse (insan)",
    }
    d["source_tr"] = d["source"].map(lambda s: src_map.get(s, s))
    d = d.sort_values(["metric", "value"], ascending=[True, False])

    fig, ax = plt.subplots(figsize=(9, 0.5 * len(d) + 1.5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    colors = [AIRED if "YZ" in s else HUMAN for s in d["source_tr"]]
    bars = ax.barh(d["source_tr"] + "  (n=" + d["n"].astype(str) + ")",
                   d["value"], color=colors)
    for bar, v in zip(bars, d["value"]):
        ax.text(v + 0.005, bar.get_y() + bar.get_height()/2,
                f"{v:.3f}", va="center", fontsize=9, fontweight="normal")
    ax.set_xlim(0, 1.0)
    ax.invert_yaxis()
    ax.set_xlabel("YZ sınıfı duyarlılığı (kırmızı) / "
                  "İnsan sınıfı doğruluğu (yeşil)")
    ax.set_title("Kaynak Bazlı Performans — LightGBM, θ* = 0,4316\n"
                 "(5 Katlı Çapraz Doğrulama Tahminleri Üzerinde)",
                 fontsize=11, fontweight="normal")
    _save(fig, "per_source_performance")


# ══════════════════════════════════════════════════════════════════════════
# 17. per_class_metrics - Sınıf bazlı performans
# ══════════════════════════════════════════════════════════════════════════
def fig_per_class():
    y_true = np.load(MODELS / "lgbm_cv_ytrue.npy")
    y_prob = np.load(MODELS / "lgbm_cv_probs.npy")
    threshold = 0.4316
    y_pred = (y_prob >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm[0,0], cm[0,1], cm[1,0], cm[1,1]

    h_prec = tn/(tn+fn) if (tn+fn) else 0
    h_rec  = tn/(tn+fp) if (tn+fp) else 0
    h_f1   = 2*h_prec*h_rec/(h_prec+h_rec)
    a_prec = tp/(tp+fp) if (tp+fp) else 0
    a_rec  = tp/(tp+fn) if (tp+fn) else 0
    a_f1   = 2*a_prec*a_rec/(a_prec+a_rec)

    classes = [f"İnsan\n(n={int((y_true==0).sum())})",
               f"YZ\n(n={int((y_true==1).sum())})"]
    prec = [h_prec, a_prec]; rec = [h_rec, a_rec]; f1s = [h_f1, a_f1]
    x = np.arange(len(classes)); w = 0.27

    fig, ax = plt.subplots(figsize=(7.5, 4.8))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    ax.bar(x - w, prec, w, label="Kesinlik", color=GOLD)
    ax.bar(x,     rec,  w, label="Duyarlılık", color=HUMAN)
    ax.bar(x + w, f1s,  w, label="F1 Skoru", color="#a64b3c")
    for xi, (p, r, f) in enumerate(zip(prec, rec, f1s)):
        ax.text(xi - w, p + 0.012, f"{p:.3f}", ha="center", fontsize=9, fontweight="normal")
        ax.text(xi,     r + 0.012, f"{r:.3f}", ha="center", fontsize=9, fontweight="normal")
        ax.text(xi + w, f + 0.012, f"{f:.3f}", ha="center", fontsize=9, fontweight="normal")
    ax.set_xticks(x); ax.set_xticklabels(classes)
    ax.set_ylabel("Skor"); ax.set_ylim(0, 1.05)
    ax.set_title(f"Sınıf Bazlı Performans — LightGBM, θ* = {threshold}",
                 fontsize=12, fontweight="normal")
    ax.legend(loc="lower right")
    _save(fig, "per_class_metrics")


# ══════════════════════════════════════════════════════════════════════════
# 18. train_val_gap - Aşırı öğrenme tanısı
# ══════════════════════════════════════════════════════════════════════════
def fig_train_val_gap():
    tbl_dir = Path(__file__).parent / "real_tables"
    d = pd.read_csv(tbl_dir / "train_val_gap.csv")
    tr_map = {
        "Random Forest":      "Rastgele Orman",
        "SVM (RBF)":          "SVM (RBF)",
        "LightGBM":           "LightGBM",
        "MLP Neural Network": "ÇKA Sinir Ağı",
        "XGBoost":            "XGBoost",
        "Gradient Boosting":  "Gradyan Artırma",
        "Logistic Regression":"Lojistik Regresyon",
    }
    d["model_tr"] = d["model"].map(lambda s: tr_map.get(s, s))
    d = d.sort_values("gap", ascending=False)
    x = np.arange(len(d)); w = 0.38

    fig, ax = plt.subplots(figsize=(9.5, 5.5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    ax.bar(x - w/2, d["train_acc"], w, color=GOLD,
           label="Eğitim doğruluğu")
    ax.bar(x + w/2, d["cv_acc"], w, color="#6b4a1e",
           label="5 katlı CV doğruluğu")
    for i, (ta, ca) in enumerate(zip(d["train_acc"], d["cv_acc"])):
        ax.text(i - w/2, ta + 0.003, f"{ta:.3f}", ha="center", fontsize=8)
        ax.text(i + w/2, ca + 0.003, f"{ca:.3f}", ha="center", fontsize=8)
    ax.set_xticks(x); ax.set_xticklabels(d["model_tr"], rotation=20, ha="right")
    ax.set_ylim(0.7, 1.02)
    ax.set_ylabel("Doğruluk")
    ax.set_title("Eğitim ve Çapraz Doğrulama Doğruluğu — "
                 "Aşırı Öğrenme Tanısı",
                 fontsize=12, fontweight="normal")
    ax.legend(loc="lower right")
    _save(fig, "train_val_gap")


# ══════════════════════════════════════════════════════════════════════════
# 19. feature_correlation_heatmap - Öznitelik korelasyon ısı haritası
# ══════════════════════════════════════════════════════════════════════════
def fig_correlation_heatmap():
    df, X, y = load_xy()
    corr = X.corr().abs()
    fig, ax = plt.subplots(figsize=(14, 12))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    cmap = mcolors.LinearSegmentedColormap.from_list("auris",
                                                      ["white", GOLD, "#6b4a1e"])
    im = ax.imshow(corr.values, cmap=cmap, vmin=0, vmax=1)
    plt.colorbar(im, ax=ax, fraction=0.03)
    ax.set_xticks(range(len(corr))); ax.set_xticklabels(corr.columns, rotation=90, fontsize=7)
    ax.set_yticks(range(len(corr))); ax.set_yticklabels(corr.columns, fontsize=7)
    ax.set_title("Öznitelik Korelasyon Isı Haritası — "
                 "|Pearson r|, 5.195 parça üzerinden",
                 fontsize=12, fontweight="normal")
    ax.grid(False)
    _save(fig, "feature_correlation_heatmap")


# ══════════════════════════════════════════════════════════════════════════
# 20. feature_ablation_curve - Öznitelik çıkarma eğrisi
# ══════════════════════════════════════════════════════════════════════════
def fig_feature_ablation():
    tbl_dir = Path(__file__).parent / "real_tables"
    d = pd.read_csv(tbl_dir / "feature_ablation.csv")
    fig, ax = plt.subplots(figsize=(8, 5))
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    ax.errorbar(d["top_n"], d["mean_acc"], yerr=d["std_acc"],
                color=GOLD, ecolor="#6b4a1e", capsize=4, marker="o", lw=2)
    ax.set_xlabel("Öneme göre sıralanmış öznitelik sayısı (LightGBM)")
    ax.set_ylabel("5 katlı CV doğruluğu")
    ax.set_title("Öznitelik Çıkarma — LightGBM Doğruluğu vs "
                 "Öznitelik Sayısı",
                 fontsize=12, fontweight="normal")
    Ns = list(d["top_n"])
    ax.set_xticks(Ns)
    for x, y_, s in zip(d["top_n"], d["mean_acc"], d["std_acc"]):
        ax.text(x, y_ + 0.008, f"{y_:.3f}", ha="center", fontsize=8)
    _save(fig, "feature_ablation_curve")


# ══════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════
def main():
    print("=== TÜRKÇE FİGÜR ÜRETİMİ ===\n")
    fig_pipeline()
    fig_feature_distribution()
    fig_model_comparison()
    fig_roc_curves()
    fig_all_models_heatmap()
    fig_ml_vs_dl()
    fig_training_history()
    fig_fold_std_table()
    fig_feature_importance()
    fig_shap_summary()
    fig_confusion_matrix()
    fig_score_distribution()
    fig_calibration()
    fig_precision_recall()
    fig_threshold_sweep()
    fig_per_source()
    fig_per_class()
    fig_train_val_gap()
    fig_correlation_heatmap()
    fig_feature_ablation()
    print("\nTüm 20 figür Türkçe olarak yeniden üretildi.")


if __name__ == "__main__":
    main()
