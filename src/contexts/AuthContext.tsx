"use client";

import React,
{
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';
import {
    onAuthStateChanged,
    signOut,
    User
} from 'firebase/auth';
import { auth } from '@/firebase';

interface AuthContextType {
    user: User | null;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};