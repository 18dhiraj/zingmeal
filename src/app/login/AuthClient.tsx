'use client';

import React, { useEffect, useState } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { trackLoginAttempt, trackLoginSuccess, trackUserLogout } from '@/lib/analytics';
import {
    LogOut,
    LogIn,
    ShieldCheck,
    UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    initialUid: string | null;
};

export default function AuthClient({ initialUid }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    /** Sync newly‑signed‑in user to Firestore */
    const syncUserDoc = async (firebaseUser: User) => {
        const ref = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref);
        let isNewUser = false;

        if (!snap.exists()) {
            await setDoc(ref, {
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                isAdmin: false,
                createdAt: Date.now(),
            });
            setIsAdmin(false);
            isNewUser = true;
        } else {
            setIsAdmin(snap.data().isAdmin === true);
            isNewUser = false;
        }
        
        return isNewUser;
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const isNewUser = await syncUserDoc(firebaseUser);
                // Track successful login
                trackLoginSuccess('google', isNewUser);
                router.replace('/');
            } else {
                setUser(null);
                setIsAdmin(false);
            }
        });
        return unsub;
    }, [router]);

    const loginWithGoogle = async () => {
        trackLoginAttempt('google');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };
    
    const logout = () => {
        trackUserLogout();
        signOut(auth);
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
                        <Button onClick={logout} variant="destructive" className="w-full">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold text-primary">
                            Sign in to ZingMeal
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Save your favorite meals and access them from any device.
                        </p>
                        <Button onClick={loginWithGoogle} className="w-full">
                            <LogIn className="w-4 h-4 mr-2" />
                            Sign in with Google
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
