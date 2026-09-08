import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warm' | 'flat' | 'highlight';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow',
    warm: 'bg-saffron-50/50 border border-saffron-100/80 shadow-sm',
    flat: 'bg-white border border-gray-200',
    highlight: 'bg-gradient-to-br from-white to-saffron-50/40 border border-saffron-200 shadow-sm',
  }[variant];

  return (
    <div className={`rounded-xl p-5 ${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

