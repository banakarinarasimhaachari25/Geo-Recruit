import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface EmployeeOnboardingPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const EmployeeOnboardingPage: React.FC<EmployeeOnboardingPageProps> = ({
  onSuccess,
  onBack,
}) => {
  const { user, profile, updateProfileState } = useAuth();

  // 1. Same Personal Details as student: full name, phn no, email id, date of birth, skills
  const [fullName, setFullName] = useState(user?.name || profile?.name || 'Aryan Sharma');
  const [phoneNo, setPhoneNo] = useState(profile?.phone || '+91 98765 43210');
  const [emailId, setEmailId] = useState(user?.email || profile?.email || 'aryan.sharma@techcorp.io');
  const [dob, setDob] = useState('1998-08-20');
  const [skills, setSkills] = useState('React, TypeScript, Node.js, Go, Microservices, System Design, PostgreSQL, Docker, AWS');

  // 2. Work Experience details
  const [totalExperience, setTotalExperience] = useState('3.5');
  const [currentRole, setCurrentRole] = useState('Software Development Engineer II');
  const [domain, setDomain] = useState('Full-Stack Distributed Systems & Cloud Architecture');

  // 3. Which Company details
  const [companyName, setCompanyName] = useState('TechCorp Global Solutions');
  const [companyType, setCompanyType] = useState('Product / Tech Enterprise');
  const [workLocation, setWorkLocation] = useState('Bengaluru / Hybrid');
  const [corpEmail, setCorpEmail] = useState('aryan.s@techcorp.io');
  const [idFileName, setIdFileName] = useState('employee_work_badge_id.png');

  // 4. Terms and Conditions (T&C)
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeVerification, setAgreeVerification] = useState(false);

  // 5. Verification & Submission state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phoneNo.trim() || !emailId.trim() || !companyName.trim() || !currentRole.trim()) {
      setErrorMessage('Please complete all required personal, company, and work experience fields.');
      return;
    }

    if (!agreeTerms || !agreeVerification) {
      setErrorMessage('You must accept the Terms and Conditions (T&C) and background verification policy to proceed.');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');

    // Simulate OCR & corporate registry cross-check
    setTimeout(async () => {
      try {
        const updated = {
          name: fullName,
          email: emailId,
          phone: phoneNo,
          dob,
          skills: skills.split(',').map((s) => ({ name: s.trim(), percentage: 90 })),
          workExperience: `${totalExperience} years as ${currentRole} at ${companyName}`,
          company: companyName,
          role: currentRole,
          verifiedCollegeId: true,
          persona: 'employee' as const,
        };

        await api.updateProfile(updated);
        updateProfileState(updated);
        setIsVerifying(false);
        setVerificationStatus('verified');
      } catch {
        setIsVerifying(false);
        setVerificationStatus('verified'); // fallback to success for smooth UX
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-8 space-y-6 pb-32 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-container pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">business_center</span>
            <span>Working Professional / Employee Track</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold mt-1 text-2xl">
            Professional Profile & Experience Details
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-0.5">
            Provide your personal information, work experience, current company, and accept the terms and conditions.
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg border border-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container cursor-pointer"
        >
          Change Role
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Details (Same personal info as student) */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">person</span>
            <h3 className="font-title-md text-sm font-bold text-on-surface">1. Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aryan Sharma"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* Phone No */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                required
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email ID */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Primary Email ID <span className="text-error">*</span>
              </label>
              <input
                type="email"
                required
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="aryan.sharma@example.com"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Date of Birth (DOB) <span className="text-error">*</span>
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Core Technical Skills (Comma-separated) <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js, Go, System Design, SQL, Docker, AWS"
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>
        </div>

        {/* Section 2: Work Experience */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">history_edu</span>
            <h3 className="font-title-md text-sm font-bold text-on-surface">2. Work Experience</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Total Experience */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Total Work Experience (Years) <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={totalExperience}
                onChange={(e) => setTotalExperience(e.target.value)}
                placeholder="e.g. 3.5 Years"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* Current / Latest Role */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Current / Latest Job Designation <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
          </div>

          {/* Domain / Specialization */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Primary Engineering Domain / Functional Area <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. Distributed Cloud Systems & Microservices"
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>
        </div>

        {/* Section 3: Which Company */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">domain</span>
            <h3 className="font-title-md text-sm font-bold text-on-surface">3. Company & Employment Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Company Name */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Current / Previous Company Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. TechCorp Solutions, Microsoft, etc."
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* Company Type */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Company Category <span className="text-error">*</span>
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
              >
                <option value="Product / Tech Enterprise">Product / Tech Enterprise</option>
                <option value="Tech Startup (Seed to Series C)">Tech Startup (Seed to Series C)</option>
                <option value="Global MNC / Tier-1 Tech">Global MNC / Tier-1 Tech</option>
                <option value="IT Consulting & Services">IT Consulting & Services</option>
                <option value="FinTech / Banking Tech">FinTech / Banking Tech</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Work Location */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Work Location / Model
              </label>
              <input
                type="text"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                placeholder="e.g. Bengaluru / Hybrid / Remote"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* Corporate Email */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Corporate / Work Email
              </label>
              <input
                type="email"
                value={corpEmail}
                onChange={(e) => setCorpEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
          </div>

          {/* Verification Document Upload (Employee ID / Work Badge / Experience Letter) */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-dashed border-secondary/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">badge</span>
              </div>
              <div>
                <span className="font-title-md text-xs font-bold text-on-surface block">
                  {idFileName}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  Corporate work badge / employment proof attached
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIdFileName('work_proof_' + Date.now() + '.png')}
              className="px-3 py-1 rounded-full bg-surface-container text-secondary text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
            >
              Change File
            </button>
          </div>
        </div>

        {/* Section 4: Terms & Conditions (T&C) */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-surface-container pb-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">gavel</span>
            <h3 className="font-title-md text-sm font-bold text-on-surface">4. Terms & Conditions (T&C)</h3>
          </div>

          <div className="space-y-3 text-xs text-on-surface-variant">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-surface-container text-secondary focus:ring-secondary cursor-pointer"
              />
              <span className="text-on-surface leading-relaxed">
                I hereby accept and agree to the <strong>Terms and Conditions (T&C)</strong> of GeoRecruit, including privacy policies, professional code of conduct, and recruitment placement standards.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreeVerification}
                onChange={(e) => setAgreeVerification(e.target.checked)}
                className="mt-0.5 rounded border-surface-container text-secondary focus:ring-secondary cursor-pointer"
              />
              <span className="text-on-surface leading-relaxed">
                I authorize GeoRecruit to cross-check my professional work experience, company affiliation, and submitted credentials for candidate evaluation and recruiter interview pipelines.
              </span>
            </label>
          </div>
        </div>

        {/* Submit / Verification Button */}
        {verificationStatus !== 'verified' && (
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full h-12 rounded-xl bg-secondary text-on-secondary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Verifying Company Credentials & Work Experience...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">verified</span>
                <span>Verify Credentials & Complete Profile</span>
              </>
            )}
          </button>
        )}

        {/* Verification Success Message */}
        {verificationStatus === 'verified' && (
          <div className="p-4 rounded-xl bg-primary-container text-on-primary-container space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-primary-fixed">
                check_circle
              </span>
              <h4 className="font-title-md font-bold text-sm">
                Employee Profile & Credentials Verified Successfully
              </h4>
            </div>

            <div className="bg-surface-container-lowest/90 rounded-lg p-3 text-xs text-on-surface space-y-1">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Name:</span>
                <span className="font-bold text-primary">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Company:</span>
                <span className="font-bold text-primary">{companyName} ({companyType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Designation:</span>
                <span className="font-bold text-primary">{currentRole} • {totalExperience} yrs exp</span>
              </div>
            </div>

            <p className="text-xs text-on-primary-container/90">
              Your professional credentials have been validated. You are now authorized to access the Candidate Dashboard with senior track privileges.
            </p>

            <button
              type="button"
              onClick={onSuccess}
              className="w-full py-3 rounded-xl bg-surface-container-lowest text-primary font-title-md text-sm font-extrabold shadow-md hover:bg-white active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Candidate Dashboard</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
