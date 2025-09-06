import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CardProvider } from '@/context/CardContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Card Management System',
  description: 'A modern, feature-rich card management system for organizing your tasks, ideas, and projects.',
  keywords: 'card management, task management, organization, productivity',
  authors: [{ name: 'Card Management System' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CardProvider>
            <div className="min-h-screen bg-background">
              {children}
            </div>
            <Toaster richColors position="top-right" />
          </CardProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}