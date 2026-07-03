import React from 'react';
import styles from './NoiseBackground.module.css';

export const NoiseBackground: React.FC = () => {
  return <div className={styles.noise} aria-hidden="true" />;
};
