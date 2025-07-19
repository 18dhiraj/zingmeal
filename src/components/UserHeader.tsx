'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/firebase';
import { useRouter } from "next/navigation";
import { useIsMobile } from '../hooks/use-mobile'; // adjust path based on project
import { trackUserLogout } from '@/lib/analytics';

export default function UserHeader() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    // Track logout event
    trackUserLogout();
    router.push("/");
    await signOut(auth);
  };


  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/settings" passHref>
          <Button variant="ghost" size={isMobile ? "icon" : "sm"}>
            <Calendar className="h-5 w-5" />
            {!isMobile && <span className="ml-2">Weekly Plan</span>}
          </Button>
        </Link>
        <Link href="/settings" passHref>
          <Button variant="ghost" size={isMobile ? "icon" : "sm"}>
            <LogIn className="h-5 w-5" />
            {!isMobile && <span className="ml-2">Login</span>}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/weekly-plan" passHref>
        <Button variant="ghost" size={isMobile ? "icon" : "sm"}>
          <Calendar className="h-5 w-5" />
          {!isMobile && <span className="ml-2">Weekly Plan</span>}
        </Button>
      </Link>

      {!isMobile && (
        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
          {user.displayName || user.email}
        </span>
      )}

      <Link href="/settings" passHref>
        <Button variant="ghost" size="icon" title="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </Link>
      <Button variant="ghost" size="icon" onClick={logout} title="Logout">
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
