import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  tooltipMessage?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  tooltipMessage,
}) => {
  return (
    <div className="flex items-center justify-between">
      {label && (
        <>
          {tooltipMessage ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <label className="text-sm text-gray-400 cursor-help">
                  {label}
                </label>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tooltipMessage}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <label className="text-sm text-gray-400">{label}</label>
          )}
        </>
      )}
      <button
        type="button"
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center disabled:cursor-auto cursor-pointer rounded-full transition-colors focus:ring-offset-[#17171d] ${
          checked ? 'bg-pocket-blue' : 'bg-gray-600'
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;
