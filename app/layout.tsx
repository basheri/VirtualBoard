import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
});

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({ 
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--font-arabic',
});

export const metadata: Metadata = {
  title: 'VirtualBoard AI - Your AI-Powered Advisory Board',
  description: 'Make better strategic decisions with AI advisors who never sleep. VirtualBoard AI provides instant perspectives from CFO, CTO, Legal, and Marketing experts.',
};

import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${ibmPlexSans.variable} ${ibmPlexSansArabic.variable}`}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}