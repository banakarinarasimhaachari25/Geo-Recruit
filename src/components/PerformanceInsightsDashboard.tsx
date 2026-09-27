import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface PerformanceInsightsDashboardProps {
  onStartNewMock?: () => void;
  candidateName?: string;
  targetRole?: string;
}

interface MockSessionRecord {
  session: string;
  date: string;
  role: string;
  overallScore: number;
  reactFrontend: number;
  nodeBackend: number;
  databaseSQL: number;
  systemDesign: number;
  behavioralSTAR: number;
  integrityScore: number;
  durationMins: number;
}

const MOCK_INTERVIEW_HISTORY: MockSessionRecord[] = [
  {
    session: 'Mock #1',
    date: 'Sep 10',
    role: 'Full-Stack Developer',
    overallScore: 64,
    reactFrontend: 62,
    nodeBackend: 58,
    databaseSQL: 65,
    systemDesign: 50,
    behavioralSTAR: 70,
    integrityScore: 92,
    durationMins: 14,
  },
  {
    session: 'Mock #2',
    date: 'Sep 14',
    role: 'Full-Stack Developer',
    overallScore: 72,
    reactFrontend: 74,
    nodeBackend: 68,
    databaseSQL: 71,
    systemDesign: 61,
    behavioralSTAR: 75,
    integrityScore: 96,
    durationMins: 15,
  },
  {
    session: 'Mock #3',
    date: 'Sep 18',
    role: 'Full-Stack Developer',
    overallScore: 79,
    reactFrontend: 82,
    nodeBackend: 76,
    databaseSQL: 77,
    systemDesign: 70,
    behavioralSTAR: 80,
    integrityScore: 98,
    durationMins: 15,
  },
  {
    session: 'Mock #4',
    date: 'Sep 22',
    role: 'Full-Stack Developer',
    overallScore: 85,
    reactFrontend: 89,
    nodeBackend: 84,
    databaseSQL: 83,
    systemDesign: 79,
    behavioralSTAR: 86,
    integrityScore: 99,
    durationMins: 15,
  },
  {
    session: 'Mock #5',
    date: 'Sep 26',
    role: 'Full-Stack Developer',
    overallScore: 91,
    reactFrontend: 95,
    nodeBackend: 90,
    databaseSQL: 89,
    systemDesign: 86,
    behavioralSTAR: 92,
    integrityScore: 100,
    durationMins: 15,
  },
];

const RADAR_SKILL_BENCHMARKS = [
  { subject: 'React & Frontend', current: 95, benchmark: 85, fullMark: 100 },
  { subject: 'Node.js & Backend', current: 90, benchmark: 80, fullMark: 100 },
  { subject: 'Database & SQL', current: 89, benchmark: 80, fullMark: 100 },
  { subject: 'System Design', current: 86, benchmark: 75, fullMark: 100 },
  { subject: 'STAR Behavioral', current: 92, benchmark: 80, fullMark: 100 },
  { subject: 'Proctor Integrity', current: 98, benchmark: 90, fullMark: 100 },
];

const SKILL_SERIES = [
  { key: 'reactFrontend', label: 'React & Frontend', color: '#006948' }, // Brand Primary
  { key: 'nodeBackend', label: 'Node.js & APIs', color: '#00658f' }, // Secondary
  { key: 'databaseSQL', label: 'PostgreSQL & DB', color: '#7c5295' }, // Tertiary
  { key: 'systemDesign', label: 'System Design', color: '#d97706' }, // Amber
  { key: 'behavioralSTAR', label: 'STAR Communication', color: '#e11d48' }, // Rose
];

export const PerformanceInsightsDashboard: React.FC<PerformanceInsightsDashboardProps> = ({
  onStartNewMock,
  candidateName = 'Aryan Sharma',
  targetRole = 'Full-Stack Software Engineer',
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'radar' | 'velocity'>('trends');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const initialScore = MOCK_INTERVIEW_HISTORY[0].overallScore;
  const latestScore = MOCK_INTERVIEW_HISTORY[MOCK_INTERVIEW_HISTORY.length - 1].overallScore;
  const totalGrowth = latestScore - initialScore;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <div className="font-bold text-on-surface border-b border-surface-container pb-1 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-[10px] text-on-surface-variant font-normal">
              {MOCK_INTERVIEW_HISTORY.find((m) => m.session === label)?.date || ''}
            </span>
          </div>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center gap-3">
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-bold font-mono text-on-surface">{item.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs overflow-hidden transition-all space-y-4 p-5 sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 font-bold shadow-xs">
            <span className="material-symbols-outlined text-[22px]">insights</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                Performance Insights & Skill Proficiency
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                5 Mocks Analyzed
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Tracks competency progression, latency optimization, and STAR scoring across multiple interview iterations.
            </p>
          </div>
        </div>

        {/* View Toggle Tabs (Interactive Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'trends'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">show_chart</span>
            <span>Skill Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'radar'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">radar</span>
            <span>Benchmark Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('velocity')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'velocity'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">bar_chart</span>
            <span>Session Delta</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-1">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Current AI Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline-sm text-2xl font-black text-primary font-mono">
              {latestScore}
            </span>
            <span className="text-xs text-on-surface-variant font-normal">/100</span>
          </div>
          <span className="text-[10px] text-primary font-bold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">trending_up</span>
            <span>+{totalGrowth} pts across 5 mocks</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-1">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Highest Proficiency
          </span>
          <div className="font-title-md text-sm font-extrabold text-on-surface truncate">
            React & Frontend
          </div>
          <span className="text-[10px] text-primary font-bold block">
            95% • Exceeds L4 Benchmark
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-1">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Fastest Velocity Skill
          </span>
          <div className="font-title-md text-sm font-extrabold text-on-surface truncate">
            System Design
          </div>
          <span className="text-[10px] text-amber-700 font-bold block">
            +36 pts growth (50% → 86%)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-1">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Proctor Trust Index
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline-sm text-2xl font-black text-emerald-700 font-mono">
              98.8%
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            <span>Zero-anomaly clean proctor</span>
          </span>
        </div>
      </div>

      {/* VIEW 1: MULTI-LINE SKILL PROFICIENCY OVER TIME */}
      {activeTab === 'trends' && (
        <div className="space-y-3 pt-1 animate-in fade-in">
          {/* Skill Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-on-surface-variant text-[11px] font-semibold mr-1">
                Filter Skill:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSkill('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedSkill === 'all'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Skills
              </button>
              {SKILL_SERIES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSelectedSkill(s.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedSkill === s.key
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <span className="text-[11px] text-on-surface-variant">
              Target: <strong>80%+ Senior Threshold</strong>
            </span>
          </div>

          {/* Recharts Area/Line Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_INTERVIEW_HISTORY} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006948" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#006948" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="session" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                {/* Overall Score Area */}
                {(selectedSkill === 'all' || selectedSkill === 'overall') && (
                  <Area
                    type="monotone"
                    dataKey="overallScore"
                    name="Overall Mock Score"
                    stroke="#006948"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorOverall)"
                    dot={{ r: 4, fill: '#006948' }}
                    activeDot={{ r: 6 }}
                  />
                )}

                {/* React */}
                {(selectedSkill === 'all' || selectedSkill === 'reactFrontend') && (
                  <Line
                    type="monotone"
                    dataKey="reactFrontend"
                    name="React & Frontend"
                    stroke="#006948"
                    strokeWidth={selectedSkill === 'reactFrontend' ? 3 : 2}
                    strokeDasharray={selectedSkill === 'all' ? '4 4' : undefined}
                    dot={{ r: 3 }}
                  />
                )}

                {/* Node */}
                {(selectedSkill === 'all' || selectedSkill === 'nodeBackend') && (
                  <Line
                    type="monotone"
                    dataKey="nodeBackend"
                    name="Node.js & Backend"
                    stroke="#00658f"
                    strokeWidth={selectedSkill === 'nodeBackend' ? 3 : 2}
                    dot={{ r: 3 }}
                  />
                )}

                {/* Database */}
                {(selectedSkill === 'all' || selectedSkill === 'databaseSQL') && (
                  <Line
                    type="monotone"
                    dataKey="databaseSQL"
                    name="PostgreSQL & DB"
                    stroke="#7c5295"
                    strokeWidth={selectedSkill === 'databaseSQL' ? 3 : 2}
                    dot={{ r: 3 }}
                  />
                )}

                {/* System Design */}
                {(selectedSkill === 'all' || selectedSkill === 'systemDesign') && (
                  <Line
                    type="monotone"
                    dataKey="systemDesign"
                    name="System Design"
                    stroke="#d97706"
                    strokeWidth={selectedSkill === 'systemDesign' ? 3 : 2}
                    dot={{ r: 3 }}
                  />
                )}

                {/* Behavioral */}
                {(selectedSkill === 'all' || selectedSkill === 'behavioralSTAR') && (
                  <Line
                    type="monotone"
                    dataKey="behavioralSTAR"
                    name="STAR Communication"
                    stroke="#e11d48"
                    strokeWidth={selectedSkill === 'behavioralSTAR' ? 3 : 2}
                    dot={{ r: 3 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 2: RADAR CHART VS RECRUITER BENCHMARK */}
      {activeTab === 'radar' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1 animate-in fade-in">
          <div className="md:col-span-7 h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_SKILL_BENCHMARKS}>
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" fontSize={10} />
                <Radar
                  name={`${candidateName} (Latest)`}
                  dataKey="current"
                  stroke="#006948"
                  fill="#006948"
                  fillOpacity={0.45}
                />
                <Radar
                  name="Top 10% Recruiter Benchmark"
                  dataKey="benchmark"
                  stroke="#64748B"
                  fill="#94A3B8"
                  fillOpacity={0.2}
                  strokeDasharray="4 4"
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="md:col-span-5 space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
              <span className="font-bold text-on-surface flex items-center gap-1.5 text-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span>Recruiter Assessment Verdict</span>
              </span>
              <p className="text-on-surface-variant leading-relaxed">
                Candidate surpasses the median enterprise developer threshold across all 5 technical core competencies. System design and concurrent state management show the highest quarter-over-quarter leap.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-on-surface text-[11px] uppercase tracking-wider block">
                Target Competency Alignment:
              </span>
              {RADAR_SKILL_BENCHMARKS.slice(0, 4).map((b) => (
                <div key={b.subject} className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">{b.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{b.current}%</span>
                    <span className="text-[10px] text-on-surface-variant">vs {b.benchmark}% target</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SESSION VELOCITY & SCORE DELTA BAR CHART */}
      {activeTab === 'velocity' && (
        <div className="space-y-3 pt-1 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Score delta gained per mock interview session:</span>
            <span className="font-semibold text-primary">Consistent Positive Growth Streak (5 Sessions)</span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_INTERVIEW_HISTORY} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="session" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="overallScore" name="Overall AI Score" fill="#006948" radius={[6, 6, 0, 0]} />
                <Bar dataKey="reactFrontend" name="React & Frontend" fill="#00658f" radius={[6, 6, 0, 0]} />
                <Bar dataKey="systemDesign" name="System Design" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Diagnostic Takeaway & Action Footer */}
      <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0">psychology</span>
          <div>
            <span className="font-bold text-on-surface block">
              AI Recommendation for Next Mock Session:
            </span>
            <span className="text-on-surface-variant">
              Practice distributed locking (Redis Redlock) and optimistic concurrency control to push System Design past 90%.
            </span>
          </div>
        </div>

        {onStartNewMock && (
          <button
            type="button"
            onClick={onStartNewMock}
            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-95 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            <span>Start Next Mock Session</span>
          </button>
        )}
      </div>
    </section>
  );
};
