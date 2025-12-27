import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, API_URL } from '../utils/api';

interface User {
    id: string;
    email: string;
    role: 'student' | 'corporate' | 'admin';
    firstName: string;
    lastName: string;
    company_name?: string;
    university_id?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (userData: any) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const TOKEN_KEY = '@campus_placement_token';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async (): Promise<void> => {
        try {
            const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
            if (storedToken) {
                setToken(storedToken);
                await fetchUser(storedToken);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
            setLoading(false);
        }
    };

    const fetchUser = async (authToken: string): Promise<void> => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data);
            } else {
                await logout();
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            await logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.success) {
                await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
                setToken(data.data.token);
                setUser(data.data.user);
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const register = async (userData: any): Promise<{ success: boolean; message?: string }> => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await res.json();
            if (data.success) {
                await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
                setToken(data.data.token);
                setUser(data.data.user);
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error removing token:', error);
        }
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export { api };
