'use client';

import { useState } from 'react';
import { UserIcon, CameraIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function MyProfilePage() {
  const [firstName, setFirstName] = useState('Trà');
  const [lastName, setLastName] = useState('My');
  const [email, setEmail] = useState('tramy@gmail.com');
  const [phone, setPhone] = useState('+84 123 456 789');
  const [location, setLocation] = useState('Đà Nẵng, Vietnam');


  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserIcon className="w-7 h-7 text-cyan-500" />
          My Profile
        </h1>
        <p className="text-sm text-gray-400 mt-1 ml-9">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Avatar & Basic Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-center relative">
            {/* Cover Area */}
            <div className="h-28 bg-[linear-gradient(90deg,#89A7CA_0%,#3D5169_97%)] relative">
              <button className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm transition-colors text-white">
                <CameraIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar */}
            <div className="relative -mt-14 flex justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                  <img src="/avata.svg" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-1 right-1 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-[#47c9e5] z-10">
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="px-6 pb-6 pt-3">
              <h2 className="text-xl font-bold text-[#1d2951]">{firstName} {lastName}</h2>
              <p className="text-sm font-bold text-[#47c9e5] uppercase tracking-wider mt-1">Pro Account</p>

              <div className="border-t border-gray-50 my-4"></div>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <EnvelopeIcon className="w-4 h-4 text-[#8ea1c1]" />
                  <span className="truncate">{email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <PhoneIcon className="w-4 h-4 text-[#8ea1c1]" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 text-[#8ea1c1]" />
                  <span className="truncate">{location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-[#1d2951] mb-6">Personal Information</h3>

            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#47c9e5] focus:ring-2 focus:ring-[#47c9e5]/20 text-gray-800 font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#47c9e5] focus:ring-2 focus:ring-[#47c9e5]/20 text-gray-800 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#47c9e5] focus:ring-2 focus:ring-[#47c9e5]/20 text-gray-800 font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#47c9e5] focus:ring-2 focus:ring-[#47c9e5]/20 text-gray-800 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#47c9e5] focus:ring-2 focus:ring-[#47c9e5]/20 text-gray-800 font-medium transition-all"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-4 border-t border-gray-50">
                <button className="px-6 py-3 rounded-2xl font-bold text-[#8ea1c1] hover:text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center min-w-[140px]"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
