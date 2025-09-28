import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'rounded-xl cursor-pointer transition-colors duration-500 focus:outline-none';

  const variantClasses = {
    primary:
      'bg-pocket-blue hover:bg-blue-600 disabled:bg-pocket-disabled text-white',
    secondary:
      'bg-gray-600 hover:bg-gray-700 disabled:bg-pocket-disabled text-white',
    danger:
      'bg-red-600 hover:bg-red-700 disabled:bg-pocket-disabled text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledClasses = disabled ? 'disabled:cursor-default' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
