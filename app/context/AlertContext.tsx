import React, { createContext, useContext, useState, useCallback } from 'react';

interface CriticalAlert {
  patientId: string;
  patientName: string;
  timestamp: Date;
}

interface AlertContextType {
  criticalAlert: CriticalAlert | null;
  triggerCriticalAlert: (alert: CriticalAlert) => void;
  clearAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [criticalAlert, setCriticalAlert] = useState<CriticalAlert | null>(null);

  const triggerCriticalAlert = useCallback((alert: CriticalAlert) => {
    setCriticalAlert(alert);
    setTimeout(() => setCriticalAlert(null), 5000);
  }, []);

  const clearAlert = useCallback(() => {
    setCriticalAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ criticalAlert, triggerCriticalAlert, clearAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};
