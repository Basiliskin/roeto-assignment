import { ButtonHTMLAttributes } from 'react';
import ui from './ui.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  size?: 'md' | 'sm';
}

export function Button({ variant = 'ghost', size = 'md', className = '', ...rest }: ButtonProps) {
  const classes = [ui.btn, ui[variant], size === 'sm' ? ui.sm : '', className].join(' ');
  return <button type="button" className={classes} {...rest} />;
}
