'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export type Period = {
  id: string;
  name: string;
  semester: string;
  is_active: boolean;
};

type PeriodContextType = {
  periods: Period[];
  activePeriod: Period | null;
  setActivePeriod: (period: Period) => void;
  refreshPeriods: () => Promise<void>;
};

const PeriodContext = createContext<PeriodContextType>({
  periods: [],
  activePeriod: null,
  setActivePeriod: () => {},
  refreshPeriods: async () => {},
});

export const PeriodProvider = ({ children }: { children: React.ReactNode }) => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [activePeriod, setActivePeriodState] = useState<Period | null>(null);
  const { user } = useAuth();

  const refreshPeriods = async () => {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching periods:', error);
      return;
    }

    setPeriods(data || []);
    
    // Set active period if none selected
    if (!activePeriod && data && data.length > 0) {
      const defaultActive = data.find(p => p.is_active) || data[0];
      setActivePeriodState(defaultActive);
    }
  };

  useEffect(() => {
    refreshPeriods();
  }, [user]);

  const setActivePeriod = (period: Period) => {
    setActivePeriodState(period);
  };

  return (
    <PeriodContext.Provider value={{ periods, activePeriod, setActivePeriod, refreshPeriods }}>
      {children}
    </PeriodContext.Provider>
  );
};

export const usePeriod = () => useContext(PeriodContext);
