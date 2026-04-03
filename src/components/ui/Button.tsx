import type React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outlined' | 'danger';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const variantClass = styles[variant] ?? '';
  return (
    <button className={`btn ${variantClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}
