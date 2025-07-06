'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    verified: boolean;
    avatar?: string | null;
    title?: string | null;
    bio?: string | null;
    company?: string | null;
    location?: string | null;
    createdAt?: Date;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
    updateUser: (userData: Partial<User>) => void; // ADD this missing function
}

interface RegisterData {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('devflow_token');
        if (savedToken) {
            setToken(savedToken);
            validateTokenAndGetProfile(savedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const validateTokenAndGetProfile = async (token: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setToken(token);
            } else {
                localStorage.removeItem('devflow_token');
                setToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Token validation error: ', error);
            localStorage.removeItem('devflow_token');
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('devflow_token', data.token);
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.message || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error: ', error);
            return {
                success: false,
                error: 'Network error. Please try again.'
            };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('devflow_token', data.token);
                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.message || data.details?.[0]?.msg || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Network error. Please try again.'
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('devflow_token');
        }
    };

    const refreshToken = async (): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('devflow_token', data.token);
                return true;
            } else {
                logout();
                return false;
            }
        } catch (error) {
            console.error('Refresh error: ', error);
            logout();
            return false;
        }
    };

    // ADD the missing updateUser function
    const updateUser = (userData: Partial<User>) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            return { ...prevUser, ...userData };
        });
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshToken,
        updateUser, // ADD this to the context value
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}