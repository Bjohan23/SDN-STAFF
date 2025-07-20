import React, { createContext, useContext, useState, useCallback } from 'react';

const StandsContext = createContext();

export const useStands = () => {
  const context = useContext(StandsContext);
  if (!context) {
    throw new Error('useStands debe ser usado dentro de un StandsProvider');
  }
  return context;
};

export const StandsProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const value = {
    refreshTrigger,
    triggerRefresh
  };

  return (
    <StandsContext.Provider value={value}>
      {children}
    </StandsContext.Provider>
  );
}; 