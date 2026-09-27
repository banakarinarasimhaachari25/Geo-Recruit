import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DailyInterviewTip as TipData } from '../types';

interface DailyInterviewTipProps {
  onNavigate?: (path: string, params?: any) => void;
  preferredRole?: string;
}

const CATEGORIES = [
  'All',
  'Behavioral & STAR',
  'System Design',
  'Coding & DSA',
  'Camera & Proctoring',
  'Technical Communication',
  'Resume Grounding',
];

export const DailyInterviewTip: React.FC<DailyInterviewTipProps> = ({
  onNavigate,
  preferredRole,
}) => {
  const [tip, setTip] = useState<TipData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const fetchTip = async (category: string = selectedCategory) => {
    setLoading(true);
    setCopied(false);
    try {
      const data = await api.getDailyInterviewTip(
        category === 'All' ? undefined : category,
        preferredRole
      );
      setTip(data);
    } catch (err) {
      console.error('Error fetching daily interview tip:', err);
      // Fallback tip if request fails
      setTip({
        id: 'fallback_tip',
        category: 'Behavioral & STAR',
        title: 'The 60-Second STAR Ratio',
        snippet:
          'When answering behavioral questions, candidates spend too much time on background setup. Structure your response with 15% on Situation/Task, 70% on your specific individual Action, and 15% on measurable Result.',
        actionableStep:
          'State the metric or business outcome in your opening sentence before diving into how you solved it.',
        takeaway: 'Focus on what YOU did, not what the team did in general.',
        source: 'curated',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
  }, [selectedCategory, preferredRole]);

  const handleCopy = () => {
    if (!tip) return;
    const textToCopy = `💡 Daily Interview Tip: ${tip.title}\n\n${tip.snippet}\n\n🎯 Actionable Step: ${tip.actionableStep}\n🔑 Key Takeaway: ${tip.takeaway}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden transition-all hover:border-primary/30">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px]">tips_and_updates</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-title-md text-sm font-bold text-on-surface">
                Daily Interview Tip
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-extrabold tracking-wide">
                <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                <span>AI Coach</span>
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Concise, AI-curated advice snippet to elevate your technical & behavioral readiness.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!tip || loading}
            className="px-2.5 py-1.5 rounded-lg border border-surface-container hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Copy tip to clipboard"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setLiked(!liked)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors ${
              liked
                ? 'border-error/40 bg-error/10 text-error'
                : 'border-surface-container hover:bg-surface-container text-on-surface-variant'
            }`}
            title={liked ? 'Saved to favorites' : 'Helpful tip'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {liked ? 'favorite' : 'favorite_border'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => fetchTip()}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:opacity-95 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
            title="Generate a new AI interview tip"
          >
            <span
              className={`material-symbols-outlined text-[14px] ${loading ? 'animate-spin' : ''}`}
            >
              refresh
            </span>
            <span>{loading ? 'Generating...' : 'Next Tip'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Tip Card Body */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-on-surface-variant">
            Synthesizing AI interview coaching snippet...
          </p>
        </div>
      ) : tip ? (
        <div className="mt-1 space-y-3 animate-in fade-in">
          {/* Tip Title & Category */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-title-md text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span>{tip.title}</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
              {tip.category}
            </span>
          </div>

          {/* Snippet Content */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 relative">
            <p className="font-body-md text-xs text-on-surface leading-relaxed">
              "{tip.snippet}"
            </p>

            {/* Actionable Step Box */}
            {tip.actionableStep && (
              <div className="mt-2.5 pt-2.5 border-t border-surface-container flex items-start gap-2 text-[11px]">
                <span className="material-symbols-outlined text-primary text-[15px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <div className="leading-snug text-on-surface">
                  <strong className="text-primary font-bold">Actionable Habit: </strong>
                  <span>{tip.actionableStep}</span>
                </div>
              </div>
            )}
          </div>

          {/* Key Takeaway & Mock Launch Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
              <span className="material-symbols-outlined text-amber-500 text-[15px]">
                lightbulb
              </span>
              <span>
                <strong>Takeaway:</strong> {tip.takeaway}
              </span>
            </div>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('interview-prep-hub')}
                className="self-end sm:self-auto text-primary hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Practice in Mock Interview</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
