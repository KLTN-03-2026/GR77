'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserIcon,
  CameraIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/** ─── Types ───────────────────────────────────────────────── */
interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  location: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  role: string;
  createdAt: string;
}

const API = 'http://localhost:3001';

export default function MyProfilePage() {
  // ─── Profile state ──────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');

  // ─── Image state ────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setLocation(data.location || '');
      setAvatarPreview(data.avatarUrl || null);
      setCoverPreview(data.coverImageUrl || null);
    } catch {
      showToast('error', 'Không thể tải thông tin profile.');
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

  // ─── Image handlers ─────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
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
      let avatarUrl: string | undefined;
      let coverImageUrl: string | undefined;

      // Upload avatar if changed
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }
      // Upload cover if changed
      if (coverFile) {
        coverImageUrl = await uploadImage(coverFile);
      }

      const body: any = {
        firstName,
        lastName,
        location,
      };
      if (avatarUrl) body.avatarUrl = avatarUrl;
      if (coverImageUrl) body.coverImageUrl = coverImageUrl;

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
      setAvatarFile(null);
      setCoverFile(null);

      // Update localStorage so Header reflects changes immediately
      const fullName = [firstName, lastName].filter(Boolean).join(' ');
      if (fullName) localStorage.setItem('userName', fullName);
      if (data.user?.avatarUrl) localStorage.setItem('userAvatar', data.user.avatarUrl);
      // Trigger storage event for Header to pick up
      window.dispatchEvent(new Event('storage'));

      showToast('success', 'Profile đã được cập nhật thành công!');
    } catch (err: any) {
      showToast('error', err.message || 'Đã xảy ra lỗi khi lưu.');
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
      showToast('success', 'Email đã được thay đổi thành công!');
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

  // ─── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
        <p className="text-gray-400 mt-4 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserIcon className="w-7 h-7 text-cyan-500" />
          My Profile
        </h1>
        <p className="text-sm text-gray-400 mt-1 ml-9">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ════ Left Column: Avatar & Basic Info ════ */}
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
                {location && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 text-[#8ea1c1] shrink-0" />
                    <span className="truncate">{location}</span>
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

        {/* ════ Right Column: Edit Form ════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
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

              {/* Location */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none"
                  />
                </div>
              </div>

              {/* Save Actions */}
              <div className="pt-4 flex justify-end gap-4 border-t border-gray-50">
                <button
                  onClick={() => fetchProfile()}
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

          {/* Email Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-[#1d2951] mb-2">Email Address</h3>
            <p className="text-sm text-gray-400 mb-6">
              Changing your email requires password verification and a confirmation code sent to the new email.
            </p>

            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 rounded-xl">
                  <EnvelopeIcon className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{profile?.email}</p>
                  <p className="text-xs text-gray-400">Primary email address</p>
                </div>
              </div>
              <button
                onClick={() => { setShowEmailModal(true); resetEmailModal(); }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-cyan-600 bg-cyan-50 hover:bg-cyan-100 transition-colors"
              >
                Change Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════ Email Change Modal ════ */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[scaleIn_0.2s_ease]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {emailStep === 'form' ? 'Change Email Address' : 'Verify New Email'}
              </h3>
              <button
                onClick={() => { setShowEmailModal(false); resetEmailModal(); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {emailError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl px-4 py-3 flex items-center gap-2">
                  <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                  {emailError}
                </div>
              )}

              {emailStep === 'form' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">New Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="newemail@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none"
                    />
                  </div>
                  <button
                    onClick={handleRequestEmailChange}
                    disabled={emailLoading || !newEmail || !emailPassword}
                    className="w-full py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {emailLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Send Verification Code'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    A 6-digit verification code has been sent to <strong className="text-gray-800">{newEmail}</strong>.
                    Please enter it below.
                  </p>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-bold text-center text-2xl tracking-[0.5em] transition-all outline-none"
                    />
                  </div>
                  <button
                    onClick={handleVerifyEmailChange}
                    disabled={emailLoading || otpCode.length !== 6}
                    className="w-full py-3 rounded-2xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {emailLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Confirm Email Change'
                    )}
                  </button>
                  <button
                    onClick={() => setEmailStep('form')}
                    className="w-full text-center text-sm text-gray-400 hover:text-gray-600 font-medium"
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
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
