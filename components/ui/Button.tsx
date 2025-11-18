import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { motion, type MotionProps } from 'framer-motion';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg',
      secondary: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200',
      ghost: 'hover:bg-gray-100 text-gray-700',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-7 py-3.5 text-lg',
    };
    
    const MotionButton = motion.button;
    
    return (
      <MotionButton
        ref={ref}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...(props as any)}
      >
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';


