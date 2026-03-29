"use client";

import React from 'react';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>Select your preferred currency for displaying prices.</CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencySelector />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDarkModeClick}>Toggle Dark Mode</Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="flex items-center justify-between">
                <p>Logged in as {user.email}</p>
                <Button onClick={logout}>Logout</Button>
              </div>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;