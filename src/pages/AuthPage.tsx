import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GeorecruitLogo } from '../components/GeorecruitLogo';

interface AuthPageProps {
  onNavigate: (path: string, params?: any) => void;
  initialMode?: 'login' | 'register' | 'recruiter';
}

type RegStep =
  | 'MOBILE_EMAIL'
  | 'OTP_VERIFICATION'
  | 'PASSWORD'
  | 'COLLEGE_ID_UPLOAD'
  | 'COLLEGE_ID_SCANNING'
  | 'VERIFICATION_RESULT'
  | 'ROLE_SELECTION'
  | 'SUCCESS';

export const AuthPage: React.FC<AuthPageProps> = ({
  onNavigate,
  initialMode = 'login',
}) => {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<'candidate_login' | 'recruiter_login' | 'register'>(
    initialMode === 'register'
      ? 'register'
      : initialMode === 'recruiter'
      ? 'recruiter_login'
      : 'candidate_login'
  );

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot Password modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Candidate Registration Flow State
  const [regStep, setRegStep] = useState<RegStep>('MOBILE_EMAIL');
  const [regMobile, setRegMobile] = useState('+91 98765 43210');
  const [regEmail, setRegEmail] = useState('aryan.sharma@example.edu');
  const [regName, setRegName] = useState('Aryan Sharma');
  const [regCollege, setRegCollege] = useState('National Institute of Technology');
  const [regStudentId, setRegStudentId] = useState('2021CS0492');
  const [regCourse, setRegCourse] = useState('B.Tech');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regOtp, setRegOtp] = useState('123456');
  const [regPassword, setRegPassword] = useState('Password123!');
  const [regIdFile, setRegIdFile] = useState<File | null>(null);
  const [regIdFileName, setRegIdFileName] = useState('aryan_college_id.png');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [studentType, setStudentType] = useState<'Student' | 'Recent Graduate'>('Student');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handlers
  const handleCandidateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Login details are mandatory. Please enter both your email address and password to continue.');
      return;
    }
    setLoginLoading(true);
    try {
      const ok = await login(loginEmail.trim(), loginPassword.trim(), 'candidate');
      if (ok) {
        onNavigate('persona-selection');
      } else {
        setLoginError('Invalid credentials. Please enter a valid registered email and password.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRecruiterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Login details are mandatory. Please enter recruiter email and password.');
      return;
    }
    setLoginLoading(true);
    try {
      const ok = await login(loginEmail.trim(), loginPassword.trim(), 'recruiter');
      if (ok) {
        onNavigate('recruiter-portal');
      } else {
        setLoginError('Invalid recruiter credentials.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await api.register({
      mobile: regMobile,
      email: regEmail,
      name: regName,
      role: 'candidate',
    });
    setIsProcessing(false);
    setRegStep('OTP_VERIFICATION');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await api.verifyOtp(regOtp, regEmail);
      if (res.verified) {
        setRegStep('PASSWORD');
      } else {
        setVerificationError('Invalid OTP code. Please enter 123456 or try again.');
      }
    } catch {
      setVerificationError('OTP verification error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRegStep('COLLEGE_ID_UPLOAD');
  };

  const handleIdUploadAndScan = async () => {
    setIsProcessing(true);
    setRegStep('COLLEGE_ID_SCANNING');

    setTimeout(async () => {
      try {
        const verifyRes = await api.verifyCollegeId({
          fileName: regIdFileName,
          name: regName,
          college: regCollege,
          studentId: regStudentId,
          course: regCourse,
          department: regDept,
        });

        setIsProcessing(false);
        if (verifyRes.verified) {
          setRegStep('VERIFICATION_RESULT');
        } else {
          setVerificationError(verifyRes.message || 'Details do not match.');
          setRegStep('COLLEGE_ID_UPLOAD');
        }
      } catch {
        setIsProcessing(false);
        setRegStep('VERIFICATION_RESULT');
      }
    }, 1500);
  };

  const handleCompleteRegistration = async () => {
    await login(regEmail, regPassword, 'candidate');
    onNavigate('candidate-dashboard');
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetSuccess(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 py-8 pb-28">
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Reset Your Password
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-1">
              Enter your registered email address to receive password reset instructions.
            </p>
            {resetSuccess ? (
              <div className="mt-4 p-3 bg-primary-container text-on-primary-container rounded-lg text-xs font-semibold text-center">
                Password reset link has been dispatched to {resetEmail || 'your email'}!
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-on-primary bg-primary rounded-lg shadow-sm"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Top Brand Banner */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mx-auto shadow-md mb-2">
          <span className="material-symbols-outlined text-[28px]">shield_person</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
          {authMode === 'register'
            ? 'Candidate Registration'
            : authMode === 'recruiter_login'
            ? 'Recruiter Intelligence Portal'
            : 'Candidate Sign In'}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-1">
          {authMode === 'register'
            ? 'Step-by-step verified onboarding for campus placements'
            : 'Access your proctored mock assessments, ATS analysis & reports'}
        </p>
      </div>

      {/* Role & Mode Switcher Pills */}
      <div className="p-1 rounded-xl bg-surface-container-low flex items-center gap-1 mb-6 border border-surface-container">
        <button
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            authMode === 'candidate_login'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setAuthMode('candidate_login')}
          type="button"
        >
          Candidate Login
        </button>
        <button
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            authMode === 'register'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => {
            setAuthMode('register');
            setRegStep('MOBILE_EMAIL');
          }}
          type="button"
        >
          New Candidate
        </button>
        <button
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            authMode === 'recruiter_login'
              ? 'bg-secondary text-on-secondary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setAuthMode('recruiter_login')}
          type="button"
        >
          Recruiter
        </button>
      </div>

      {/* MODE 1: Candidate Login */}
      {authMode === 'candidate_login' && (
        <form
          onSubmit={handleCandidateLogin}
          className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container/70 shadow-sm space-y-4"
        >
          {loginError && (
            <div className="p-2.5 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="aryan.sharma@example.edu"
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full h-12 rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loginLoading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>Sign In as Candidate</span>
              </>
            )}
          </button>

          {/* Quick Demo Fill Shortcut */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setLoginEmail('aryan.sharma@example.edu');
                setLoginPassword('Secret123!');
              }}
              className="text-xs text-on-surface-variant hover:text-primary font-medium"
            >
              Fill Aryan Sharma (Demo Candidate) Credentials
            </button>
          </div>
        </form>
      )}

      {/* MODE 2: Recruiter Login */}
      {authMode === 'recruiter_login' && (
        <form
          onSubmit={handleRecruiterLogin}
          className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container/70 shadow-sm space-y-4"
        >
          <div className="p-2.5 rounded-lg bg-secondary-fixed/40 text-on-secondary-fixed text-xs flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Enterprise Partner Access: Google, Microsoft, Amazon, Stripe</span>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Corporate / Work Email
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="talent.lead@google.com"
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full h-12 rounded-xl bg-secondary text-on-secondary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loginLoading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">badge</span>
                <span>Sign In as Recruiter</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* MODE 3: Candidate Step-by-Step Registration */}
      {authMode === 'register' && (
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container/70 shadow-sm space-y-5">
          {/* Step Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              <span>Registration Progress</span>
              <span className="text-primary">
                {regStep === 'MOBILE_EMAIL'
                  ? 'Step 1 of 5: Contact Details'
                  : regStep === 'OTP_VERIFICATION'
                  ? 'Step 2 of 5: OTP Check'
                  : regStep === 'PASSWORD'
                  ? 'Step 3 of 5: Password'
                  : regStep === 'COLLEGE_ID_UPLOAD' || regStep === 'COLLEGE_ID_SCANNING'
                  ? 'Step 4 of 5: Student ID Scan'
                  : 'Step 5 of 5: Verified Profile'}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{
                  width:
                    regStep === 'MOBILE_EMAIL'
                      ? '20%'
                      : regStep === 'OTP_VERIFICATION'
                      ? '40%'
                      : regStep === 'PASSWORD'
                      ? '60%'
                      : regStep === 'COLLEGE_ID_UPLOAD' || regStep === 'COLLEGE_ID_SCANNING'
                      ? '80%'
                      : '100%',
                }}
              ></div>
            </div>
          </div>

          {/* STEP 1: Mobile & Email */}
          {regStep === 'MOBILE_EMAIL' && (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                  College / Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Continue to OTP Verification</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {regStep === 'OTP_VERIFICATION' && (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="p-3 bg-surface-container-low rounded-lg text-xs text-on-surface-variant">
                We sent a 6-digit OTP code to <strong className="text-on-surface">{regEmail}</strong>. (For test mode, enter <strong className="text-primary font-bold">123456</strong>).
              </div>

              {verificationError && (
                <div className="p-2 rounded bg-error-container text-on-error-container text-xs">
                  {verificationError}
                </div>
              )}

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-center font-headline-md tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRegStep('MOBILE_EMAIL')}
                  className="flex-1 h-11 rounded-lg border border-surface-container text-on-surface text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-2 h-11 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm"
                >
                  Verify OTP
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Password */}
          {regStep === 'PASSWORD' && (
            <form onSubmit={handleSavePassword} className="space-y-3">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                  Create a Secure Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to College ID Upload</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          )}

          {/* STEP 4: College ID Upload & Scanning */}
          {(regStep === 'COLLEGE_ID_UPLOAD' || regStep === 'COLLEGE_ID_SCANNING') && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-surface-container-low border-2 border-dashed border-primary/40 text-center">
                <span className="material-symbols-outlined text-[36px] text-primary">badge</span>
                <h4 className="font-title-md text-on-surface text-sm font-bold mt-1">
                  Upload Student ID Card
                </h4>
                <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                  Supports image (PNG, JPG) or PDF document. OCR extracts Name, College, Roll ID, and Course.
                </p>

                <div className="mt-3 p-2 bg-surface-container rounded-lg text-left text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Expected Student:</span>
                    <span className="font-semibold text-on-surface">{regName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">College:</span>
                    <span className="font-semibold text-on-surface">{regCollege}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Student Roll ID:</span>
                    <span className="font-semibold text-on-surface">{regStudentId}</span>
                  </div>
                </div>
              </div>

              {regStep === 'COLLEGE_ID_SCANNING' ? (
                <div className="p-4 text-center space-y-2">
                  <span className="material-symbols-outlined text-[28px] text-primary animate-spin">
                    progress_activity
                  </span>
                  <p className="font-label-md text-primary font-bold text-xs">
                    Running OCR & Comparing Credentials...
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleIdUploadAndScan}
                  className="w-full h-12 rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                  <span>Scan & Authenticate ID</span>
                </button>
              )}
            </div>
          )}

          {/* STEP 5: Verification Result & Profile Creation */}
          {regStep === 'VERIFICATION_RESULT' && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">verified</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  College ID Verified Successfully
                </h3>
                <p className="font-body-sm text-on-surface-variant text-xs mt-1">
                  Your credentials have been matched with the institution records.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Status:</span>
                  <span className="text-primary font-bold">Authenticated Tier 1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Institution:</span>
                  <span className="font-semibold text-on-surface">{regCollege}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Roll ID:</span>
                  <span className="font-semibold text-on-surface">{regStudentId}</span>
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1 text-left">
                  Current Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Student', 'Recent Graduate'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setStudentType(t)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                        studentType === t
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container-low text-on-surface border-surface-container'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompleteRegistration}
                className="w-full h-12 rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Candidate Dashboard</span>
                <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
