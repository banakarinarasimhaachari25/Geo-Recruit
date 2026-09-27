import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface StudentOnboardingPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const StudentOnboardingPage: React.FC<StudentOnboardingPageProps> = ({
  onSuccess,
  onBack,
}) => {
  const { user, profile, updateProfileState } = useAuth();

  // 1. Personal & Educational Form fields specified by user:
  // full name, phn no, email id, date of birth, eduacation field, college name, avg cgpa, skills
  const [fullName, setFullName] = useState(user?.name || profile?.name || 'Aryan Sharma');
  const [phoneNo, setPhoneNo] = useState(profile?.phone || '+91 98765 43210');
  const [emailId, setEmailId] = useState(user?.email || profile?.email || 'aryan.sharma@example.edu');
  const [dob, setDob] = useState('2003-05-14');
  const [educationField, setEducationField] = useState('Computer Science & Engineering');
  const [collegeName, setCollegeName] = useState('National Institute of Technology');
  const [avgCgpa, setAvgCgpa] = useState('8.6');
  const [skills, setSkills] = useState('React.js, TypeScript, Node.js, Python, Data Structures & Algorithms, SQL');

  // 2. ID Proof Upload & Cross-check state
  const [idFileName, setIdFileName] = useState('student_college_id_card.png');
  const [idFileSelected, setIdFileSelected] = useState(true);
  const [isCrossChecking, setIsCrossChecking] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'mismatch'>('idle');
  const [crossCheckReport, setCrossCheckReport] = useState<{
    nameMatch: boolean;
    collegeMatch: boolean;
    fieldMatch: boolean;
    extractedName: string;
    extractedCollege: string;
    extractedField: string;
    extractedId: string;
  } | null>(null);

  const handleCrossCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !collegeName.trim() || !emailId.trim()) {
      alert('Please fill out all required personal and educational details.');
      return;
    }

    setIsCrossChecking(true);
    setVerificationStatus('idle');

    // Simulate OCR extraction from ID proof and compare with website form details
    setTimeout(async () => {
      // In this realistic OCR check:
      // The simulated OCR extracts the normalized institutional details
      const extractedName = 'Aryan Sharma';
      const extractedCollege = 'National Institute of Technology';
      const extractedField = 'Computer Science & Engineering';
      const extractedId = '2021CS0492';

      // Cross check Name
      const normInputName = fullName.toLowerCase().trim();
      const normExtName = extractedName.toLowerCase().trim();
      const nameMatch = normInputName.includes(normExtName) || normExtName.includes(normInputName);

      // Cross check College
      const normInputCollege = collegeName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normExtCollege = extractedCollege.toLowerCase().replace(/[^a-z0-9]/g, '');
      const collegeMatch =
        normInputCollege.includes(normExtCollege) || normExtCollege.includes(normInputCollege);

      // Cross check Field
      const normInputField = educationField.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normExtField = extractedField.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fieldMatch =
        normInputField.includes(normExtField) ||
        normExtField.includes(normInputField) ||
        normInputField.includes('cs') ||
        normInputField.includes('computer');

      const allMatched = nameMatch && collegeMatch;

      setCrossCheckReport({
        nameMatch,
        collegeMatch,
        fieldMatch,
        extractedName,
        extractedCollege,
        extractedField,
        extractedId,
      });

      setIsCrossChecking(false);

      if (allMatched) {
        setVerificationStatus('verified');
        // Save to backend and local profile
        const updated = {
          name: fullName,
          email: emailId,
          phone: phoneNo,
          dob,
          educationField,
          college: collegeName,
          cgpa: avgCgpa,
          skills: skills.split(',').map((s) => ({ name: s.trim(), percentage: 85 })),
          verifiedCollegeId: true,
          persona: 'student' as const,
        };
        await api.updateProfile(updated);
        updateProfileState(updated);
      } else {
        setVerificationStatus('mismatch');
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-8 space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-container pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Student Onboarding & Credential Verification</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-extrabold mt-1 text-2xl">
            Personal & Educational Profile
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-0.5">
            Please enter your complete student profile details and upload your College ID proof for automated cross-checking.
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg border border-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container cursor-pointer"
        >
          Change Role
        </button>
      </div>

      <form onSubmit={handleCrossCheck} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-2">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
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
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email ID */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Email ID <span className="text-error">*</span>
              </label>
              <input
                type="email"
                required
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="name@university.edu"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Educational Details */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-2">
            <span className="material-symbols-outlined text-primary text-[20px]">school</span>
            <h3 className="font-title-md text-sm font-bold text-on-surface">2. Educational Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Education Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Education Field / Branch <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={educationField}
                onChange={(e) => setEducationField(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* College Name */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                College Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Average CGPA */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Average CGPA / Grade <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={avgCgpa}
                onChange={(e) => setAvgCgpa(e.target.value)}
                placeholder="e.g. 8.6 / 10"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Skills (Comma-separated) <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, Python, DSA, SQL"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Section 3: College ID Proof Upload & Cross-check */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              <h3 className="font-title-md text-sm font-bold text-on-surface">
                3. College ID Proof Verification
              </h3>
            </div>
            <span className="text-xs text-primary font-bold">Mandatory Verification</span>
          </div>

          <p className="font-body-sm text-xs text-on-surface-variant">
            Upload your valid College ID card photo or scanned document. Our OCR engine will cross-check the details on your ID against the information entered on this website.
          </p>

          {/* Upload Drop Zone */}
          <div className="p-4 rounded-xl bg-surface-container-low border-2 border-dashed border-primary/40 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[28px]">document_scanner</span>
            </div>
            <span className="font-title-md text-xs font-bold text-on-surface">
              {idFileName}
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">
              Simulated institutional photo document attached (PNG/JPG)
            </span>
            <button
              type="button"
              onClick={() => setIdFileName('uploaded_id_' + Date.now() + '.png')}
              className="mt-1 px-3 py-1 rounded-full bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
            >
              Choose Different ID File
            </button>
          </div>

          {/* Trigger Cross-Check Button */}
          {verificationStatus !== 'verified' && (
            <button
              type="submit"
              disabled={isCrossChecking}
              className="w-full h-12 rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCrossChecking ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  <span>Scanning ID & Cross-Checking Details...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span>Cross-Check ID with Entered Details</span>
                </>
              )}
            </button>
          )}

          {/* Verification Result: SUCCESS MATCH */}
          {verificationStatus === 'verified' && crossCheckReport && (
            <div className="p-4 rounded-xl bg-primary-container text-on-primary-container space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-primary-fixed">
                  check_circle
                </span>
                <h4 className="font-title-md font-bold text-sm">
                  College ID Verified Successfully
                </h4>
              </div>

              {/* Cross-Check Comparison Matrix */}
              <div className="bg-surface-container-lowest/90 rounded-lg p-3 text-xs text-on-surface space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Full Name:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <span>{crossCheckReport.extractedName}</span>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">College Institution:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <span>{crossCheckReport.extractedCollege}</span>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Education Field & Roll:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <span>{crossCheckReport.extractedId} · {crossCheckReport.extractedField}</span>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-on-primary-container/90">
                All details match perfectly. You are authorized to access the Candidate Dashboard.
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

          {/* Verification Result: MISMATCH WARNING */}
          {verificationStatus === 'mismatch' && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-error">warning</span>
                <h4 className="font-title-md font-bold text-sm">Details do not match</h4>
              </div>
              <p className="text-xs">
                Details do not match. Please check your information or upload the ID again.
              </p>
              <div className="text-[11px] bg-white/70 p-2 rounded text-on-surface">
                <strong>Tip:</strong> Ensure your Full Name ({fullName}) matches the student name on your institution card ({crossCheckReport?.extractedName || 'Aryan Sharma'}) and College name matches.
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
