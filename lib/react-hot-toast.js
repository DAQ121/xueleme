import React from 'react';

// This is a simplified, local copy of react-hot-toast to bypass installation issues.
// Full source can be found at https://esm.sh/react-hot-toast

const ToastContext = React.createContext(null);

export const Toaster = () => {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    const listeners = [];
    const add = (toast) => {
      setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
      setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, toast.duration || 3000);
    };

    toast.listeners.push(add);
    return () => {
      toast.listeners = toast.listeners.filter(listener => listener !== add);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
      {toasts.map(({ id, message, type }) => (
        <div key={id} style={{
          background: type === 'success' ? '#4CAF50' : '#333',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          marginBottom: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          {message}
        </div>
      ))}
    </div>
  );
};

const toast = (message, options) => {
  toast.listeners.forEach(listener => listener({ message, ...options }));
};

toast.success = (message, options) => toast(message, { ...options, type: 'success' });
toast.error = (message, options) => toast(message, { ...options, type: 'error' });
toast.listeners = [];

export { toast };
