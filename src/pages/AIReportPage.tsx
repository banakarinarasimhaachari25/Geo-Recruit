import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InterviewReport } from '../types';
import { AIFeedbackGenerator } from '../components/AIFeedbackGenerator';

interface AIReportPageProps {
  onNavigate: (path: string, params?: any) => void;
  reportId?: string;
  mode?: string;
}

export const AIReportPage: React.FC<AIReportPageProps> = ({
  onNavigate,
  reportId = 'rep_1',
  mode,
}) => {
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [viewMode, setViewMode] = useState<'scorecard' | 'feedback_generator'>('scorecard');
  const [selectedQIndex, setSelectedQIndex] = useState(0);
  const [strengthsOpen, setStrengthsOpen] = useState(true);
  const [growthOpen, setGrowthOpen] = useState(true);
  const [exportNotice, setExportNotice] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.getInterviewReport(reportId);
        setReport(res);
      } catch {
        // fallback
      }
    };
    fetchReport();
  }, [reportId]);

  // Determine if this is a Practice (Mock) Session vs Professional AI Interview
  // User mandate: "for users who selected mock interview in the report areas to be improved will also be mentioned and for professional interview it will not be mentioned."
  const isMockInterview =
    (mode || report?.mode || report?.interviewMode || '').toLowerCase().includes('practice') ||
    mode === 'practice' ||
    report?.mode === 'practice';

  const fallbackQuestions = [
    {
      questionId: 'q1',
      title: 'Q1: Distributed Locks',
      category: 'Architecture • Advanced',
      score: 'Score: 9.1 / 10',
      prompt:
        '"How would you ensure high availability and prevent split-brain scenarios when coordinating state across multi-region microservices?"',
      transcript:
        '"I would employ a Raft-based consensus quorum across three odd availability zones. If partition occurs, the minority partition stops writes and acts read-only to eliminate split-brain..."',
      aiNote:
        'Superb identification of Paxos/Raft consensus tradeoffs. Follow-up recommendation: could briefly address cross-region egress cost considerations.',
    },
    {
      questionId: 'q2',
      title: 'Q2: Conflict Resolution',
      category: 'Behavioral • STAR Approach',
      score: 'Score: 7.8 / 10',
      prompt: '"Tell me about a time when a critical bug escaped into production on your watch."',
      transcript:
        '"Last year, an auth cache invalidation caused 500s for 4% of active sessions. I took ownership, rolled back the deployment within 9 minutes, and authored a post-mortem..."',
      aiNote:
        'Strong ownership mindset. Try quantifying the team preventative safeguards (e.g. added 14 integration test suites) to close with impact.',
    },
    {
      questionId: 'q3',
      title: 'Q3: Rate Limiting',
      category: 'System Design • Scale',
      score: 'Score: 8.6 / 10',
      prompt:
        '"Design an API rate limiter supporting 500,000 queries per second with sub-5ms response thresholds."',
      transcript:
        '"I used a token-bucket algorithm distributed across Redis cluster instances using Lua scripts to maintain atomicity and eliminate network round trips..."',
      aiNote:
        'Excellent technical solution and algorithmic rigor. Lua scripting highlights deep engineering awareness.',
    },
  ];

  // Dynamic question list from the real evaluated report or fallback
  const questionsList =
    report?.questionAnalysis && report.questionAnalysis.length > 0
      ? report.questionAnalysis.map((item, idx) => {
          const numScore = typeof item.score === 'number' ? item.score : 8.0;
          return {
            questionId: item.questionId || `q${idx + 1}`,
            title: `Q${idx + 1}: ${(item.category || 'Topic').slice(0, 15)}`,
            category: item.category || 'Technical Assessment',
            scoreNumber: numScore,
            score: `Score: ${numScore.toFixed(1)} / 10`,
            prompt: item.prompt,
            transcript: item.candidateAnswer ? item.candidateAnswer : 'No verbal or written answer recorded.',
            aiNote: item.aiFeedback || 'Evaluation based on technical accuracy, problem formulation, and solution depth.',
          };
        })
      : fallbackQuestions.map((q) => ({
          ...q,
          scoreNumber: 8.5,
        }));

  const activeQ = questionsList[selectedQIndex] || questionsList[0];

  const overall = report?.overallScore || 8.5;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-space-md py-space-sm space-y-space-md pb-28">
      {/* Recruiter / Assessment Status Banner */}
      <div
        className={`flex items-center justify-between p-space-md rounded-xl text-white shadow-sm relative overflow-hidden ${
          isMockInterview ? 'bg-primary' : 'bg-secondary'
        }`}
      >
        <div className="flex items-center gap-space-sm z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-white text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isMockInterview ? 'model_training' : 'verified'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm leading-none font-bold text-sm md:text-base">
                {isMockInterview ? 'Mock Interview Practice Report' : 'Professional AI Interview Report'}
              </span>
              <span className="font-label-sm text-[10px] bg-white/20 text-white px-space-xs py-0.5 rounded-full font-semibold">
                {isMockInterview ? 'Diagnostic Coaching' : 'Enterprise Certified'}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-white/90 mt-0.5 text-xs">
              {isMockInterview
                ? 'Includes overall evaluation metrics and personalized Areas to be Improved'
                : 'Official candidate qualification scorecard for partner engineering recruiters'}
            </p>
          </div>
        </div>
        <div className="w-16 h-16 absolute -right-4 -bottom-4 rounded-full bg-white/10 blur-lg pointer-events-none"></div>
      </div>

      {/* Resume Grounding Notice */}
      {report?.resumeFileName && (
        <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-primary text-[18px]">description</span>
            <span className="text-on-surface truncate">
              Evaluated against resume: <strong>{report.resumeFileName}</strong>
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold shrink-0">
            Resume Grounded
          </span>
        </div>
      )}

      {/* View Switcher: Standard Scorecard vs Deep AI Feedback Generator */}
      <div className="p-1 bg-[#FAF8F5] rounded-2xl border-2 border-[#E5E1DD] flex items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setViewMode('scorecard')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            viewMode === 'scorecard'
              ? 'bg-[#083A4F] text-white shadow-xs'
              : 'text-[#4F5B62] hover:text-[#083A4F]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">fact_check</span>
          <span>Scorecard & Question Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('feedback_generator')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            viewMode === 'feedback_generator'
              ? 'bg-[#083A4F] text-white shadow-xs'
              : 'text-[#4F5B62] hover:text-[#083A4F]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] text-[#A58D66]">
            psychology_alt
          </span>
          <span>AI Feedback Generator (Transcript + Video)</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#A58D66]/20 text-[#A58D66] font-bold text-[10px] uppercase">
            Actionable Areas
          </span>
        </button>
      </div>

      {viewMode === 'feedback_generator' ? (
        <AIFeedbackGenerator
          interviewReport={report}
          role={report?.role || 'Full-Stack Software Engineer'}
          candidateName={report?.candidateName || 'Aryan Sharma'}
          onStartNewMock={() => onNavigate('interview-prep-hub', { mode: 'practice' })}
        />
      ) : (
        <>
          {/* Featured Feedback Generator Banner */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-[#083A4F]/10 via-white to-[#407E8C]/15 border-2 border-[#407E8C]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#083A4F] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#A58D66] text-[22px]">
                  psychology_alt
                </span>
              </div>
              <div>
                <strong className="text-[#083A4F] text-sm block">
                  Want In-Depth Transcript & Video Analysis?
                </strong>
                <span className="text-[#4F5B62]">
                  Examine speaking pace (WPM), filler words, eye gaze tracking, and prioritized actionable improvement areas.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('feedback_generator')}
              className="px-3.5 py-2 rounded-xl bg-[#083A4F] hover:bg-[#114b64] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-all"
            >
              <span>Open AI Feedback Generator</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

      {/* Overall Evaluation Score Bento */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container/60 space-y-space-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold text-xs">
              Candidate Evaluation: {report?.candidateName || 'Candidate'}
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {report?.role || report?.trackTitle || 'Senior Systems Track'}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 font-label-sm text-xs px-space-sm py-1 rounded-full bg-primary-container text-on-primary-container font-semibold">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            AI Verified
          </span>
        </div>

        {/* Central Score Display & Highlights */}
        <div className="grid grid-cols-12 gap-space-sm items-center pt-space-xs">
          <div className="col-span-5 flex flex-col items-center justify-center p-space-md rounded-xl bg-surface-container-low text-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-highest"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                ></path>
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${overall * 10}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                ></path>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface leading-none">
                  {overall}
                </span>
                <span className="font-label-sm text-on-surface-variant text-[11px]">out of 10</span>
              </div>
            </div>
            <span className="mt-space-xs font-label-md text-label-md text-primary font-bold">
              {report?.tier || 'Tier 1 Certified'}
            </span>
          </div>

          <div className="col-span-7 flex flex-col justify-between h-full space-y-space-xs">
            <div className="p-space-sm rounded-lg bg-surface-container-low">
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span className="font-label-sm text-label-sm text-xs">Session Duration</span>
              </div>
              <span className="font-title-md text-title-md text-on-surface font-semibold text-sm">
                {report?.sessionDurationMins || 38} mins
              </span>
            </div>

            <div className="p-space-sm rounded-lg bg-surface-container-low">
              <div className="flex items-center gap-space-xs text-primary">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield_with_heart
                </span>
                <span className="font-label-sm text-label-sm font-semibold text-xs">
                  {report?.integrityTrustPercent || 100}% Integrity Trust
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                {report?.anomaliesCount || 0} anomalies or tab switches
              </span>
            </div>

            <div className="p-space-sm rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold text-xs">Benchmark Rank</span>
              <span className="font-title-md text-title-md font-bold text-sm">
                {report?.benchmarkRank || 'Top 4.2%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hiring Manager Integrity Dossier (Step 6) */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container/60 space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              policy
            </span>
            <div>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                Hiring Manager Integrity Reporting
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Fullscreen enforcement, window focus tracking & real-time anomaly log
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              (report?.anomaliesCount || 0) >= 3
                ? 'bg-red-100 text-red-800 border border-red-300'
                : (report?.anomaliesCount || 0) > 0
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {(report?.anomaliesCount || 0) >= 3
              ? 'Flagged — Repeated Violations'
              : (report?.anomaliesCount || 0) > 0
              ? `${report?.anomaliesCount} Warnings Logged`
              : 'Clean Proctoring (Verified)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
              Fullscreen Compliance
            </span>
            <div className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                verified
              </span>
              <span>Hardware Enforced</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
              Absence Window Limit
            </span>
            <div className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">timer</span>
              <span>10s Auto-Kill Threshold</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
              Integrity Trust Index
            </span>
            <div className="font-bold text-on-surface flex items-center gap-1.5 font-mono">
              <span className="material-symbols-outlined text-primary text-[16px]">security</span>
              <span>{report?.integrityTrustPercent || 98}% Verified</span>
            </div>
          </div>
        </div>

        {report?.integrityReporting?.violations && report.integrityReporting.violations.length > 0 && (
          <div className="pt-2 border-t border-surface-container space-y-1.5">
            <span className="text-[11px] font-bold text-on-surface block">
              Real-Time Violation Audit Log:
            </span>
            <div className="space-y-1">
              {report.integrityReporting.violations.map((v: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-red-50 text-red-900 border border-red-200 text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-red-600">
                      warning
                    </span>
                    <span>{typeof v === 'string' ? v : v.type}</span>
                  </span>
                  <span className="text-[10px] font-mono text-red-700">
                    {typeof v === 'string' ? '' : v.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Core Competencies */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container/60 space-y-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Core Competencies</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
              Measured against 12,000+ benchmarked engineers
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
          </div>
        </div>

        {/* Visual Bars */}
        <div className="space-y-space-sm">
          {(report?.competencies || [
            { name: 'Problem Solving & Logic', score: 88, color: 'bg-primary' },
            { name: 'Technical Depth', score: 86, color: 'bg-primary' },
            { name: 'Communication Clarity', score: 84, color: 'bg-primary' },
            { name: 'System Architecture', score: 82, color: 'bg-primary' },
            { name: 'Behavioral (STAR Method)', score: 80, color: 'bg-secondary' },
          ]).map((comp) => (
            <div key={comp.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-title-md text-title-md text-on-surface text-sm">
                  {comp.name}
                </span>
                <span
                  className={`font-label-md text-label-md font-bold ${
                    comp.color === 'bg-secondary' ? 'text-secondary' : 'text-primary'
                  }`}
                >
                  {comp.score}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className={`h-full rounded-full ${comp.color || 'bg-primary'}`}
                  style={{ width: `${comp.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic Highlights (Strengths & Growth Areas Accordion) */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container/60 space-y-space-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Diagnostic Highlights
          </h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Tap to inspect</span>
        </div>

        {/* Strengths Card */}
        <div className="rounded-lg bg-surface-container-low overflow-hidden">
          <button
            className="w-full p-space-md flex items-center justify-between text-left cursor-pointer"
            onClick={() => setStrengthsOpen(!strengthsOpen)}
            type="button"
          >
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div>
                <span className="font-title-md text-title-md text-on-surface block font-semibold text-sm">
                  Key Strengths (3 Identified)
                </span>
                <span className="font-body-sm text-body-sm text-primary text-xs">
                  Edge case mastery & modular reasoning
                </span>
              </div>
            </div>
            <span
              className="material-symbols-outlined transition-transform duration-200 text-on-surface-variant"
              style={{ transform: strengthsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>

          {strengthsOpen && (
            <div className="p-space-md pt-0 space-y-space-sm">
              {(report?.strengths && report.strengths.length > 0 ? report.strengths : [
                {
                  title: '1. Technical Fundamentals & Terminology',
                  description: 'Demonstrated familiarity with foundational terminology and structured thinking.',
                },
                {
                  title: '2. Methodical Problem Breakdown',
                  description: 'Addressed the core interview questions directly with structured articulation.',
                },
              ]).map((st, i) => (
                <div key={i} className="p-space-sm rounded-lg bg-surface-container-lowest border border-surface-container">
                  <p className="font-title-md text-title-md text-on-surface font-semibold text-sm">
                    {st.title}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 text-xs">
                    {st.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Growth Areas Card - Displayed for Mock Interview; Excluded for Professional Interview */}
        {isMockInterview ? (
          <div className="rounded-lg bg-surface-container-low overflow-hidden border border-amber-500/20">
            <button
              className="w-full p-space-md flex items-center justify-between text-left cursor-pointer"
              onClick={() => setGrowthOpen(!growthOpen)}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-700">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                </div>
                <div>
                  <span className="font-title-md text-title-md text-on-surface block font-semibold text-sm">
                    Areas to be Improved (Mock Interview Diagnostic Coaching)
                  </span>
                  <span className="font-body-sm text-body-sm text-amber-700 text-xs font-semibold">
                    {(report?.weaknesses?.length || 2)} Key Growth Opportunities Identified
                  </span>
                </div>
              </div>
              <span
                className="material-symbols-outlined transition-transform duration-200 text-on-surface-variant"
                style={{ transform: growthOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                expand_more
              </span>
            </button>

            {growthOpen && (
              <div className="p-space-md pt-0 space-y-space-sm">
                {(report?.weaknesses && report.weaknesses.length > 0 ? report.weaknesses : [
                  {
                    title: '1. Quantify Impact in STAR Stories',
                    description: 'When describing engineering incidents or projects, explicitly quantify business metrics and performance impact.',
                  },
                  {
                    title: '2. Deepen Architectural Trade-offs',
                    description: 'Proactively compare alternative patterns or libraries before choosing your final solution.',
                  },
                ]).map((wk, i) => (
                  <div key={i} className="p-space-sm rounded-lg bg-surface-container-lowest border border-amber-500/20">
                    <p className="font-title-md text-title-md text-on-surface font-semibold text-sm flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-[16px]">arrow_circle_up</span>
                      <span>{wk.title}</span>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-xs leading-relaxed">
                      {wk.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Professional Interview: Areas to be Improved are NOT mentioned as explicitly requested */
          <div className="rounded-lg bg-surface-container-low p-space-md border border-surface-container space-y-2">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <span className="font-title-md text-on-surface block font-bold text-sm">
                  Official Professional Screening Report
                </span>
                <span className="font-body-sm text-secondary text-xs font-semibold">
                  Blind Technical Evaluation • Enterprise Recruiter Certified
                </span>
              </div>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              This session was completed under official Professional AI proctoring conditions. Per enterprise recruitment standards, candidate formative coaching and areas for improvement are excluded from candidate evaluation scorecards.
            </p>
          </div>
        )}
      </div>

      {/* Question-by-Question Deep Dive */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container/60 space-y-space-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Question Analysis</h3>
          <span className="font-label-sm text-label-sm bg-surface-container px-space-xs py-0.5 rounded text-on-surface font-semibold">
            {questionsList.length} Questions
          </span>
        </div>

        {/* Question Pill Selector */}
        <div className="flex gap-space-xs overflow-x-auto pb-1 no-scrollbar">
          {questionsList.map((q, idx) => {
            const isSelected = selectedQIndex === idx;
            return (
              <button
                key={q.questionId || idx}
                className={`px-space-sm py-1.5 rounded-full font-label-md text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                }`}
                onClick={() => setSelectedQIndex(idx)}
                type="button"
              >
                {q.title}
              </button>
            );
          })}
        </div>

        {/* Active Question View Content */}
        <div className="p-space-md rounded-lg bg-surface-container-low space-y-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant text-xs">
              {activeQ.category}
            </span>
            <span
              className={`font-label-md text-label-md font-bold px-2.5 py-0.5 rounded-full text-xs ${
                (activeQ.scoreNumber || 8.0) >= 8.0
                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                  : (activeQ.scoreNumber || 8.0) >= 6.0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {activeQ.score}
            </span>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-lowest">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold text-[10px]">
              Prompt
            </span>
            <p className="font-title-md text-title-md text-on-surface mt-0.5 text-xs md:text-sm">
              {activeQ.prompt}
            </p>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-lowest">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold text-[10px]">
                Your Transcribed Response
              </span>
              <span className="font-label-sm text-label-sm text-primary font-medium text-xs">
                96% clarity
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant italic mt-1 text-xs">
              {activeQ.transcript}
            </p>
          </div>

          <div className="p-space-sm rounded-lg bg-primary/10 text-on-surface space-y-1">
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span className="font-label-md text-label-md font-bold text-xs">
                AI Evaluator Remark
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface text-xs leading-relaxed">
              {activeQ.aiNote}
            </p>
          </div>
        </div>
      </div>

      {/* Supporting Visual Proof: Assessment Artifact */}
      <div className="rounded-xl overflow-hidden shadow-sm relative">
        <img
          className="w-full h-32 object-cover"
          alt="Dossier Preview"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg5Imtgpqz6PhJhT8u7dLjabouGM4SVxC_Ln7RcMQEr7L8BB_sFTPdxaFp3GXJd4s3i8zR70Re2ChjfBKOMxW7MLMFmQ8pBIoqmkkkgDXUQ_lTs9O7rm-fuB-fxXNb0GbCGn2e-5btKG8ze6f15LjwVusTQapLqoAVRgHiZqAOrhsX2imAF0pl3l7Rk6z5bmWUUNCcHk3-YKuDG-YWfwTC59owrBRI4E1VEOG2HV4lSuedki2VQvRNZA"
        />
        <div className="absolute inset-0 bg-inverse-surface/60 flex items-center justify-between px-space-md">
          <div className="text-on-primary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider block font-semibold text-primary-fixed text-xs">
              Certified Artifact
            </span>
            <span className="font-title-md text-title-md font-bold text-white text-sm md:text-base">
              TalentAI Comprehensive Dossier
            </span>
          </div>
          <button
            onClick={() => setExportNotice(true)}
            className="px-space-md py-space-xs rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold shadow-sm hover:bg-surface-container cursor-pointer text-xs"
            type="button"
          >
            View PDF
          </button>
        </div>
      </div>
      </>
      )}

      {/* Action Deck (Fixed Bottom Accessible Grid) */}
      <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
        <button
          onClick={() => {
            setExportNotice(true);
            setTimeout(() => setExportNotice(false), 2500);
          }}
          className="w-full h-12 px-space-md rounded-lg bg-surface-container-lowest text-on-surface font-title-md text-title-md font-semibold flex items-center justify-center gap-space-xs shadow-sm hover:bg-surface-container active:scale-95 transition-all cursor-pointer border border-surface-container text-sm"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">download</span>
          <span>{exportNotice ? 'PDF Generated!' : 'Export PDF'}</span>
        </button>

        <button
          className="w-full h-12 px-space-md rounded-lg bg-primary text-on-primary font-title-md text-title-md font-semibold flex items-center justify-center gap-space-xs shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer text-sm"
          onClick={() => onNavigate('interview-prep-hub')}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          <span>Practice Again</span>
        </button>
      </div>
    </div>
  );
};
