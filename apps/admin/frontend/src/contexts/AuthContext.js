'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = Cookies.get('admin_token');
            if (token) {
                const response = await authAPI.getProfile();
                setUser(response.data.data);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            Cookies.remove('admin_token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await authAPI.login({ username, password });
            const { token, admin } = response.data.data;

            Cookies.set('admin_token', token, { expires: 7 });
            setUser(admin);

            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Cookies.remove('admin_token');
            setUser(null);
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
