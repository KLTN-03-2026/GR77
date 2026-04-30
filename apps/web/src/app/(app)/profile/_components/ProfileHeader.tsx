import { CameraIcon, UserIcon, EnvelopeIcon, MapPinIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
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
}: ProfileHeaderProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center relative">
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
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3">
          <h2 className="text-xl font-bold text-[#1d2951]">{displayName}</h2>
          <p className="text-sm font-bold text-cyan-500 uppercase tracking-wider mt-1">
            {profile?.role || 'USER'}
          </p>

          <div className="border-t border-gray-200 my-2" />

          {/* eKYC Status */}
          <div className="mb-4">
            {profile?.ekyc?.status === 'APPROVED' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                <CheckCircle2 className="w-3 h-3" />
                Verified Account
              </div>
            ) : profile?.ekyc?.status === 'PENDING' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                <ClockIcon className="w-3 h-3" />
                KYC Pending
              </div>
            ) : (
              <Link href="/profile/ekyc" className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-100 transition-all">
                <ShieldCheck className="w-3 h-3" />
                Verify Identity
              </Link>
            )}
          </div>

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

    </div>
  );
}
