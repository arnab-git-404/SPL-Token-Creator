import { useState, useCallback } from 'react';

const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info', autoClose = true) => {
    setNotification({ message, type, autoClose });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const notifySuccess = useCallback((message) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const notifyError = useCallback((message) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const notifyWarning = useCallback((message) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const notifyInfo = useCallback((message) => {
    showNotification(message, 'info');
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };
};

export default useNotification;