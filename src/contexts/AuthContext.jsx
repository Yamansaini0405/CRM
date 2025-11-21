'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const baseUrl = import.meta.env.VITE_BASE_URL || ""
    const [user, setUser] = useState(null);
    const [tokens, setTokens] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load tokens from localStorage on mount
    useEffect(() => {
        const storedTokens = localStorage.getItem('tokens');
        const storedUser = localStorage.getItem('user');
        if (storedTokens && storedUser) {
            setTokens(JSON.parse(storedTokens));
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (phone, password) => {
        setError(null);
        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/api/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            setTokens({ refresh: data.refresh, access: data.access });
            setUser(data.user);
            localStorage.setItem('tokens', JSON.stringify({ refresh: data.refresh, access: data.access }));
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (phone, firstName, lastName, email, role, password, password2) => {
        setError(null);
        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/api/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    role,
                    password,
                    password2,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, tokens, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
