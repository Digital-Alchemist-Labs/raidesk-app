import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { motion, type MotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof MotionProps> {
  hoverable?: boolean;
  selected?: boolean;
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverable = false, selected = false, children, ...props }, ref) => {
    const baseStyles = 'bg-white rounded-2xl p-6 transition-all duration-300 border border-gray-100';
    const shadowStyles = 'shadow-sm';
    const hoverStyles = hoverable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : '';
    const selectedStyles = selected ? 'ring-2 ring-blue-500 shadow-lg border-blue-200' : '';
    
    const MotionDiv = motion.div;
    
    return (
      <MotionDiv
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${baseStyles} ${shadowStyles} ${hoverStyles} ${selectedStyles} ${className}`}
        {...(props as any)}
      >
        {children}
      </MotionDiv>
    );
  }
);

Card.displayName = 'Card';


