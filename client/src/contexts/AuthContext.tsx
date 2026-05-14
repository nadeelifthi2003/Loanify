import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'customer' | 'officer' | 'admin' | 'manager';

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (role: Role, email: string, password?: string) => Promise<void>;
    register: (name: string, email: string, password?: string) => Promise<void>;
    loginWithGoogle: (token: string, role?: Role) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for saved user in localStorage on mount
        const savedUser = localStorage.getItem('loanify_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (role: Role, email: string, password?: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: password || 'defaultpassword', role })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            const loggedUser: User = data.user;
            setUser(loggedUser);
            localStorage.setItem('loanify_user', JSON.stringify(loggedUser));
            localStorage.setItem('loanify_token', data.token);

            switch (loggedUser.role) {
                case 'officer':
                case 'manager':
                    navigate('/officer');
                    break;
                case 'admin':
                    navigate('/admin');
                    break;
                default:
                    navigate('/customer');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password?: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password: password || 'defaultpassword' })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            const newUser: User = data.user;
            setUser(newUser);
            localStorage.setItem('loanify_user', JSON.stringify(newUser));
            localStorage.setItem('loanify_token', data.token);

            navigate('/customer');
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (token: string, role?: Role) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, role: role || 'customer' })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Google authentication failed');
            }

            const loggedUser: User = data.user;
            setUser(loggedUser);
            localStorage.setItem('loanify_user', JSON.stringify(loggedUser));
            localStorage.setItem('loanify_token', data.token);

            switch (loggedUser.role) {
                case 'officer':
                case 'manager':
                    navigate('/officer');
                    break;
                case 'admin':
                    navigate('/admin');
                    break;
                default:
                    navigate('/customer');
            }
        } catch (error) {
            console.error('Google Auth error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('loanify_user');
        localStorage.removeItem('loanify_token');
        navigate('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, loginWithGoogle, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
