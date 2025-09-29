import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between">
      {label && <label className="text-sm text-gray-400">{label}</label>}
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
