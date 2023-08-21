import { XMarkIcon } from '@heroicons/react/20/solid';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Toast {
  id: number;
  message: string;
  timestamp:number;
  type: 'success' | 'error' | 'info';
}

interface ToastContextProps {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
}

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastContext = createContext<ToastContextProps>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

let toastId = 0;

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const newToast: Toast = { id: toastId++, message, type, timestamp: Date.now() };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  const contextValue = {
    toasts,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <div style={{ position: 'relative' }}>
        {children}
        <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 50 }}>
          <div style={{  padding: '0.5rem', borderRadius: '0.25rem' }}>
            {toasts.map((toast) => (
             <ToastMessage key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
          </div>
        </div>
      </div>
    </ToastContext.Provider>

  );
}
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};


interface ToastMessageProps {
  toast: Toast;
  removeToast: (id:number) => void;
}

export const ToastMessage: React.FC<ToastMessageProps> = ({ toast, removeToast }) => {
  const [progressWidth, setProgressWidth] = useState('90%');
  const timeToLive = 10000
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - toast.timestamp;
      const remainingTime = timeToLive - elapsedTime;
      const width = (remainingTime / timeToLive) * 100;
      setProgressWidth(`${width}%`);
      if (remainingTime <= 0) {
        removeToast(toast.id);
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [removeToast, toast]);

  return (
    <div key={toast.id}>
      
      <div
        style={{
          backgroundColor: toast.type === 'success' ? '#48bb78' : toast.type === 'error' ? '#f56565' : '#4299e1',
          color: 'white',
          padding: '0.5rem',
          paddingTop: '0.20rem',
          borderRadius: '0.25rem',
          marginBottom: '0.25rem',
          display: 'flex',
          flexDirection: 'column' ,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', height: '0.2rem' }}>
          <div
            style={{
              width: progressWidth,
              height: '100%',
              backgroundColor: 'white',
              transition: 'width 1s linear', // Add transition for smooth progress update
            }}
          ></div>
        </div>
        <div 
        style={{
          paddingTop: '0.20rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)}>
            <XMarkIcon className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>
      
    </div>
  );
};

 