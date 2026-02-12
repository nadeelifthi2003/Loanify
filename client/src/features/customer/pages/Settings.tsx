import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft } from 'lucide-react';

export const Settings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    nic: '123456789V',
    phone: '+1 234 567 8900',
    address: '123 Main Street, Apartment 4B, New York, NY 10001',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Button
          variant="ghost"
          className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />

              <Input
                label="NIC / Passport"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                placeholder="Enter NIC or Passport"
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />

              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <Button>Update Information</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Profile Picture & Status */}
        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">Profile Picture</h2>
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <Button variant="outline" className="w-full max-w-[200px]">Change Photo</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium text-gray-900">Jan 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account Type</span>
                <span className="font-medium text-gray-900">Customer</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Row - Change Password */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Change Password</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
              />
            </div>
            <div className="mt-6">
              <Button>Update Password</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
