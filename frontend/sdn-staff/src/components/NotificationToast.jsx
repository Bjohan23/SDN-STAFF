import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NotificationToast = ({ 
  message, 
  type = 'success', 
  duration = 4000, 
  isVisible, 
  onClose 
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to finish
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getStyles = () => {
    const baseStyles = "fixed top-4 right-4 max-w-sm w-full bg-gray-800 border rounded-lg shadow-lg z-50 transition-all duration-300 transform";
    
    const visibilityStyles = show 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0 pointer-events-none";

    const typeStyles = {
      success: "border-green-500",
      error: "border-red-500",
      warning: "border-yellow-500",
      info: "border-blue-500"
    };

    return `${baseStyles} ${visibilityStyles} ${typeStyles[type] || typeStyles.info}`;
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5 flex-shrink-0";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-400`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-400`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-400`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClass} text-blue-400`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-400`} />;
    }
  };

  if (!isVisible && !show) return null;

  return (
    <div className={getStyles()}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-white">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => {
                setShow(false);
                setTimeout(onClose, 300);
              }}
              className="inline-flex text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;