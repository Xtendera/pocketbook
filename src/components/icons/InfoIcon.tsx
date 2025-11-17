import React from 'react';
import { MdInfo } from 'react-icons/md';

interface InfoIconProps {
  size?: number;
  className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ size = 16, className = '' }) => {
  return <MdInfo size={size} className={className} />;
};

export default InfoIcon;
