"use client";

import { useContext, useState, useEffect, createContext } from "react";

interface AuthContextType {
    user: IUser | undefined;
    setUser: React.Dispatch<React.SetStateAction<IUser | undefined>>;
    accessToken: string | undefined;
    setAccessToken: React.Dispatch<React.SetStateAction<string | undefined>>;
    isAuthen : boolean | undefined;
    setIsAuthen : React.Dispatch<React.SetStateAction<boolean | undefined>>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>();
    const [accessToken, setAccessToken] = useState<string | undefined>();
    const [isAuthen, setIsAuthen] = useState<boolean | undefined>(false);
    const [isLoading, setIsLoading] = useState(true);

    // Restore auth state from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            const savedUser = localStorage.getItem("user");
            if (token && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    setAccessToken(token);
                    setIsAuthen(true);
                } catch {
                    localStorage.removeItem("user");
                    localStorage.removeItem("accessToken");
                }
            }
            setIsLoading(false);
        }
    }, []);

    // Persist user to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            } else {
                localStorage.removeItem("user");
            }
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, isAuthen, setIsAuthen, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}