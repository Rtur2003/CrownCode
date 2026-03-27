// =========================================================================
// HYPERPARAMETER OPTIMIZATION TOOL - Interactive HPO Method Guide
// =========================================================================
// Implements an interactive guide for hyperparameter optimization methods,
// platform comparison (MATLAB/scikit-learn/Optuna), and code generation.
//
// References:
// - Hyperparameter Optimization Mini Document (TR & EN)
//
// @author Hasan Arthur Altuntaş
// @version 1.0.0
// @since 2026-03-27
// =========================================================================

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Brain,
  Target,
  Shuffle,
  TrendingUp,
  Timer,
  Layers,
  GitBranch,
  BarChart3,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Settings,
  Cpu,
  Info,
  CheckCircle2,
  XCircle,
  Minus
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// ── Types ──────────────────────────────────────────────────────────────

type HPOMethod =
  | 'random_search'
  | 'bayesian'
  | 'tpe'
  | 'successive_halving'
  | 'hyperband'
  | 'bohb'
  | 'genetic'
  | 'pso'
  | 'pbt'

type ProblemType = 'small_ml' | 'expensive_training' | 'deep_learning' | 'complex_space'
type Platform = 'matlab' | 'sklearn' | 'optuna'

interface MethodInfo {
  id: HPOMethod
  icon: React.ReactNode
  gradient: string
}

// ── Component ──────────────────────────────────────────────────────────

const HyperparameterOptimizer: React.FC = () => {
  const { t } = useLanguage()
  const hpo = t.hyperparameterOpt

  const [selectedMethod, setSelectedMethod] = useState<HPOMethod>('random_search')
  const [problemType, setProblemType] = useState<ProblemType>('small_ml')
  const [copiedCode, setCopiedCode] = useState<Platform | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [showGuide, setShowGuide] = useState(true)

  // ── Method definitions ──────────────────────────────────────────────

  const methods: MethodInfo[] = [
    { id: 'random_search', icon: <Shuffle size={20} />, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'bayesian', icon: <Brain size={20} />, gradient: 'from-purple-500 to-pink-500' },
    { id: 'tpe', icon: <GitBranch size={20} />, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'successive_halving', icon: <Timer size={20} />, gradient: 'from-orange-500 to-amber-500' },
    { id: 'hyperband', icon: <Layers size={20} />, gradient: 'from-red-500 to-rose-500' },
    { id: 'bohb', icon: <Zap size={20} />, gradient: 'from-violet-500 to-purple-500' },
    { id: 'genetic', icon: <TrendingUp size={20} />, gradient: 'from-lime-500 to-green-500' },
    { id: 'pso', icon: <Target size={20} />, gradient: 'from-sky-500 to-blue-500' },
    { id: 'pbt', icon: <Settings size={20} />, gradient: 'from-fuchsia-500 to-pink-500' }
  ]

  // ── Problem type to recommended methods ────────────────────────────

  const recommendedMethods: Record<ProblemType, HPOMethod[]> = {
    small_ml: ['random_search', 'bayesian'],
    expensive_training: ['successive_halving', 'hyperband', 'bohb'],
    deep_learning: ['pbt', 'hyperband', 'tpe'],
    complex_space: ['genetic', 'pso', 'tpe']
  }

  const isRecommended = useCallback((method: HPOMethod) => {
    return recommendedMethods[problemType].includes(method)
  }, [problemType])

  // ── Platform support matrix ─────────────────────────────────────────

  type SupportLevel = 'strong' | 'partial' | 'none'

  const platformSupport: Record<HPOMethod, Record<Platform, SupportLevel>> = {
    random_search: { matlab: 'strong', sklearn: 'strong', optuna: 'strong' },
    bayesian: { matlab: 'strong', sklearn: 'none', optuna: 'strong' },
    tpe: { matlab: 'none', sklearn: 'none', optuna: 'strong' },
    successive_halving: { matlab: 'strong', sklearn: 'partial', optuna: 'strong' },
    hyperband: { matlab: 'none', sklearn: 'none', optuna: 'strong' },
    bohb: { matlab: 'none', sklearn: 'none', optuna: 'partial' },
    genetic: { matlab: 'none', sklearn: 'none', optuna: 'strong' },
    pso: { matlab: 'none', sklearn: 'none', optuna: 'partial' },
    pbt: { matlab: 'none', sklearn: 'none', optuna: 'partial' }
  }

  const getSupportIcon = (level: SupportLevel) => {
    switch (level) {
      case 'strong': return <CheckCircle2 size={16} className="ds-support-strong" />
      case 'partial': return <Minus size={16} className="ds-support-partial" />
      case 'none': return <XCircle size={16} className="ds-support-none" />
    }
  }

  // ── Code generation ─────────────────────────────────────────────────

  const generatedCode = useMemo(() => {
    const codeMap: Record<HPOMethod, { python: string; matlab: string; optuna: string }> = {
      random_search: {
        python: `from sklearn.model_selection import RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
from scipy.stats import randint, uniform

# Define parameter distributions
param_distributions = {
    'n_estimators': randint(50, 500),
    'max_depth': randint(3, 20),
    'min_samples_split': randint(2, 20),
    'min_samples_leaf': randint(1, 10),
    'max_features': uniform(0.1, 0.9)
}

# Random Search with cross-validation
search = RandomizedSearchCV(
    estimator=RandomForestClassifier(random_state=42),
    param_distributions=param_distributions,
    n_iter=100,           # Number of random trials
    cv=5,                 # 5-fold cross-validation
    scoring='f1_weighted',
    random_state=42,
    n_jobs=-1,            # Use all CPU cores
    verbose=1
)

search.fit(X_train, y_train)
print(f"Best score: {search.best_score_:.4f}")
print(f"Best params: {search.best_params_}")`,
        matlab: `% Random Search with fitcensemble
rng(42)

% Define hyperparameter options
params = hyperparameters('fitcensemble', X_train, Y_train, 'Tree');

% Run optimization
results = bayesopt(@(params) ...
    kfoldLoss(fitcensemble(X_train, Y_train, ...
        'Method', 'Bag', ...
        'NumLearningCycles', params.NumLearningCycles, ...
        'Learners', templateTree('MaxNumSplits', params.MaxNumSplits))), ...
    params, ...
    'AcquisitionFunctionName', 'expected-improvement', ...
    'MaxObjectiveEvaluations', 100, ...
    'UseParallel', true);

disp(results.MinObjective);
disp(results.XAtMinObjective);`,
        optuna: `import optuna
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 500),
        'max_depth': trial.suggest_int('max_depth', 3, 20),
        'min_samples_split': trial.suggest_int('min_samples_split', 2, 20),
        'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 10),
        'max_features': trial.suggest_float('max_features', 0.1, 0.9)
    }

    model = RandomForestClassifier(**params, random_state=42)
    score = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')
    return score.mean()

# Create study with Random Sampler
study = optuna.create_study(
    direction='maximize',
    sampler=optuna.samplers.RandomSampler(seed=42)
)
study.optimize(objective, n_trials=100)

print(f"Best score: {study.best_value:.4f}")
print(f"Best params: {study.best_params}")`
      },
      bayesian: {
        python: `# Note: scikit-learn does not have built-in Bayesian Optimization
# Use scikit-optimize (skopt) instead
from skopt import BayesSearchCV
from sklearn.ensemble import GradientBoostingClassifier

search_spaces = {
    'n_estimators': (50, 500),
    'max_depth': (3, 15),
    'learning_rate': (0.001, 0.3, 'log-uniform'),
    'subsample': (0.5, 1.0, 'uniform')
}

opt = BayesSearchCV(
    estimator=GradientBoostingClassifier(random_state=42),
    search_spaces=search_spaces,
    n_iter=50,
    cv=5,
    scoring='f1_weighted',
    random_state=42,
    n_jobs=-1
)

opt.fit(X_train, y_train)
print(f"Best score: {opt.best_score_:.4f}")
print(f"Best params: {opt.best_params_}")`,
        matlab: `% MATLAB has strong built-in Bayesian Optimization
rng(42)

results = bayesopt(@(params) ...
    kfoldLoss(fitcensemble(X_train, Y_train, ...
        'Method', 'LSBoost', ...
        'NumLearningCycles', params.NumLearningCycles, ...
        'LearnRate', params.LearnRate, ...
        'Learners', templateTree('MaxNumSplits', params.MaxNumSplits))), ...
    [optimizableVariable('NumLearningCycles', [50 500], 'Type', 'integer'), ...
     optimizableVariable('LearnRate', [0.001 0.3], 'Transform', 'log'), ...
     optimizableVariable('MaxNumSplits', [1 50], 'Type', 'integer')], ...
    'AcquisitionFunctionName', 'expected-improvement-plus', ...
    'MaxObjectiveEvaluations', 50, ...
    'IsObjectiveDeterministic', false, ...
    'UseParallel', true);

bestParams = results.XAtMinObjective;
fprintf('Best loss: %.4f\\n', results.MinObjective);`,
        optuna: `import optuna
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 500),
        'max_depth': trial.suggest_int('max_depth', 3, 15),
        'learning_rate': trial.suggest_float('learning_rate', 0.001, 0.3, log=True),
        'subsample': trial.suggest_float('subsample', 0.5, 1.0)
    }

    model = GradientBoostingClassifier(**params, random_state=42)
    score = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')
    return score.mean()

# TPE sampler (default) - Bayesian approach
study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=50)

# Visualization
optuna.visualization.plot_optimization_history(study)
optuna.visualization.plot_param_importances(study)

print(f"Best: {study.best_value:.4f}")
print(f"Params: {study.best_params}")`
      },
      tpe: {
        python: `# TPE is not available in scikit-learn core
# Use Optuna (TPE is the default sampler)
# See the Optuna tab for the recommended approach
print("TPE is not available in scikit-learn.")
print("Recommended: Use Optuna with default TPESampler.")`,
        matlab: `% TPE is not a named option in MATLAB's HPO menu
% MATLAB uses Bayesian Optimization with GP by default
% For TPE-like behavior, consider using Python/Optuna
disp('TPE is not directly available in MATLAB.');
disp('Use bayesopt with GP surrogate instead.');`,
        optuna: `import optuna
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score

def objective(trial):
    # TPE handles mixed search spaces well
    kernel = trial.suggest_categorical('kernel', ['rbf', 'poly', 'sigmoid'])
    C = trial.suggest_float('C', 1e-3, 100, log=True)
    gamma = trial.suggest_float('gamma', 1e-4, 10, log=True)

    params = {'kernel': kernel, 'C': C, 'gamma': gamma}
    if kernel == 'poly':
        params['degree'] = trial.suggest_int('degree', 2, 5)

    model = SVC(**params, random_state=42)
    score = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')
    return score.mean()

# TPE is the DEFAULT sampler in Optuna
study = optuna.create_study(
    direction='maximize',
    sampler=optuna.samplers.TPESampler(seed=42)
)
study.optimize(objective, n_trials=100, show_progress_bar=True)

print(f"Best score: {study.best_value:.4f}")
print(f"Best params: {study.best_params}")`
      },
      successive_halving: {
        python: `from sklearn.experimental import enable_halving_search_cv
from sklearn.model_selection import HalvingRandomSearchCV
from sklearn.ensemble import RandomForestClassifier
from scipy.stats import randint

param_distributions = {
    'n_estimators': randint(50, 500),
    'max_depth': randint(3, 20),
    'min_samples_split': randint(2, 20)
}

# Successive Halving: starts many, eliminates weak
search = HalvingRandomSearchCV(
    estimator=RandomForestClassifier(random_state=42),
    param_distributions=param_distributions,
    factor=3,             # Elimination factor
    resource='n_samples', # Resource to increase
    min_resources=50,
    cv=5,
    scoring='f1_weighted',
    random_state=42,
    n_jobs=-1
)

search.fit(X_train, y_train)
print(f"Best score: {search.best_score_:.4f}")
print(f"Best params: {search.best_params_}")
print(f"Iterations: {search.n_iterations_}")`,
        matlab: `% MATLAB has ASHA (Asynchronous Successive Halving) support
rng(42)

% Use bayesopt with built-in ASHA scheduling
results = bayesopt(@(params) ...
    trainAndEvaluate(X_train, Y_train, params), ...
    [optimizableVariable('NumTrees', [50 500], 'Type', 'integer'), ...
     optimizableVariable('MaxSplits', [1 50], 'Type', 'integer')], ...
    'MaxObjectiveEvaluations', 100, ...
    'UseParallel', true);

disp(results.MinObjective);`,
        optuna: `import optuna
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 500),
        'max_depth': trial.suggest_int('max_depth', 3, 20),
        'min_samples_split': trial.suggest_int('min_samples_split', 2, 20)
    }

    model = RandomForestClassifier(**params, random_state=42)

    # Report intermediate values for pruning
    for step in range(5):
        score = cross_val_score(model, X_train, y_train,
                                cv=step+2, scoring='f1_weighted').mean()
        trial.report(score, step)
        if trial.should_prune():
            raise optuna.TrialPruned()

    return score

# Successive Halving pruner
study = optuna.create_study(
    direction='maximize',
    pruner=optuna.pruners.SuccessiveHalvingPruner(
        min_resource=1, reduction_factor=3
    )
)
study.optimize(objective, n_trials=100)
print(f"Best: {study.best_value:.4f}")`
      },
      hyperband: {
        python: `# Hyperband is not in scikit-learn core
# Use Optuna for Hyperband implementation
print("Hyperband is not available in scikit-learn core.")
print("Recommended: Use Optuna with HyperbandPruner.")`,
        matlab: `% Hyperband is not a main built-in option in MATLAB
% Use bayesopt with appropriate settings
disp('Hyperband is not directly available in MATLAB.');
disp('Consider using Optuna for Hyperband support.');`,
        optuna: `import optuna
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import cross_val_score

def objective(trial):
    n_layers = trial.suggest_int('n_layers', 1, 4)
    layers = []
    for i in range(n_layers):
        layers.append(trial.suggest_int(f'n_units_{i}', 16, 256))

    lr = trial.suggest_float('learning_rate_init', 1e-5, 1e-1, log=True)
    alpha = trial.suggest_float('alpha', 1e-5, 1e-1, log=True)

    model = MLPClassifier(
        hidden_layer_sizes=tuple(layers),
        learning_rate_init=lr,
        alpha=alpha,
        max_iter=200,
        random_state=42
    )

    score = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')

    # Report for pruning
    for step, s in enumerate(score):
        trial.report(s, step)
        if trial.should_prune():
            raise optuna.TrialPruned()

    return score.mean()

# Hyperband pruner - budget-aware halving
study = optuna.create_study(
    direction='maximize',
    pruner=optuna.pruners.HyperbandPruner(
        min_resource=1, max_resource=5, reduction_factor=3
    )
)
study.optimize(objective, n_trials=100)
print(f"Best: {study.best_value:.4f}")
print(f"Params: {study.best_params}")`
      },
      bohb: {
        python: `# BOHB requires dedicated libraries (HpBandSter or Optuna)
# Combines Bayesian Optimization + Hyperband
print("BOHB is not in scikit-learn core.")
print("Use Optuna (TPE + Hyperband) for similar behavior.")`,
        matlab: `% BOHB is not available in MATLAB
disp('BOHB is not available in MATLAB.');
disp('Use Python/Optuna for BOHB-like behavior.');`,
        optuna: `import optuna
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

# BOHB ≈ TPE Sampler + Hyperband Pruner in Optuna
def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 500),
        'max_depth': trial.suggest_int('max_depth', 3, 15),
        'learning_rate': trial.suggest_float('learning_rate', 0.001, 0.3, log=True),
        'subsample': trial.suggest_float('subsample', 0.5, 1.0)
    }

    model = GradientBoostingClassifier(**params, random_state=42)
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')

    for step, score in enumerate(scores):
        trial.report(score, step)
        if trial.should_prune():
            raise optuna.TrialPruned()

    return scores.mean()

# BOHB-like: TPE (smart search) + Hyperband (budget efficiency)
study = optuna.create_study(
    direction='maximize',
    sampler=optuna.samplers.TPESampler(seed=42),
    pruner=optuna.pruners.HyperbandPruner(
        min_resource=1, max_resource=5
    )
)
study.optimize(objective, n_trials=100)

print(f"Best: {study.best_value:.4f}")
print(f"Params: {study.best_params}")
optuna.visualization.plot_optimization_history(study)`
      },
      genetic: {
        python: `# Genetic/Evolutionary methods are not in scikit-learn
# Use DEAP, TPOT, or Optuna NSGA-II
print("Genetic methods are not in scikit-learn core.")
print("Options: DEAP, TPOT, or Optuna NSGA-II.")`,
        matlab: `% MATLAB has Global Optimization Toolbox for GA
% But not integrated into main HPO menu
rng(42)

% Using ga() for hyperparameter search
nvars = 3; % [n_estimators, max_depth, learning_rate]
lb = [50, 3, 0.001];
ub = [500, 20, 0.3];
intcon = [1, 2]; % Integer constraints

[x, fval] = ga(@(params) ...
    -evaluateModel(X_train, Y_train, params), ...
    nvars, [], [], [], [], lb, ub, [], intcon);

fprintf('Best loss: %.4f\\n', -fval);`,
        optuna: `import optuna

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 500),
        'max_depth': trial.suggest_int('max_depth', 3, 20),
        'learning_rate': trial.suggest_float('learning_rate', 0.001, 0.3, log=True)
    }

    model = GradientBoostingClassifier(**params, random_state=42)
    f1 = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted').mean()
    train_time = cross_val_score(model, X_train, y_train, cv=2, scoring='f1_weighted')

    return f1, train_time.mean()  # Multi-objective

# NSGA-II for multi-objective optimization
study = optuna.create_study(
    directions=['maximize', 'maximize'],
    sampler=optuna.samplers.NSGAIISampler(seed=42)
)
study.optimize(objective, n_trials=100)

# Pareto front
for trial in study.best_trials:
    print(f"Values: {trial.values}, Params: {trial.params}")`
      },
      pso: {
        python: `# PSO is not in scikit-learn
# Use pyswarm or Optuna CMA-ES (similar evolutionary approach)
from pyswarm import pso

def objective(params):
    n_est = int(params[0])
    max_d = int(params[1])
    lr = params[2]

    model = GradientBoostingClassifier(
        n_estimators=n_est, max_depth=max_d,
        learning_rate=lr, random_state=42
    )
    score = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')
    return -score.mean()  # Minimize negative score

lb = [50, 3, 0.001]
ub = [500, 20, 0.3]
xopt, fopt = pso(objective, lb, ub, swarmsize=30, maxiter=50)
print(f"Best score: {-fopt:.4f}")`,
        matlab: `% MATLAB: Use particleswarm from Global Optimization Toolbox
rng(42)

nvars = 3;
lb = [50, 3, 0.001];
ub = [500, 20, 0.3];

options = optimoptions('particleswarm', ...
    'SwarmSize', 30, ...
    'MaxIterations', 50, ...
    'Display', 'iter');

[x, fval] = particleswarm(@(params) ...
    -evaluateModel(X_train, Y_train, params), ...
    nvars, lb, ub, options);

fprintf('Best score: %.4f\\n', -fval);`,
        optuna: `import optuna
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 500),
        'max_depth': trial.suggest_int('max_depth', 3, 20),
        'learning_rate': trial.suggest_float('learning_rate', 0.001, 0.3, log=True)
    }

    model = GradientBoostingClassifier(**params, random_state=42)
    return cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted').mean()

# CMA-ES sampler (evolutionary, similar philosophy to PSO)
study = optuna.create_study(
    direction='maximize',
    sampler=optuna.samplers.CmaEsSampler(seed=42)
)
study.optimize(objective, n_trials=100)
print(f"Best: {study.best_value:.4f}")`
      },
      pbt: {
        python: `# PBT is not in scikit-learn
# Use Ray Tune for Population Based Training
# pip install "ray[tune]"
from ray import tune
from ray.tune.schedulers import PopulationBasedTraining

pbt_scheduler = PopulationBasedTraining(
    time_attr="training_iteration",
    perturbation_interval=5,
    hyperparam_mutations={
        "lr": tune.loguniform(1e-4, 1e-1),
        "batch_size": [16, 32, 64, 128]
    }
)

analysis = tune.run(
    train_fn,  # Your training function
    scheduler=pbt_scheduler,
    num_samples=8,
    config={
        "lr": tune.loguniform(1e-4, 1e-1),
        "batch_size": tune.choice([16, 32, 64, 128]),
        "epochs": 50
    }
)

print(f"Best config: {analysis.best_config}")`,
        matlab: `% PBT is not available in MATLAB
% Use Python with Ray Tune for PBT
disp('PBT is not available in MATLAB.');
disp('Use Python with Ray Tune for PBT support.');
disp('PBT is especially useful for deep learning.');`,
        optuna: `# Optuna does not have built-in PBT
# But you can approximate it with pruning + warm-starting
# For true PBT, use Ray Tune

# Optuna approach: MedianPruner + warm starting
import optuna

def objective(trial):
    lr = trial.suggest_float('lr', 1e-4, 1e-1, log=True)
    batch_size = trial.suggest_categorical('batch_size', [16, 32, 64, 128])
    dropout = trial.suggest_float('dropout', 0.1, 0.5)

    # Simulate epoch-based training with intermediate reporting
    model = create_model(lr=lr, dropout=dropout)
    for epoch in range(50):
        loss = train_one_epoch(model, batch_size)
        trial.report(loss, epoch)
        if trial.should_prune():
            raise optuna.TrialPruned()

    return evaluate(model)

study = optuna.create_study(
    direction='maximize',
    pruner=optuna.pruners.MedianPruner(
        n_startup_trials=5, n_warmup_steps=10
    )
)
study.optimize(objective, n_trials=50)
print(f"Best: {study.best_value:.4f}")`
      }
    }

    return codeMap[selectedMethod]
  }, [selectedMethod])

  // ── Copy handler ────────────────────────────────────────────────────

  const copyCode = useCallback(async (platform: Platform) => {
    const code = platform === 'python'
      ? generatedCode.python
      : platform === 'matlab'
        ? generatedCode.matlab
        : generatedCode.optuna
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(platform)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedCode(platform)
      setTimeout(() => setCopiedCode(null), 2000)
    }
  }, [generatedCode])

  // ── Problem type cards ──────────────────────────────────────────────

  const problemCards: { id: ProblemType; icon: React.ReactNode }[] = [
    { id: 'small_ml', icon: <Cpu size={18} /> },
    { id: 'expensive_training', icon: <Timer size={18} /> },
    { id: 'deep_learning', icon: <Brain size={18} /> },
    { id: 'complex_space', icon: <Layers size={18} /> }
  ]

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="hpo-container">

      {/* ── Section 1: Problem Type ── */}
      <div className="ds-section">
        <h3 className="ds-section-title">
          <Lightbulb size={18} />
          {hpo.problemType.title}
        </h3>
        <div className="hpo-problem-grid">
          {problemCards.map(card => (
            <motion.button
              key={card.id}
              className={`hpo-problem-card ${problemType === card.id ? 'active' : ''}`}
              onClick={() => setProblemType(card.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="hpo-problem-icon">{card.icon}</div>
              <span className="hpo-problem-label">{hpo.problemType[card.id].title}</span>
              <span className="hpo-problem-desc">{hpo.problemType[card.id].description}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Section 2: Method Selection ── */}
      <div className="ds-section">
        <h3 className="ds-section-title">
          <Zap size={18} />
          {hpo.methods.title}
        </h3>
        <div className="hpo-methods-grid">
          {methods.map(method => {
            const recommended = isRecommended(method.id)
            return (
              <motion.button
                key={method.id}
                className={`hpo-method-card ${selectedMethod === method.id ? 'active' : ''} ${recommended ? 'recommended' : ''}`}
                onClick={() => setSelectedMethod(method.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {recommended && (
                  <div className="hpo-recommended-badge">
                    <CheckCircle2 size={12} />
                  </div>
                )}
                <div className={`hpo-method-icon bg-gradient-to-r ${method.gradient}`}>
                  {method.icon}
                </div>
                <span className="hpo-method-label">{hpo.methods[method.id].title}</span>
                <span className="hpo-method-desc">{hpo.methods[method.id].shortDesc}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Selected Method Details ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMethod}
          className="ds-section hpo-detail-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="hpo-detail-header">
            <h3 className="ds-section-title">
              {methods.find(m => m.id === selectedMethod)?.icon}
              {hpo.methods[selectedMethod].title}
            </h3>
            <p className="hpo-detail-description">
              {hpo.methods[selectedMethod].description}
            </p>
          </div>

          {/* Platform support for this method */}
          <div className="hpo-support-row">
            <div className="hpo-support-item">
              <span className="hpo-platform-label">MATLAB</span>
              {getSupportIcon(platformSupport[selectedMethod].matlab)}
              <span className="hpo-support-text">
                {hpo.platformLabels[platformSupport[selectedMethod].matlab]}
              </span>
            </div>
            <div className="hpo-support-item">
              <span className="hpo-platform-label">scikit-learn</span>
              {getSupportIcon(platformSupport[selectedMethod].sklearn)}
              <span className="hpo-support-text">
                {hpo.platformLabels[platformSupport[selectedMethod].sklearn]}
              </span>
            </div>
            <div className="hpo-support-item">
              <span className="hpo-platform-label">Optuna</span>
              {getSupportIcon(platformSupport[selectedMethod].optuna)}
              <span className="hpo-support-text">
                {hpo.platformLabels[platformSupport[selectedMethod].optuna]}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Section 4: Practical Guide ── */}
      <div className="ds-section">
        <button
          className="ds-collapsible-header"
          onClick={() => setShowGuide(!showGuide)}
        >
          <div className="ds-collapsible-title">
            <Info size={18} />
            <span>{hpo.guide.title}</span>
          </div>
          {showGuide ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {showGuide && (
            <motion.div
              className="hpo-guide-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {hpo.guide.tips.map((tip: string, idx: number) => (
                <motion.div
                  key={idx}
                  className="hpo-guide-tip"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Lightbulb size={16} className="hpo-tip-icon" />
                  <span>{tip}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Section 5: Platform Comparison Table ── */}
      <div className="ds-section">
        <button
          className="ds-collapsible-header"
          onClick={() => setShowComparison(!showComparison)}
        >
          <div className="ds-collapsible-title">
            <BarChart3 size={18} />
            <span>{hpo.comparison.title}</span>
          </div>
          {showComparison ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {showComparison && (
            <motion.div
              className="ds-summary-table-wrapper"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <table className="ds-summary-table hpo-comparison-table">
                <thead>
                  <tr>
                    <th>{hpo.comparison.headers.method}</th>
                    <th>{hpo.comparison.headers.idea}</th>
                    <th>MATLAB</th>
                    <th>scikit-learn</th>
                    <th>Optuna</th>
                    <th>{hpo.comparison.headers.comment}</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map(method => (
                    <tr
                      key={method.id}
                      className={selectedMethod === method.id ? 'ds-active-row' : ''}
                      onClick={() => setSelectedMethod(method.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><strong>{hpo.methods[method.id].title}</strong></td>
                      <td>{hpo.methods[method.id].shortDesc}</td>
                      <td>{getSupportIcon(platformSupport[method.id].matlab)}</td>
                      <td>{getSupportIcon(platformSupport[method.id].sklearn)}</td>
                      <td>{getSupportIcon(platformSupport[method.id].optuna)}</td>
                      <td>{hpo.methods[method.id].comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Section 6: Code Generator ── */}
      <div className="ds-section">
        <h3 className="ds-section-title">
          <Code2 size={18} />
          {hpo.code.title}
        </h3>

        <div className="hpo-code-grid">
          {/* Python / scikit-learn */}
          <div className="ds-code-block">
            <div className="ds-code-header">
              <span className="ds-code-lang">Python / scikit-learn</span>
              <button className="ds-copy-btn" onClick={() => copyCode('python')}>
                {copiedCode === 'python' ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode === 'python' ? hpo.code.copied : hpo.code.copy}
              </button>
            </div>
            <pre className="ds-code-content"><code>{generatedCode.python}</code></pre>
          </div>

          {/* MATLAB */}
          <div className="ds-code-block">
            <div className="ds-code-header">
              <span className="ds-code-lang">MATLAB</span>
              <button className="ds-copy-btn" onClick={() => copyCode('matlab')}>
                {copiedCode === 'matlab' ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode === 'matlab' ? hpo.code.copied : hpo.code.copy}
              </button>
            </div>
            <pre className="ds-code-content"><code>{generatedCode.matlab}</code></pre>
          </div>

          {/* Optuna */}
          <div className="ds-code-block">
            <div className="ds-code-header">
              <span className="ds-code-lang">Optuna</span>
              <button className="ds-copy-btn" onClick={() => copyCode('optuna')}>
                {copiedCode === 'optuna' ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode === 'optuna' ? hpo.code.copied : hpo.code.copy}
              </button>
            </div>
            <pre className="ds-code-content"><code>{generatedCode.optuna}</code></pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HyperparameterOptimizer
