import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import {
  exportOptimizedResumePDF,
  exportATSDossierPDF,
  DEFAULT_OPTIMIZED_RESUME,
  ResumeData,
} from '../utils/pdfExport';

interface ATSResumeAnalyzerProps {
  onNavigate: (path: string, params?: any) => void;
  onOpenReview: () => void;
}

export const ATSResumeAnalyzer: React.FC<ATSResumeAnalyzerProps> = ({
  onNavigate,
  onOpenReview,
}) => {
  const { user, profile } = useAuth();
  const candidateName = profile?.name || user?.name || 'Aryan Sharma';
  const candidateEmail = profile?.email || user?.email || 'aryan.sharma@example.com';
  const candidatePhone = profile?.phone || '+91 98765 43210';
  const candidateCollege = profile?.college || 'National Institute of Technology';

  const [selectedRole, setSelectedRole] = useState('Full-Stack Software Engineer');
  const [fileName, setFileName] = useState('Aryan_Sharma_Resume_2025.pdf');
  const [fileSize, setFileSize] = useState('1.4 MB');
  const [uploadTime, setUploadTime] = useState('Uploaded just now');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [scanStatus, setScanStatus] = useState('Completed 100%');
  const [score, setScore] = useState(82);
  const [previousScore, setPreviousScore] = useState(68);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isExportingResume, setIsExportingResume] = useState(false);
  const [isExportingDossier, setIsExportingDossier] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const [historyData, setHistoryData] = useState([
    { iteration: 'v1.0', score: 68 },
    { iteration: 'v1.1', score: 74 },
    { iteration: 'v1.2', score: 82 },
    { iteration: 'v2.0', score: 86 },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Dynamic ATS-Optimized Resume model customized for user and target role
  const currentOptimizedResume: ResumeData = {
    ...DEFAULT_OPTIMIZED_RESUME,
    candidateName,
    targetRole: selectedRole,
    email: candidateEmail,
    phone: candidatePhone,
    education: [
      {
        degree: `Bachelor of Technology in ${profile?.specialization || 'Computer Science & Engineering'}`,
        institution: candidateCollege,
        period: profile?.batch ? `Batch of ${profile.batch}` : '2019 - 2023',
        scoreOrDetails: profile?.cgpa
          ? `CGPA: ${profile.cgpa} / 10.0 • First Class with Distinction`
          : 'CGPA: 8.8 / 10.0 • First Class with Distinction',
      },
    ],
  };

  const handleDownloadOptimizedResume = () => {
    setIsExportingResume(true);
    setTimeout(() => {
      const ok = exportOptimizedResumePDF(currentOptimizedResume);
      setIsExportingResume(false);
      if (ok) {
        setDownloadSuccessToast(
          `Exported ${candidateName.replace(/\s+/g, '_')}_Optimized_Resume.pdf`
        );
        setTimeout(() => setDownloadSuccessToast(null), 4000);
      }
    }, 450);
  };

  const handleDownloadDossier = () => {
    setIsExportingDossier(true);
    setTimeout(() => {
      const ok = exportATSDossierPDF(
        candidateName,
        selectedRole,
        score,
        ['React.js', 'TypeScript', 'REST API', 'Docker', 'PostgreSQL', 'Git', 'TailwindCSS', 'State Management'],
        ['Jest Tests', 'CI/CD Pipelines', 'AWS Lambda', 'GraphQL']
      );
      setIsExportingDossier(false);
      if (ok) {
        setExportSuccess(true);
        setDownloadSuccessToast('ATS Evaluation Dossier PDF exported successfully!');
        setTimeout(() => {
          setExportSuccess(false);
          setDownloadSuccessToast(null);
        }, 4000);
      }
    }, 450);
  };

  const handleCopyResumeText = () => {
    const text = `
${currentOptimizedResume.candidateName.toUpperCase()}
${currentOptimizedResume.targetRole}
${currentOptimizedResume.email} | ${currentOptimizedResume.phone} | ${currentOptimizedResume.location}
LinkedIn: ${currentOptimizedResume.linkedin} | GitHub: ${currentOptimizedResume.github}

PROFESSIONAL SUMMARY
${currentOptimizedResume.summary}

TECHNICAL COMPETENCIES
${currentOptimizedResume.skills.map((s) => `${s.category}: ${s.items.join(', ')}`).join('\n')}

PROFESSIONAL EXPERIENCE
${currentOptimizedResume.experience
  .map(
    (e) => `
${e.role} — ${e.company} (${e.period} | ${e.location})
${e.bullets.map((b) => `• ${b}`).join('\n')}
`
  )
  .join('\n')}

KEY TECHNICAL PROJECTS
${currentOptimizedResume.projects
  .map(
    (p) => `
${p.title} (${p.technologies.join(', ')})
${p.bullets.map((b) => `• ${b}`).join('\n')}
`
  )
  .join('\n')}

EDUCATION
${currentOptimizedResume.education
  .map((ed) => `${ed.degree} — ${ed.institution} (${ed.period})\n${ed.scoreOrDetails}`)
  .join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setUploadTime('Uploaded just now');
      triggerAnalysis(file.name);
    }
  };

  const triggerAnalysis = async (targetFile: string = fileName) => {
    setIsScanning(true);
    setScanProgress(15);
    setScanStatus('Extracting Skills (15%)...');

    setTimeout(() => {
      setScanProgress(48);
      setScanStatus('Checking Keywords (48%)...');
    }, 600);

    setTimeout(() => {
      setScanProgress(82);
      setScanStatus('Comparing Job Requirements (82%)...');
    }, 1200);

    try {
      const res = await api.analyzeATS(selectedRole, targetFile, '', previousScore);
      setTimeout(() => {
        setScanProgress(100);
        setScanStatus('Completed 100%');
        setIsScanning(false);
        setPreviousScore(score);
        setScore(res.atsScore || 86);
        setHistoryData((prev) => [
          ...prev,
          { iteration: `v${prev.length + 1}.0`, score: res.atsScore || 86 },
        ]);
      }, 1800);
    } catch {
      setTimeout(() => {
        setScanProgress(100);
        setScanStatus('Completed 100%');
        setIsScanning(false);
      }, 1800);
    }
  };

  const handleExportPDF = () => {
    handleDownloadDossier();
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-space-md py-space-sm space-y-space-lg pb-28">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      {/* Header Banner */}
      <section className="flex flex-col space-y-space-xs">
        <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-space-xs rounded-full bg-surface-container-high text-primary font-label-md text-label-md">
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span>AI Parser v4.2 Active</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
          Resume ATS Analyzer
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Optimize your resume for applicant tracking systems and recruiter AI screening.
        </p>
      </section>

      {/* Upload & Role Configuration Card */}
      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 space-y-space-md">
        {/* Target Job Selector */}
        <div className="flex flex-col space-y-space-xs">
          <label
            className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center justify-between"
            htmlFor="job-role-select"
          >
            <span>Target Job Role</span>
            <span className="text-primary font-label-sm text-label-sm lowercase font-medium">
              942 open listings parsed
            </span>
          </label>
          <div className="relative">
            <select
              className="w-full h-12 pl-space-md pr-10 rounded-lg bg-surface-container-low text-on-surface font-title-md text-title-md appearance-none focus:outline-none focus:bg-surface-container transition-colors cursor-pointer"
              id="job-role-select"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                triggerAnalysis();
              }}
            >
              <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
              <option value="Senior Frontend Architect">Senior Frontend Architect</option>
              <option value="Backend Engineer (Distributed Systems)">
                Backend Engineer (Distributed Systems)
              </option>
              <option value="Cloud & DevOps Specialist">Cloud & DevOps Specialist</option>
              <option value="AI/ML Applications Engineer">AI/ML Applications Engineer</option>
            </select>
            <span className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
              unfold_more
            </span>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              const file = e.dataTransfer.files[0];
              setFileName(file.name);
              setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
              setUploadTime('Uploaded just now');
              triggerAnalysis(file.name);
            }
          }}
          className="relative flex flex-col items-center justify-center p-space-lg rounded-xl bg-surface-container-low text-center transition-all cursor-pointer border-2 border-dashed border-surface-container hover:border-primary/50"
        >
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-space-sm shadow-sm">
            <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
          </div>
          <span className="font-title-md text-title-md text-on-surface font-semibold">
            Drop resume here or browse
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Supports PDF, DOCX (Max 10 MB)
          </span>

          {/* Supported filetype micro-badges */}
          <div className="flex items-center gap-space-sm mt-space-sm">
            <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-error">picture_as_pdf</span> PDF
            </span>
            <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px] text-tertiary">description</span> DOCX
            </span>
          </div>
        </div>

        {/* Attached File Pill Preview */}
        <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-10 h-10 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-title-md text-on-surface truncate font-medium">
                {fileName}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {fileSize} • {uploadTime}
              </span>
            </div>
          </div>
          <button
            aria-label="Replace file"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="material-symbols-outlined text-[20px]">sync</span>
          </button>
        </div>

        {/* Dynamic CTA & Processing Preview */}
        <button
          className="w-full h-12 rounded-lg bg-primary text-on-primary font-title-md text-title-md font-semibold flex items-center justify-center gap-space-sm shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-75"
          onClick={() => triggerAnalysis()}
          disabled={isScanning}
          type="button"
        >
          {isScanning ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
              <span>Processing ATS Models...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px]">analytics</span>
              <span>Analyze Resume</span>
            </>
          )}
        </button>

        {/* Pipeline Process Step Tracker */}
        <div className="flex flex-col space-y-space-xs pt-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              ATS Analysis Engine
            </span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">
              {scanStatus}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>

          {/* Step Chips */}
          <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
            <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-low text-on-surface font-label-sm text-label-sm">
              <span
                className="material-symbols-outlined text-[15px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="truncate">Extracting Skills</span>
            </div>
            <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-low text-on-surface font-label-sm text-label-sm">
              <span
                className="material-symbols-outlined text-[15px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="truncate">Checking Keywords</span>
            </div>
            <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-low text-on-surface font-label-sm text-label-sm">
              <span
                className="material-symbols-outlined text-[15px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="truncate">Job Alignment</span>
            </div>
            <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-surface-container-low text-on-surface font-label-sm text-label-sm">
              <span
                className="material-symbols-outlined text-[15px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="truncate">ATS Scoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Score Gauge Bento Card */}
      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 space-y-space-md">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
            Benchmark Result
          </span>
          <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>AI Verified</span>
          </span>
        </div>

        {/* Radial Metric Ring Display */}
        <div className="flex items-center justify-center py-space-xs">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg aria-hidden="true" className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                className="text-surface-container"
                cx="60"
                cy="60"
                fill="transparent"
                r="50"
                stroke="currentColor"
                strokeWidth="10"
              />
              <circle
                className="text-primary transition-all duration-1000 ease-out"
                cx="60"
                cy="60"
                fill="transparent"
                r="50"
                stroke="currentColor"
                strokeDasharray="314.159"
                strokeDashoffset={314.159 - (314.159 * score) / 100}
                strokeLinecap="round"
                strokeWidth="10"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="flex items-baseline">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  {score}
                </span>
                <span className="font-title-md text-title-md text-on-surface-variant font-normal">
                  /100
                </span>
              </div>
              <span className="font-label-md text-label-md text-primary font-semibold mt-0.5 px-space-sm py-0.5 rounded-full bg-surface-container-low">
                {score >= 80 ? 'Strong Match' : 'Good Match'}
              </span>
            </div>
          </div>
        </div>

        {/* Delta Comparison Widget */}
        <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Iteration History
            </span>
            <div className="flex items-center gap-space-xs mt-0.5">
              <span className="font-title-md text-title-md text-on-surface-variant line-through">
                68/100
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                arrow_forward
              </span>
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                {score}/100
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+{score - 68} pts boost</span>
          </div>
        </div>

        {/* Recharts Score Evolution Chart */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-on-surface-variant font-semibold uppercase">
              ATS Improvement Over Time
            </span>
            <span className="font-label-sm text-primary font-semibold">4 Iterations</span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="iteration" stroke="#64748B" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} width={28} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#006948"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#006948' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ========================================================
          AI-OPTIMIZED RESUME READY FOR PDF EXPORT
      ======================================================== */}
      <section className="p-space-md rounded-xl bg-linear-to-br from-surface-container-lowest to-primary/5 shadow-sm border-2 border-primary/30 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">description</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-base font-bold text-on-surface">
                  Optimized ATS Resume Ready
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-extrabold uppercase">
                  96% ATS Pass
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Enhanced with quantified metrics, resolved parser warnings, and high-frequency keywords.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-3 py-2 rounded-lg border border-surface-container hover:bg-surface-container text-on-surface text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Preview</span>
            </button>

            <button
              type="button"
              disabled={isExportingResume}
              onClick={handleDownloadOptimizedResume}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-95 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isExportingResume ? 'animate-spin' : ''}`}>
                {isExportingResume ? 'refresh' : 'download'}
              </span>
              <span>{isExportingResume ? 'Generating PDF...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Highlighted Fixes Pill Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-on-surface-variant font-medium">Included enhancements:</span>
          <span className="px-2 py-0.5 rounded-md bg-surface-container font-semibold text-on-surface">
            ✓ Single-column ATS layout
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-container font-semibold text-on-surface">
            ✓ Google X-Y-Z metrics
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-container font-semibold text-on-surface">
            ✓ CI/CD & AWS Lambda keywords
          </span>
        </div>
      </section>

      {/* Recruiter Persona & Parsing Insight */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-high shadow-sm p-space-md flex flex-col space-y-space-sm">
        <div className="flex items-center gap-space-sm">
          <img
            className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0"
            alt="Hiring Manager"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlf30n_IREEGrRToBkS7CxI3xlUuMRznGCFWPAMItOsTt4_2TviKKL9yOwgqEDr-r0wDz5pM1Oa-_kWiKqy3nvIX_TezwgOwWTf-21lULjzSRQMady-rXRYFhaUfyrJcGVkJajuvBLimEF8wowvnJTXg96bgP8lrDH9go4jig62vULFvAR7VOXPiLWUTbP5YESEgIA7BUYDzCNtUiDpHO5XnMYJvUFHFE66ucAMVcz-4mdBAKcdccP5g"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-title-md text-title-md text-on-surface font-semibold truncate">
              Taleo & Greenhouse Compatibility
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Semantic pass probability: 96.4%
            </span>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface">
          Your experience headers and role chronologies match algorithmic ingestion benchmarks cleanly. Minor syntax tuning will unlock top 5% candidate indexing.
        </p>
      </section>

      {/* Matching Keywords Section */}
      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Matching Keywords</h2>
          </div>
          <span className="font-label-md text-label-md text-primary font-semibold">8 Found</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          High-frequency terms confirmed in both your resume body and the target JD.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-space-xs">
          {[
            'React.js',
            'TypeScript',
            'REST API',
            'Docker',
            'PostgreSQL',
            'Git',
            'TailwindCSS',
            'State Management',
          ].map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md font-semibold"
            >
              <span className="material-symbols-outlined text-[14px]">check</span> {kw}
            </span>
          ))}
        </div>
      </section>

      {/* Missing Keywords Section */}
      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Missing Keywords</h2>
          </div>
          <span className="font-label-md text-label-md text-error font-semibold">5 Recommended</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          High-impact signals absent in your text. Inject these contextually into project bullets.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-space-xs">
          {['GraphQL', 'CI/CD Pipeline', 'AWS Lambda', 'Kubernetes', 'Unit Testing (Jest)'].map(
            (kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">add_circle</span> {kw}
              </span>
            )
          )}
        </div>
      </section>

      {/* Categorized Skills Breakdown */}
      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 space-y-space-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Skill Category Matrix</h2>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase">
            Detected vs Gap
          </span>
        </div>

        {/* Category 1 */}
        <div className="flex flex-col space-y-space-xs">
          <div className="flex justify-between items-center">
            <span className="font-title-md text-title-md text-on-surface font-semibold">
              Frontend Architecture
            </span>
            <span className="font-label-md text-label-md text-primary font-medium">90% Coverage</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full bg-primary rounded-full w-[90%]"></div>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Found: React, TS, Tailwind</span>
            <span className="text-error font-medium">Gap: Jest Tests</span>
          </div>
        </div>

        {/* Category 2 */}
        <div className="flex flex-col space-y-space-xs">
          <div className="flex justify-between items-center">
            <span className="font-title-md text-title-md text-on-surface font-semibold">
              Backend & Data Layer
            </span>
            <span className="font-label-md text-label-md text-primary font-medium">78% Coverage</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full bg-primary rounded-full w-[78%]"></div>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Found: Node.js, PostgreSQL, REST</span>
            <span className="text-error font-medium">Gap: GraphQL</span>
          </div>
        </div>

        {/* Category 3 */}
        <div className="flex flex-col space-y-space-xs">
          <div className="flex justify-between items-center">
            <span className="font-title-md text-title-md text-on-surface font-semibold">
              DevOps & Cloud Infra
            </span>
            <span className="font-label-md text-label-md text-tertiary font-medium">62% Coverage</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full bg-tertiary rounded-full w-[62%]"></div>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Found: Docker, Git</span>
            <span className="text-error font-medium">Gap: AWS Lambda, K8s, CI/CD</span>
          </div>
        </div>
      </section>

      {/* Resume Strengths */}
      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 space-y-space-sm">
        <div className="flex items-center gap-space-xs">
          <span
            className="material-symbols-outlined text-primary text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            thumb_up
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Resume Strengths</h2>
        </div>
        <div className="flex flex-col space-y-space-xs pt-space-xs">
          <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
              query_stats
            </span>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                Clear Quantifiable Metrics
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Detected 7 concrete data achievements (e.g., "Reduced latency by 34%", "scaled to 120k MAU"). Recruiters rank this in top percentile.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
              rocket_launch
            </span>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                Strong Project Impact Statements
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Bullet formulations follow the Google X-Y-Z formula cleanly without passive voice ambiguity.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Formatting & Parser Warnings */}
      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 space-y-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-error text-[22px]">warning</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Formatting & Parser Warnings
          </h2>
        </div>
        <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-error-container text-on-error-container">
          <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0">table_rows</span>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md font-semibold">
              Found 1 Multi-Column Table Format Warning
            </span>
            <span className="font-body-sm text-body-sm mt-0.5">
              Section "Technical Skills (Page 2)" uses nested tabular grids. Older ATS scrapers (Workday v2022) may concatenate column text into illegible strings.
            </span>
          </div>
        </div>
      </section>

      {/* Actionable AI Fixes */}
      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 space-y-space-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Actionable AI Fixes</h2>
          <span className="font-label-sm text-label-sm text-on-surface-variant">3 prioritized</span>
        </div>
        <div className="flex flex-col space-y-space-sm">
          <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center shrink-0 mt-0.5 font-bold">
              1
            </span>
            <div className="flex flex-col space-y-0.5">
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                Integrate CI/CD in E-Commerce Experience
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Update bullet 3 to: <em>"Engineered GitHub Actions CI/CD pipeline, reducing deployment failure rates by 42%."</em>
              </span>
            </div>
          </div>

          <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center shrink-0 mt-0.5 font-bold">
              2
            </span>
            <div className="flex flex-col space-y-0.5">
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                Flatten Two-Column Skills Grid
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Convert the table structure to clean comma-delimited single lines with standardized headers (e.g., Languages, Frameworks, Cloud).
              </span>
            </div>
          </div>

          <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center shrink-0 mt-0.5 font-bold">
              3
            </span>
            <div className="flex flex-col space-y-0.5">
              <span className="font-title-md text-title-md text-on-surface font-semibold">
                Mention Serverless / AWS Lambda explicitly
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Pair with your existing Node microservices description to address high-weight recruiter filter tags.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter Benchmark Engine */}
      <section className="relative rounded-xl overflow-hidden shadow-sm bg-inverse-surface text-inverse-on-surface p-space-md flex flex-col space-y-space-xs">
        <div className="flex items-center gap-space-xs text-primary-fixed font-label-md text-label-md uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">insights</span>
          <span>Recruiter Benchmark Engine</span>
        </div>
        <span className="font-headline-sm text-headline-sm font-semibold">
          Ready for Recruiter Submission?
        </span>
        <p className="font-body-sm text-body-sm text-surface-container-highest">
          Candidate profiles optimized past 85 ATS score receive 3.2x more callback invitations within 72 hours.
        </p>
      </section>

      {/* Sticky Bottom Actions Container */}
      <section className="flex flex-col space-y-space-sm pt-space-xs pb-space-sm">
        {/* Direct PDF Export Action Button */}
        <button
          className="w-full h-12 rounded-lg bg-linear-to-r from-primary to-primary-container text-on-primary font-title-md text-title-md font-bold flex items-center justify-center gap-space-sm shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          onClick={handleDownloadOptimizedResume}
          disabled={isExportingResume}
          type="button"
        >
          <span className={`material-symbols-outlined text-[22px] ${isExportingResume ? 'animate-spin' : ''}`}>
            {isExportingResume ? 'refresh' : 'picture_as_pdf'}
          </span>
          <span>{isExportingResume ? 'Generating PDF File...' : 'Export Optimized Resume (PDF)'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="h-11 rounded-lg border border-surface-container bg-surface-container-low text-on-surface font-title-md text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors cursor-pointer"
            onClick={() => setShowPreviewModal(true)}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
            <span>Preview Resume</span>
          </button>

          <button
            className="h-11 rounded-lg border border-surface-container bg-surface-container-low text-on-surface font-title-md text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
            onClick={handleDownloadDossier}
            disabled={isExportingDossier}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">
              {exportSuccess ? 'check_circle' : 'assignment'}
            </span>
            <span>{isExportingDossier ? 'Exporting...' : 'ATS Audit Report'}</span>
          </button>
        </div>

        <button
          className="w-full h-10 rounded-lg text-on-surface-variant font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 hover:text-on-surface cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          <span>Upload Another Resume</span>
        </button>
      </section>

      {/* ========================================================
          FLOATING SUCCESS TOAST
      ======================================================== */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-primary/40">
            <span className="material-symbols-outlined text-primary-fixed text-[22px]">
              check_circle
            </span>
            <div className="text-xs font-semibold">{downloadSuccessToast}</div>
          </div>
        </div>
      )}

      {/* ========================================================
          OPTIMIZED RESUME PREVIEW & EXPORT MODAL
      ======================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-container bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  picture_as_pdf
                </span>
                <div>
                  <h3 className="font-title-md text-sm font-bold text-on-surface">
                    ATS-Optimized Resume Preview
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Formatted for Workday, Taleo, Greenhouse & Enterprise ATS parsers
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyResumeText}
                  className="px-2.5 py-1.5 rounded-lg border border-surface-container hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copy plain text"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {copiedResume ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedResume ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  disabled={isExportingResume}
                  onClick={handleDownloadOptimizedResume}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:opacity-95 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                  title="Export and download as PDF file"
                >
                  <span className={`material-symbols-outlined text-[15px] ${isExportingResume ? 'animate-spin' : ''}`}>
                    {isExportingResume ? 'refresh' : 'download'}
                  </span>
                  <span>{isExportingResume ? 'Exporting...' : 'Export PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer"
                  title="Close preview"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Document Body (Rendered like an A4 Sheet) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-surface-container-high/30">
              <div className="max-w-2xl mx-auto bg-white text-gray-900 p-6 sm:p-10 rounded-xl shadow-lg border border-gray-200 font-sans text-xs space-y-4">
                {/* Resume Header */}
                <div className="text-center border-b border-gray-300 pb-3 space-y-1">
                  <h1 className="text-xl font-bold tracking-tight text-gray-900">
                    {currentOptimizedResume.candidateName.toUpperCase()}
                  </h1>
                  <p className="text-xs font-bold text-emerald-800">
                    {currentOptimizedResume.targetRole.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {currentOptimizedResume.email} • {currentOptimizedResume.phone} • {currentOptimizedResume.location} • {currentOptimizedResume.linkedin} • {currentOptimizedResume.github}
                  </p>
                </div>

                {/* Professional Summary */}
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-800/40 pb-0.5">
                    Professional Summary
                  </h2>
                  <p className="text-[11.5px] leading-relaxed text-gray-700">
                    {currentOptimizedResume.summary}
                  </p>
                </div>

                {/* Technical Competencies */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-800/40 pb-0.5">
                    Technical Competencies (ATS-Optimized)
                  </h2>
                  <div className="space-y-1 text-[11px] text-gray-800">
                    {currentOptimizedResume.skills.map((grp) => (
                      <div key={grp.category} className="flex flex-col sm:flex-row sm:items-start gap-1">
                        <strong className="text-gray-900 font-bold shrink-0">{grp.category}:</strong>
                        <span className="text-gray-700">{grp.items.join('  •  ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Experience */}
                <div className="space-y-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-800/40 pb-0.5">
                    Professional Experience
                  </h2>
                  {currentOptimizedResume.experience.map((exp) => (
                    <div key={exp.company} className="space-y-1">
                      <div className="flex justify-between items-baseline font-bold text-gray-900">
                        <span>{exp.role}</span>
                        <span className="text-[10px] text-gray-500 font-normal">
                          {exp.period} | {exp.location}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-800">{exp.company}</div>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-700">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="leading-snug">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Key Technical Projects */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-800/40 pb-0.5">
                    Key Technical Projects
                  </h2>
                  {currentOptimizedResume.projects.map((proj) => (
                    <div key={proj.title} className="space-y-1">
                      <div className="flex justify-between items-baseline font-bold text-gray-900">
                        <span>{proj.title}</span>
                        <span className="text-[10px] text-gray-500 font-normal">{proj.period}</span>
                      </div>
                      <div className="text-[10.5px] italic text-emerald-800">
                        Technologies: {proj.technologies.join(', ')}
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-700">
                        {proj.bullets.map((b, i) => (
                          <li key={i} className="leading-snug">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-800/40 pb-0.5">
                    Education
                  </h2>
                  {currentOptimizedResume.education.map((edu, idx) => (
                    <div key={idx} className="space-y-0.5 text-[11px]">
                      <div className="flex justify-between items-baseline font-bold text-gray-900">
                        <span>{edu.degree}</span>
                        <span className="text-[10px] text-gray-500 font-normal">{edu.period}</span>
                      </div>
                      <div className="text-gray-700">{edu.institution} • {edu.scoreOrDetails}</div>
                    </div>
                  ))}
                </div>

                {/* Certifications */}
                {currentOptimizedResume.certifications && (
                  <div className="space-y-1 pt-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-800/40 pb-0.5">
                      Certifications
                    </h2>
                    <p className="text-[11px] text-gray-700">
                      {currentOptimizedResume.certifications.join('  •  ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-surface-container bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                <span>Matches Taleo, Greenhouse & Workday parser standards</span>
              </span>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-surface-container hover:bg-surface-container text-on-surface text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={isExportingResume}
                  onClick={handleDownloadOptimizedResume}
                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:opacity-95 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isExportingResume ? 'animate-spin' : ''}`}>
                    {isExportingResume ? 'refresh' : 'download'}
                  </span>
                  <span>{isExportingResume ? 'Exporting PDF...' : 'Download PDF File'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
