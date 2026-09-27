import React, { useState } from 'react';

export type InterviewFlowStep =
  | 'SELECT_OPTION'
  | 'PROF_MEDIA'
  | 'PROF_RULES'
  | 'PRACTICE_DIFFICULTY'
  | 'PRACTICE_MEDIA'
  | 'PRACTICE_RULES';

interface InterviewProgressTrackerProps {
  currentFlowStep: InterviewFlowStep;
  resumeFileName: string;
  selectedRole: string;
  onNavigate: (path: string, params?: any) => void;
  onTriggerResumeUpload?: () => void;
  onSelectOptionStep?: () => void;
}

export const InterviewProgressTracker: React.FC<InterviewProgressTrackerProps> = ({
  currentFlowStep,
  resumeFileName,
  selectedRole,
  onNavigate,
  onTriggerResumeUpload,
  onSelectOptionStep,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMetricsPreview, setShowMetricsPreview] = useState(false);

  // Compute sub-step info for Step 2
  const isProfessional = currentFlowStep === 'PROF_MEDIA' || currentFlowStep === 'PROF_RULES';
  const isPractice =
    currentFlowStep === 'PRACTICE_DIFFICULTY' ||
    currentFlowStep === 'PRACTICE_MEDIA' ||
    currentFlowStep === 'PRACTICE_RULES';

  let currentSubStepLabel = 'Select Interview Mode';
  let overallPercent = 45;

  if (currentFlowStep === 'SELECT_OPTION') {
    currentSubStepLabel = 'Select Mode (Professional or Practice)';
    overallPercent = 40;
  } else if (currentFlowStep === 'PRACTICE_DIFFICULTY') {
    currentSubStepLabel = 'Select Difficulty (Easy, Med, High)';
    overallPercent = 50;
  } else if (currentFlowStep === 'PROF_MEDIA' || currentFlowStep === 'PRACTICE_MEDIA') {
    currentSubStepLabel = 'Camera & Microphone Preflight';
    overallPercent = 60;
  } else if (currentFlowStep === 'PROF_RULES' || currentFlowStep === 'PRACTICE_RULES') {
    currentSubStepLabel = 'Rules & Integrity Agreement';
    overallPercent = 75;
  }

  return (
    <div className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      {/* Tracker Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container/60 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">
            <span className="material-symbols-outlined text-[16px]">timeline</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-title-md text-sm font-bold text-on-surface">
                Candidate Preparation Journey
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                Step 2 of 3 Active
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Progress through Resume Grounding, Mock Interview, and AI Feedback.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Learn how this journey works"
          >
            <span className="material-symbols-outlined text-[14px]">info</span>
            <span>{showInfoModal ? 'Hide Journey Info' : 'How Journey Works'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar with Percentage */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-on-surface-variant flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Current: <strong>{currentSubStepLabel}</strong></span>
          </span>
          <span className="font-extrabold text-primary">{overallPercent}% Complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-primary-container transition-all duration-500 rounded-full"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Expanded Journey Explanation Box */}
      {showInfoModal && (
        <div className="mt-3 p-3.5 rounded-xl bg-primary-fixed/20 border border-primary-fixed text-xs text-on-surface space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-primary">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>Preparation Journey Pipeline Guide</span>
            </span>
            <button
              onClick={() => setShowInfoModal(false)}
              className="text-on-surface-variant hover:text-on-surface cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            GeoRecruit’s 3-step pipeline aligns your actual experience with live recruiter benchmarks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
            <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-surface-container">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                Step 1: Resume
              </span>
              <span>Your projects, tech stack, and experience are parsed so the AI asks realistic, grounded questions.</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-surface-container">
              <span className="font-bold text-primary block mb-0.5">
                Step 2: Mock Interview
              </span>
              <span>Practice speaking aloud or complete formal proctoring with speech-to-text and posture tracking.</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-surface-container">
              <span className="font-bold text-secondary block mb-0.5">
                Step 3: AI Feedback
              </span>
              <span>Receive question-by-question scoring, integrity telemetry, and practice improvement roadmaps.</span>
            </div>
          </div>
        </div>
      )}

      {/* 3 Main Interactive Journey Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {/* STEP 1: RESUME GROUNDING (COMPLETED) */}
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 relative flex flex-col justify-between group transition-all hover:border-emerald-500/60">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                  ✓
                </span>
                <span>Step 1: Resume</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                <span>Ready</span>
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span>Resume Grounding</span>
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                Questions will be tailored to projects & skills from your uploaded resume.
              </p>
            </div>

            {/* Resume File Chip */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-lowest border border-surface-container text-[11px]">
              <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0">
                description
              </span>
              <span className="truncate font-semibold text-on-surface flex-1" title={resumeFileName}>
                {resumeFileName}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-emerald-500/20 text-[11px]">
            <button
              type="button"
              onClick={() => onNavigate('ats-resume-analyzer')}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>ATS Score</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </button>
            {onTriggerResumeUpload && (
              <button
                type="button"
                onClick={onTriggerResumeUpload}
                className="text-on-surface-variant hover:text-on-surface font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
                <span>Change</span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 2: MOCK INTERVIEW (IN PROGRESS) */}
        <div className="p-3.5 rounded-xl border-2 border-primary bg-primary/5 shadow-xs relative flex flex-col justify-between transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px] animate-pulse">
                  2
                </span>
                <span>Step 2: Mock Interview</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                <span>In Progress</span>
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-on-surface">
                {isProfessional
                  ? 'Professional AI Interview'
                  : isPractice
                  ? 'Practice Session'
                  : 'Mode & Hardware Setup'}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                {currentFlowStep === 'SELECT_OPTION' && 'Choose official qualification or mock practice.'}
                {currentFlowStep === 'PRACTICE_DIFFICULTY' && 'Select difficulty level: Easy, Medium, or High.'}
                {(currentFlowStep === 'PROF_MEDIA' || currentFlowStep === 'PRACTICE_MEDIA') &&
                  'Verify webcam and microphone hardware permissions.'}
                {(currentFlowStep === 'PROF_RULES' || currentFlowStep === 'PRACTICE_RULES') &&
                  'Review and accept proctoring code of conduct.'}
              </p>
            </div>

            {/* Sub-steps Indicator Pills */}
            <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
              <div
                className={`px-1.5 py-1 rounded text-center font-bold truncate ${
                  currentFlowStep === 'SELECT_OPTION'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                1. Mode
              </div>
              <div
                className={`px-1.5 py-1 rounded text-center font-bold truncate ${
                  currentFlowStep === 'PROF_MEDIA' || currentFlowStep === 'PRACTICE_MEDIA'
                    ? 'bg-primary text-on-primary'
                    : currentFlowStep === 'SELECT_OPTION'
                    ? 'bg-surface-container/60 text-on-surface-variant'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                2. Media
              </div>
              <div
                className={`px-1.5 py-1 rounded text-center font-bold truncate ${
                  currentFlowStep === 'PROF_RULES' || currentFlowStep === 'PRACTICE_RULES'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container/60 text-on-surface-variant'
                }`}
              >
                3. Rules
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-primary/20 text-[11px]">
            <span className="text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">videocam</span>
              <span className="truncate">{selectedRole}</span>
            </span>
            {currentFlowStep !== 'SELECT_OPTION' && onSelectOptionStep && (
              <button
                type="button"
                onClick={onSelectOptionStep}
                className="text-on-surface-variant hover:text-on-surface underline font-semibold cursor-pointer shrink-0"
              >
                Change Mode
              </button>
            )}
          </div>
        </div>

        {/* STEP 3: FEEDBACK & REPORT (UPCOMING) */}
        <div className="p-3.5 rounded-xl border border-dashed border-surface-container bg-surface-container-low/40 relative flex flex-col justify-between group transition-all hover:border-secondary/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-[11px]">
                  3
                </span>
                <span>Step 3: Feedback</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
                Upcoming
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span>AI Evaluation & Feedback</span>
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                Immediate scorecard, proctor integrity telemetry, and growth diagnostics.
              </p>
            </div>

            {/* Feedback Feature Highlights */}
            <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-surface-container space-y-1 text-[10px] text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>• Technical Depth Score</span>
                <span className="font-semibold text-secondary">0 - 100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Integrity & Focus Trust</span>
                <span className="font-semibold text-secondary">Proctored</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Areas for Improvement</span>
                <span className="font-semibold text-emerald-600">Practice Track</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-surface-container text-[11px]">
            <button
              type="button"
              onClick={() => onNavigate('previous-reports')}
              className="text-secondary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Past Reports</span>
              <span className="material-symbols-outlined text-[13px]">history</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMetricsPreview(!showMetricsPreview)}
              className="text-on-surface-variant hover:text-on-surface font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">insights</span>
              <span>Preview Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Preview Drawer */}
      {showMetricsPreview && (
        <div className="mt-3 p-3.5 rounded-xl bg-secondary-fixed/20 border border-secondary-fixed text-xs text-on-surface space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              <span>What will be evaluated in your Step 3 Feedback Report?</span>
            </span>
            <button
              onClick={() => setShowMetricsPreview(false)}
              className="text-on-surface-variant hover:text-on-surface cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] pt-1">
            <div className="p-2 rounded-lg bg-surface-container-lowest border border-surface-container">
              <span className="font-bold text-on-surface block mb-0.5">1. Domain Accuracy</span>
              <span className="text-on-surface-variant">Core algorithms, language mechanics, and system design clarity.</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-lowest border border-surface-container">
              <span className="font-bold text-on-surface block mb-0.5">2. Articulation</span>
              <span className="text-on-surface-variant">STAR method structure, pacing, speech tone, and concise explanations.</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-lowest border border-surface-container">
              <span className="font-bold text-on-surface block mb-0.5">3. Proctor Integrity</span>
              <span className="text-on-surface-variant">Face presence, gaze direction, audio consistency, and tab focus.</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-lowest border border-surface-container">
              <span className="font-bold text-on-surface block mb-0.5">4. Growth Plan</span>
              <span className="text-on-surface-variant">Detailed study recommendations & sample answers (Practice track).</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
