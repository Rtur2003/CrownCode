/**
 * The deployed AURIS decision model, as recorded in training_results.json
 * and deep_learning_results.json of Rthur2003/auris-models (5-fold CV).
 * Update together with the weights; never round up or estimate.
 */
export const AURIS_MODEL = {
  name: 'LightGBM',
  samples: 5195,
  aiSamples: 2082,
  humanSamples: 3113,
  features: 47,
  folds: 5,
  threshold: 0.431577,
  accuracy: 0.8839,
  precision: 0.8441,
  recall: 0.8713,
  f1: 0.8575,
  rocAuc: 0.9549,
} as const

/** ROC-AUC of every model that votes, same CV protocol. */
export const VOTER_AUC: Record<string, number> = {
  'LightGBM': 0.9549,
  'Deep MLP (512-256-128-64)': 0.9537,
  'XGBoost': 0.9463,
  'Residual MLP (3 blocks)': 0.9453,
  'Gradient Boosting': 0.9406,
  'Random Forest': 0.9393,
  'Attention MLP': 0.9356,
  'SVM (RBF)': 0.9347,
  'MLP Neural Network': 0.9258,
  'Logistic Regression': 0.8511,
  '1D-CNN': 0.8442,
}

export const DL_VOTERS = new Set(['Deep MLP (512-256-128-64)', '1D-CNN', 'Residual MLP (3 blocks)', 'Attention MLP'])
