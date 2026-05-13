"""Scratch: inspect per-source counts in features.csv."""
import pandas as pd
from collections import Counter

df = pd.read_csv(r"D:\CrownCode\DataSet\features.csv")

tokens = Counter()
prefixes = Counter()
for p in df["file_path"]:
    parts = p.replace("/", "\\").split("\\")
    if "DataSet" in parts:
        idx = parts.index("DataSet")
        if idx + 2 < len(parts):
            tokens[parts[idx + 2]] += 1
    name = parts[-1]
    prefixes[name.split("_")[0]] += 1

print("Source folder counts:")
for k, v in tokens.most_common():
    print(f"  {k}: {v}")

print("\nFilename prefix counts (top 20):")
for k, v in prefixes.most_common(20):
    print(f"  {k}: {v}")

print("\nLabel breakdown by folder source:")
df["source_folder"] = df["file_path"].apply(
    lambda p: p.replace("/", "\\").split("\\")[
        p.replace("/", "\\").split("\\").index("DataSet") + 2
    ]
    if "DataSet" in p.replace("/", "\\").split("\\")
    else "unknown"
)
print(df.groupby(["source_folder", "label_int"]).size().unstack(fill_value=0))
