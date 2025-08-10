import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { ChefHat, Bookmark } from 'lucide-react';
import UserHeader from '@/components/UserHeader';
import LayoutClientWrapper from '@/components/LayoutClientWrapper'; // ✅
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import CanonicalTag from '@/components/CanonicalTag';


export const metadata: Metadata = {
  title: 'ZingMeal - Find meals you like!',
  description: 'Find your next meal easily!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = (
    <header className="bg-card shadow-sm sticky top-0 z-40 border-b">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" passHref>
          <Button
            variant="ghost"
            size="sm"
            className="text-xl font-bold text-primary hover:bg-transparent px-2 sm:px-3 flex items-center gap-2"
          >
            <ChefHat className="h-6 w-6" />
            <span className="hidden sm:inline">ZingMeal</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <CurrencyDisplay />
          </div>
          <Link href="/favorites" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-2 sm:px-3"
              title="Favorites"
            >
              <Bookmark className="h-5 w-5" />
              <span className="hidden sm:inline">My Favorites</span>
            </Button>
          </Link>
          <UserHeader />
        </div>
      </nav>
    </header>

  );

  return (
     <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://zingmeal.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <CanonicalTag />
        <GoogleAnalytics />
      </head>
      <body className="font-body antialiased min-h-screen">
        <AuthProvider>
          <CurrencyProvider>
            <div className="flex flex-col min-h-screen">
              <LayoutClientWrapper header={header}>
                {children}
              </LayoutClientWrapper>
            </div>
            <Toaster />
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
