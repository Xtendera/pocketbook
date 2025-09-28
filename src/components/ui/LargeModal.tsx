import React from 'react';

interface LargeModalProps {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const LargeModal: React.FC<LargeModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleEscapeKey}
      tabIndex={-1}
    >
      <div className="bg-[#17171d] border border-pocket-blue rounded-xl p-8 w-[90vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-6">
          {title && <h2 className="text-2xl text-white">{title}</h2>}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white cursor-pointer transition-colors text-2xl font-bold ml-auto"
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default LargeModal;
