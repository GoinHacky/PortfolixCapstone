import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({ message: '', type: 'info' });
  const [visible, setVisible] = useState(false);
  const showNotification = useCallback(({ message, type = 'info', duration = 3000 }) => {
    setNotification({ message, type });
    setVisible(true);
    if (duration > 0) {
      setTimeout(() => setVisible(false), duration);
    }
  }, []);
  const handleClose = () => setVisible(false);
  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {visible && (
        <Notification message={notification.message} type={notification.type} onClose={handleClose} />
      )}
    </NotificationContext.Provider>
  );
} 