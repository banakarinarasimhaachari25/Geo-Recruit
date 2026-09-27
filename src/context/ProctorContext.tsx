import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

export type InterviewStatus = 'ready' | 'in_progress' | 'flagged' | 'terminated';

export interface ViolationRecord {
  id: string;
  type: string;
  timestamp: string;
  count: number;
}

export interface ProctorContextType {
  interviewStatus: InterviewStatus;
  violations: ViolationRecord[];
  violationCount: number;
  isFullscreen: boolean;
  absenceTimer: number; // 0..10 seconds
  popupActive: boolean;
  currentWarningMessage: string;
  lastViolationType: string;
  terminationReason: string | null;
  sessionId: string;
  setSessionId: (id: string) => void;
  startInterview: (sessionId?: string) => Promise<boolean>;
  triggerViolation: (type: string) => void;
  dismissPopupAndResumeFullscreen: () => Promise<void>;
  terminateSession: (reason: string) => void;
  continueFlaggedSession: () => Promise<void>;
  resetProctorState: () => void;
}

const ProctorContext = createContext<ProctorContextType | undefined>(undefined);

export const ProctorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>('ready');
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [violationCount, setViolationCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [absenceTimer, setAbsenceTimer] = useState<number>(0);
  const [popupActive, setPopupActive] = useState<boolean>(false);
  const [lastViolationType, setLastViolationType] = useState<string>('');
  const [currentWarningMessage, setCurrentWarningMessage] = useState<string>(
    'Please stay focused on the interview.'
  );
  const [terminationReason, setTerminationReason] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(`session_${Date.now()}`);

  const absenceIntervalRef = useRef<any>(null);
  const absenceSecondsRef = useRef<number>(0);

  // Check fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const playWarningBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15); // A4
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const terminateSession = useCallback(
    (reason: string) => {
      if (absenceIntervalRef.current) {
        clearInterval(absenceIntervalRef.current);
        absenceIntervalRef.current = null;
      }
      setInterviewStatus('terminated');
      setTerminationReason(reason);
      setPopupActive(false);

      // Real-time backend sync
      api.sendViolation(sessionId, `Forced Termination: ${reason}`, violationCount + 1);
    },
    [sessionId, violationCount]
  );

  // Start absence timer when candidate is away
  const startAbsenceTimer = useCallback(() => {
    if (absenceIntervalRef.current) return;
    absenceSecondsRef.current = 0;
    setAbsenceTimer(0);

    absenceIntervalRef.current = setInterval(() => {
      absenceSecondsRef.current += 1;
      setAbsenceTimer(absenceSecondsRef.current);

      // If continuous absence >= 10s -> terminate
      if (absenceSecondsRef.current >= 10) {
        clearInterval(absenceIntervalRef.current);
        absenceIntervalRef.current = null;
        terminateSession('extended absence (10+ seconds away)');
      }
    }, 1000);
  }, [terminateSession]);

  const clearAbsenceTimer = useCallback(() => {
    if (absenceIntervalRef.current) {
      clearInterval(absenceIntervalRef.current);
      absenceIntervalRef.current = null;
    }
    absenceSecondsRef.current = 0;
    setAbsenceTimer(0);
  }, []);

  const triggerViolation = useCallback(
    (type: string) => {
      // Only process violations when an interview is actively running
      if (interviewStatus === 'ready' || interviewStatus === 'terminated') return;

      const newCount = violationCount + 1;
      setViolationCount(newCount);
      setLastViolationType(type);

      const record: ViolationRecord = {
        id: `viol_${Date.now()}`,
        type,
        timestamp: new Date().toLocaleTimeString(),
        count: newCount,
      };
      setViolations((prev) => [...prev, record]);

      // Real-time backend logging
      api.sendViolation(sessionId, type, newCount);
      playWarningBeep();

      // Start the 10-second absence timer
      startAbsenceTimer();

      // Show non-dismissible popup with escalating warning message
      setPopupActive(true);

      if (newCount === 1) {
        setCurrentWarningMessage('Please stay focused on the interview.');
      } else if (newCount === 2) {
        setCurrentWarningMessage('This is your second warning. Please remain in the interview window.');
      } else {
        // 3rd occurrence
        setCurrentWarningMessage(
          '3rd Violation Detected: Repeated violations flagged. Enterprise proctor integrity penalized.'
        );
        setInterviewStatus('flagged');
      }
    },
    [interviewStatus, violationCount, sessionId, startAbsenceTimer]
  );

  // Event Listeners (mounted when interview is in progress or flagged)
  useEffect(() => {
    if (interviewStatus !== 'in_progress' && interviewStatus !== 'flagged') {
      return;
    }

    // 1. visibilitychange -> tab switched / minimized
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab switched or browser minimized');
      } else {
        // Returned within 10s: popup is already active with "Return to Interview" button
      }
    };

    // 2. blur on window -> alt-tabbed or clicked outside browser
    const handleWindowBlur = () => {
      triggerViolation('Window blur / clicked outside interview browser');
    };

    // 3. fullscreenchange -> exited fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerViolation('Exited fullscreen mode');
      }
    };

    // 4. beforeunload -> attempted to close / refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      triggerViolation('Attempted to refresh or close interview tab');
      e.preventDefault();
      e.returnValue = 'An active interview is in progress. Leaving will penalize your integrity rating.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [interviewStatus, triggerViolation]);

  // Start interview and request fullscreen in the user gesture
  const startInterview = async (customSessionId?: string): Promise<boolean> => {
    if (customSessionId) {
      setSessionId(customSessionId);
    }
    setInterviewStatus('in_progress');
    setViolationCount(0);
    setViolations([]);
    setPopupActive(false);
    clearAbsenceTimer();

    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch (err) {
      console.warn('Fullscreen gesture notification:', err);
      return false;
    }
  };

  // Candidate returns within 10 seconds and clicks "Return to Interview"
  const dismissPopupAndResumeFullscreen = async () => {
    clearAbsenceTimer();
    setPopupActive(false);

    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn('Re-trigger fullscreen:', err);
    }
  };

  const continueFlaggedSession = async () => {
    clearAbsenceTimer();
    setPopupActive(false);
    setInterviewStatus('flagged');

    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch {}
  };

  const resetProctorState = () => {
    clearAbsenceTimer();
    setInterviewStatus('ready');
    setViolationCount(0);
    setViolations([]);
    setPopupActive(false);
    setTerminationReason(null);
  };

  return (
    <ProctorContext.Provider
      value={{
        interviewStatus,
        violations,
        violationCount,
        isFullscreen,
        absenceTimer,
        popupActive,
        currentWarningMessage,
        lastViolationType,
        terminationReason,
        sessionId,
        setSessionId,
        startInterview,
        triggerViolation,
        dismissPopupAndResumeFullscreen,
        terminateSession,
        continueFlaggedSession,
        resetProctorState,
      }}
    >
      {children}
    </ProctorContext.Provider>
  );
};

export const useProctor = (): ProctorContextType => {
  const context = useContext(ProctorContext);
  if (!context) {
    throw new Error('useProctor must be used within a ProctorProvider');
  }
  return context;
};
