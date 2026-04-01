import type React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
