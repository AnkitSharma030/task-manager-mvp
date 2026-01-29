'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for token in localStorage on mount
        const storedToken = localStorage.getItem('auth-token');
        const storedUser = localStorage.getItem('auth-user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store token and user in localStorage
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('auth-user', JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);

        return data;
    };

    const logout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    // Helper to get auth headers for API requests
    const getAuthHeaders = () => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Authenticated fetch wrapper
    const authFetch = async (url, options = {}) => {
        const headers = {
            ...options.headers,
            ...getAuthHeaders(),
        };

        const res = await fetch(url, { ...options, headers });

        // If unauthorized, logout
        if (res.status === 401) {
            logout();
            throw new Error('Session expired');
        }

        return res;
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            getAuthHeaders,
            authFetch
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
