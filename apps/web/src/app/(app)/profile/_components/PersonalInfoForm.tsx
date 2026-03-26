import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

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
}

export function PersonalInfoForm({
  firstName, setFirstName,
  lastName, setLastName,
  province, setProvince,
  district, setDistrict,
  address, setAddress,
  provincesData, districtsData,
  handleSave, isSaving, fetchProfile
}: PersonalInfoFormProps) {
  return (
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
              placeholder="Enter first name"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none"
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="pt-2">
          <label className="block text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center">
            <MapPinIcon className="w-5 h-5 inline mr-1 text-cyan-600" />
            Địa chỉ & Nơi ở
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Tỉnh/Thành phố</label>
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setDistrict('');
                }}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none appearance-none"
              >
                <option value="">-- Chọn Tỉnh/Thành --</option>
                {provincesData.map((p: any) => (
                  <option key={p.id} value={p.full_name}>{p.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Phường/Xã/Quận/Huyện</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!province}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Chọn Nơi Ở --</option>
                {districtsData.map((d: any) => (
                  <option key={d.id} value={d.full_name}>{d.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Địa chỉ cụ thể</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, tên đường, ngõ/ngách, toà nhà..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none"
            />
          </div>
        </div>

        {/* Save Actions */}
        <div className="pt-4 flex justify-end gap-4 border-t border-gray-50">
          <button
            onClick={fetchProfile}
            className="px-6 py-3 rounded-2xl font-bold text-[#8ea1c1] hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center min-w-[160px]"
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
  );
}
