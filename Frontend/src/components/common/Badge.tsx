import React from 'react';

export type BadgeVariant =
  | 'pending'
  | 'accepted'
  | 'picked'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'saffron'
  | 'green'
  | 'blue'
  | 'amber'
  | 'red'
  | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const getVariantStyles = (v: string): string => {
    switch (v) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'accepted':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'picked':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'delivered':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'saffron':
        return 'bg-saffron-50 text-saffron-700 border border-saffron-200';
      case 'green':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'red':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium capitalize tracking-wide select-none ${sizeClasses} ${getVariantStyles(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

