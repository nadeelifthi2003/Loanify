import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Bell, Lock, User, Moon, Sun, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const OfficerSettings = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        fullName: 'Officer Smith',
        email: 'officer.smith@loanify.bank',
        phone: '+1 234 567 8999',
        employeeId: 'EMP-2023-001',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        newApplication: true,
        riskAlerts: true,
        dailySummary: false,
        emailDigests: true
    });

    const [security] = useState({
        twoFactor: true,
        sessionTimeout: '30m'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="space-y-6 animate-fade-in text-light-text-primary dark:text-dark-text-primary">
            <div>
                <Button
                    variant="ghost"
                    className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Officer Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your profile, preferences, and security</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <Card className="p-4 h-fit lg:col-span-1">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile'
                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications'
                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Bell className="w-4 h-4" />
                            Notifications
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security'
                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Shield className="w-4 h-4" />
                            Security
                        </button>
                    </nav>
                </Card>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === 'profile' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Personal Information
                            </h2>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    OS
                                </div>
                                <div>
                                    <Button variant="outline" size="sm" className="mb-2">Change Avatar</Button>
                                    <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Employee ID"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    disabled
                                    className="bg-gray-50 dark:bg-gray-800"
                                />
                                <Input
                                    label="Email Address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button>Save Changes</Button>
                            </div>

                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-base font-medium text-gray-800 dark:text-white mb-4">Appearance</h3>
                                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">Interface Theme</p>
                                            <p className="text-xs text-gray-500">Select your preferred interface appearance</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={toggleTheme}>
                                        Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { id: 'newApplication', title: 'New Application Alerts', desc: 'Get notified when a new loan application is assigned to you.' },
                                    { id: 'riskAlerts', title: 'High Risk Alerts', desc: 'Immediate notification when a high-risk application is detected.' },
                                    { id: 'dailySummary', title: 'Daily Reports', desc: 'Receive a daily summary of processed applications.' },
                                    { id: 'emailDigests', title: 'Email Digests', desc: 'Weekly email digest of your performance metrics.' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={notifications[item.id as keyof typeof notifications]}
                                                onChange={() => toggleNotification(item.id as keyof typeof notifications)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button>Save Preferences</Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Security Settings
                            </h2>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Change Password</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="outline" size="sm">Update Password</Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Two-Factor Authentication</h3>
                                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg">
                                    <div className="flex gap-4">
                                        <div className="p-2 bg-white dark:bg-dark-surface rounded-full shadow-sm h-fit">
                                            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication (2FA)</p>
                                            <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account by requiring a code when logging in.</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant={security.twoFactor ? 'danger' : 'outline'}>
                                        {security.twoFactor ? 'Disable' : 'Enable'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
