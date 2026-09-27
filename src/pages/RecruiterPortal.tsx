import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RecruiterCandidate } from '../types';

interface RecruiterPortalProps {
  onNavigate: (path: string, params?: any) => void;
}

export const RecruiterPortal: React.FC<RecruiterPortalProps> = ({ onNavigate }) => {
  const [candidates, setCandidates] = useState<RecruiterCandidate[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<RecruiterCandidate | null>(null);
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);

  const companies = ['Google', 'Microsoft', 'Amazon', 'Stripe', 'Atlassian'];

  const fetchCandidates = async () => {
    try {
      const res = await api.getCandidates({
        role: selectedRole,
        status: selectedStatus,
        search: searchQuery,
      });
      setCandidates(res);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [selectedRole, selectedStatus, searchQuery]);

  const handleShortlist = async (cand: RecruiterCandidate) => {
    await api.shortlistCandidate(cand.id);
    fetchCandidates();
    if (selectedCandidate?.id === cand.id) {
      setSelectedCandidate({ ...selectedCandidate, status: 'Shortlisted' });
    }
  };

  const handleSendOffer = async (cand: RecruiterCandidate) => {
    await api.sendOffer(cand.id);
    fetchCandidates();
    setOfferSuccess(`Formal employment offer dispatched to ${cand.name}!`);
    setTimeout(() => setOfferSuccess(null), 3500);
    if (selectedCandidate?.id === cand.id) {
      setSelectedCandidate({ ...selectedCandidate, status: 'Offered' });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Candidate Dossier Detail Drawer/Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCandidate.avatarUrl}
                  alt={selectedCandidate.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40"
                />
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface text-base font-bold">
                    {selectedCandidate.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                    {selectedCandidate.degree} · {selectedCandidate.college}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Score Badges Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                    ATS Score
                  </span>
                  <p className="font-headline-md font-bold text-primary mt-0.5">
                    {selectedCandidate.atsScore}
                    <span className="text-xs text-on-surface-variant font-normal">/100</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                    AI Interview
                  </span>
                  <p className="font-headline-md font-bold text-secondary mt-0.5">
                    {selectedCandidate.interviewScore}
                    <span className="text-xs text-on-surface-variant font-normal">/10</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                    Integrity
                  </span>
                  <p className="font-title-md font-bold text-tertiary mt-1 text-xs">
                    {selectedCandidate.integrityStatus}
                  </p>
                </div>
              </div>

              {/* Verified Institutional Credential */}
              <div className="p-3 rounded-xl bg-primary-container/20 text-on-surface border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                  <span className="text-xs font-semibold">College ID & Identity Authenticated</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">
                  Tier 1 Certified
                </span>
              </div>

              {/* Skills */}
              <div>
                <span className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1.5 text-xs">
                  Validated Technical Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.keySkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-md text-xs font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedCandidate(null);
                    onNavigate('evaluation-report', { reportId: selectedCandidate.reportId || 'rep_1' });
                  }}
                  className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface font-title-md text-xs font-bold hover:bg-surface-container-highest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">analytics</span>
                  <span>Inspect Full AI Interview Report & Transcript</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleShortlist(selectedCandidate)}
                    disabled={selectedCandidate.status === 'Shortlisted' || selectedCandidate.status === 'Offered'}
                    className="py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                    <span>{selectedCandidate.status === 'Shortlisted' ? 'Shortlisted' : 'Shortlist Candidate'}</span>
                  </button>

                  <button
                    onClick={() => handleSendOffer(selectedCandidate)}
                    disabled={selectedCandidate.status === 'Offered'}
                    className="py-2.5 rounded-xl bg-secondary text-on-secondary font-title-md text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>{selectedCandidate.status === 'Offered' ? 'Offer Extended' : 'Send Formal Offer'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Banner Notification */}
      {offerSuccess && (
        <div className="p-3 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{offerSuccess}</span>
        </div>
      )}

      {/* RECRUITER DASHBOARD HEADER */}
      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[28px]">business_center</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-sm text-headline-sm text-on-surface font-extrabold text-lg">
                  GeoRecruit Recruiter Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase">
                  Enterprise
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                Authorized talent sourcing & proctored assessment inspection portal
              </p>
            </div>
          </div>

          {/* Switch to Candidate Dashboard Button */}
          <button
            onClick={() => onNavigate('candidate-dashboard')}
            className="px-3.5 py-2 rounded-xl bg-surface-container text-primary hover:bg-primary hover:text-on-primary font-title-md text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Switch to Candidate Dashboard</span>
          </button>
        </div>

        {/* Recruiter Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-surface-container">
          <div className="p-2.5 rounded-lg bg-surface-container-low text-center">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Active Openings</span>
            <p className="font-headline-sm text-base font-extrabold text-on-surface mt-0.5">18</p>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-low text-center">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Candidates Screened</span>
            <p className="font-headline-sm text-base font-extrabold text-primary mt-0.5">142</p>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-low text-center">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">AI Verified</span>
            <p className="font-headline-sm text-base font-extrabold text-secondary mt-0.5">96%</p>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-low text-center">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Offers Dispatched</span>
            <p className="font-headline-sm text-base font-extrabold text-tertiary mt-0.5">14</p>
          </div>
        </div>
      </div>

      {/* Target Company Selector & Filters */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-xs font-bold text-on-surface-variant uppercase">
              Target Company:
            </span>
            <div className="flex flex-wrap gap-1">
              {companies.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCompany(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCompany === c
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-on-surface-variant font-medium">
            Showing pipeline for <strong>{selectedCompany}</strong>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-surface-container">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, college institution, skills..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="Full-Stack">Full-Stack Developer</option>
            <option value="AI/ML">AI/ML Associate</option>
            <option value="DevOps">DevOps & Cloud</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none cursor-pointer"
          >
            <option value="all">All Pipeline Stages</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Offered">Offered</option>
          </select>
        </div>
      </div>

      {/* Candidate Pipeline Cards */}
      <div className="space-y-3">
        {candidates.map((cand) => (
          <div
            key={cand.id}
            className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
            onClick={() => setSelectedCandidate(cand)}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={cand.avatarUrl}
                  alt={cand.name}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-surface-container"
                />
                {cand.verifiedCollegeId && (
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]"
                    title="Verified Student ID"
                  >
                    <span className="material-symbols-outlined text-[10px]">check</span>
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-title-md text-on-surface font-bold text-sm truncate">
                    {cand.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                    {cand.matchPercent}% Match
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant text-xs truncate">
                  {cand.degree} · {cand.college}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {cand.keySkills.slice(0, 3).map((sk) => (
                    <span
                      key={sk}
                      className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface text-[10px]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics & Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container">
              <div className="text-right">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase block">
                  ATS Score
                </span>
                <span className="font-title-md text-primary font-bold text-sm">
                  {cand.atsScore}/100
                </span>
              </div>

              <div className="text-right">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase block">
                  AI Interview
                </span>
                <span className="font-title-md text-secondary font-bold text-sm">
                  {cand.interviewScore}/10
                </span>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-xs font-semibold text-on-surface">
                {cand.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
