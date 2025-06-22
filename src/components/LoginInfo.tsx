"use client";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function LoginInfoTip() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
        });
        return () => unsubscribe();
    }, []);

    if (isLoggedIn) return null;

    return (
        <div className="mb-6 px-4 py-3 rounded-md bg-primary/10 border border-primary text-primary text-sm sm:text-base text-center">
            <p>
                <strong>Tip:</strong> Log in to access your saved meal plans and favorites from any device.
            </p>
        </div>
    );
}
