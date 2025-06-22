"use client";

import React, { useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, ShieldCheck, UserCircle } from "lucide-react";

export default function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const syncUserToFirestore = async (firebaseUser: User) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        isAdmin: false,
        createdAt: Date.now(),
      });
      setIsAdmin(false);
    } else {
      const data = userSnap.data();
      setIsAdmin(data.isAdmin === true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncUserToFirestore(firebaseUser);
        router.push("/");
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8 text-center">
      <div className="max-w-sm w-full bg-card shadow-md rounded-lg p-6 space-y-6">
        {user ? (
          <>
            <div className="flex flex-col items-center space-y-2">
              <UserCircle className="w-12 h-12 text-primary" />
              <h2 className="text-xl font-semibold text-primary">
                Welcome, {user.displayName}
              </h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              {isAdmin && (
                <span className="text-green-600 flex items-center gap-1 text-sm font-medium mt-1">
                  <ShieldCheck className="w-4 h-4" />
                  Admin Access
                </span>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold text-primary">
              Sign in to ZingMeal
            </h2>
            <p className="text-sm text-muted-foreground">
              Save your favorite meals and access them from any device.
            </p>
            <Button
              onClick={handleGoogleLogin}
              variant="default"
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with Google
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
