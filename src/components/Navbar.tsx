import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GeorecruitLogo } from './GeorecruitLogo';

interface NavbarProps {
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  currentPath: string;
  onNavigate: (path: string, params?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDrawer,
  onOpenNotifications,
  currentPath,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, role, switchRole, logout, isAuthenticated, configStatus } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 w-full z-40 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-surface-container">
      <div className="h-16 px-space-md flex items-center justify-between relative max-w-7xl mx-auto">
        {/* Left Side: Drawer Toggle & Portal Jump */}
        <div className="flex items-center gap-space-sm z-10">
          <button
            aria-label="Open Menu"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            onClick={onOpenDrawer}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Quick Dashboard Badges when logged in */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => onNavigate(role === 'recruiter' ? 'recruiter-portal' : 'candidate-dashboard')}
                className="px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">
                  {role === 'recruiter' ? 'business_center' : 'school'}
                </span>
                <span>{role === 'recruiter' ? 'Recruiter Dashboard' : 'Candidate Dashboard'}</span>
              </button>
            </div>
          )}
        </div>

        {/* TOP MIDDLE: Official Website Logo & Wordmark "Georecruit" Centered exactly in the top middle! */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center cursor-pointer select-none">
          <GeorecruitLogo
            variant="horizontal"
            size="md"
            showTagline={false}
            onClick={() => onNavigate('landing-page')}
          />
        </div>

        {/* TOP RIGHT CORNER: Two Options "Login" (email & password) and "Sign In (New User)" (email + phone + OTP) */}
        <div className="flex items-center gap-space-xs z-10">
          {/* Notifications alert button */}
          <button
            aria-label="Notifications"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative cursor-pointer"
            onClick={onOpenNotifications}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-surface"></span>
          </button>

          {/* The required two options in the top right corner */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-title-md text-xs font-bold hover:bg-surface-container-high transition-all cursor-pointer border border-surface-container"
              type="button"
              title="Existing users: Login with Email & Password"
            >
              Login
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-title-md text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
              type="button"
              title="New users: Sign in with Email, Phone & OTP"
            >
              Sign In
            </button>
          </div>

          {/* User Account avatar / switcher if authenticated */}
          {isAuthenticated && (
            <div className="relative ml-1">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/40 cursor-pointer"
                type="button"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-container-lowest shadow-2xl border border-surface-container p-space-sm z-50 animate-in fade-in">
                    <div className="p-2 border-b border-surface-container">
                      <p className="font-title-md text-xs font-bold text-on-surface truncate">{user?.name}</p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm font-semibold text-[10px]">
                        {role === 'recruiter' ? 'Recruiter Dashboard' : 'Candidate Dashboard'}
                      </span>
                    </div>

                    <div className="space-y-1 py-1">
                      <button
                        onClick={() => {
                          switchRole('candidate');
                          setShowProfileMenu(false);
                          onNavigate('candidate-dashboard');
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                          role === 'candidate' ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container'
                        }`}
                      >
                        <span>Open Candidate Dashboard</span>
                        {role === 'candidate' && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </button>

                      <button
                        onClick={() => {
                          switchRole('recruiter');
                          setShowProfileMenu(false);
                          onNavigate('recruiter-portal');
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                          role === 'recruiter' ? 'bg-secondary text-on-secondary font-bold' : 'hover:bg-surface-container'
                        }`}
                      >
                        <span>Open Recruiter Dashboard</span>
                        {role === 'recruiter' && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </button>
                    </div>

                    <div className="border-t border-surface-container pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          onNavigate('landing-page');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-error hover:bg-error-container/20 rounded-lg font-semibold flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
