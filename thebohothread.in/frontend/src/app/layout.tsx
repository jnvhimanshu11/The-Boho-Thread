import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/shared/QueryProvider';

export const metadata: Metadata = {
  title: 'Student Help Hub | Notes, AI Tools & School CRM',
  description: 'Your complete study partner — class notes, AI doubt solver, and school management system.',
  keywords: 'student notes, class notes, AI doubt solver, school CRM, study material, PYQ',
  openGraph: {
    title: 'Student Help Hub',
    description: 'Notes + AI Tools + School CRM all in one place',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen antialiased">
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '10px',
                fontSize: '14px',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
