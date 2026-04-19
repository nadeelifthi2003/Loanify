import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
    children?: React.ReactNode;
    role?: 'customer' | 'officer' | 'admin' | 'manager';
}

export const DashboardLayout = ({ children, role = 'customer' }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                navigate('/auth/login');
            } else {
                const isRoleMatch = user?.role === role || (role === 'officer' && user?.role === 'manager');
                if (!isRoleMatch) {
                    // Redirect to correct dashboard if role doesn't match
                    switch (user?.role) {
                        case 'admin': navigate('/admin'); break;
                        case 'manager':
                        case 'officer': navigate('/officer'); break;
                        case 'customer': navigate('/customer'); break;
                        default: navigate('/auth/login');
                    }
                }
            }
        }
    }, [isAuthenticated, user, role, navigate, isLoading]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    const hasAccess = isAuthenticated && (user?.role === role || (role === 'officer' && user?.role === 'manager'));
    if (!hasAccess) return null;

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-200">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} showSidebarToggle />

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    role={role}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};
