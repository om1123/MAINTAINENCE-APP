import React from 'react';
import { X } from 'lucide-react';

interface ScrollableDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
}

const ScrollableDialog: React.FC<ScrollableDialogProps> = ({
  title,
  isOpen,
  onClose,
  children,
  maxWidth = '42rem',
  maxHeight = '85vh'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Position */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Dialog Content */}
        <div 
          className="relative bg-gray-800/90 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-md transform transition-all"
          style={{ maxWidth }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-gradient">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div 
            className="p-6 overflow-y-auto custom-scrollbar"
            style={{ maxHeight }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollableDialog;