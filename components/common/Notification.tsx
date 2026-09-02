"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Notification = () => {
  const { notification, hideNotification } = useAuth();
  
  const isVisible = notification.visible; // FIX: Use the 'visible' state property
  const isSuccess = notification.type === 'success';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`fixed bottom-5 right-5 flex items-center text-white py-3 px-5 rounded-lg shadow-lg z-[10001] ${isSuccess ? 'bg-indigo-600' : 'bg-red-500'}`}
        >
          <div className="flex items-center">
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={hideNotification}
            className="ml-4 p-1 rounded-full hover:bg-black/20 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
