import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Notification = () => {
  const { notification, showNotification } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification && notification.message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000); // Corresponds to the timeout in AuthContext

      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification || !notification.message) {
    return null;
  }

  const isSuccess = notification.type === 'success';

  return (
    <div 
      className={`fixed bottom-5 right-5 flex items-center text-white py-3 px-5 rounded-lg shadow-lg transform transition-all duration-300 z-[10001] ${isSuccess ? 'bg-indigo-600' : 'bg-red-500'} ${visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 mr-3" />
      ) : (
        <AlertCircle className="w-5 h-5 mr-3" />
      )}
      <span>{notification.message}</span>
    </div>
  );
};

export default Notification;

