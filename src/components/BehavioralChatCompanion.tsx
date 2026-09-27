import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

export interface BehavioralQuestionItem {
  id: string;
  category: string;
  competency: string;
  prompt: string;
  recruiterGoal: string;
  starTip: string;
}

export const CURATED_BEHAVIORAL_QUESTIONS: BehavioralQuestionItem[] = [
  {
    id: 'beh_conflict',
    category: 'Teamwork & Conflict',
    competency: 'Collaboration',
    prompt:
      'Tell me about a time you had a strong technical disagreement with a teammate or lead. How did you handle the friction and reach alignment?',
    recruiterGoal:
      'Evaluates emotional intelligence, constructive communication, and whether you put project success above ego.',
    starTip:
      'Situation: The disputed feature • Task: Why alignment was crucial • Action: The objective data/decision matrix you used • Result: The consensus reached & team cohesion maintained.',
  },
  {
    id: 'beh_deadline',
    category: 'High Pressure & Deadlines',
    competency: 'Prioritization & Execution',
    prompt:
      'Describe a situation where a critical production bug or strict release deadline jeopardized delivery. How did you prioritize your effort?',
    recruiterGoal:
      'Evaluates composure under stress, triage prioritization, and proactive stakeholder communication.',
    starTip:
      'Situation: The outage or deadline crunch • Task: What had to ship vs what could wait • Action: The triage steps and mitigations you spearheaded • Result: Uptime preserved, release shipped, and post-mortem safeguards created.',
  },
  {
    id: 'beh_failure',
    category: 'Failure & Resilience',
    competency: 'Growth Mindset',
    prompt:
      'Tell me about a project that did not go according to plan or a mistake you personally made. What did you learn, and what did you change moving forward?',
    recruiterGoal:
      'Tests accountability (no finger-pointing), humility, and systematic prevention of repeat failures.',
    starTip:
      'Situation: The context • Task: The mistake or unexpected blocker • Action: How you took immediate personal ownership to remediate • Result: What safeguards or automated tests you put in place.',
  },
  {
    id: 'beh_initiative',
    category: 'Leadership & Initiative',
    competency: 'Proactive Ownership',
    prompt:
      'Describe a project where you took initiative beyond your formal job scope to eliminate an unaddressed engineering bottleneck.',
    recruiterGoal:
      'Looks for self-starters who see broken processes and fix them without being told.',
    starTip:
      'Situation: The hidden inefficiency • Task: Why you decided to tackle it • Action: The prototype or workflow you built • Result: Hours saved or latency slashed across the team.',
  },
  {
    id: 'beh_adaptability',
    category: 'Fast Learning & Adaptability',
    competency: 'Continuous Learning',
    prompt:
      'Tell me about a time you had to rapidly ramp up on an unfamiliar technology stack, language, or system architecture under pressure.',
    recruiterGoal:
      'Evaluates learning agility, research velocity, and adaptability in fast-moving engineering teams.',
    starTip:
      'Situation: The new tech requirement • Task: The delivery expectation • Action: How you broke down documentation and built spike prototypes • Result: Shipped on time with maintainable patterns.',
  },
];

interface ChatMessage {
  id: string;
  sender: 'coach' | 'candidate';
  text: string;
  timestamp: string;
  feedback?: {
    score: number;
    overallRating: 'Strong' | 'Good' | 'Needs Work';
    starBreakdown: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
    strengths: string[];
    areasToImprove: string[];
    polishedSample: string;
    followUpQuestion: string;
    coachMessage: string;
  };
}

interface BehavioralChatCompanionProps {
  role?: string;
  candidateName?: string;
  onLaunchVideoPractice: () => void;
  onLaunchVideoProfessional: () => void;
  onBackToOptions: () => void;
}

export const BehavioralChatCompanion: React.FC<BehavioralChatCompanionProps> = ({
  role = 'Full-Stack Software Engineer',
  candidateName = 'Aryan',
  onLaunchVideoPractice,
  onLaunchVideoProfessional,
  onBackToOptions,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<BehavioralQuestionItem>(
    CURATED_BEHAVIORAL_QUESTIONS[0]
  );
  const [isCustomQuestion, setIsCustomQuestion] = useState(false);
  const [customQuestionInput, setCustomQuestionInput] = useState('');
  const [candidateInput, setCandidateInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStarGuide, setShowStarGuide] = useState(true);
  const [activeStarTab, setActiveStarTab] = useState<'s' | 't' | 'a' | 'r'>('a');

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome_1',
      sender: 'coach',
      text: `Hello ${candidateName}! I'm Coach Maya Lin, your AI Behavioral & Leadership Interview Companion.

Behavioral questions decide whether hiring managers trust you with high-stakes responsibility. Here, you can type your answers, receive instant STAR-method evaluation, and polish your stories before stepping into the live video camera interview.

Let's start with this classic question:
"${CURATED_BEHAVIORAL_QUESTIONS[0].prompt}"`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  // Handle changing to another question
  const handleSelectQuestion = (q: BehavioralQuestionItem) => {
    setSelectedQuestion(q);
    setIsCustomQuestion(false);
    setCandidateInput('');
    const newCoachMsg: ChatMessage = {
      id: `msg_coach_${Date.now()}`,
      sender: 'coach',
      text: `New Practice Prompt (${q.category}):
"${q.prompt}"

💡 What recruiters are listening for:
${q.recruiterGoal}`,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, newCoachMsg]);
  };

  const handleApplyCustomQuestion = () => {
    if (!customQuestionInput.trim()) return;
    const customQ: BehavioralQuestionItem = {
      id: `custom_${Date.now()}`,
      category: 'Custom Question',
      competency: 'Targeted Practice',
      prompt: customQuestionInput.trim(),
      recruiterGoal: 'Assessing your communication structure, authenticity, and metric-driven results.',
      starTip: 'Structure your story with Situation, Task, Action, and Result.',
    };
    setSelectedQuestion(customQ);
    setIsCustomQuestion(false);
    setCandidateInput('');
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_coach_${Date.now()}`,
        sender: 'coach',
        text: `Custom Prompt Activated:
"${customQ.prompt}"

Take a moment to formulate your thoughts. Focus on specific technical decisions you personally made.`,
        timestamp: 'Just now',
      },
    ]);
  };

  // Insert STAR template helper into input
  const handleInsertStarTemplate = () => {
    const template = `Situation: When working on [Project / Company], we encountered [Context / Challenge].
Task: My specific responsibility was to [Goal / Deliverable].
Action: I personally took the lead by [Technical decision / Step 1], [Step 2], and [Step 3].
Result: As a direct result, we achieved [Quantified metric e.g. % faster / zero downtime], and learned [Key engineering takeaway].`;
    setCandidateInput((prev) => (prev ? `${prev}\n\n${template}` : template));
    textareaRef.current?.focus();
  };

  // Submit candidate answer for instant AI feedback
  const handleSubmitAnswer = async () => {
    const trimmed = candidateInput.trim();
    if (!trimmed || isSubmitting) return;

    const candidateMsg: ChatMessage = {
      id: `cand_${Date.now()}`,
      sender: 'candidate',
      text: trimmed,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, candidateMsg]);
    setCandidateInput('');
    setIsSubmitting(true);

    try {
      const feedback = await api.getBehavioralFeedback({
        question: selectedQuestion.prompt,
        answer: trimmed,
        role,
      });

      const coachFeedbackMsg: ChatMessage = {
        id: `coach_fb_${Date.now()}`,
        sender: 'coach',
        text: feedback.coachMessage,
        timestamp: 'Just now',
        feedback,
      };

      setMessages((prev) => [...prev, coachFeedbackMsg]);
    } catch (err) {
      console.error('Failed to get behavioral feedback:', err);
      // Fallback response if network glitches
      setMessages((prev) => [
        ...prev,
        {
          id: `coach_fallback_${Date.now()}`,
          sender: 'coach',
          text: `Good rehearsal! Your story has strong momentum. Remember to clearly highlight what YOU individually decided and end with a quantified metric before your live video session.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = candidateInput.trim() ? candidateInput.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / 130) * 60);

  return (
    <div className="flex flex-col w-full rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm overflow-hidden animate-in fade-in">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-surface-container-low border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-primary-container shrink-0 border-2 border-primary">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
              alt="Coach Maya Lin"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-400"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-title-md text-base font-bold text-on-surface">
                Coach Maya Lin (AI Behavioral Companion)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                Instant STAR Feedback
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Target Role: <strong>{role}</strong> • Practice answers before live camera evaluation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onBackToOptions}
            className="px-3 py-1.5 rounded-xl border border-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container cursor-pointer transition-colors"
          >
            Switch Mode
          </button>
          <button
            type="button"
            onClick={onLaunchVideoPractice}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-95 cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>Proceed to Video Interview</span>
            <span className="material-symbols-outlined text-[16px]">videocam</span>
          </button>
        </div>
      </div>

      {/* Behavioral Question Carousel / Selector */}
      <div className="p-3.5 bg-surface-container/60 border-b border-surface-container space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">psychology</span>
            <span>Select Practice Question:</span>
          </span>
          <button
            type="button"
            onClick={() => setIsCustomQuestion((prev) => !prev)}
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">edit_note</span>
            <span>{isCustomQuestion ? 'Back to Curated Questions' : 'Type Custom Question'}</span>
          </button>
        </div>

        {isCustomQuestion ? (
          <div className="flex items-center gap-2 animate-in fade-in">
            <input
              type="text"
              value={customQuestionInput}
              onChange={(e) => setCustomQuestionInput(e.target.value)}
              placeholder="e.g. Tell me about a time you led a cross-functional migration to TypeScript..."
              className="flex-1 px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleApplyCustomQuestion}
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-95 shrink-0 cursor-pointer"
            >
              Set Question
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CURATED_BEHAVIORAL_QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestion(q)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  selectedQuestion.id === q.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-surface-container'
                }`}
              >
                <span>{q.category}</span>
              </button>
            ))}
          </div>
        )}

        {/* Current Active Question Display */}
        <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container/80 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary uppercase text-[10px] tracking-wider">
              Active Question • {selectedQuestion.competency}
            </span>
            <button
              type="button"
              onClick={() => setShowStarGuide((prev) => !prev)}
              className="text-[11px] font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">help</span>
              <span>{showStarGuide ? 'Hide STAR Tips' : 'Show STAR Tips'}</span>
            </button>
          </div>
          <p className="font-headline-sm text-xs sm:text-sm font-bold text-on-surface leading-snug">
            "{selectedQuestion.prompt}"
          </p>

          {showStarGuide && (
            <div className="pt-2 text-[11px] text-on-surface-variant border-t border-surface-container mt-2 flex items-start gap-2 bg-primary/5 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                lightbulb
              </span>
              <div>
                <strong className="text-on-surface font-bold">STAR Recruiter Guide: </strong>
                {selectedQuestion.starTip}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="p-4 sm:p-5 space-y-4 max-h-[500px] overflow-y-auto bg-surface-container-lowest/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'candidate' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            {msg.sender === 'coach' ? (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container shrink-0 border border-primary">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                  alt="Coach Maya"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center shrink-0">
                {candidateName.charAt(0) || 'C'}
              </div>
            )}

            {/* Bubble Content */}
            <div
              className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs space-y-2 ${
                msg.sender === 'candidate'
                  ? 'bg-primary text-on-primary rounded-tr-xs shadow-xs'
                  : 'bg-surface-container-low border border-surface-container text-on-surface rounded-tl-xs shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] opacity-80 pb-0.5 border-b border-current/10">
                <span className="font-bold">{msg.sender === 'coach' ? 'Coach Maya Lin' : candidateName}</span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

              {/* Instant Structured Feedback Card (Rendered for coach feedback messages) */}
              {msg.feedback && (
                <div className="mt-3 p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container text-on-surface space-y-3 shadow-xs">
                  {/* Score & Rating Badge */}
                  <div className="flex items-center justify-between border-b border-surface-container pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          msg.feedback.overallRating === 'Strong'
                            ? 'bg-emerald-500'
                            : msg.feedback.overallRating === 'Good'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="font-bold text-sm">
                        {msg.feedback.overallRating} Response
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 font-mono font-bold text-primary text-sm">
                      <span>{msg.feedback.score}</span>
                      <span className="text-[10px] text-on-surface-variant font-normal">/100</span>
                    </div>
                  </div>

                  {/* STAR Breakdown Interactive Tabs */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      STAR Method Breakdown:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setActiveStarTab('s')}
                        className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                          activeStarTab === 's'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        Situation
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStarTab('t')}
                        className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                          activeStarTab === 't'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        Task
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStarTab('a')}
                        className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                          activeStarTab === 'a'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        Action
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStarTab('r')}
                        className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                          activeStarTab === 'r'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        Result
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface-container-low text-xs text-on-surface leading-relaxed min-h-[46px]">
                      {activeStarTab === 's' && (
                        <span>
                          <strong className="text-primary font-bold">Situation Context: </strong>
                          {msg.feedback.starBreakdown.situation}
                        </span>
                      )}
                      {activeStarTab === 't' && (
                        <span>
                          <strong className="text-primary font-bold">Task & Goal: </strong>
                          {msg.feedback.starBreakdown.task}
                        </span>
                      )}
                      {activeStarTab === 'a' && (
                        <span>
                          <strong className="text-primary font-bold">Action (Your Ownership): </strong>
                          {msg.feedback.starBreakdown.action}
                        </span>
                      )}
                      {activeStarTab === 'r' && (
                        <span>
                          <strong className="text-primary font-bold">Result & Metrics: </strong>
                          {msg.feedback.starBreakdown.result}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Strengths & Actionable Areas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                        <span>Key Strengths:</span>
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {msg.feedback.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">tune</span>
                        <span>Polish Recommendation:</span>
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {msg.feedback.areasToImprove.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Polished Executive Sample Answer */}
                  {msg.feedback.polishedSample && (
                    <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 space-y-1 text-xs">
                      <span className="font-bold text-primary flex items-center gap-1 text-[11px]">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        <span>Executive STAR Model Example:</span>
                      </span>
                      <p className="text-on-surface-variant italic text-[11.5px] leading-relaxed">
                        "{msg.feedback.polishedSample}"
                      </p>
                    </div>
                  )}

                  {/* Follow-Up Probe Question */}
                  {msg.feedback.followUpQuestion && (
                    <div className="p-2 rounded-lg bg-surface-container text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-[16px]">
                          help_outline
                        </span>
                        <span>
                          <strong>Interviewer Follow-up: </strong>
                          {msg.feedback.followUpQuestion}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCandidateInput(`Regarding ${msg.feedback?.followUpQuestion || 'that'}: `);
                          textareaRef.current?.focus();
                        }}
                        className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-[10px] shrink-0 cursor-pointer"
                      >
                        Answer Probe
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live Typing Indicator */}
        {isSubmitting && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant p-2">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-primary-container border border-primary shrink-0">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                alt="Coach Maya"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-surface-container-low border border-surface-container">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              <span>Coach Maya is analyzing your STAR breakdown & metrics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3.5 sm:p-4 bg-surface-container-low border-t border-surface-container space-y-2">
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
          <button
            type="button"
            onClick={handleInsertStarTemplate}
            className="flex items-center gap-1 font-bold text-primary hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">post_add</span>
            <span>Insert STAR Starter Outline</span>
          </button>
          <span>
            {wordCount} words {wordCount > 0 ? `(~${estimatedSeconds}s delivery)` : ''} • Aim for 80–180 words
          </span>
        </div>

        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={3}
            value={candidateInput}
            onChange={(e) => setCandidateInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmitAnswer();
              }
            }}
            placeholder="Type your behavioral response here... (Tip: Highlight your individual actions and conclude with measurable impact)"
            className="w-full p-3 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
          />

          <button
            type="button"
            disabled={!candidateInput.trim() || isSubmitting}
            onClick={handleSubmitAnswer}
            className="h-10 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-95 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
          >
            <span>Evaluate</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>

        {/* Transition Bridge Callout to Video Mock */}
        <div className="p-3 rounded-xl bg-linear-to-r from-primary/10 via-surface-container-lowest to-secondary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
              videocam
            </span>
            <div>
              <strong className="text-on-surface">Ready to test these stories on camera?</strong>
              <p className="text-[11px] text-on-surface-variant">
                Transition to the proctored or practice video room to test real-time speech and eye contact.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onLaunchVideoPractice}
              className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-95 cursor-pointer shadow-xs"
            >
              Practice Video Mock
            </button>
            <button
              type="button"
              onClick={onLaunchVideoProfessional}
              className="px-3 py-1.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs hover:opacity-95 cursor-pointer shadow-xs"
            >
              Official Proctored
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
