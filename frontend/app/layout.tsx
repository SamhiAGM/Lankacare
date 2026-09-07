import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'LankaCare — Sri Lanka Digital Health Platform',
  description:
    'Independent digital health coordination prototype for Sri Lanka. Discover healthcare facilities across all 9 provinces and 25 districts, track dengue surveillance, search NMRA essential medicines, and access 24/7 verified emergency services.',
  keywords: [
    'LankaCare',
    'Sri Lanka Digital Health',
    'Sri Lanka Hospital Directory',
    '1990 Suwa Seriya',
    'Dengue Surveillance Sri Lanka',
    'National Dengue Control Unit',
    'NMRA Essential Medicines',
    'Epidemiology Unit Sri Lanka',
    '25 Districts Healthcare',
  ],
  authors: [{ name: 'LankaCare Digital Health Project' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                <AppShell>{children}</AppShell>
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
