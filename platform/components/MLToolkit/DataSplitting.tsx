// =========================================================================
// DATA SPLITTING TOOL - Interactive ML/DL Data Split Strategy Designer
// =========================================================================
// Implements professional data splitting strategies based on dataset size,
// split type, and ML/DL considerations. Generates Python & MATLAB code.
//
// References:
// - Data Splitting Strategies by Dataset Size (Lecture Note)
// - Python & MATLAB Dataset Splitting Comparative Lecture Note
//
// @author Hasan Arthur Altuntaş
// @version 1.0.0
// @since 2026-03-27
// =========================================================================

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  BarChart3,
  Brain,
  Cpu,
  Layers,
  Users,
  Clock,
  Shuffle,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  Target,
  TrendingUp,
  Info
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// ── Types ──────────────────────────────────────────────────────────────

type DatasetSize = 'small' | 'medium' | 'large'
type SplitStrategy = 'stratified' | 'group' | 'chronological' | 'cv_test'
type ModelType = 'ml' | 'dl'

interface SplitRatio {
  train: number
  validation: number
  test: number
}

// ── Component ──────────────────────────────────────────────────────────

const DataSplitting: React.FC = () => {
  const { t } = useLanguage()
  const ds = t.dataSplitting

  // State
  const [datasetSize, setDatasetSize] = useState<DatasetSize>('medium')
  const [splitStrategy, setSplitStrategy] = useState<SplitStrategy>('stratified')
  const [modelType, setModelType] = useState<ModelType>('ml')
  const [customRatio, setCustomRatio] = useState<SplitRatio>({ train: 70, validation: 15, test: 15 })
  const [cvFolds, setCvFolds] = useState<number>(5)
  const [copiedCode, setCopiedCode] = useState<'python' | 'matlab' | null>(null)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [showLeakageRules, setShowLeakageRules] = useState(false)

  // ── Recommended ratios based on size + model ────────────────────────

  const recommendedRatio = useMemo((): SplitRatio => {
    if (splitStrategy === 'cv_test') {
      return datasetSize === 'small'
        ? { train: 80, validation: 0, test: 20 }
        : { train: 85, validation: 0, test: 15 }
    }

    const ratios: Record<DatasetSize, Record<ModelType, SplitRatio>> = {
      small: {
        ml: { train: 70, validation: 15, test: 15 },
        dl: { train: 70, validation: 15, test: 15 }
      },
      medium: {
        ml: { train: 70, validation: 15, test: 15 },
        dl: { train: 80, validation: 10, test: 10 }
      },
      large: {
        ml: { train: 80, validation: 10, test: 10 },
        dl: { train: 90, validation: 5, test: 5 }
      }
    }
    return ratios[datasetSize][modelType]
  }, [datasetSize, modelType, splitStrategy])

  // Apply recommendation
  const applyRecommendation = useCallback(() => {
    setCustomRatio(recommendedRatio)
  }, [recommendedRatio])

  // ── Ratio slider handler ────────────────────────────────────────────

  const handleRatioChange = useCallback((field: keyof SplitRatio, value: number) => {
    setCustomRatio(prev => {
      const newRatio = { ...prev, [field]: value }
      const total = newRatio.train + newRatio.validation + newRatio.test
      if (total > 100) {
        const overflow = total - 100
        if (field === 'train') {
          newRatio.validation = Math.max(0, newRatio.validation - Math.ceil(overflow / 2))
          newRatio.test = 100 - newRatio.train - newRatio.validation
        } else if (field === 'validation') {
          newRatio.test = Math.max(0, 100 - newRatio.train - newRatio.validation)
        } else {
          newRatio.validation = Math.max(0, 100 - newRatio.train - newRatio.test)
        }
      }
      return newRatio
    })
  }, [])

  // ── Leakage warnings ───────────────────────────────────────────────

  const leakageWarnings = useMemo(() => {
    const warnings: string[] = []
    if (splitStrategy === 'stratified') {
      warnings.push(ds.warnings.stratifiedNotEnough)
    }
    if (splitStrategy === 'group') {
      warnings.push(ds.warnings.groupLeakage)
    }
    if (splitStrategy === 'chronological') {
      warnings.push(ds.warnings.futureLeakage)
    }
    if (datasetSize === 'small') {
      warnings.push(ds.warnings.smallDataUnstable)
    }
    if (modelType === 'dl' && datasetSize === 'small') {
      warnings.push(ds.warnings.dlSmallData)
    }
    warnings.push(ds.warnings.preprocessAfterSplit)
    warnings.push(ds.warnings.augmentTrainOnly)
    return warnings
  }, [splitStrategy, datasetSize, modelType, ds.warnings])

  // ── Code generation ─────────────────────────────────────────────────

  const generatedCode = useMemo(() => {
    const { train, validation, test } = customRatio
    const testSize = test / 100
    const valSize = validation / (train + validation)

    if (splitStrategy === 'stratified') {
      return {
        python: `import numpy as np
from sklearn.model_selection import train_test_split

# Dataset: X (features), y (labels)
# Strategy: Stratified Split (${train}/${validation}/${test})

# Step 1: Separate test set
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y,
    test_size=${testSize.toFixed(2)},
    stratify=y,
    random_state=42
)

${validation > 0 ? `# Step 2: Split remaining into train and validation
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp,
    test_size=${valSize.toFixed(2)},
    stratify=y_temp,
    random_state=42
)

print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
print(f"Train ratio: {len(X_train)/len(X):.2f}")
print(f"Class balance - Train: {np.mean(y_train):.3f}, Val: {np.mean(y_val):.3f}, Test: {np.mean(y_test):.3f}")` : `X_train = X_temp
y_train = y_temp

print(f"Train: {len(X_train)}, Test: {len(X_test)}")
print(f"Class balance - Train: {np.mean(y_train):.3f}, Test: {np.mean(y_test):.3f}")`}`,
        matlab: `rng(42)
% Dataset: X (features), Y (labels)
% Strategy: Stratified Split (${train}/${validation}/${test})

% Step 1: Separate test set
cvTest = cvpartition(Y, 'HoldOut', ${testSize.toFixed(2)});
idxTest = test(cvTest);
idxTemp = training(cvTest);

X_test = X(idxTest, :);  Y_test = Y(idxTest);
X_temp = X(idxTemp, :);  Y_temp = Y(idxTemp);

${validation > 0 ? `% Step 2: Split remaining into train and validation
cvVal = cvpartition(Y_temp, 'HoldOut', ${valSize.toFixed(2)});
idxVal = test(cvVal);
idxTr  = training(cvVal);

X_train = X_temp(idxTr, :);  Y_train = Y_temp(idxTr);
X_val   = X_temp(idxVal, :); Y_val   = Y_temp(idxVal);

fprintf('Train: %d, Val: %d, Test: %d\\n', nnz(idxTr), nnz(idxVal), nnz(idxTest));` : `X_train = X_temp;  Y_train = Y_temp;

fprintf('Train: %d, Test: %d\\n', sum(idxTemp), sum(idxTest));`}`
      }
    }

    if (splitStrategy === 'group') {
      return {
        python: `import numpy as np
from sklearn.model_selection import GroupShuffleSplit

# Dataset: X (features), y (labels), groups (e.g. patient_id)
# Strategy: Group Split (${train}/${validation}/${test})
# All samples from the same group stay in the same set

gss_test = GroupShuffleSplit(
    n_splits=1, test_size=${testSize.toFixed(2)}, random_state=42
)
temp_idx, test_idx = next(gss_test.split(X, y, groups))

X_test, y_test = X[test_idx], y[test_idx]
X_temp, y_temp = X[temp_idx], y[temp_idx]
groups_temp = groups[temp_idx]

${validation > 0 ? `gss_val = GroupShuffleSplit(
    n_splits=1, test_size=${valSize.toFixed(2)}, random_state=42
)
train_idx, val_idx = next(gss_val.split(X_temp, y_temp, groups_temp))

X_train, y_train = X_temp[train_idx], y_temp[train_idx]
X_val, y_val = X_temp[val_idx], y_temp[val_idx]

# Verify no group leakage
train_groups = set(groups_temp[train_idx])
val_groups = set(groups_temp[val_idx])
test_groups = set(groups[test_idx])
assert train_groups.isdisjoint(val_groups), "Group leakage detected!"
assert train_groups.isdisjoint(test_groups), "Group leakage detected!"
print(f"Train groups: {len(train_groups)}, Val groups: {len(val_groups)}, Test groups: {len(test_groups)}")` : `X_train, y_train = X_temp, y_temp
print(f"Train: {len(X_train)}, Test: {len(X_test)}")`}`,
        matlab: `rng(42)
% Dataset: X (features), Y (labels), groupID (e.g. patient_id)
% Strategy: Group Split (${train}/${validation}/${test})

uniqueGroups = unique(groupID);
nGroups = numel(uniqueGroups);
nTestGroups = round(nGroups * ${testSize.toFixed(2)});

shuffled = uniqueGroups(randperm(nGroups));
testGroups = shuffled(1:nTestGroups);
${validation > 0 ? `nValGroups = round(nGroups * ${(validation/100).toFixed(2)});
valGroups  = shuffled(nTestGroups+1 : nTestGroups+nValGroups);
trainGroups = shuffled(nTestGroups+nValGroups+1 : end);

idxTest  = ismember(groupID, testGroups);
idxVal   = ismember(groupID, valGroups);
idxTrain = ismember(groupID, trainGroups);

X_train = X(idxTrain,:); Y_train = Y(idxTrain);
X_val   = X(idxVal,:);   Y_val   = Y(idxVal);
X_test  = X(idxTest,:);  Y_test  = Y(idxTest);

fprintf('Train groups: %d, Val groups: %d, Test groups: %d\\n', ...
    numel(trainGroups), numel(valGroups), numel(testGroups));` : `trainGroups = shuffled(nTestGroups+1 : end);

idxTest  = ismember(groupID, testGroups);
idxTrain = ismember(groupID, trainGroups);

X_train = X(idxTrain,:); Y_train = Y(idxTrain);
X_test  = X(idxTest,:);  Y_test  = Y(idxTest);`}`
      }
    }

    if (splitStrategy === 'chronological') {
      return {
        python: `import pandas as pd
import numpy as np

# Dataset: df with date column sorted chronologically
# Strategy: Chronological Split (${train}/${validation}/${test})
# No future data leaks into training

n = len(df)
train_end = int(n * ${(train/100).toFixed(2)})
${validation > 0 ? `val_end = int(n * ${((train + validation)/100).toFixed(2)})

train = df.iloc[:train_end]
val   = df.iloc[train_end:val_end]
test  = df.iloc[val_end:]

print(f"Train: {train.date.min()} to {train.date.max()} ({len(train)} samples)")
print(f"Val:   {val.date.min()} to {val.date.max()} ({len(val)} samples)")
print(f"Test:  {test.date.min()} to {test.date.max()} ({len(test)} samples)")` : `train = df.iloc[:train_end]
test  = df.iloc[train_end:]

print(f"Train: {train.date.min()} to {train.date.max()} ({len(train)} samples)")
print(f"Test:  {test.date.min()} to {test.date.max()} ({len(test)} samples)")`}

# WARNING: Do NOT shuffle time series data!
# Ensure no future information leaks into training.`,
        matlab: `% Dataset: T (table with date column, sorted)
% Strategy: Chronological Split (${train}/${validation}/${test})

n = height(T);
trainEnd = round(n * ${(train/100).toFixed(2)});
${validation > 0 ? `valEnd = round(n * ${((train + validation)/100).toFixed(2)});

train = T(1:trainEnd, :);
val   = T(trainEnd+1:valEnd, :);
test  = T(valEnd+1:end, :);

fprintf('Train: %s to %s (%d samples)\\n', ...
    string(train.date(1)), string(train.date(end)), height(train));
fprintf('Val:   %s to %s (%d samples)\\n', ...
    string(val.date(1)), string(val.date(end)), height(val));
fprintf('Test:  %s to %s (%d samples)\\n', ...
    string(test.date(1)), string(test.date(end)), height(test));` : `train = T(1:trainEnd, :);
test  = T(trainEnd+1:end, :);

fprintf('Train: %s to %s (%d samples)\\n', ...
    string(train.date(1)), string(train.date(end)), height(train));
fprintf('Test:  %s to %s (%d samples)\\n', ...
    string(test.date(1)), string(test.date(end)), height(test));`}

% WARNING: Do NOT shuffle time series data!`
      }
    }

    // CV + Test
    return {
      python: `import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold

# Dataset: X (features), y (labels)
# Strategy: CV + Independent Test (${cvFolds}-fold)
# Best for small datasets - prevents unstable results

# Step 1: Separate independent test set
X_tv, X_test, y_tv, y_test = train_test_split(
    X, y,
    test_size=${testSize.toFixed(2)},
    stratify=y,
    random_state=42
)

# Step 2: ${cvFolds}-fold Stratified Cross-Validation on remaining data
skf = StratifiedKFold(
    n_splits=${cvFolds}, shuffle=True, random_state=42
)

for fold, (train_idx, val_idx) in enumerate(skf.split(X_tv, y_tv), 1):
    X_train, X_val = X_tv[train_idx], X_tv[val_idx]
    y_train, y_val = y_tv[train_idx], y_tv[val_idx]

    # Train model, evaluate on val fold
    # model.fit(X_train, y_train)
    # score = model.score(X_val, y_val)
    print(f"Fold {fold}: train={len(train_idx)}, val={len(val_idx)}")

# Step 3: Final evaluation on test set (only once!)
print(f"\\nIndependent test set: {len(X_test)} samples")
print("Use test set ONLY for final reporting.")`,
      matlab: `rng(42)
% Dataset: X (features), Y (labels)
% Strategy: CV + Independent Test (${cvFolds}-fold)

% Step 1: Separate independent test set
cvTest = cvpartition(Y, 'HoldOut', ${testSize.toFixed(2)});
idxTV = training(cvTest);
idxTe = test(cvTest);

X_tv = X(idxTV,:);  Y_tv = Y(idxTV);
X_test = X(idxTe,:); Y_test = Y(idxTe);

% Step 2: ${cvFolds}-fold Stratified Cross-Validation
cv = cvpartition(Y_tv, 'KFold', ${cvFolds});

for k = 1:cv.NumTestSets
    idxTr = training(cv, k);
    idxVa = test(cv, k);

    X_train = X_tv(idxTr,:); Y_train = Y_tv(idxTr);
    X_val   = X_tv(idxVa,:); Y_val   = Y_tv(idxVa);

    % Train model, evaluate on val fold
    fprintf('Fold %d: train=%d, val=%d\\n', k, nnz(idxTr), nnz(idxVa));
end

% Step 3: Final evaluation on test set (only once!)
fprintf('\\nIndependent test set: %d samples\\n', sum(idxTe));
fprintf('Use test set ONLY for final reporting.\\n');`
    }
  }, [customRatio, splitStrategy, cvFolds])

  // ── Copy to clipboard ───────────────────────────────────────────────

  const copyCode = useCallback(async (lang: 'python' | 'matlab') => {
    const code = lang === 'python' ? generatedCode.python : generatedCode.matlab
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(lang)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedCode(lang)
      setTimeout(() => setCopiedCode(null), 2000)
    }
  }, [generatedCode])

  // ── Dataset Size Cards ──────────────────────────────────────────────

  const sizeCards: { id: DatasetSize; icon: React.ReactNode; samples: string }[] = [
    { id: 'small', icon: <Database size={20} />, samples: ds.sizes.small.samples },
    { id: 'medium', icon: <BarChart3 size={20} />, samples: ds.sizes.medium.samples },
    { id: 'large', icon: <TrendingUp size={20} />, samples: ds.sizes.large.samples }
  ]

  // ── Strategy Cards ──────────────────────────────────────────────────

  const strategyCards: { id: SplitStrategy; icon: React.ReactNode }[] = [
    { id: 'stratified', icon: <Layers size={20} /> },
    { id: 'group', icon: <Users size={20} /> },
    { id: 'chronological', icon: <Clock size={20} /> },
    { id: 'cv_test', icon: <GitBranch size={20} /> }
  ]

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="data-splitting-container">

      {/* ── Section 1: Model Type Toggle ── */}
      <div className="ds-section">
        <h3 className="ds-section-title">
          <Target size={18} />
          {ds.modelType.title}
        </h3>
        <div className="ds-model-toggle">
          <button
            className={`ds-toggle-btn ${modelType === 'ml' ? 'active' : ''}`}
            onClick={() => setModelType('ml')}
          >
            <Cpu size={18} />
            <span>{ds.modelType.ml}</span>
          </button>
          <button
            className={`ds-toggle-btn ${modelType === 'dl' ? 'active' : ''}`}
            onClick={() => setModelType('dl')}
          >
            <Brain size={18} />
            <span>{ds.modelType.dl}</span>
          </button>
        </div>
      </div>

      {/* ── Section 2: Dataset Size ── */}
      <div className="ds-section">
        <h3 className="ds-section-title">
          <Database size={18} />
          {ds.datasetSize.title}
        </h3>
        <div className="ds-size-grid">
          {sizeCards.map(card => (
            <motion.button
              key={card.id}
              className={`ds-size-card ${datasetSize === card.id ? 'active' : ''}`}
              onClick={() => { setDatasetSize(card.id); applyRecommendation() }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="ds-size-icon">{card.icon}</div>
              <div className="ds-size-info">
                <span className="ds-size-label">{ds.sizes[card.id].title}</span>
                <span className="ds-size-samples">{card.samples}</span>
              </div>
              <div className="ds-size-approach">
                <span className="ds-approach-badge">
                  {modelType === 'ml' ? ds.sizes[card.id].mlApproach : ds.sizes[card.id].dlApproach}
                </span>
              </div>
              {datasetSize === card.id && (
                <motion.div
                  className="ds-size-indicator"
                  layoutId="sizeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Section 3: Split Strategy ── */}
      <div className="ds-section">
        <h3 className="ds-section-title">
          <Shuffle size={18} />
          {ds.strategy.title}
        </h3>
        <div className="ds-strategy-grid">
          {strategyCards.map(card => (
            <motion.button
              key={card.id}
              className={`ds-strategy-card ${splitStrategy === card.id ? 'active' : ''}`}
              onClick={() => setSplitStrategy(card.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="ds-strategy-icon">{card.icon}</div>
              <span className="ds-strategy-label">{ds.strategy[card.id].title}</span>
              <span className="ds-strategy-desc">{ds.strategy[card.id].description}</span>
              {splitStrategy === card.id && (
                <motion.div
                  className="ds-strategy-indicator"
                  layoutId="strategyIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Section 4: Split Ratios ── */}
      <div className="ds-section">
        <h3 className="ds-section-title">
          <BarChart3 size={18} />
          {ds.ratios.title}
        </h3>

        <div className="ds-recommendation-bar">
          <Info size={16} />
          <span>
            {ds.ratios.recommended}: <strong>{recommendedRatio.train}/{recommendedRatio.validation}/{recommendedRatio.test}</strong>
            {splitStrategy === 'cv_test' && ` (${cvFolds}-fold CV)`}
          </span>
          <button className="ds-apply-btn" onClick={applyRecommendation}>
            {ds.ratios.apply}
          </button>
        </div>

        {/* Visual split bar */}
        <div className="ds-split-visual">
          <div className="ds-split-bar">
            <motion.div
              className="ds-split-segment train"
              style={{ width: `${customRatio.train}%` }}
              layout
              transition={{ duration: 0.3 }}
            >
              <span>{customRatio.train}%</span>
            </motion.div>
            {customRatio.validation > 0 && (
              <motion.div
                className="ds-split-segment validation"
                style={{ width: `${customRatio.validation}%` }}
                layout
                transition={{ duration: 0.3 }}
              >
                <span>{customRatio.validation}%</span>
              </motion.div>
            )}
            <motion.div
              className="ds-split-segment test"
              style={{ width: `${customRatio.test}%` }}
              layout
              transition={{ duration: 0.3 }}
            >
              <span>{customRatio.test}%</span>
            </motion.div>
          </div>
          <div className="ds-split-labels">
            <span className="train-label">Train</span>
            {customRatio.validation > 0 && <span className="val-label">Validation</span>}
            <span className="test-label">Test</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="ds-sliders">
          <div className="ds-slider-row">
            <label className="ds-slider-label train-color">Train: {customRatio.train}%</label>
            <input
              type="range"
              min={40}
              max={95}
              value={customRatio.train}
              onChange={e => handleRatioChange('train', Number(e.target.value))}
              className="ds-slider train-slider"
            />
          </div>
          {splitStrategy !== 'cv_test' && (
            <div className="ds-slider-row">
              <label className="ds-slider-label val-color">Validation: {customRatio.validation}%</label>
              <input
                type="range"
                min={0}
                max={30}
                value={customRatio.validation}
                onChange={e => handleRatioChange('validation', Number(e.target.value))}
                className="ds-slider val-slider"
              />
            </div>
          )}
          <div className="ds-slider-row">
            <label className="ds-slider-label test-color">Test: {customRatio.test}%</label>
            <input
              type="range"
              min={5}
              max={30}
              value={customRatio.test}
              onChange={e => handleRatioChange('test', Number(e.target.value))}
              className="ds-slider test-slider"
            />
          </div>
          {splitStrategy === 'cv_test' && (
            <div className="ds-slider-row">
              <label className="ds-slider-label val-color">CV Folds: {cvFolds}</label>
              <input
                type="range"
                min={3}
                max={10}
                value={cvFolds}
                onChange={e => setCvFolds(Number(e.target.value))}
                className="ds-slider val-slider"
              />
            </div>
          )}
        </div>

        {/* Total validation */}
        {(customRatio.train + customRatio.validation + customRatio.test) !== 100 && (
          <div className="ds-ratio-warning">
            <AlertTriangle size={16} />
            {ds.ratios.totalWarning}: {customRatio.train + customRatio.validation + customRatio.test}%
          </div>
        )}
      </div>

      {/* ── Section 5: Leakage Warnings ── */}
      <div className="ds-section">
        <button
          className="ds-collapsible-header"
          onClick={() => setShowLeakageRules(!showLeakageRules)}
        >
          <div className="ds-collapsible-title">
            <Shield size={18} />
            <span>{ds.leakage.title}</span>
            <span className="ds-warning-count">{leakageWarnings.length}</span>
          </div>
          {showLeakageRules ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {showLeakageRules && (
            <motion.div
              className="ds-warnings-list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {leakageWarnings.map((warning, idx) => (
                <motion.div
                  key={idx}
                  className="ds-warning-item"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <AlertTriangle size={16} className="ds-warning-icon" />
                  <span>{warning}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Section 6: Professional Workflow ── */}
      <div className="ds-section">
        <button
          className="ds-collapsible-header"
          onClick={() => setShowWorkflow(!showWorkflow)}
        >
          <div className="ds-collapsible-title">
            <CheckCircle2 size={18} />
            <span>{ds.workflow.title}</span>
          </div>
          {showWorkflow ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {showWorkflow && (
            <motion.div
              className="ds-workflow-list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {ds.workflow.steps.map((step: string, idx: number) => (
                <motion.div
                  key={idx}
                  className="ds-workflow-step"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="ds-step-number">{idx + 1}</div>
                  <span>{step}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Section 7: Code Generator ── */}
      <div className="ds-section">
        <h3 className="ds-section-title">
          <Code2 size={18} />
          {ds.code.title}
        </h3>

        <div className="ds-code-tabs">
          {/* Python */}
          <div className="ds-code-block">
            <div className="ds-code-header">
              <span className="ds-code-lang">Python</span>
              <button
                className="ds-copy-btn"
                onClick={() => copyCode('python')}
              >
                {copiedCode === 'python' ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode === 'python' ? ds.code.copied : ds.code.copy}
              </button>
            </div>
            <pre className="ds-code-content">
              <code>{generatedCode.python}</code>
            </pre>
          </div>

          {/* MATLAB */}
          <div className="ds-code-block">
            <div className="ds-code-header">
              <span className="ds-code-lang">MATLAB</span>
              <button
                className="ds-copy-btn"
                onClick={() => copyCode('matlab')}
              >
                {copiedCode === 'matlab' ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode === 'matlab' ? ds.code.copied : ds.code.copy}
              </button>
            </div>
            <pre className="ds-code-content">
              <code>{generatedCode.matlab}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* ── Section 8: Summary Table ── */}
      <div className="ds-section">
        <h3 className="ds-section-title">
          <BarChart3 size={18} />
          {ds.summary.title}
        </h3>
        <div className="ds-summary-table-wrapper">
          <table className="ds-summary-table">
            <thead>
              <tr>
                <th>{ds.summary.headers.size}</th>
                <th>{ds.summary.headers.mlApproach}</th>
                <th>{ds.summary.headers.dlApproach}</th>
                <th>{ds.summary.headers.attention}</th>
              </tr>
            </thead>
            <tbody>
              <tr className={datasetSize === 'small' ? 'ds-active-row' : ''}>
                <td><strong>{ds.sizes.small.title}</strong></td>
                <td>Test + CV</td>
                <td>Transfer learning + careful val/test</td>
                <td>{ds.summary.attentions.small}</td>
              </tr>
              <tr className={datasetSize === 'medium' ? 'ds-active-row' : ''}>
                <td><strong>{ds.sizes.medium.title}</strong></td>
                <td>70/15/15 or 80/10/10</td>
                <td>80/10/10</td>
                <td>{ds.summary.attentions.medium}</td>
              </tr>
              <tr className={datasetSize === 'large' ? 'ds-active-row' : ''}>
                <td><strong>{ds.sizes.large.title}</strong></td>
                <td>90/5/5</td>
                <td>90/5/5 or similar</td>
                <td>{ds.summary.attentions.large}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DataSplitting
