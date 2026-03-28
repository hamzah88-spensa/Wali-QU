'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';
import { PeriodProvider, usePeriod } from './PeriodProvider';
import { Menu } from 'lucide-react';

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { periods, activePeriod, setActivePeriod } = usePeriod();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 print:hidden">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-slate-500 hover:text-slate-700">
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 hidden sm:block">
          {activePeriod ? `Periode: ${activePeriod.name} - ${activePeriod.semester}` : 'Pilih Periode'}
        </h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <label htmlFor="period-select" className="hidden sm:block text-sm font-medium text-slate-700">
          Ganti Periode:
        </label>
        <select
          id="period-select"
          className="rounded-xl border border-slate-300 bg-white px-2 py-1.5 sm:px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[140px] sm:max-w-xs"
          value={activePeriod?.id || ''}
          onChange={(e) => {
            const period = periods.find((p) => p.id === e.target.value);
            if (period) setActivePeriod(period);
          }}
        >
          <option value="" disabled>Pilih Periode</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.semester})
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <PeriodProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:overflow-visible scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </PeriodProvider>
  );
}
