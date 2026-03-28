import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/components/AuthProvider';
import { AppLayout } from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'Sistem Manajemen Pembimbingan Siswa',
  description: 'Aplikasi web modern untuk pencatatan dan manajemen pembimbingan siswa oleh Guru Wali',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
