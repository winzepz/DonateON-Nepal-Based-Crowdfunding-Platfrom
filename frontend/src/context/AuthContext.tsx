import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    kycStatus?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async (authToken?: string) => {
        const activeToken = authToken || token || localStorage.getItem('token');
        if (!activeToken) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${activeToken}` }
            });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.error('Failed to refresh user:', err);
            // If token is invalid, logout
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            refreshUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setLoading(false);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
