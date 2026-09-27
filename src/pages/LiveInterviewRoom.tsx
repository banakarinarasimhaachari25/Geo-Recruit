import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { QuestionItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useProctor } from '../context/ProctorContext';
import { PreInterviewGateScreen } from '../components/PreInterviewGateScreen';
import { ProctorViolationModal } from '../components/ProctorViolationModal';

interface LiveInterviewRoomProps {
  onNavigate: (path: string, params?: any) => void;
  role?: string;
  mode?: string;
  difficulty?: string;
  resumeText?: string;
  resumeFileName?: string;
}

const COMMON_TECH_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Java',
  'PostgreSQL',
  'MongoDB',
  'SQL',
  'Docker',
  'AWS',
  'Kubernetes',
  'C++',
  'Go',
  'FastAPI',
  'Spring Boot',
  'Next.js',
  'System Design',
  'DSA',
  'HTML/CSS',
  'Git',
  'Machine Learning',
  'Redis',
  'GraphQL',
];

export const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({
  onNavigate,
  role = 'Full-Stack Developer',
  mode = 'Interview',
  difficulty = 'Hard',
  resumeText,
  resumeFileName,
}) => {
  const { user, profile } = useAuth();
  const candidateName = profile?.name || user?.name || 'Aryan Sharma';
  const candidateFirstName = candidateName.split(' ')[0];

  const {
    interviewStatus,
    violations,
    violationCount,
    absenceTimer,
    popupActive,
    currentWarningMessage,
    lastViolationType,
    terminationReason: proctorTerminationReason,
    startInterview: proctorStartInterview,
    triggerViolation: proctorTriggerViolation,
    dismissPopupAndResumeFullscreen,
    terminateSession: proctorTerminateSession,
    resetProctorState,
  } = useProctor();

  // Stage management: Human-like Introduction & Skills Grounding -> Technical Questions
  const [interviewStage, setInterviewStage] = useState<'introduction' | 'questions'>('introduction');
  const [introLanguage, setIntroLanguage] = useState<'hi' | 'en' | 'hinglish'>('hi');
  const [introText, setIntroText] = useState('');
  const [detectedSkills, setDetectedSkills] = useState<string[]>(['React', 'Node.js', 'PostgreSQL']);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Session & Question state
  const [sessionId, setSessionId] = useState<string>('session_demo');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateAnswers, setCandidateAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Countdown Timers: Session duration maximum of 15 minutes (900s) + per-question countdown (165s)
  const TOTAL_SESSION_SECONDS = 15 * 60; // 900 seconds (15 minutes maximum)
  const QUESTION_TIME_SECONDS = 165; // 2 minutes 45 seconds per technical question
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState(TOTAL_SESSION_SECONDS);
  const [questionSecondsRemaining, setQuestionSecondsRemaining] = useState(QUESTION_TIME_SECONDS);
  const [isRecording, setIsRecording] = useState(true);

  // Integrity & Warnings
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState(
    'Maintain eye contact with camera and keep browser in fullscreen mode.'
  );
  const [showOnScreenAlert, setShowOnScreenAlert] = useState(false);
  const [onScreenAlertTitle, setOnScreenAlertTitle] = useState('PROCTOR ALERT');
  const [onScreenAlertReason, setOnScreenAlertReason] = useState('Attention Required');
  const alertDismissTimerRef = useRef<any>(null);

  // Multiple Faces Detection & Warning state
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const [isSimulatedMultiFaceActive, setIsSimulatedMultiFaceActive] = useState(false);

  // Media Controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isBigScreenCam, setIsBigScreenCam] = useState(false);

  const [terminatedReason, setTerminatedReason] = useState<string | null>(null);

  // Collapsible Rules Drawer
  const [rulesOpen, setRulesOpen] = useState(false);

  // AI Persona Speech
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);

  // Video & Web Speech Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const awayTimerRef = useRef<any>(null);

  // Parse skills from self-introduction text
  const extractSkillsFromText = (text: string) => {
    const matched: string[] = [];
    COMMON_TECH_SKILLS.forEach((skill) => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        matched.push(skill);
      }
    });
    return matched;
  };

  const handleIntroTextChange = (val: string) => {
    setIntroText(val);
    const extracted = extractSkillsFromText(val);
    if (extracted.length > 0) {
      setDetectedSkills((prev) => Array.from(new Set([...prev, ...extracted])));
    }
  };

  const toggleSkillTag = (skill: string) => {
    setDetectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Sound Warning Beeps
  const playWarningBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.15); // A4
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Trigger Proctor Violation
  const triggerViolation = (type: string) => {
    proctorTriggerViolation(type);
  };

  // Trigger Multiple Faces Warning
  const triggerMultipleFacesDetected = () => {
    setMultipleFacesDetected(true);
    triggerViolation('Multiple Faces Detected in Camera Frame');
  };

  const handleDismissMultipleFaces = () => {
    setMultipleFacesDetected(false);
    setIsSimulatedMultiFaceActive(false);
  };

  // Text-To-Speech for AI Interviewer Question
  const speakAIQuestion = (text: string, lang: 'hi' | 'en' = 'en') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }
      utterance.onstart = () => setIsSpeakingAI(true);
      utterance.onend = () => setIsSpeakingAI(false);
      utterance.onerror = () => setIsSpeakingAI(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Hardware Webcam
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Webcam hardware fallback to simulated stream:', err);
      }
    };
    startWebcam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Web Speech API for candidate speech transcription
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = introLanguage === 'hi' ? 'hi-IN' : 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
          }
          if (interimTranscript) {
            if (interviewStage === 'introduction') {
              setIntroText((prev) => (prev ? `${prev} ${interimTranscript}` : interimTranscript));
              const extracted = extractSkillsFromText(interimTranscript);
              if (extracted.length > 0) {
                setDetectedSkills((prev) => Array.from(new Set([...prev, ...extracted])));
              }
            } else {
              setCurrentAnswer((prev) => (prev ? `${prev} ${interimTranscript}` : interimTranscript));
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition status:', e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition initialization notice:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [interviewStage, introLanguage]);

  // Tab switch & Window Inactive monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab Switch / Window Inactive');
        awayTimerRef.current = setTimeout(() => {
          setTerminatedReason('Interview Terminated — Extended Absence (10+ seconds away)');
        }, 10000);
      } else {
        if (awayTimerRef.current) {
          clearTimeout(awayTimerRef.current);
          awayTimerRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (awayTimerRef.current) clearTimeout(awayTimerRef.current);
    };
  }, [warningCount, sessionId]);

  // Overall Session Countdown Timer (Ticks down from 15 minutes across entire session)
  useEffect(() => {
    const sessionInterval = setInterval(() => {
      setSessionSecondsRemaining((prev) => {
        if (prev <= 1) {
          finishAndEvaluate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(sessionInterval);
  }, []);

  // Per-Question Countdown Timer (Active during technical questions stage)
  useEffect(() => {
    if (interviewStage !== 'questions') return;
    const qInterval = setInterval(() => {
      setQuestionSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return QUESTION_TIME_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(qInterval);
  }, [interviewStage, currentQuestionIndex, questions]);

  const handleAddExtraTime = () => {
    setQuestionSecondsRemaining((prev) => Math.min(prev + 30, 300));
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Launch Technical Questions based on Mentioned Skills
  const handleStartTechnicalInterview = async () => {
    setIsTransitioning(true);
    setIsLoadingQuestions(true);

    const skillsToUse = detectedSkills.length > 0 ? detectedSkills : ['React', 'Node.js', 'PostgreSQL'];

    try {
      const res = await api.startInterview(
        role,
        mode,
        difficulty,
        5,
        resumeText,
        resumeFileName,
        skillsToUse
      );
      setSessionId(res.sessionId || 'session_live');
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
      }
    } catch {
      // Fallback questions populated
    } finally {
      setIsLoadingQuestions(false);
      setTimeout(() => {
        setIsTransitioning(false);
        setInterviewStage('questions');
        setCurrentAnswer('');
        sessionStartTimeRef.current = Date.now();
      }, 1200);
    }
  };

  const currentQ = questions[currentQuestionIndex] || {
    id: 'q1',
    category: detectedSkills[0] ? `Candidate Stated Skill • ${detectedSkills[0]}` : 'Core Architecture',
    difficulty: difficulty || 'Hard',
    prompt: `In your introduction, you highlighted experience with ${detectedSkills[0] || 'React & Node.js'}. Walk me through how you structure production systems, manage state, and optimize performance when building with this stack.`,
    keywords: [detectedSkills[0] || 'React', 'Architecture', 'State Management', 'Latency'],
    expectedPoints: ['Design structure', 'Trade-offs', 'Scalability considerations'],
  };

  const handleNextQuestion = () => {
    setCandidateAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: currentAnswer,
    }));

    if (currentQuestionIndex + 1 < (questions.length || 5)) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer('');
      setQuestionSecondsRemaining(QUESTION_TIME_SECONDS);
    } else {
      finishAndEvaluate();
    }
  };

  const finishAndEvaluate = async () => {
    try {
      const isPractice = (mode || '').toLowerCase().includes('practice');
      const cleanMode = isPractice ? 'practice' : 'professional';

      const updatedAnswers = {
        ...candidateAnswers,
        [currentQuestionIndex]: currentAnswer,
      };

      const qAnswers = (questions.length > 0 ? questions : [currentQ]).map((q, idx) => ({
        question: q.prompt,
        answer: (updatedAnswers[idx] || '').trim() || 'No answer recorded for this question.',
        category: q.category,
      }));

      const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 60000));

      const res = await api.evaluateInterview({
        sessionId,
        role,
        mode: cleanMode,
        candidateName,
        resumeText,
        resumeFileName,
        difficulty,
        questionsWithAnswers: qAnswers,
        integrityData: {
          violationCount,
          violations: violations.map((v) => `${v.type} (${v.timestamp})`),
          completedDurationMins: elapsedMinutes,
          isFlagged: interviewStatus === 'flagged',
        },
      });

      onNavigate('evaluation-report', { reportId: res.reportId, mode: cleanMode });
    } catch {
      const isPractice = (mode || '').toLowerCase().includes('practice');
      onNavigate('evaluation-report', { mode: isPractice ? 'practice' : 'professional' });
    }
  };

  const totalQuestions = questions.length || 5;
  const progressPercent = Math.min(100, Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100));

  // Hindi & English Intro Speech Prompts
  const INTRO_PROMPTS = {
    hi: {
      title: 'नमस्ते! अपने बारे में बताएं (Explain About Yourself)',
      subtitle: 'आपकी भाषा और बताए गए स्किल्स के आधार पर ही आगे का इंटरव्यू शुरू होगा।',
      aiGreeting: `नमस्ते ${candidateFirstName}! GeoRecruit AI इंटरव्यू में आपका हार्दिक स्वागत है। आज का इंटरव्यू बहुत ही सहज, दोस्ताना और आपकी स्किल्स पर आधारित रहेगा। कृपया अपने बारे में बताएं — आपकी पृष्ठभूमि क्या है और आप किन-किन स्किल्स, प्रोग्रामिंग लैंग्वेजेज या टूल्स (जैसे React, Node.js, Python, Java, SQL आदि) पर काम करते हैं?`,
      badge: '🇮🇳 हिंदी सेशन सक्रिय',
      cta: 'स्किल्स के आधार पर इंटरव्यू शुरू करें (Start Interview) 🚀',
    },
    en: {
      title: 'Namaste! Please Explain About Yourself & Your Skills',
      subtitle: 'The interview will personalize questions based on the skills you explain.',
      aiGreeting: `Namaste ${candidateFirstName}! Welcome to your ${role} interview. Before jumping into technical questions, let's have a comfortable warm-up. Please introduce yourself, your background, and mention the primary technical skills, frameworks, and tools you specialize in. We will tailor the questions from there!`,
      badge: '🇬🇧 English Active',
      cta: 'Start Interview Based on My Skills 🚀',
    },
    hinglish: {
      title: 'Namaste! Apne baare mein batayein (Explain About Yourself)',
      subtitle: 'Tension free warm-up: Technical questions will be based on your stated skills.',
      aiGreeting: `Namaste ${candidateFirstName}! Welcome to your ${role} interview. Tension bilkul mat lijiye, yeh bohot friendly aur human-like interview hoga. Pehle aap apne baare mein batayein — aapka background aur kin-kin skills ya tech stacks mein aap proficient hain? Uske baad hum aapki skills par interview start karenge!`,
      badge: '🌐 Hinglish Mode',
      cta: 'Start Interview Based on My Skills 🚀',
    },
  };

  const activeIntro = INTRO_PROMPTS[introLanguage];

  // STEP 1: PRE-INTERVIEW GATE SCREEN (Rendered before interview page renders)
  if (interviewStatus === 'ready') {
    return (
      <PreInterviewGateScreen
        candidateName={candidateName}
        role={role}
        mode={mode}
        difficulty={difficulty}
        onEnterFullscreenAndStart={async () => {
          await proctorStartInterview(sessionId);
        }}
        onCancel={() => {
          resetProctorState();
          onNavigate('candidate-dashboard');
        }}
      />
    );
  }

  // TERMINATED SCREEN (Due to extended absence >=10s or forced termination)
  if (interviewStatus === 'terminated') {
    return (
      <div className="min-h-screen w-full bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 border-red-500 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-[36px]">gavel</span>
          </div>
          <h2 className="text-xl font-bold text-[#083A4F]">
            Interview Session Terminated
          </h2>
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-800 text-xs font-semibold leading-relaxed border border-red-200">
            {proctorTerminationReason
              ? `Forced termination: ${proctorTerminationReason}`
              : 'The session was terminated by the proctor due to extended absence (10+ seconds away) or repeated violations.'}
          </div>
          <p className="text-xs text-[#4F5B62]">
            Total violations logged in real-time to the Hiring Manager Dossier: <strong>{violationCount}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              resetProctorState();
              onNavigate('candidate-dashboard');
            }}
            className="w-full py-3.5 rounded-2xl bg-[#083A4F] text-white font-bold text-xs shadow-md hover:bg-[#114b64] cursor-pointer transition-colors"
          >
            Return to Candidate Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-space-md py-space-sm pb-24 relative animate-in fade-in">
      {/* STEP 4: NON-DISMISSIBLE PROCTOR VIOLATION POPUP WITH ABSENCE TIMER */}
      {popupActive && (
        <ProctorViolationModal
          violationCount={violationCount}
          warningMessage={currentWarningMessage}
          violationType={lastViolationType}
          absenceTimer={absenceTimer}
          onReturnToInterview={dismissPopupAndResumeFullscreen}
          onTerminate={(reason) => proctorTerminateSession(reason)}
          isFlagged={interviewStatus === 'flagged'}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">videocam</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-base sm:text-lg font-extrabold text-on-surface">
                {interviewStage === 'introduction'
                  ? 'Step 1: Introduction & Skills Grounding'
                  : `Technical Interview: ${role}`}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {mode === 'practice' ? 'Practice Mock' : 'Official Proctored'}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Candidate: <strong>{candidateName}</strong> • {role} • {difficulty} Tier
            </p>
          </div>
        </div>

        {/* Right side: Session Countdown Timer & Language Selection */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Real-time Proctor Integrity Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-container text-xs font-bold">
            <span className={`material-symbols-outlined text-[16px] ${violationCount > 0 ? 'text-amber-600' : 'text-primary'}`}>
              security
            </span>
            <span className={violationCount >= 2 ? 'text-error' : 'text-on-surface'}>
              {violationCount}/3 Warnings
            </span>
            {interviewStatus === 'flagged' && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold uppercase animate-pulse">
                Flagged
              </span>
            )}
          </div>

          {/* 15-Minute Session Countdown Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-container shadow-2xs font-mono">
            <span
              className={`material-symbols-outlined text-[16px] ${
                sessionSecondsRemaining <= 180 ? 'text-error animate-pulse' : 'text-primary'
              }`}
            >
              timer
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-sans font-bold text-on-surface-variant uppercase tracking-wider">
                Session Clock
              </span>
              <span
                className={`text-xs font-bold ${
                  sessionSecondsRemaining <= 180 ? 'text-error' : 'text-on-surface'
                }`}
              >
                {formatTimer(sessionSecondsRemaining)} / 15:00
              </span>
            </div>
          </div>

          {/* Language Selection Tabs in the Beginning */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container">
            <button
              type="button"
              onClick={() => setIntroLanguage('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                introLanguage === 'hi'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>🇮🇳</span>
              <span>हिंदी</span>
            </button>
            <button
              type="button"
              onClick={() => setIntroLanguage('hinglish')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                introLanguage === 'hinglish'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>🌐</span>
              <span>Hinglish</span>
            </button>
            <button
              type="button"
              onClick={() => setIntroLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                introLanguage === 'en'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          STAGE 1: HUMAN-LIKE INTRODUCTION ("EXPLAIN ABOUT YOURSELF")
      ======================================================== */}
      {interviewStage === 'introduction' && (
        <div className="mt-4 space-y-4 animate-in fade-in">
          {/* AI Interviewer Persona Warm Greeting Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border-2 border-primary/30 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary-container shrink-0 border-2 border-primary">
                  <img
                    className="w-full h-full object-cover"
                    alt="Dr. Aris Thorne"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_ZuHgrTTKq_K3A5XQ56qp5hLNER8XoeUER29ak_iVuu_oXrx-l9SXbE7ZlJZlvvW9Ru5KfmfJ7IhH3F0AcC-3QbEMcQMDkCjbQ9n8yqwTZBEnv0BDslojuvw7wP3cQAojoFsJN-vvAMIMErTndH2h5XNZvvqr-ZWqBf67PIhGyBcPDembs-XV8IebBX_sSHrBfB2B-pLKM_Ha_2Nfy4Mi8_EQw1i-dxJB3UYIKGiVbkXG7BgPdEU2NA"
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary-fixed rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[10px]">
                      auto_awesome
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-title-md text-sm font-bold text-on-surface">
                      Dr. Aris Thorne (Lead AI Interviewer)
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                      {activeIntro.badge}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-base font-extrabold text-primary">
                    {activeIntro.title}
                  </h3>
                  <p className="text-xs text-on-surface leading-relaxed mt-1">
                    "{activeIntro.aiGreeting}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => speakAIQuestion(activeIntro.aiGreeting, introLanguage === 'hi' ? 'hi' : 'en')}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isSpeakingAI ? 'graphic_eq' : 'volume_up'}
                  </span>
                  <span>{isSpeakingAI ? 'Speaking...' : 'Listen / सुनें'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Candidate Live Video & Proctor Screen (Clean, NO options cluttering video) */}
          <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-surface-container flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />

            {/* Candidate Primary Face Tracking Box (Green) */}
            <div
              className="absolute w-44 h-56 md:w-52 md:h-64 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-xl"
              style={{ boxShadow: '0 0 0 2px #68dba9, 0 0 20px rgba(104, 219, 169, 0.45)' }}
            >
              <div className="flex justify-between items-center text-primary-fixed text-xs font-mono">
                <span className="bg-black/80 px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px]">
                  <span className="material-symbols-outlined text-[13px]">face</span>
                  <span>{candidateFirstName}</span>
                </span>
                <span className="bg-black/80 px-1.5 py-0.5 rounded text-[11px] font-bold">99.4%</span>
              </div>
              <div className="text-right">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-fixed animate-ping"></span>
              </div>
            </div>

            {/* SECONDARY FACE BOUNDING BOX (RED) — Shown when Multiple Faces Detected */}
            {multipleFacesDetected && (
              <div
                className="absolute right-4 top-16 w-36 h-44 sm:w-44 sm:h-52 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-2xl border-2 border-error animate-pulse bg-error/15 z-30"
                style={{ boxShadow: '0 0 0 2px #ef4444, 0 0 24px rgba(239, 68, 68, 0.6)' }}
              >
                <div className="flex justify-between items-center text-error font-mono text-[10px] bg-black/85 px-1.5 py-0.5 rounded">
                  <span className="flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[13px]">person_alert</span>
                    <span>Face #2 (Unauthorized)</span>
                  </span>
                  <span className="text-error font-extrabold">98.2%</span>
                </div>
                <div className="text-right">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                </div>
              </div>
            )}

            {/* ========================================================
                PROCTOR WARNING: MULTIPLE FACES DETECTED
            ======================================================== */}
            {multipleFacesDetected && (
              <div className="absolute top-14 inset-x-3 sm:inset-x-8 md:inset-x-12 z-50 p-3.5 sm:p-4 rounded-xl bg-error text-on-error border-2 border-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px] text-yellow-300">group_off</span>
                  </div>
                  <div>
                    <div className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                      <span>⚠️ PROCTOR WARNING: MULTIPLE FACES DETECTED</span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-error font-mono text-[10px] font-black">
                        2 FACES IN FRAME
                      </span>
                    </div>
                    <p className="text-xs text-white/95 mt-0.5 leading-snug">
                      Strict anti-cheating policy: Only <strong>{candidateName}</strong> is permitted in the camera view. Another individual was detected. Please ensure all other persons leave the room immediately.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDismissMultipleFaces}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-error font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  I Am Alone Now / Clear
                </button>
              </div>
            )}

            {/* Video Header: Clean REC, Session Timer & Proctor Status */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-inverse-on-surface text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
                <span>REC 1080p Live</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-300 font-mono font-bold text-xs border border-amber-300/30">
                <span className="material-symbols-outlined text-[13px]">timer</span>
                <span>Session: {formatTimer(sessionSecondsRemaining)}</span>
              </span>

              {warningCount === 0 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-primary font-bold text-xs border border-primary/30">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  <span>Proctor: Clean</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-error text-on-error font-bold text-xs animate-pulse">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>Warning {warningCount}/3</span>
                </span>
              )}
            </div>

            {/* Video Bottom: Clean Mic Status ONLY (No extraneous buttons) */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-inverse-on-surface text-xs pointer-events-auto">
                <span className="material-symbols-outlined text-primary text-[16px]">mic</span>
                <span className="text-[11px] font-semibold text-primary">Microphone Active</span>
              </div>
              <span className="text-[11px] text-white/70 bg-black/80 px-2.5 py-1 rounded-full">
                Face Centered
              </span>
            </div>
          </div>

          {/* Candidate Introduction & Mentioned Skills Input Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">record_voice_over</span>
                <span>Your Introduction & Key Skills</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                Speech-to-Text Active
              </span>
            </div>

            <textarea
              value={introText}
              onChange={(e) => handleIntroTextChange(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder={
                introLanguage === 'hi'
                  ? 'बोलें या लिखें: "नमस्ते, मेरा नाम आर्यन है। मैं React, Node.js, Python और PostgreSQL में अनुभवी हूँ। मैंने हाल ही में..."'
                  : 'Speak or type: "Hello, I am Aryan. I have hands-on experience in React, Node.js, TypeScript, and PostgreSQL. I recently built..."'
              }
            />

            {/* Identified Skills grounded from Candidate's introduction */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary text-[16px]">psychology</span>
                  <span>Skills Detected for Your Technical Round:</span>
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {detectedSkills.length} skills selected
                </span>
              </div>

              {/* Detected Skills Pill Rack */}
              <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 rounded-xl bg-surface-container-low border border-surface-container">
                {detectedSkills.length === 0 ? (
                  <span className="text-xs text-on-surface-variant italic">
                    Mention your skills above or click any tag below to select...
                  </span>
                ) : (
                  detectedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-xs"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => toggleSkillTag(sk)}
                        className="hover:text-error cursor-pointer text-xs ml-0.5"
                        title="Remove skill"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Suggested Quick-Add Tags */}
              <div className="pt-1">
                <span className="text-[11px] text-on-surface-variant block mb-1">
                  Quick add skills:
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {COMMON_TECH_SKILLS.slice(0, 14).map((sk) => {
                    const isSelected = detectedSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkillTag(sk)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-secondary text-on-secondary shadow-xs'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {isSelected ? `✓ ${sk}` : `+ ${sk}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Launch CTA Button */}
            <div className="pt-3">
              <button
                type="button"
                disabled={isTransitioning}
                onClick={handleStartTechnicalInterview}
                className="w-full py-3.5 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary font-title-md text-sm font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTransitioning ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    <span>
                      {introLanguage === 'hi'
                        ? 'स्किल्स के आधार पर प्रश्न तैयार किए जा रहे हैं...'
                        : 'Personalizing interview questions for your skills...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{activeIntro.cta}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 2: TECHNICAL QUESTIONS (BASED ON MENTIONED SKILLS)
      ======================================================== */}
      {interviewStage === 'questions' && (
        <div className="mt-3 space-y-4 animate-in fade-in">
          {/* ========================================================
              DEDICATED COUNTDOWN TIMER & TIME MANAGEMENT WIDGET
          ======================================================== */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Question Countdown Digital Display */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-xs transition-colors shrink-0 ${
                    questionSecondsRemaining <= 30
                      ? 'bg-error animate-pulse'
                      : questionSecondsRemaining <= 60
                      ? 'bg-amber-500'
                      : 'bg-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[26px]">timer</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-2xl font-black font-mono tracking-tight text-on-surface">
                      {formatTimer(questionSecondsRemaining)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        questionSecondsRemaining <= 30
                          ? 'bg-error-container text-on-error-container animate-pulse'
                          : questionSecondsRemaining <= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {questionSecondsRemaining <= 30
                        ? '⏳ Wrap Up Now'
                        : questionSecondsRemaining <= 60
                        ? '1 Min Remaining'
                        : 'Speaking Window'}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                    {questionSecondsRemaining <= 30
                      ? 'Approaching time limit: summarize your final points and outcomes.'
                      : 'Pacing guide: 2m 45s allocated to structure and verbalize your response.'}
                  </p>
                </div>
              </div>

              {/* Session Time & Quick Actions */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex flex-col items-end mr-1 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Total Session
                  </span>
                  <span className="font-mono text-xs font-extrabold text-on-surface">
                    {formatTimer(sessionSecondsRemaining)} / 15:00
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddExtraTime}
                  className="px-2.5 py-1.5 rounded-xl border border-surface-container hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Add 30 seconds to formulate your answer"
                >
                  <span className="material-symbols-outlined text-[14px]">more_time</span>
                  <span>+30s</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:opacity-95 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <span>{currentQuestionIndex + 1 === totalQuestions ? 'Finish' : 'Next Question'}</span>
                  <span className="material-symbols-outlined text-[14px]">skip_next</span>
                </button>
              </div>
            </div>

            {/* Linear Countdown Progress Bar for this Question */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-medium">
                <span>
                  Question {currentQuestionIndex + 1} of {totalQuestions} • {currentQ.category}
                </span>
                <span className="font-mono font-semibold">
                  {Math.round((questionSecondsRemaining / QUESTION_TIME_SECONDS) * 100)}% time left
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    questionSecondsRemaining <= 30
                      ? 'bg-error'
                      : questionSecondsRemaining <= 60
                      ? 'bg-amber-500'
                      : 'bg-primary'
                  }`}
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (questionSecondsRemaining / QUESTION_TIME_SECONDS) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Current Question Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container/70 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">code_blocks</span>
                <span>{currentQ.category}</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-[11px]">
                  Difficulty: {currentQ.difficulty || difficulty}
                </span>
                <button
                  type="button"
                  onClick={() => speakAIQuestion(currentQ.prompt)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded-full transition-colors cursor-pointer text-xs font-semibold text-primary"
                >
                  <span className="material-symbols-outlined text-[15px]">volume_up</span>
                  <span>Listen</span>
                </button>
              </div>
            </div>

            <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface pt-1 leading-snug">
              {currentQ.prompt}
            </h3>

            {/* Skills & Keyword tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {(currentQ.keywords || ['Architecture', 'Implementation']).map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-0.5 rounded-lg bg-surface-container text-on-surface-variant text-[11px] font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Clean Candidate Camera Video Screen (NO options or buttons cluttering the video) */}
          <div className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-surface-container flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoPaused ? 'opacity-20' : 'opacity-100'}`}
            />
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />

            {/* Candidate Primary Face Tracking Box (Green) */}
            <div
              className="absolute w-44 h-56 md:w-52 md:h-64 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-xl"
              style={{ boxShadow: '0 0 0 2px #68dba9, 0 0 20px rgba(104, 219, 169, 0.45)' }}
            >
              <div className="flex justify-between items-center text-primary-fixed text-xs font-mono">
                <span className="bg-black/80 px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px]">
                  <span className="material-symbols-outlined text-[13px]">face</span>
                  <span>{candidateFirstName}</span>
                </span>
                <span className="bg-black/80 px-1.5 py-0.5 rounded text-[11px] font-bold">99.4%</span>
              </div>
              <div className="text-right">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-fixed animate-ping"></span>
              </div>
            </div>

            {/* SECONDARY FACE BOUNDING BOX (RED) — Shown when Multiple Faces Detected */}
            {multipleFacesDetected && (
              <div
                className="absolute right-4 top-16 w-36 h-44 sm:w-44 sm:h-52 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-2xl border-2 border-error animate-pulse bg-error/15 z-30"
                style={{ boxShadow: '0 0 0 2px #ef4444, 0 0 24px rgba(239, 68, 68, 0.6)' }}
              >
                <div className="flex justify-between items-center text-error font-mono text-[10px] bg-black/85 px-1.5 py-0.5 rounded">
                  <span className="flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[13px]">person_alert</span>
                    <span>Face #2 (Unauthorized)</span>
                  </span>
                  <span className="text-error font-extrabold">98.2%</span>
                </div>
                <div className="text-right">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                </div>
              </div>
            )}

            {/* ========================================================
                PROCTOR WARNING: MULTIPLE FACES DETECTED ON SCREEN
            ======================================================== */}
            {multipleFacesDetected && (
              <div className="absolute top-14 inset-x-3 sm:inset-x-8 md:inset-x-12 z-50 p-3.5 sm:p-4 rounded-xl bg-error text-on-error border-2 border-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px] text-yellow-300">group_off</span>
                  </div>
                  <div>
                    <div className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                      <span>⚠️ PROCTOR WARNING: MULTIPLE FACES DETECTED</span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-error font-mono text-[10px] font-black">
                        2 FACES IN FRAME
                      </span>
                    </div>
                    <p className="text-xs text-white/95 mt-0.5 leading-snug">
                      Strict anti-cheating policy: Only <strong>{candidateName}</strong> is permitted in the camera view. Another individual was detected. Please ensure all other persons leave the room immediately.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDismissMultipleFaces}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-error font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  I Am Alone Now / Clear
                </button>
              </div>
            )}

            {/* General On-Screen Proctor Alert */}
            {showOnScreenAlert && !multipleFacesDetected && (
              <div className="absolute top-14 inset-x-4 md:inset-x-12 z-40 animate-in fade-in">
                <div className="bg-inverse-surface/95 border-2 border-error text-inverse-on-surface rounded-xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-error text-[24px]">warning</span>
                    <div>
                      <span className="font-bold text-xs text-error block uppercase">{onScreenAlertTitle}</span>
                      <p className="text-xs text-inverse-on-surface/90">{warningMessage}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOnScreenAlert(false)}
                    className="px-3 py-1 bg-error text-on-error font-bold text-xs rounded-lg shadow cursor-pointer shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Video Header: Clean REC, Question Countdown Timer & Proctor Status */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-inverse-on-surface text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
                <span>REC 1080p</span>
              </span>

              {/* In-Video Question Countdown Timer */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md font-mono font-bold text-xs border ${
                  questionSecondsRemaining <= 30
                    ? 'text-error border-error animate-pulse'
                    : 'text-amber-300 border-amber-300/30'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">timer</span>
                <span>{formatTimer(questionSecondsRemaining)} left</span>
              </span>

              {warningCount === 0 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-primary font-bold text-xs border border-primary/30">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  <span>Proctor: Clean</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-error text-on-error font-bold text-xs animate-pulse">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>Warning {warningCount}/3</span>
                </span>
              )}
            </div>

            {/* Video Bottom: Clean Mic Status ONLY (No extraneous buttons) */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-inverse-on-surface text-xs pointer-events-auto">
                <span className="material-symbols-outlined text-primary text-[16px]">mic</span>
                <span className="text-[11px] font-semibold text-primary">Microphone Active</span>
              </div>
              <span className="text-[11px] text-white/70 bg-black/80 px-2.5 py-1 rounded-full">
                Face Centered
              </span>
            </div>
          </div>

          {/* Live Candidate Answer Transcript Box */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">graphic_eq</span>
                <span>Live Answer Transcript</span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Speech recognition or typing
              </span>
            </div>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container text-on-surface text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Your spoken words are being transcribed in real-time. You can also edit or type your architectural response here..."
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={finishAndEvaluate}
              className="px-4 py-2.5 rounded-xl border border-error/40 text-error hover:bg-error-container text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>End & Submit</span>
            </button>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="flex-1 max-w-xs py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentQuestionIndex + 1 === totalQuestions ? 'Finish & View Evaluation' : 'Next Question'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Integrity Rules Drawer & Proctor Diagnostics */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setRulesOpen(!rulesOpen)}
          className="w-full py-2.5 px-4 bg-surface-container-low hover:bg-surface-container rounded-xl flex items-center justify-between text-xs text-on-surface cursor-pointer border border-surface-container transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[18px]">security</span>
            <span className="font-bold">Proctoring Rules & Diagnostics</span>
          </div>
          <span className="material-symbols-outlined text-[18px]">
            {rulesOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {rulesOpen && (
          <div className="mt-2 p-4 rounded-xl bg-surface-container-lowest border border-surface-container space-y-3 text-xs animate-in fade-in">
            <div className="space-y-1.5 text-on-surface-variant">
              <p>• <strong>Zero-Cheating Camera Rule:</strong> Only the single registered candidate must be visible in the camera frame.</p>
              <p>• <strong>Multiple Faces Detection:</strong> Presence of any secondary person immediately triggers an on-screen alert and proctor integrity penalty.</p>
              <p>• <strong>Window Locking:</strong> Navigating away from this tab will trigger an anomaly flag.</p>
            </div>

            {/* Discreet Proctoring Diagnostics Test Trigger */}
            <div className="pt-2 border-t border-surface-container flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-on-surface-variant">
                Test proctor alerts:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerMultipleFacesDetected}
                  className="px-2.5 py-1 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/30 text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">group_off</span>
                  <span>Simulate 2nd Person Detected</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerViolation('Gaze Displaced from Center')}
                  className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-bold cursor-pointer"
                >
                  Simulate Gaze Flag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
