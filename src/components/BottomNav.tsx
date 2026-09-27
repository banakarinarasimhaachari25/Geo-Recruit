import React from 'react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPath, onNavigate }) => {
  const { role } = useAuth();
  const isRecruiterPath = currentPath === 'recruiter-portal';

  const candidateTabs = [
    { path: 'candidate-dashboard', label: 'Home', icon: 'home' },
    { path: 'ats-resume-analyzer', label: 'ATS', icon: 'description' },
    { path: 'interview-prep-hub', label: 'Interview', icon: 'smart_toy' },
    { path: 'evaluation-report', label: 'Report', icon: 'bar_chart' },
    { path: 'previous-reports', label: 'History', icon: 'history' },
  ];

  const recruiterTabs = [
    { path: 'recruiter-portal', label: 'Pipeline', icon: 'business_center' },
    { path: 'news', label: 'Drives', icon: 'campaign' },
    { path: 'evaluation-report', label: 'Audit Report', icon: 'analytics' },
    { path: 'candidate-dashboard', label: 'Candidate Mode', icon: 'school' },
  ];

  const tabs = isRecruiterPath || role === 'recruiter' ? recruiterTabs : candidateTabs;

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-surface-container">
      <div className="flex justify-around items-center h-16 px-space-xs max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;

          return (
            <button
              key={tab.path}
              className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors cursor-pointer ${
                isActive
                  ? isRecruiterPath ? 'text-secondary font-bold' : 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => onNavigate(tab.path)}
              type="button"
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
              <span className="font-label-sm text-label-sm mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
