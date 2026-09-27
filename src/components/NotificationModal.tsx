import React from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif_1',
      title: 'Google Campus Drive 2025',
      message: '2 new distributed systems questions and system architecture rounds added to syllabus.',
      time: '15 mins ago',
      category: 'Recruitment Alert',
      actionPath: 'interview-prep-hub',
      actionLabel: 'Practice Now',
      color: 'text-tertiary bg-tertiary-container text-on-tertiary-container',
    },
    {
      id: 'notif_2',
      title: 'College ID Verified',
      message: 'Your student credential was authenticated. You are now prioritized in Tier-1 campus drive listings.',
      time: '2 hours ago',
      category: 'Verification Status',
      actionPath: 'candidate-dashboard',
      actionLabel: 'View Badge',
      color: 'text-primary bg-primary-container text-on-primary-container',
    },
    {
      id: 'notif_3',
      title: 'ATS Resume Scored 82/100',
      message: 'Taleo & Greenhouse ingestion probability is 96.4%. Minor adjustments recommended in project bullets.',
      time: 'Yesterday',
      category: 'ATS Analyzer',
      actionPath: 'ats-resume-analyzer',
      actionLabel: 'View ATS',
      color: 'text-secondary bg-secondary-container text-on-secondary-container',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 bg-inverse-surface/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden mt-12">
        <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">notifications_active</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface text-base font-bold">
              Notifications & Alerts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="divide-y divide-surface-container max-h-[70vh] overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 hover:bg-surface-container-low transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-sm uppercase tracking-wider text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                  {n.category}
                </span>
                <span className="font-label-sm text-on-surface-variant text-xs">{n.time}</span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface text-sm font-bold">
                {n.title}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-1">
                {n.message}
              </p>
              <div className="mt-2.5 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate(n.actionPath);
                  }}
                  className="px-3 py-1 bg-surface-container text-primary hover:bg-primary hover:text-on-primary rounded-full font-label-md text-xs font-semibold transition-all"
                >
                  {n.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
