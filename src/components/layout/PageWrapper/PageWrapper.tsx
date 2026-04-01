import type React from 'react';
import styles from './PageWrapper.module.css';

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className={styles.wrapper}>
      {children}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
    </div>
  );
}
