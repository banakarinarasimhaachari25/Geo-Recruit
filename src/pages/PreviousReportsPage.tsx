import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InterviewReport } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PreviousReportsPageProps {
  onNavigate: (path: string, params?: any) => void;
}

export const PreviousReportsPage: React.FC<PreviousReportsPageProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [atsHistory, setAtsHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState<'interview' | 'ats'>('interview');

  useEffect(() => {
    api.getInterviewReports().then((r) => setReports(r));
    api.getAtsHistory().then((h) => setAtsHistory(h));
  }, []);

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.trackTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff =
      filterDifficulty === 'all' || rep.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  const chartData = reports.map((r, i) => ({
    name: r.trackTitle.slice(0, 14) + '...',
    score: r.overallScore * 10,
    integrity: r.integrityTrustPercent || 98,
  }));

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-high text-primary font-label-md text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">analytics</span>
          <span>Performance Archives</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-1">
          Reports & Progress Analytics
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-0.5">
          Review historical mock interview evaluations, ATS iterative improvements, and AI proctor records.
        </p>
      </div>

      {/* Tabs */}
      <div className="p-1 rounded-xl bg-surface-container-low flex items-center gap-1 border border-surface-container">
        <button
          onClick={() => setActiveTab('interview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'interview'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Mock Interview Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('ats')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'ats'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          ATS Iteration History ({atsHistory.length})
        </button>
      </div>

      {activeTab === 'interview' && (
        <div className="space-y-4">
          {/* Performance Overview Chart */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-title-md text-on-surface text-sm font-bold">
                Score & Integrity Trends
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-primary">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span> Score
                </span>
                <span className="flex items-center gap-1 text-secondary">
                  <span className="w-2.5 h-2.5 rounded-sm bg-secondary"></span> Integrity
                </span>
              </div>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis domain={[50, 100]} stroke="#64748B" fontSize={10} width={28} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#006948" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="integrity" fill="#5654a8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, roles, topics..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none"
              />
            </div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="hard">Hard</option>
              <option value="medium">Medium</option>
              <option value="easy">Easy</option>
            </select>
          </div>

          {/* Reports List */}
          <div className="space-y-2">
            {filteredReports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => onNavigate('evaluation-report', { reportId: rep.id })}
                className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[22px]">terminal</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-title-md text-on-surface text-sm font-semibold truncate">
                        {rep.trackTitle}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-[10px] font-bold">
                        {rep.integrityTrustPercent || 98}% Safe
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant text-xs truncate mt-0.5">
                      {rep.date} · {rep.sessionDurationMins} mins · {rep.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-title-md text-primary font-bold text-base">
                      {rep.overallScore}
                    </span>
                    <span className="text-[10px] text-on-surface-variant block">/10</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ats' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
            <h3 className="font-title-md text-on-surface text-sm font-bold mb-2">
              ATS Score Progression Log
            </h3>
            <p className="font-body-sm text-on-surface-variant text-xs mb-4">
              Historical resume uploads compared with keyword matches and score deltas.
            </p>

            <div className="space-y-2">
              {atsHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between"
                >
                  <div>
                    <span className="font-title-md text-on-surface text-xs font-bold block">
                      {item.role}
                    </span>
                    <span className="font-body-sm text-on-surface-variant text-[11px]">
                      {item.fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="font-title-md text-primary font-bold text-sm">
                        {item.atsScore}/100
                      </span>
                      {item.previousScore && (
                        <span className="text-[10px] text-on-surface-variant block">
                          Prev: {item.previousScore}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onNavigate('ats-resume-analyzer')}
                      className="px-2.5 py-1 bg-surface-container text-primary rounded-lg text-xs font-semibold"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
