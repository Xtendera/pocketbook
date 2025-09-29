import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#17171d] border border-pocket-blue rounded-xl p-8 w-96 max-w-[90vw]">
        <div className="flex flex-col items-center space-y-6">
          {title && <h2 className="text-2xl text-white">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  );
};

interface ModalActionsProps {
  children: React.ReactNode;
}

export const ModalActions: React.FC<ModalActionsProps> = ({ children }) => {
  return <div className="flex space-x-3 w-full">{children}</div>;
};

export default Modal;
