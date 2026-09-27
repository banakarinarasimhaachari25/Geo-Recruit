import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GeorecruitLogo } from './GeorecruitLogo';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
}) => {
  const { user, role, switchRole } = useAuth();

  const candidateItems = [
    { path: 'candidate-dashboard', label: 'Candidate Dashboard', icon: 'grid_view' },
    { path: 'persona-selection', label: 'Role Track (Student / Employee)', icon: 'switch_account' },
    { path: 'student-onboarding', label: 'Student Onboarding & College ID', icon: 'school' },
    { path: 'employee-onboarding', label: 'Employee Onboarding & Experience', icon: 'business_center' },
    { path: 'ats-resume-analyzer', label: 'ATS Resume Analyzer', icon: 'document_scanner' },
    { path: 'interview-prep-hub', label: 'AI Interview Prep Hub', icon: 'mic' },
    { path: 'live-interview', label: 'Live Mock Interview Room', icon: 'videocam' },
    { path: 'evaluation-report', label: 'AI Evaluation Report', icon: 'analytics' },
    { path: 'previous-reports', label: 'Previous Reports & History', icon: 'history' },
    { path: 'college-id-verify', label: 'College ID Verification', icon: 'badge' },
  ];

  const recruiterItems = [
    { path: 'recruiter-portal', label: 'Recruiter Dashboard', icon: 'business_center' },
    { path: 'news', label: 'Campus Drives & Openings', icon: 'campaign' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-surface-container-lowest shadow-2xl flex flex-col transition-transform duration-300 ease-in-out pt-safe pb-safe ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 px-space-md flex items-center justify-between bg-surface-container-low border-b border-surface-container">
          <GeorecruitLogo
            variant="horizontal"
            size="sm"
            showTagline={false}
            onClick={() => {
              onNavigate('landing-page');
              onClose();
            }}
          />
          <button
            aria-label="Close Drawer"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-space-md py-space-sm space-y-4">
          {/* Public Home */}
          <div>
            <button
              className={`w-full flex items-center gap-space-md px-space-md py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                currentPath === 'landing-page'
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
              onClick={() => {
                onNavigate('landing-page');
                onClose();
              }}
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              <span className="font-title-md text-sm">GeoRecruit Home</span>
            </button>
          </div>

          {/* Candidate Dashboard Suite */}
          <div className="space-y-1">
            <div className="px-space-sm py-1 font-label-sm text-[11px] text-primary uppercase tracking-wider font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">school</span>
              <span>Candidate Dashboard</span>
            </div>
            {candidateItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  className={`w-full flex items-center gap-space-md px-space-md py-2 rounded-xl transition-all cursor-pointer text-left text-xs ${
                    isActive
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                  onClick={() => {
                    switchRole('candidate');
                    onNavigate(item.path);
                    onClose();
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="font-title-md text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Recruiter Dashboard Suite */}
          <div className="space-y-1 pt-1 border-t border-surface-container">
            <div className="px-space-sm py-1 font-label-sm text-[11px] text-secondary uppercase tracking-wider font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">business_center</span>
              <span>Recruiter Dashboard</span>
            </div>
            {recruiterItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  className={`w-full flex items-center gap-space-md px-space-md py-2 rounded-xl transition-all cursor-pointer text-left text-xs ${
                    isActive
                      ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                  onClick={() => {
                    switchRole('recruiter');
                    onNavigate(item.path);
                    onClose();
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="font-title-md text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings */}
          <div className="pt-1 border-t border-surface-container">
            <button
              className={`w-full flex items-center gap-space-md px-space-md py-2 rounded-xl transition-all cursor-pointer text-left text-xs ${
                currentPath === 'profile'
                  ? 'bg-surface-container text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
              onClick={() => {
                onNavigate('profile');
                onClose();
              }}
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              <span className="font-title-md text-xs">Profile & Settings</span>
            </button>
          </div>
        </div>

        {/* User Footer Summary */}
        <div className="p-space-md bg-surface-container-low border-t border-surface-container">
          <div
            className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-colors cursor-pointer"
            onClick={() => {
              onNavigate('profile');
              onClose();
            }}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-title-md text-on-surface truncate text-xs font-bold">
                {user?.name || 'Aryan Sharma'}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate text-[11px]">
                {role === 'recruiter' ? 'Enterprise Recruiter' : 'Candidate Pro'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
