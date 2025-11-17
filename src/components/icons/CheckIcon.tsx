import React from 'react';
import { MdCheck } from 'react-icons/md';

interface CheckIconProps {
  size?: number;
  className?: string;
}

const CheckIcon: React.FC<CheckIconProps> = ({ size = 24, className = '' }) => {
  return <MdCheck size={size} className={className} />;
};

export default CheckIcon;
