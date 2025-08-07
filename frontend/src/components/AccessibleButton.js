import React from 'react';

/**
 * Accessible button component that meets WCAG 2.1 AA standards
 * Features:
 * - Proper ARIA labels
 * - Keyboard navigation support
 * - Focus indicators
 * - Screen reader support
 */
const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'md',
  ariaLabel,
  ariaDescribedBy,
  type = 'button',
  className = '',
  icon: Icon,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  const handleKeyDown = (e) => {
    // Allow space and enter to activate button
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && onClick) {
        onClick(e);
      }
    }
  };
  
  return (
    <button
      type={type}
      className={classes}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {Icon && (
        <Icon 
          className={`${children ? 'mr-2' : ''} ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};

export default AccessibleButton;