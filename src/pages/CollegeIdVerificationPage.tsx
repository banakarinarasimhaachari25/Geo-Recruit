import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CollegeIdVerificationPageProps {
  onNavigate: (path: string, params?: any) => void;
}

export const CollegeIdVerificationPage: React.FC<CollegeIdVerificationPageProps> = ({
  onNavigate,
}) => {
  const { profile, refreshProfile } = useAuth();
  const [studentName, setStudentName] = useState(profile?.name || 'Aryan Sharma');
  const [collegeName, setCollegeName] = useState(profile?.college || 'National Institute of Technology');
  const [studentId, setStudentId] = useState(profile?.studentId || '2021CS0492');
  const [course, setCourse] = useState('B.Tech');
  const [department, setDepartment] = useState('Computer Science & Engineering');

  const [fileName, setFileName] = useState('student_id_card.jpg');
  const [isScanning, setIsScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    message: string;
    extractedData?: any;
    mismatches?: string[];
  } | null>(
    profile?.verifiedCollegeId
      ? {
          verified: true,
          message: 'College ID Verified Successfully',
          extractedData: {
            name: profile?.name || 'Aryan Sharma',
            college: profile?.college || 'National Institute of Technology',
            studentId: profile?.studentId || '2021CS0492',
            course: 'B.Tech',
            department: 'Computer Science & Engineering',
          },
        }
      : null
  );

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setVerificationResult(null);

    try {
      const res = await api.verifyCollegeId({
        fileName,
        name: studentName,
        college: collegeName,
        studentId,
        course,
        department,
      });

      setVerificationResult(res);
      if (res.verified) {
        await refreshProfile();
      }
    } catch {
      setVerificationResult({
        verified: false,
        message: 'Details do not match. Please check your information or upload the ID again.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 py-6 space-y-6 pb-28">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-high text-primary font-label-md text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>OCR Institutional Authentication</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-1">
          College ID Verification
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-0.5">
          Authenticate student status to unlock verified badge for Google, Microsoft & partner campus drives.
        </p>
      </div>

      {/* Status Banner */}
      {verificationResult?.verified && (
        <div className="p-4 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-primary-fixed">verified</span>
            <div>
              <h3 className="font-title-md font-bold text-sm">
                College ID Verified Successfully
              </h3>
              <p className="text-xs text-on-primary-container/90">
                Tier-1 verified badge applied to your profile and recruiter dossier.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('candidate-dashboard')}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-bold text-xs shadow-xs"
          >
            Dashboard
          </button>
        </div>
      )}

      {verificationResult && !verificationResult.verified && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container space-y-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-error">error</span>
            <h3 className="font-title-md font-bold text-sm">Details do not match</h3>
          </div>
          <p className="text-xs">
            {verificationResult.message}
          </p>
          {verificationResult.mismatches && (
            <ul className="list-disc list-inside text-xs space-y-0.5 pl-1">
              {verificationResult.mismatches.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Upload & Form */}
      <form onSubmit={handleVerify} className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4">
        {/* Upload Zone */}
        <div className="p-4 rounded-xl bg-surface-container-low border-2 border-dashed border-primary/30 text-center flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-[36px] text-primary">badge</span>
          <span className="font-title-md text-on-surface text-sm font-semibold mt-1">
            {fileName}
          </span>
          <span className="font-body-sm text-on-surface-variant text-xs mt-0.5">
            PNG, JPG, PDF document (Max 10 MB)
          </span>
          <button
            type="button"
            onClick={() => setFileName('aryan_college_id_card.png')}
            className="mt-2 px-3 py-1 rounded-full bg-surface-container text-primary font-label-md text-xs font-semibold hover:bg-surface-container-high"
          >
            Simulate Scan Upload
          </button>
        </div>

        {/* Expected Details to Match */}
        <div className="space-y-3">
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Student Full Name
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              College / University Name
            </label>
            <input
              type="text"
              required
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Student Roll / ID
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Course Degree
              </label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Department
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isScanning}
          className="w-full h-12 rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              <span>Running OCR Verification...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
              <span>Process & Verify College ID</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
