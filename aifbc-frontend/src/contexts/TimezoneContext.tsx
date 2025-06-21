import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TimezoneContextType, TimezoneInfo } from '../types';
import { getTimezoneInfo } from '../utils';

const defaultTimezone = 'Asia/Bangkok'; // GMT+7 as default

const TimezoneContext = createContext<TimezoneContextType | undefined>(
  undefined
);

interface TimezoneProviderProps {
  children: ReactNode;
}

export const TimezoneProvider: React.FC<TimezoneProviderProps> = ({
  children,
}) => {
  const [timezone, setTimezone] = useState<string>(defaultTimezone);
  const [timezoneInfo, setTimezoneInfo] = useState<TimezoneInfo>(
    getTimezoneInfo(defaultTimezone)
  );

  const handleSetTimezone = (newTimezone: string) => {
    setTimezone(newTimezone);
    setTimezoneInfo(getTimezoneInfo(newTimezone));
  };

  const value: TimezoneContextType = {
    timezone,
    setTimezone: handleSetTimezone,
    timezoneInfo,
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTimezone = (): TimezoneContextType => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};
