import React from 'react';

interface ProctorViolationModalProps {
  violationCount: number;
  warningMessage: string;
  violationType: string;
  absenceTimer: number; // 0..10 seconds
  onReturnToInterview: () => void | Promise<void>;
  onTerminate: (reason: string) => void;
  isFlagged?: boolean;
}

export const ProctorViolationModal: React.FC<ProctorViolationModalProps> = ({
  violationCount,
  warningMessage,
  violationType,
  absenceTimer,
  onReturnToInterview,
  onTerminate,
  isFlagged = false,
}) => {
  const secondsLeft = Math.max(0, 10 - absenceTimer);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
      onClick={(e) => e.stopPropagation()} // Prevent click-outside dismissal
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#083A4F] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            violationCount >= 3 || isFlagged ? 'bg-[#ba1a1a]' : 'bg-[#083A4F]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {violationCount >= 3 ? 'gavel' : 'warning'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A58D66]">
                Proctor Integrity Alert
              </span>
              <h2 className="text-base font-bold text-white">
                {violationCount === 1 && 'First Warning: Focus Required'}
                {violationCount === 2 && 'Second Warning: Critical Alert'}
                {violationCount >= 3 && 'Third Violation: Session Flagged'}
              </h2>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-white/20 text-white font-mono font-bold text-xs">
            {violationCount} of 3
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-[#083A4F]">
          {/* Main Warning Text */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E1DD] space-y-2">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#407E8C] text-[20px] mt-0.5 shrink-0">
                info
              </span>
              <div>
                <div className="font-bold text-sm text-[#083A4F]">{warningMessage}</div>
                <div className="text-xs text-[#4F5B62] mt-0.5">
                  Trigger Event: <strong className="text-[#083A4F]">{violationType}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Absence Timer Meter (10s Continuous Absence Limit) */}
          <div className="p-4 rounded-2xl bg-[#E5E1DD]/40 border border-[#E5E1DD] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#083A4F] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[16px] animate-spin">
                  timer
                </span>
                <span>Absence Window Auto-Termination</span>
              </span>
              <span className="font-mono font-bold text-[#ba1a1a]">
                {secondsLeft}s remaining
              </span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-yellow-500 to-[#ba1a1a] transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(absenceTimer / 10) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#4F5B62]">
              Candidates staying away for ≥10 continuous seconds are immediately terminated for extended absence.
            </p>
          </div>

          {/* Rules Reminder */}
          <div className="text-xs text-[#4F5B62] space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#407E8C] text-[14px]">check</span>
              <span>Keep your eyes centered on the camera feed.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#407E8C] text-[14px]">check</span>
              <span>Do not switch tabs, Alt+Tab, or click outside the interview window.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#407E8C] text-[14px]">check</span>
              <span>Fullscreen mode is enforced throughout the interview.</span>
            </div>
          </div>

          {/* Action Button (Strictly Non-Dismissible - Only "Return to Interview" button) */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={onReturnToInterview}
              className="w-full py-3.5 rounded-2xl bg-[#083A4F] hover:bg-[#114b64] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#407E8C]"
            >
              <span className="material-symbols-outlined text-[20px]">fullscreen</span>
              <span>Return to Interview (Resume Fullscreen)</span>
            </button>

            {violationCount >= 3 && (
              <button
                type="button"
                onClick={() => onTerminate('repeated violations')}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-[#ba1a1a] hover:bg-red-50 cursor-pointer transition-colors"
              >
                End Session & Submit Integrity Audit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
