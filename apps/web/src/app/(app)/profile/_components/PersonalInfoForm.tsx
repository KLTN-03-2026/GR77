import React from 'react';
import { MapPinIcon, PencilIcon } from '@heroicons/react/24/outline';

interface PersonalInfoFormProps {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  province: string;
  setProvince: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  provincesData: any[];
  districtsData: any[];
  handleSave: () => void;
  isSaving: boolean;
  fetchProfile: () => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  onEditClick: () => void;
}

export function PersonalInfoForm({
  firstName, setFirstName,
  lastName, setLastName,
  province, setProvince,
  district, setDistrict,
  address, setAddress,
  provincesData, districtsData,
  handleSave, isSaving, fetchProfile,
  isEditing, setIsEditing, onEditClick
}: PersonalInfoFormProps) {
  return (
    <div className="bg-white rounded-b-xl sm:rounded-b-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#1d2951]">Personal Information</h3>
        {!isEditing && (
          <button
            onClick={onEditClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm transition-all transform active:scale-95"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isEditing}
              placeholder="Enter first name"
              className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none ${
                isEditing
                  ? 'bg-gray-50 border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
                  : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
              } text-gray-800 font-medium`}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isEditing}
              placeholder="Enter last name"
              className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none ${
                isEditing
                  ? 'bg-gray-50 border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
                  : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
              } text-gray-800 font-medium`}
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="pt-2">
          <label className="block text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
            <MapPinIcon className="w-5 h-5 inline mr-1 text-cyan-600" />
            Address & Location
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Province / City</label>
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setDistrict('');
                }}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none appearance-none ${
                  isEditing
                    ? 'bg-gray-50 border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
                    : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                } text-gray-800 font-medium`}
              >
                <option value="">-- Select Province / City --</option>
                {provincesData.map((p: any) => (
                  <option key={p.id} value={p.full_name}>{p.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Ward / Commune</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!isEditing || !province}
                className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none appearance-none ${
                  !isEditing || !province
                    ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-50 border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
                } text-gray-800 font-medium`}
              >
                <option value="">-- Select Ward / Commune --</option>
                {districtsData.map((d: any) => (
                  <option key={d.id} value={d.full_name}>{d.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Specific Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isEditing}
              placeholder="House number, street name, building..."
              className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none ${
                isEditing
                  ? 'bg-gray-50 border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
                  : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
              } text-gray-800 font-medium`}
            />
          </div>
        </div>

        {/* Save Actions */}
        {isEditing && (
          <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-[160px] py-2.5 rounded-full font-bold text-[#319C04] border-2 border-[#319C04] bg-white hover:bg-[#319C04]/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center text-[15px]"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-[#319C04]/30 border-t-[#319C04] rounded-full animate-spin" />
              ) : (
                'Save change'
              )}
            </button>
            <button
              onClick={fetchProfile}
              className="w-full sm:w-[140px] py-2.5 rounded-full font-bold text-[#BC4639] border-2 border-[#BC4639] bg-white hover:bg-[#BC4639]/20 transition-all transform active:scale-95 flex items-center justify-center text-[15px]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
