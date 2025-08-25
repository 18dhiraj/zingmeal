'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ChefHat, Bookmark, Calendar, LogOut, User as Avatar, Search, Settings } from 'lucide-react';
import { CurrencyDisplay } from '../CurrencyDisplay';
import { useRouter } from 'next/navigation';
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import Image from 'next/image';


const HomeHeader = () => {

    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
    };

    return (
        <header className="sticky top-0 z-50 bg-black/10 backdrop-blur-[1px] text-white px-4 sm:px-6 py-3 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-y-2">
                <div className="flex items-center gap-2">
                    {/* <ChefHat className="w-6 h-6 text-white" /> */}
                    <Image
                        src={require('@/assets/logo/logo.png')}
                        alt='zingmeal-logo'
                        className='w-9 h-9'
                    />
                    <span className="hidden sm:inline text-xl font-semibold tracking-wide">ZingMeal</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-end w-auto sm:w-auto">
                    <CurrencyDisplay />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/explore?focus=true")}
                        className="text-white hover:bg-white/40 p-2 aspect-square"
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/settings")}
                        className="text-white hover:bg-white/40 p-2 aspect-square"
                    >
                        <Settings className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/favorites")}
                        className="text-white hover:bg-white/40 border border-white/30 flex items-center gap-1"
                    >
                        <Bookmark className="h-5 w-5" />
                        <span className="hidden sm:inline">Favorites</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => user ? router.push("/weekly-plan") : router.push("/login")}
                        className="text-white hover:bg-white/40 border border-white/30 flex items-center gap-1"
                    >
                        <Calendar className="h-5 w-5" />
                        <span className="hidden sm:inline">Weekly Plan</span>
                    </Button>

                    {user ? (
                        <>
                            <span className="hidden sm:inline text-sm text-white truncate max-w-[120px]">
                                {user.displayName || user.email}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-white hover:bg-white/40 flex items-center"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/settings")}
                            className="text-white hover:bg-white/40 border border-white/30 flex items-center gap-1"
                        >
                            <Avatar className="h-5 w-5" />
                            <span className="hidden sm:inline">Login</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}

export default HomeHeader