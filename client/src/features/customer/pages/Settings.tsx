import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    ArrowLeft, User, Lock, Bell, Moon, Sun,
    Shield, CheckCircle, Save, Eye, EyeOff,
} from 'lucide-react';

const API = 'http://localhost:5000';

const getToken = () => localStorage.getItem('loanify_token') || '';
const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
});

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Sun },
];

export const Settings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('customer_notifications');
        return saved ? JSON.parse(saved) : {
            loanStatusUpdates: true,
            paymentReminders: true,
            promotionalOffers: false,
            emailDigests: true,
        };
    });

    // Load profile from server
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API}/api/profile/me`, { headers: authHeaders() });
                const data = await res.json();
                if (data.status === 'success') {
                    setProfile({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        phone: data.user.phone || '',
                    });
                }
            } catch {
                // silently fall back to auth context values
            }
        };
        fetchProfile();
    }, []);

    const initials = profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const saveProfile = async () => {
        if (!profile.name.trim()) {
            showToast('Full name cannot be empty.', 'error');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/profile/update`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ name: profile.name, phone: profile.phone }),
            });
            const data = await res.json();
            if (data.status === 'success') {
                // Update localStorage so Navbar reflects the change
                const saved = localStorage.getItem('loanify_user');
                if (saved) {
                    const u = JSON.parse(saved);
                    u.name = data.user.name;
                    localStorage.setItem('loanify_user', JSON.stringify(u));
                }
                showToast('Profile updated successfully!', 'success');
            } else {
                showToast(data.message || 'Update failed.', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            showToast('Please fill in all password fields.', 'error');
            return;
        }
        if (passwords.newPassword.length < 8) {
            showToast('New password must be at least 8 characters.', 'error');
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            showToast('New passwords do not match.', 'error');
            return;
        }
        setChangingPw(true);
        try {
            const res = await fetch(`${API}/api/profile/change-password`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                }),
            });
            const data = await res.json();
            if (data.status === 'success') {
                showToast('Password changed successfully!', 'success');
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showToast(data.message || 'Failed to change password.', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setChangingPw(false);
        }
    };

    const saveNotifications = () => {
        localStorage.setItem('customer_notifications', JSON.stringify(notifications));
        showToast('Notification preferences saved!', 'success');
    };

    const toggleNotif = (key: keyof typeof notifications) => {
        setNotifications((p: typeof notifications) => ({ ...p, [key]: !p[key] }));
    };

    const PwToggle = ({ field }: { field: 'current' | 'new' | 'confirm' }) => (
        <button
            type="button"
            onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
            {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <Button
                    variant="ghost"
                    className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    Account Settings
                </h1>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Manage your profile, security, and notification preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <Card className="p-3 h-fit lg:col-span-1">
                    <nav className="space-y-1">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === id
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </Card>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">

                    {/* ── PROFILE ── */}
                    {activeTab === 'profile' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Personal Information
                            </h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                                    {initials || <User className="w-8 h-8" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">{profile.name}</p>
                                    <p className="text-sm text-gray-500">{profile.email}</p>
                                    <Badge variant="success" size="sm" className="mt-2">Active</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    label="Full Name"
                                    value={profile.name}
                                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="Your full name"
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                                />
                                <Input
                                    label="Phone Number"
                                    value={profile.phone}
                                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                                    placeholder="+94 77 123 4567"
                                />
                                <div className="flex items-end">
                                    <div className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Account Type</p>
                                        <p className="font-semibold text-gray-800 dark:text-white capitalize">{user?.role || 'Customer'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={saveProfile} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
                                    Save Changes
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* ── SECURITY ── */}
                    {activeTab === 'security' && (
                        <Card className="p-6 space-y-8">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Security Settings
                            </h2>

                            {/* Change Password */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Change Password
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {(['current', 'new', 'confirm'] as const).map((field) => (
                                        <div key={field} className="relative">
                                            <Input
                                                label={
                                                    field === 'current' ? 'Current Password'
                                                    : field === 'new' ? 'New Password'
                                                    : 'Confirm Password'
                                                }
                                                type={showPw[field] ? 'text' : 'password'}
                                                value={passwords[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
                                                onChange={(e) =>
                                                    setPasswords((p) => ({
                                                        ...p,
                                                        [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="••••••••"
                                            />
                                            <PwToggle field={field} />
                                        </div>
                                    ))}
                                </div>
                                {passwords.newPassword && passwords.newPassword.length < 8 && (
                                    <p className="text-xs text-red-500">Password must be at least 8 characters.</p>
                                )}
                                {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                                    <p className="text-xs text-red-500">Passwords do not match.</p>
                                )}
                                <div className="flex justify-end">
                                    <Button
                                        onClick={changePassword}
                                        isLoading={changingPw}
                                        leftIcon={<CheckCircle className="w-4 h-4" />}
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </div>

                            {/* Session Info */}
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Active Session</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    You are currently signed in. Your session will expire after 24 hours of inactivity.
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* ── NOTIFICATIONS ── */}
                    {activeTab === 'notifications' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Notification Preferences
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { id: 'loanStatusUpdates', title: 'Loan Status Updates', desc: 'Get notified when your application status changes.' },
                                    { id: 'paymentReminders', title: 'Payment Reminders', desc: 'Receive reminders before your EMI due date.' },
                                    { id: 'promotionalOffers', title: 'Promotional Offers', desc: 'Special loan rates and limited-time offers from Loanify.' },
                                    { id: 'emailDigests', title: 'Weekly Email Digest', desc: 'A summary of your account activity every week.' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white text-sm">{item.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={notifications[item.id as keyof typeof notifications]}
                                                onChange={() => toggleNotif(item.id as keyof typeof notifications)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button onClick={saveNotifications} leftIcon={<Save className="w-4 h-4" />}>
                                    Save Preferences
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* ── APPEARANCE ── */}
                    {activeTab === 'appearance' && (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
                                Appearance
                            </h2>
                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">Interface Theme</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Currently using <strong>{theme === 'dark' ? 'Dark' : 'Light'}</strong> mode.
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={toggleTheme}>
                                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
