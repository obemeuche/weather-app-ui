import type React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function Skeleton({ width, height, borderRadius, style, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius, ...style }}
    />
  );
}
