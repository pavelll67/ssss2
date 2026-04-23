import { createContext, useContext, useState } from 'react';

const SaveNotificationContext = createContext(null);

export function SaveNotificationProvider({ children }) {
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  const triggerSaveAnimation = () => {
    setShowSaveAnimation(true);
    // Автоматически скрываем анимацию через 1.2 секунды
    setTimeout(() => {
      setShowSaveAnimation(false);
    }, 1200);
  };

  return (
    <SaveNotificationContext.Provider value={{ showSaveAnimation, triggerSaveAnimation }}>
      {children}
    </SaveNotificationContext.Provider>
  );
}

export function useSaveNotification() {
  const context = useContext(SaveNotificationContext);
  if (!context) {
    throw new Error('useSaveNotification must be used within SaveNotificationProvider');
  }
  return context;
}

