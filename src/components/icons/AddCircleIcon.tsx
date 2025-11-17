import React from 'react';
import { MdAddCircle } from 'react-icons/md';

interface AddCircleIconProps {
  size?: number;
  className?: string;
}

const AddCircleIcon: React.FC<AddCircleIconProps> = ({
  size = 24,
  className = '',
}) => {
  return <MdAddCircle size={size} className={className} />;
};

export default AddCircleIcon;
