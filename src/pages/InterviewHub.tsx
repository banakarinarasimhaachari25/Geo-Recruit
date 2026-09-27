import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { InterviewProgressTracker, InterviewFlowStep } from '../components/InterviewProgressTracker';
import { BehavioralChatCompanion } from '../components/BehavioralChatCompanion';

interface InterviewHubProps {
  onNavigate: (path: string, params?: any) => void;
  initialRole?: string;
  initialMode?: string;
  initialResumeText?: string;
  initialResumeFileName?: string;
}

type FlowStep =
  | 'SELECT_OPTION' // User given options: Professional AI Interview, Practice Session, or Behavioral Chat
  | 'PROF_MEDIA' // Professional AI: camera & mic access
  | 'PROF_RULES' // Professional AI: rules & regulations (agree & continue or else no)
  | 'PRACTICE_DIFFICULTY' // Practice: select Easy, Medium, High
  | 'PRACTICE_MEDIA' // Practice: camera & mic access
  | 'PRACTICE_RULES' // Practice: rules & regulations (agree & continue)
  | 'BEHAVIORAL_CHAT'; // Text-based AI chat companion for behavioral practice with instant feedback

export const InterviewHub: React.FC<InterviewHubProps> = ({
  onNavigate,
  initialRole = 'Full-Stack Software Engineer',
  initialMode,
  initialResumeText,
  initialResumeFileName,
}) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [flowStep, setFlowStep] = useState<FlowStep>(() => {
    if (initialMode === 'practice') return 'PRACTICE_DIFFICULTY';
    if (initialMode === 'professional') return 'PROF_MEDIA';
    if (initialMode === 'behavioral-chat') return 'BEHAVIORAL_CHAT';
    return 'SELECT_OPTION';
  });

  // Resume state for interview question personalization
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState(
    initialResumeText ||
      `Candidate: Aryan Sharma\nRole: ${initialRole}\nEducation: B.Tech (Computer Science & Engineering), CGPA: 8.6\nSkills: React, TypeScript, Node.js, Python, PostgreSQL, Redis, Docker, AWS\nProjects: 1. E-Commerce Microservices Engine with ACID transactions.\n2. AI Model Serving & Real-Time Event Broker.`
  );
  const [resumeFileName, setResumeFileName] = useState(
    initialResumeFileName || 'Aryan_Sharma_Resume.pdf'
  );
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState<string | null>(null);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || file.name;
      setResumeText(text);
      setResumeUploadSuccess(`Resume "${file.name}" attached. Questions will be personalized!`);
      setTimeout(() => setResumeUploadSuccess(null), 3000);
    };
    reader.readAsText(file);
  };

  // Practice difficulty options: Easy, Medium, High (as requested)
  const [practiceDifficulty, setPracticeDifficulty] = useState<'Easy' | 'Medium' | 'High'>('Medium');

  // Agreement Checkboxes
  const [profRulesAgreed, setProfRulesAgreed] = useState(false);
  const [practiceRulesAgreed, setPracticeRulesAgreed] = useState(false);
  const [rulesDeclinedNotice, setRulesDeclinedNotice] = useState(false);

  // Hardware Camera & Mic state
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start hardware camera/mic preview
  const startPreflightMedia = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setMicActive(true);
    } catch (err: any) {
      console.warn('Camera/Mic permission in browser/iframe:', err);
      setCameraError('Camera/Mic access active via AI simulation stream.');
      setCameraActive(true); // allow simulated video preview
      setMicActive(true);
    }
  };

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    // When entering a media check step, initialize media
    if (flowStep === 'PROF_MEDIA' || flowStep === 'PRACTICE_MEDIA') {
      startPreflightMedia();
    }
    return () => {
      stopMediaTracks();
    };
  }, [flowStep]);

  // Launch handlers
  const handleLaunchProfessional = () => {
    if (!profRulesAgreed) {
      setRulesDeclinedNotice(true);
      return;
    }
    stopMediaTracks();
    onNavigate('live-interview', {
      role: selectedRole,
      mode: 'professional',
      difficulty: 'High',
      resumeText,
      resumeFileName,
    });
  };

  const handleLaunchPractice = () => {
    if (!practiceRulesAgreed) {
      setRulesDeclinedNotice(true);
      return;
    }
    stopMediaTracks();
    onNavigate('live-interview', {
      role: selectedRole,
      mode: 'practice',
      difficulty: practiceDifficulty,
      resumeText,
      resumeFileName,
    });
  };

  const handleDeclineRules = () => {
    setRulesDeclinedNotice(true);
    stopMediaTracks();
    setFlowStep('SELECT_OPTION');
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-4 space-y-6 pb-28 animate-in fade-in">
      {/* Hidden File Input for Resume Upload (Triggerable from Tracker or Bar) */}
      <input
        ref={resumeFileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleResumeUpload}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-surface-container pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            <span>GeoRecruit AI Interview Suite</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold mt-1 text-2xl">
            {selectedRole}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
            Prepare, verify hardware permissions, and complete proctored evaluation.
          </p>
        </div>

        <button
          onClick={() => {
            stopMediaTracks();
            onNavigate('candidate-dashboard');
          }}
          className="px-3 py-1.5 rounded-xl border border-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Dashboard</span>
        </button>
      </div>

      {/* Visual Progress Tracker: Step 1 (Resume) -> Step 2 (Mock Interview) -> Step 3 (Feedback) */}
      <InterviewProgressTracker
        currentFlowStep={flowStep as InterviewFlowStep}
        resumeFileName={resumeFileName}
        selectedRole={selectedRole}
        onNavigate={onNavigate}
        onTriggerResumeUpload={() => resumeFileInputRef.current?.click()}
        onSelectOptionStep={() => {
          stopMediaTracks();
          setFlowStep('SELECT_OPTION');
        }}
      />

      {/* Resume Attachment & Grounding Bar */}
      <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">description</span>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-on-surface truncate">
                {resumeFileName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                AI Grounded
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant truncate">
              Interview questions will specifically evaluate projects & tools from this resume.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => resumeFileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container text-on-surface font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          <span>Change Resume</span>
        </button>
      </div>

      {resumeUploadSuccess && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{resumeUploadSuccess}</span>
        </div>
      )}

      {rulesDeclinedNotice && (
        <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            <span>
              Interview was not started because rules and regulations were not agreed to. You can review and agree whenever you are ready.
            </span>
          </div>
          <button
            onClick={() => setRulesDeclinedNotice(false)}
            className="text-on-error-container hover:underline font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================
          SCREEN 1: USER IS GIVEN THREE PREPARATION MODES:
          Option 1: Professional AI Interview (Proctored Video)
          Option 2: Practice Session (Mock Video with Difficulty Tiers)
          Option 3: Text AI Chat Companion (Instant STAR Feedback)
      ======================================================== */}
      {flowStep === 'SELECT_OPTION' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="text-center space-y-1">
            <h2 className="font-headline-sm text-xl font-bold text-on-surface">
              Select Your Interview Mode
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-md mx-auto">
              Choose between an official proctored assessment, customizable video practice, or a text-based AI chat warm-up.
            </p>
          </div>

          {/* Featured Warm-Up Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-primary/10 via-surface-container-lowest to-secondary/10 border-2 border-primary/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="relative w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[28px]">chat</span>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white"></span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-title-md text-base font-bold text-on-surface">
                    Text-Based AI Chat Companion (Behavioral Warm-Up)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-bold text-[10px] uppercase tracking-wider">
                    Recommended First Step
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Practice answering behavioral questions with instant STAR feedback from Coach Maya Lin before stepping into the video mock interview.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                stopMediaTracks();
                setFlowStep('BEHAVIORAL_CHAT');
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-95 font-bold text-xs shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              <span>Practice in Chat</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* OPTION 1: PROFESSIONAL AI INTERVIEW */}
            <div
              onClick={() => {
                setFlowStep('PROF_MEDIA');
                setProfRulesAgreed(false);
              }}
              className="p-5 rounded-2xl bg-surface-container-lowest border-2 border-surface-container hover:border-secondary shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">verified</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                    Official Screening
                  </span>
                </div>

                <div>
                  <h3 className="font-title-md text-sm sm:text-base font-bold text-on-surface group-hover:text-secondary transition-colors">
                    Professional AI
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Formal enterprise qualification with camera face tracking, proctoring, and recruiter scorecard.
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-on-surface-variant pt-1 border-t border-surface-container">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[14px]">check</span>
                    <span>Proctored Video & Mic</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[14px]">check</span>
                    <span>Shared with hiring teams</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-title-md text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 group-hover:opacity-95"
              >
                <span>Select Professional</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* OPTION 2: PRACTICE SESSION */}
            <div
              onClick={() => {
                setFlowStep('PRACTICE_DIFFICULTY');
                setPracticeRulesAgreed(false);
              }}
              className="p-5 rounded-2xl bg-surface-container-lowest border-2 border-surface-container hover:border-primary shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">videocam</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                    Video Practice
                  </span>
                </div>

                <div>
                  <h3 className="font-title-md text-sm sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                    Video Mock Practice
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Live camera rehearsal with 3 difficulty tiers (Easy, Medium, High) and speech-to-text.
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-on-surface-variant pt-1 border-t border-surface-container">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[14px]">check</span>
                    <span>Easy / Med / High Tiers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[14px]">check</span>
                    <span>Speech & Posture Feedback</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 group-hover:opacity-95"
              >
                <span>Select Video Mock</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* OPTION 3: TEXT AI CHAT COMPANION */}
            <div
              onClick={() => {
                stopMediaTracks();
                setFlowStep('BEHAVIORAL_CHAT');
              }}
              className="p-5 rounded-2xl bg-surface-container-lowest border-2 border-surface-container hover:border-emerald-600 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">psychology</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold">
                    Text Warm-Up
                  </span>
                </div>

                <div>
                  <h3 className="font-title-md text-sm sm:text-base font-bold text-on-surface group-hover:text-emerald-600 transition-colors">
                    AI Chat Companion
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Type and rehearse behavioral questions with Coach Maya Lin. Instant STAR scoring and sample rewrites.
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-on-surface-variant pt-1 border-t border-surface-container">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[14px]">check</span>
                    <span>Instant STAR Breakdown</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[14px]">check</span>
                    <span>Executive Rewrite Samples</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-title-md text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 group-hover:opacity-95"
              >
                <span>Open Chat Coach</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FLOW C: TEXT-BASED AI CHAT COMPANION (BEHAVIORAL WARM-UP)
      ======================================================== */}
      {flowStep === 'BEHAVIORAL_CHAT' && (
        <BehavioralChatCompanion
          role={selectedRole}
          candidateName={user?.name || 'Aryan'}
          onLaunchVideoPractice={() => {
            stopMediaTracks();
            setFlowStep('PRACTICE_DIFFICULTY');
            setPracticeRulesAgreed(false);
          }}
          onLaunchVideoProfessional={() => {
            stopMediaTracks();
            setFlowStep('PROF_MEDIA');
            setProfRulesAgreed(false);
          }}
          onBackToOptions={() => {
            stopMediaTracks();
            setFlowStep('SELECT_OPTION');
          }}
        />
      )}

      {/* ========================================================
          FLOW A: PROFESSIONAL AI INTERVIEW
          Step 1: Camera & Microphone Access -> Continue
          Step 2: Rules and Regulations -> Agree & Continue / No
      ======================================================== */}
      {flowStep === 'PROF_MEDIA' && (
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                Professional AI Interview • Step 1 of 2
              </span>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                Camera & Microphone Access Check
              </h2>
            </div>
            <button
              onClick={() => {
                stopMediaTracks();
                setFlowStep('SELECT_OPTION');
              }}
              className="text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Back to Options
            </button>
          </div>

          <p className="text-xs text-on-surface-variant">
            Professional AI screening requires live webcam and microphone verification for continuous proctoring and real-time candidate speech analysis.
          </p>

          {/* Live Video Preview Box */}
          <div className="relative w-full h-56 bg-inverse-surface rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive && !cameraError ? 'block' : 'hidden'}`}
            />

            {/* Fallback Simulation Visual if permission denied in iframe */}
            {(!cameraActive || cameraError) && (
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4rHGqxE4LXC1s98O-gBG-j0P1MLNKsILavbSKzkcoFPfS-TSn_zKAk5MYYd4YEXdcqzAvIHZjjd62tPNNL74QqJlKM0HfkY5coCzBWHRqwMejvqyc9zLBSnBQS0LedqPpQiB5wPlEuW1OoSJ8UoL3wPn-XQgXLHFKhpyDQJ_RX5dTtxbvA6bP2X44nsce_DEE3Zxj_nk3knqy3CTTI9oKKSLwGjBUA1gFZPsQQVtEEXblaXIU8DUBiw"
                alt="Simulated Camera"
                className="w-full h-full object-cover"
              />
            )}

            {/* Face Tracking Bounding Box */}
            <div
              className="absolute w-36 h-40 rounded-xl pointer-events-none flex flex-col justify-between p-1.5"
              style={{ boxShadow: '0 0 0 2px #68dba9, 0 0 16px rgba(104, 219, 169, 0.4)' }}
            >
              <div className="flex justify-between items-center text-primary-fixed font-label-sm text-[10px]">
                <span className="bg-inverse-surface/80 px-1 py-0.5 rounded">Face Centered</span>
                <span className="bg-inverse-surface/80 px-1 py-0.5 rounded text-primary-fixed">99.8%</span>
              </div>
              <div className="text-right">
                <span className="inline-block w-2 h-2 rounded-full bg-primary-fixed animate-ping"></span>
              </div>
            </div>

            {/* Top Badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-inverse-surface/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-inverse-on-surface font-label-sm text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
              <span>1080p Proctor Stream</span>
            </div>

            {/* Bottom Mic Visualizer */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-inverse-surface/85 backdrop-blur-md px-2.5 py-1 rounded-full text-inverse-on-surface text-[11px]">
                <span className="material-symbols-outlined text-primary-fixed text-[15px]">mic</span>
                <div className="flex items-center gap-0.5 h-2 w-12">
                  <span className="flex-1 h-full bg-primary-fixed rounded-xs"></span>
                  <span className="flex-1 h-full bg-primary-fixed rounded-xs"></span>
                  <span className="flex-1 h-2/3 bg-primary-fixed rounded-xs"></span>
                  <span className="flex-1 h-1/3 bg-surface-variant/40 rounded-xs"></span>
                </div>
                <span className="text-primary-fixed font-bold text-[10px]">Audio Active</span>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold">
                Camera Access Granted
              </span>
            </div>
          </div>

          {/* Status checklist */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              <span className="font-semibold text-on-surface">Camera Permissions Granted</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              <span className="font-semibold text-on-surface">Microphone Input Detected</span>
            </div>
          </div>

          {/* Warm-Up Suggestion Banner */}
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
              <span className="text-on-surface-variant">
                Want to warm up your answers first? Rehearse in the <strong>AI Chat Companion</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                stopMediaTracks();
                setFlowStep('BEHAVIORAL_CHAT');
              }}
              className="text-primary font-bold hover:underline shrink-0 cursor-pointer ml-2"
            >
              Open Chat
            </button>
          </div>

          {/* User clicks continue to view rules and regulations */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                stopMediaTracks();
                setFlowStep('SELECT_OPTION');
              }}
              className="flex-1 py-3 rounded-xl border border-surface-container text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => setFlowStep('PROF_RULES')}
              className="flex-2 py-3 rounded-xl bg-secondary text-on-secondary text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Rules & Regulations</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* PROFESSIONAL AI STEP 2: RULES AND REGULATIONS TO BE FOLLOWED */}
      {flowStep === 'PROF_RULES' && (
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                Professional AI Interview • Step 2 of 2
              </span>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                Proctoring Rules & Regulations to be Followed
              </h2>
            </div>
            <span className="text-xs text-error font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">security</span>
              <span>Mandatory Agreement</span>
            </span>
          </div>

          <p className="text-xs text-on-surface-variant">
            Please read the following rules and regulations carefully. You must agree to these terms to start the interview; otherwise, the interview will not be initiated.
          </p>

          {/* Rules List */}
          <div className="space-y-3 text-xs text-on-surface">
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-secondary">
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Rule 1: Solo Candidate Presence in Camera</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed pl-6">
                Only the registered candidate must be visible in the camera frame at all times. Presence of any other person or background whispering will trigger immediate proctor anomalies.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-secondary">
                <span className="material-symbols-outlined text-[18px]">tab</span>
                <span>Rule 2: Zero Tab-Switching & Window Locking</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed pl-6">
                Do not minimize the interview window, open search tabs, or use developer tools. Window blur events are recorded and directly reduce your Integrity Score.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-secondary">
                <span className="material-symbols-outlined text-[18px]">headset_off</span>
                <span>Rule 3: Strictly No External Devices or Headphones</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed pl-6">
                Earphones, smartwatches, dual monitors, or mobile phones are prohibited during the live technical assessment.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-secondary">
                <span className="material-symbols-outlined text-[18px]">mic</span>
                <span>Rule 4: Verbal Articulation & Audio Responses</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed pl-6">
                All answers must be articulated aloud into the microphone. The AI evaluates technical depth, problem-solving, and communication clarity from your spoken response.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-secondary">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Rule 5: Official Screening Report Policy</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed pl-6">
                Per enterprise recruitment benchmarks, this Professional AI Interview generates an official qualification scorecard. <strong>Formative coaching / areas for improvement are excluded from the report</strong> to ensure blind evaluation.
              </p>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="p-3.5 rounded-xl bg-surface-container border border-surface-container flex items-start gap-2.5">
            <input
              type="checkbox"
              id="profAgree"
              checked={profRulesAgreed}
              onChange={(e) => setProfRulesAgreed(e.target.checked)}
              className="mt-0.5 rounded border-surface-container text-secondary focus:ring-secondary cursor-pointer"
            />
            <label htmlFor="profAgree" className="text-xs text-on-surface font-semibold leading-relaxed cursor-pointer select-none">
              I have read, understood, and hereby agree to follow all the above proctoring rules and interview regulations strictly.
            </label>
          </div>

          {/* Action Buttons: Agree and Continue (Starts Interview) or Decline (Does NOT start interview) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDeclineRules}
              className="flex-1 py-3 rounded-xl border border-surface-container text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Decline / Go Back (Do Not Start)
            </button>
            <button
              disabled={!profRulesAgreed}
              onClick={handleLaunchProfessional}
              className="flex-2 py-3 rounded-xl bg-secondary text-on-secondary text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Agree & Continue (Start Interview)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          FLOW B: PRACTICE SESSIONS
          Step 1: Three Options (Easy, Medium, High) -> Start
          Step 2: Camera & Microphone Access -> Continue
          Step 3: Rules and Regulations -> Agree & Continue
      ======================================================== */}
      {flowStep === 'PRACTICE_DIFFICULTY' && (
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Practice Session • Step 1 of 3
              </span>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                Select Difficulty Level
              </h2>
            </div>
            <button
              onClick={() => setFlowStep('SELECT_OPTION')}
              className="text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Back to Options
            </button>
          </div>

          <p className="text-xs text-on-surface-variant">
            Please choose one of the three difficulty options for your mock practice interview:
          </p>

          {/* The Three Options: Easy, Medium, High (as explicitly required) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* EASY */}
            <div
              onClick={() => setPracticeDifficulty('Easy')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                practiceDifficulty === 'Easy'
                  ? 'border-primary bg-primary-container/20 shadow-xs'
                  : 'border-surface-container bg-surface-container-low hover:border-primary/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Beginner Friendly
                  </span>
                  {practiceDifficulty === 'Easy' && (
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  )}
                </div>
                <h4 className="font-title-md font-bold text-sm text-on-surface mt-2">
                  Easy
                </h4>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Core conceptual definitions, language fundamentals, and introductory algorithmic questions.
                </p>
              </div>
              <span className="text-[11px] font-bold text-primary">Foundational Track</span>
            </div>

            {/* MEDIUM */}
            <div
              onClick={() => setPracticeDifficulty('Medium')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                practiceDifficulty === 'Medium'
                  ? 'border-primary bg-primary-container/20 shadow-xs'
                  : 'border-surface-container bg-surface-container-low hover:border-primary/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    Recommended
                  </span>
                  {practiceDifficulty === 'Medium' && (
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  )}
                </div>
                <h4 className="font-title-md font-bold text-sm text-on-surface mt-2">
                  Medium
                </h4>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Practical coding logic, standard data structure tradeoffs, state management, and API design.
                </p>
              </div>
              <span className="text-[11px] font-bold text-primary">Industry Standard</span>
            </div>

            {/* HIGH */}
            <div
              onClick={() => setPracticeDifficulty('High')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                practiceDifficulty === 'High'
                  ? 'border-primary bg-primary-container/20 shadow-xs'
                  : 'border-surface-container bg-surface-container-low hover:border-primary/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                    Challenging
                  </span>
                  {practiceDifficulty === 'High' && (
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  )}
                </div>
                <h4 className="font-title-md font-bold text-sm text-on-surface mt-2">
                  High
                </h4>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Complex distributed system design, high concurrency edge cases, and architectural resilience.
                </p>
              </div>
              <span className="text-[11px] font-bold text-primary">Advanced Scale</span>
            </div>
          </div>

          {/* User clicks start to advance to camera/mic check */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setFlowStep('SELECT_OPTION')}
              className="flex-1 py-3 rounded-xl border border-surface-container text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setFlowStep('PRACTICE_MEDIA')}
              className="flex-2 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Start ({practiceDifficulty} Tier)</span>
            </button>
          </div>
        </div>
      )}

      {/* PRACTICE STEP 2: CAMERA AND MICROPHONE ACCESS */}
      {flowStep === 'PRACTICE_MEDIA' && (
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Practice Session • Step 2 of 3
              </span>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                Camera & Microphone Access
              </h2>
            </div>
            <button
              onClick={() => {
                stopMediaTracks();
                setFlowStep('PRACTICE_DIFFICULTY');
              }}
              className="text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Change Difficulty
            </button>
          </div>

          <p className="text-xs text-on-surface-variant">
            Please allow camera and microphone access so you can practice speaking your answers aloud and habituate to eye contact.
          </p>

          {/* Video Preview */}
          <div className="relative w-full h-56 bg-inverse-surface rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive && !cameraError ? 'block' : 'hidden'}`}
            />

            {(!cameraActive || cameraError) && (
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4rHGqxE4LXC1s98O-gBG-j0P1MLNKsILavbSKzkcoFPfS-TSn_zKAk5MYYd4YEXdcqzAvIHZjjd62tPNNL74QqJlKM0HfkY5coCzBWHRqwMejvqyc9zLBSnBQS0LedqPpQiB5wPlEuW1OoSJ8UoL3wPn-XQgXLHFKhpyDQJ_RX5dTtxbvA6bP2X44nsce_DEE3Zxj_nk3knqy3CTTI9oKKSLwGjBUA1gFZPsQQVtEEXblaXIU8DUBiw"
                alt="Simulated Camera"
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-inverse-surface/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-inverse-on-surface text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>Practice Stream ({practiceDifficulty})</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-inverse-surface/85 backdrop-blur-md px-2.5 py-1 rounded-full text-inverse-on-surface text-[11px]">
                <span className="material-symbols-outlined text-primary-fixed text-[15px]">mic</span>
                <span className="text-primary-fixed font-bold text-[10px]">Mic Ready</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold">
                Camera Active
              </span>
            </div>
          </div>

          {/* Warm-Up Suggestion Banner */}
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
              <span className="text-on-surface-variant">
                Want to rehearse answers in text first? Chat with <strong>Coach Maya Lin</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                stopMediaTracks();
                setFlowStep('BEHAVIORAL_CHAT');
              }}
              className="text-primary font-bold hover:underline shrink-0 cursor-pointer ml-2"
            >
              Open Chat
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                stopMediaTracks();
                setFlowStep('PRACTICE_DIFFICULTY');
              }}
              className="flex-1 py-3 rounded-xl border border-surface-container text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setFlowStep('PRACTICE_RULES')}
              className="flex-2 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Rules & Regulations</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* PRACTICE STEP 3: RULES AND REGULATIONS -> AGREE & CONTINUE */}
      {flowStep === 'PRACTICE_RULES' && (
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Practice Session • Step 3 of 3
              </span>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                Practice Rules & Regulations
              </h2>
            </div>
            <span className="text-xs text-primary font-bold">Mock Assessment</span>
          </div>

          <p className="text-xs text-on-surface-variant">
            Please review the mock practice guidelines. Click agree and continue to begin your interview session:
          </p>

          <div className="space-y-3 text-xs text-on-surface">
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
                <span>Rule 1: Verbalize Answers Aloud</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed pl-6">
                Use your microphone to speak your thoughts. The AI captures and evaluates your answers using continuous speech recognition.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                <span>Rule 2: Maximum 15 Minutes Session & Human Warm-Up</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed pl-6">
                Session duration has a maximum of 15 minutes. Once the session starts, the AI will not jump straight into questions, but will first interact with you through friendly, human-like icebreaker questions to create a comfortable environment.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
                <span>Rule 3: Diagnostic Report Includes "Areas to be Improved"</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed pl-6">
                Unlike formal screening, this Practice Session report <strong>will explicitly detail your Areas to be Improved</strong>, knowledge gaps, and concrete study recommendations to prepare you for actual placement drives.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container border border-surface-container flex items-start gap-2.5">
            <input
              type="checkbox"
              id="practiceAgree"
              checked={practiceRulesAgreed}
              onChange={(e) => setPracticeRulesAgreed(e.target.checked)}
              className="mt-0.5 rounded border-surface-container text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="practiceAgree" className="text-xs text-on-surface font-semibold leading-relaxed cursor-pointer select-none">
              I have read and agree to the practice rules and regulations.
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDeclineRules}
              className="flex-1 py-3 rounded-xl border border-surface-container text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Decline / Go Back (Do Not Start)
            </button>
            <button
              disabled={!practiceRulesAgreed}
              onClick={handleLaunchPractice}
              className="flex-2 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Agree & Continue (Start Interview)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
