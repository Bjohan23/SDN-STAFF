import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-900',
          text: 'text-red-200',
          button: 'bg-red-600 hover:bg-red-700',
          icon: 'text-red-400'
        };
      case 'info':
        return {
          bg: 'bg-blue-900',
          text: 'text-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700',
          icon: 'text-blue-400'
        };
      default:
        return {
          bg: 'bg-yellow-900',
          text: 'text-yellow-200',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          icon: 'text-yellow-400'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 p-2 rounded-full ${colors.bg} mr-4`}>
              <ExclamationTriangleIcon className={`h-6 w-6 ${colors.icon}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-white">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-300 ml-4"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2">
                <p className="text-gray-300">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${colors.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;