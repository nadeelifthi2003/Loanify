import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'customer' | 'officer' | 'admin';

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
    login: (role: Role, email: string) => Promise<void>;
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

    const login = async (role: Role, email: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: User = {
            id: '1',
            name: 'John Doe',
            email: email,
            role: role,
            avatar: undefined
        };

        setUser(mockUser);
        localStorage.setItem('loanify_user', JSON.stringify(mockUser));
        setIsLoading(false);

        // Navigation logic based on role
        switch (role) {
            case 'officer':
                navigate('/officer');
                break;
            case 'admin':
                navigate('/admin');
                break;
            default:
                navigate('/customer');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('loanify_user');
        navigate('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
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
