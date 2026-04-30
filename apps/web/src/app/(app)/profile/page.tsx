'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useAddressData } from './_hooks/useAddressData';
import { ProfileHeader } from './_components/ProfileHeader';
import { PersonalInfoForm } from './_components/PersonalInfoForm';
import { EmailSection } from './_components/EmailSection';
import { ChangeEmailModal } from './_components/ChangeEmailModal';
import { ImageCropModal } from './_components/ImageCropModal';
import { useGlobalAuth } from '@/contexts/AuthContext';

/** ─── Types ───────────────────────────────────────────────── */
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  profile?: {
    firstName: string | null;
    lastName: string | null;
    province: string | null;
    district: string | null;
    ward: string | null;
    address: string | null;
    avatarUrl: string | null;
    coverImageUrl: string | null;
  };
  ekyc?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
  };
}

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

export default function MyProfilePage() {
  const { updateUser } = useGlobalAuth();

  // ─── Profile state ──────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');
  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [originalProvince, setOriginalProvince] = useState('');
  const [originalDistrict, setOriginalDistrict] = useState('');
  const [originalWard, setOriginalWard] = useState('');
  const [originalAddress, setOriginalAddress] = useState('');

  const { provincesData, districtsData } = useAddressData(province);

  // ─── Image state ────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ─── Crop state ─────────────────────────────────────────────
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  // ─── Email change state ─────────────────────────────────────
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailStep, setEmailStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // ─── Save state ─────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // ─── Fetch profile ──────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!token) { setIsLoading(false); return; }
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data: UserProfile = await res.json();
      setProfile(data);
      if (data.profile) {
        const firstName = data.profile.firstName || '';
        const lastName = data.profile.lastName || '';
        const province = data.profile.province || '';
        const district = data.profile.district || '';
        const ward = data.profile.ward || '';
        const address = data.profile.address || '';
        
        setFirstName(firstName);
        setLastName(lastName);
        setProvince(province);
        setDistrict(district);
        setWard(ward);
        setAddress(address);
        setOriginalFirstName(firstName);
        setOriginalLastName(lastName);
        setOriginalProvince(province);
        setOriginalDistrict(district);
        setOriginalWard(ward);
        setOriginalAddress(address);
        setAvatarPreview(data.profile.avatarUrl || null);
        setCoverPreview(data.profile.coverImageUrl || null);
      }
    } catch {
      showToast('error', 'Failed to load profile information.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ─── Toast helper ───────────────────────────────────────────
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Edit mode handlers ────────────────────────────────────────────────────────────────────
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFirstName(originalFirstName);
    setLastName(originalLastName);
    setProvince(originalProvince);
    setDistrict(originalDistrict);
    setWard(originalWard);
    setAddress(originalAddress);
    setIsEditing(false);
  };

  // ─── Image handlers ─────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTempImageSrc(URL.createObjectURL(file));
    setCropType('avatar');
    setCropModalOpen(true);
    e.target.value = '';
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTempImageSrc(URL.createObjectURL(file));
    setCropType('cover');
    setCropModalOpen(true);
    e.target.value = '';
  };

  const handleCropSave = async (croppedFile: File) => {
    setIsSaving(true);
    try {
      const url = await uploadImage(croppedFile);
      const body = {
        [cropType === 'avatar' ? 'avatarUrl' : 'coverImageUrl']: url,
      };

      const res = await fetch(`${API}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update image');
      }

      const data = await res.json();
      setProfile((prev) => prev ? { ...prev, ...data.user } : prev);
      updateUser(data.user);

      if (cropType === 'avatar') {
        setAvatarPreview(url);
      } else {
        setCoverPreview(url);
      }
      showToast('success', `${cropType === 'avatar' ? 'Avatar' : 'Cover'} updated successfully!`);
      setCropModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred while saving image.');
    } finally {
      setIsSaving(false);
      setTempImageSrc(null);
    }
  };

  // ─── Upload image helper ────────────────────────────────────
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  // ─── Save Changes ──────────────────────────────────────────
  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);

    try {
      const body: any = {
        firstName,
        lastName,
        province,
        district,
        ward,
        address,
      };

      const res = await fetch(`${API}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed');
      }

      const data = await res.json();
      setProfile((prev) => prev ? { ...prev, ...data.user } : prev);
      updateUser(data.user);

      // Update original values after successful save
      setOriginalFirstName(firstName);
      setOriginalLastName(lastName);
      setOriginalProvince(province);
      setOriginalDistrict(district);
      setOriginalWard(ward);
      setOriginalAddress(address);

      setIsEditing(false);

      showToast('success', 'Profile updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Email change step 1: request ───────────────────────────
  const handleRequestEmailChange = async () => {
    if (!token || !newEmail || !emailPassword) return;
    setEmailLoading(true);
    setEmailError('');
    try {
      const res = await fetch(`${API}/auth/request-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setEmailStep('otp');
    } catch (err: any) {
      setEmailError(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  // ─── Email change step 2: verify OTP ───────────────────────
  const handleVerifyEmailChange = async () => {
    if (!token || !otpCode) return;
    setEmailLoading(true);
    setEmailError('');
    try {
      const res = await fetch(`${API}/auth/verify-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setProfile((prev) => prev ? { ...prev, email: data.user.email } : prev);
      setShowEmailModal(false);
      resetEmailModal();
      showToast('success', 'Email changed successfully!');
    } catch (err: any) {
      setEmailError(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const resetEmailModal = () => {
    setNewEmail('');
    setEmailPassword('');
    setOtpCode('');
    setEmailStep('form');
    setEmailError('');
  };

  // ─── Display name logic ─────────────────────────────────────
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || profile?.username || 'User';
  const locationString = [address, ward, district, province].filter(Boolean).join(', ');

  // ─── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
        <p className="text-gray-400 mt-4 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-8 sm:pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold animate-[slideIn_0.3s_ease] ${toast.type === 'success'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {toast.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-500" />
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 ml-8 sm:ml-9">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* ════ Left Column: Avatar & Basic Info ════ */}
        <ProfileHeader
          displayName={displayName}
          profile={profile}
          locationString={locationString}
          coverPreview={coverPreview}
          avatarPreview={avatarPreview}
          coverInputRef={coverInputRef}
          avatarInputRef={avatarInputRef}
          handleCoverChange={handleCoverChange}
          handleAvatarChange={handleAvatarChange}
        />

        {/* ════ Right Column: Edit Form ════ */}
        <div className="lg:col-span-2">
          {/* Email Section */}
          <EmailSection
            email={profile?.email}
            onOpenModal={() => { setShowEmailModal(true); resetEmailModal(); }}
          />

          {/* Personal Information */}
          <PersonalInfoForm
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName} setLastName={setLastName}
            province={province} setProvince={setProvince}
            district={district} setDistrict={setDistrict}
            address={address} setAddress={setAddress}
            provincesData={provincesData} districtsData={districtsData}
            handleSave={handleSave} isSaving={isSaving} fetchProfile={handleCancel}
            isEditing={isEditing} setIsEditing={setIsEditing} onEditClick={handleEditClick}
          />
        </div>
      </div>

      {/* ════ Email Change Modal ════ */}
      <ChangeEmailModal
        showEmailModal={showEmailModal}
        onClose={() => { setShowEmailModal(false); resetEmailModal(); }}
        emailStep={emailStep} setEmailStep={setEmailStep}
        emailError={emailError}
        newEmail={newEmail} setNewEmail={setNewEmail}
        emailPassword={emailPassword} setEmailPassword={setEmailPassword}
        otpCode={otpCode} setOtpCode={setOtpCode}
        emailLoading={emailLoading}
        handleRequestEmailChange={handleRequestEmailChange}
        handleVerifyEmailChange={handleVerifyEmailChange}
      />

      {/* ════ Image Crop Modal ════ */}
      {tempImageSrc && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false);
            setTempImageSrc(null);
          }}
          imageSrc={tempImageSrc}
          onSave={handleCropSave}
          isSaving={isSaving}
          aspectRatio={cropType === 'avatar' ? 1 : 16 / 5}
          circularCrop={cropType === 'avatar'}
        />
      )}

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
