'use client';

import { useState } from 'react';
import { 
  KeyIcon, 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1200);
  };

  const toggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-black text-[#1d2951] tracking-tight">Account Security</h1>
        <p className="text-[#8ea1c1] font-medium mt-1">Manage your password, two-factor authentication, and monitor active sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Password & 2FA */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Change Password Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <KeyIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1d2951]">Change Password</h2>
                <p className="text-sm font-medium text-[#8ea1c1]">Ensure your account is using a long, random password to stay secure.</p>
              </div>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium transition-all"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium">Password must be at least 8 characters long.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800 font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={isUpdatingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="px-8 py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center min-w-[200px]"
                >
                  {isUpdatingPassword ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${is2FAEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {is2FAEnabled ? <ShieldCheckIcon className="w-6 h-6" /> : <ShieldCheckIcon className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1d2951]">Two-Factor Authentication</h2>
                  <p className="text-sm font-medium text-[#8ea1c1]">Add an extra layer of security to your account.</p>
                </div>
              </div>
              
              {/* Modern Toggle Switch */}
              <button 
                onClick={toggle2FA}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${is2FAEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span className="sr-only">Use setting</span>
                <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${is2FAEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="p-8">
              {is2FAEnabled ? (
                <div className="flex items-start gap-4 p-5 bg-green-50 rounded-2xl border border-green-100">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-900">Two-Factor Authentication is Enabled</h4>
                    <p className="text-sm text-green-700 mt-1">When signing in, you will need to provide a verification code from your authenticator app.</p>
                    <button className="mt-4 px-5 py-2 min-h-0 bg-white border border-green-200 text-green-700 font-bold rounded-xl text-sm hover:bg-green-50 transition-colors shadow-sm">
                      Reconfigure 2FA
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <DevicePhoneMobileIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="font-bold text-[#1d2951] mb-2">Protect your account with 2FA</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">We highly recommend you to enable two-factor authentication to protect your Kindlink account from unauthorized access.</p>
                  <button onClick={toggle2FA} className="px-6 py-2.5 bg-[#1d2951] text-white font-bold rounded-xl text-sm hover:bg-gray-800 transition-colors shadow-md">
                    Enable Two-Factor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sessions & Danger Zone */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Active Sessions */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-[#1d2951]">Active Sessions</h3>
            </div>
            
            <div className="p-2">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-4 m-2">
                <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm flex-shrink-0">
                  <ComputerDesktopIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#1d2951] text-sm">Windows 11, Edge</h4>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] uppercase tracking-wider font-bold rounded-md">Current</span>
                  </div>
                  <p className="text-xs text-[#8ea1c1] mt-1">Ho Chi Minh City, VN</p>
                  <p className="text-xs text-[#8ea1c1]">Active now</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl hover:bg-gray-50 flex items-start gap-4 m-2 transition-colors">
                <div className="p-2 bg-gray-100 rounded-xl text-gray-500 flex-shrink-0">
                  <DevicePhoneMobileIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1d2951] text-sm">iPhone 14 Pro, Safari</h4>
                  <p className="text-xs text-[#8ea1c1] mt-1">Hanoi, VN</p>
                  <p className="text-xs text-[#8ea1c1]">Last active: 2 hours ago</p>
                  <button className="text-xs font-bold text-red-500 mt-2 hover:text-red-600 transition-colors">Revoke session</button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-50 text-center">
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Sign out of all devices
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
