import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { ChefHat, Bookmark } from 'lucide-react';
import UserHeader from '@/components/UserHeader';
import LayoutClientWrapper from '@/components/LayoutClientWrapper'; // ✅

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
          <Button variant="ghost" className="text-xl font-bold text-primary hover:bg-transparent px-2 sm:px-3">
            <ChefHat className="mr-2 h-6 w-6" />
            <span className="hidden sm:inline">ZingMeal</span>
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/favorites" passHref>
            <Button variant="outline" size="default">
              <Bookmark className="mr-2 h-5 w-5" />
              My Favorites
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen">
        <div className="flex flex-col min-h-screen">
          <LayoutClientWrapper header={header}>
            {children}
          </LayoutClientWrapper>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
