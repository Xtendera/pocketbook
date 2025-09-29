import React from 'react';

interface CheckIconProps {
  size?: number;
  className?: string;
}

const CheckIcon: React.FC<CheckIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={`${size}px`}
      viewBox="0 -960 960 960"
      width={`${size}px`}
      fill="currentColor"
      className={className}
    >
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </svg>
  );
};

export default CheckIcon;
