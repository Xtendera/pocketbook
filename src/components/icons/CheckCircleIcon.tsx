import React from 'react';
import { MdCheckCircle } from 'react-icons/md';

interface CheckCircleIconProps {
  size?: number;
  className?: string;
}

const CheckCircleIcon: React.FC<CheckCircleIconProps> = ({
  size = 24,
  className = '',
}) => {
  return <MdCheckCircle size={size} className={className} />;
};

export default CheckCircleIcon;
