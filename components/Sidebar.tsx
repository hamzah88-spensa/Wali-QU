'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarDays, 
  MessageSquare, 
  FileText, 
  Settings,
  LogOut
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Siswa', href: '/students', icon: Users },
  { name: 'Pembimbingan', href: '/mentoring', icon: BookOpen },
  { name: 'Rencana Tahunan', href: '/annual-plans', icon: CalendarDays },
  { name: 'Komunikasi', href: '/communications', icon: MessageSquare },
  { name: 'Laporan', href: '/reports', icon: FileText },
  { name: 'Pengaturan Periode', href: '/periods', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 print:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <h1 className="text-lg font-bold text-indigo-400">Guru Wali App</h1>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={signOut}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white" />
          Logout
        </button>
      </div>
      </div>
    </>
  );
}
