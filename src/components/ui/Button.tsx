import React from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-700 border border-navy',
  accent: 'bg-gold text-white hover:bg-gold-600 border border-gold',
  outline: 'bg-white text-navy border border-zinc-200 hover:bg-zinc-50',
  ghost: 'bg-transparent text-zinc-600 border border-transparent hover:bg-zinc-100',
  danger: 'bg-red-700 text-white hover:bg-red-800 border border-red-700'
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm'
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props} />);


}