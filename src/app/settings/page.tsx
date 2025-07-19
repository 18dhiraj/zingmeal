"use client";

import React from 'react';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const SettingsPage = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const handleDarkModeClick = () => {
    toast({
      title: "Coming Soon",
      description: "Dark mode is not yet available, but we're working on it!",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Currency</h2>
          <CurrencySelector />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <Button onClick={handleDarkModeClick}>Toggle Dark Mode</Button>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          {user ? (
            <div className="flex items-center gap-4">
              <p>Logged in as {user.email}</p>
              <Button onClick={logout}>Logout</Button>
            </div>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;