'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/firebase';
import { useRouter } from "next/navigation";

export default function UserHeader() {
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    router.push("/");
    await signOut(auth);
  }

  if (!user) {
    return (
      <Link href="/login" passHref>
        <Button variant="default" size="sm">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground truncate max-w-[150px] hidden sm:inline-block">
        {user.displayName || user.email}
      </span>
      <Button variant="ghost" size="icon" onClick={logout} title="Log out">
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
