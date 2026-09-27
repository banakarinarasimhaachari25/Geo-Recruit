import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ProfilePageProps {
  onNavigate: (path: string, params?: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { profile, user, role, updateProfileState, switchRole } = useAuth();
  const [name, setName] = useState(profile?.name || user?.name || 'Aryan Sharma');
  const [email, setEmail] = useState(profile?.email || user?.email || 'aryan.sharma@example.edu');
  const [phone, setPhone] = useState(profile?.phone || '+91 98765 43210');
  const [college, setCollege] = useState(profile?.college || 'National Institute of Technology');
  const [studentId, setStudentId] = useState(profile?.studentId || '2021CS0492');
  const [degree, setDegree] = useState(profile?.degree || 'B.Tech CS');
  const [batch, setBatch] = useState(profile?.batch || 'Batch of 2025');
  const [specialization, setSpecialization] = useState(profile?.specialization || 'B.Tech / CSE');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates = {
        name,
        email,
        phone,
        college,
        studentId,
        degree,
        batch,
        specialization,
      };
      await api.updateProfile(updates);
      updateProfileState(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      //
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-high text-primary font-label-md text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">account_circle</span>
          <span>Account Settings</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-1">
          Profile Management
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-0.5">
          Keep your candidate credentials, verified college ID, and target specialization synced.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-primary-container text-on-primary-container rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Profile changes saved securely to database!</span>
        </div>
      )}

      {/* Avatar Card */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container flex items-center gap-4">
        <div className="relative">
          <img
            src={
              profile?.avatarUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3OHx5h2WOBwJprjrL1w6Y5T-o34kBz9F05CggmEMNA9t8QsKbq1DovNQ-cZp4FBByS_mSYcRvqC12RS6NwolL5c7_xyhbdiaaTcp4DJ1jVfZ4iB3xO2o-pINyox8OVnp6odyRkrwOQsHSV8dKR-83OzdSsNhZHKlq9iZ0pKbtYyg-8UgKxt2gmHXdPg8evK6Xc-KE24h8NSEl-0nWoDFq34zN6Ek0VzgOJys_K7uwvGxisQCitopqw'
            }
            alt="Profile Avatar"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/40 shadow-sm"
          />
          {profile?.verifiedCollegeId && (
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">
              <span className="material-symbols-outlined text-[10px]">check</span>
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-headline-sm text-on-surface text-base font-bold truncate">{name}</h3>
          <p className="font-body-sm text-on-surface-variant text-xs truncate">
            {role === 'recruiter' ? 'Corporate Recruiter' : `${degree} · ${college}`}
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
            {profile?.verifiedCollegeId ? 'Institutional Verified' : 'Standard Account'}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Student / Roll ID
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
            College / Institution
          </label>
          <input
            type="text"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Degree & Major
            </label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Graduation Batch
            </label>
            <input
              type="text"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
            Tracked Specialization
          </label>
          <input
            type="text"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
          />
        </div>

        <div className="pt-2 flex justify-between items-center">
          <button
            type="button"
            onClick={() => onNavigate('college-id-verify')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>Re-verify College ID</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">save</span>
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
