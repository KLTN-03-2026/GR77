import { CameraIcon, UserIcon, EnvelopeIcon, MapPinIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface ProfileHeaderProps {
  displayName: string;
  profile: any;
  locationString: string;
  coverPreview: string | null;
  avatarPreview: string | null;
  coverInputRef: React.RefObject<HTMLInputElement | null> | any;
  avatarInputRef: React.RefObject<HTMLInputElement | null> | any;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  avatarFile: File | null;
  coverFile: File | null;
}

export function ProfileHeader({
  displayName,
  profile,
  locationString,
  coverPreview,
  avatarPreview,
  coverInputRef,
  avatarInputRef,
  handleCoverChange,
  handleAvatarChange,
  avatarFile,
  coverFile,
}: ProfileHeaderProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-center relative">
        {/* Cover Image */}
        <div className="h-28 relative group">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[linear-gradient(90deg,#89A7CA_0%,#3D5169_97%)]" />
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/50 rounded-lg backdrop-blur-sm transition-all text-white opacity-0 group-hover:opacity-100"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
        </div>

        {/* Avatar */}
        <div className="relative -mt-14 flex justify-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-cyan-300" />
                </div>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-cyan-500 z-10"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="px-6 pb-6 pt-3">
          <h2 className="text-xl font-bold text-[#1d2951]">{displayName}</h2>
          <p className="text-sm font-bold text-cyan-500 uppercase tracking-wider mt-1">
            {profile?.role || 'USER'}
          </p>

          <div className="border-t border-gray-50 my-4" />

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <EnvelopeIcon className="w-4 h-4 text-[#8ea1c1] shrink-0" />
              <span className="truncate">{profile?.email}</span>
            </div>
            {locationString && (
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 text-[#8ea1c1] shrink-0 mt-0.5" />
                <span className="break-words">{locationString}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview badges */}
      {(avatarFile || coverFile) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700 font-medium flex items-start gap-2">
          <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <span>Hình ảnh mới sẽ được lưu khi bạn nhấn <strong>"Save Changes"</strong>.</span>
        </div>
      )}
    </div>
  );
}
