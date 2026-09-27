import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProctorProvider } from './context/ProctorContext';
import { Navbar } from './components/Navbar';
import { MobileDrawer } from './components/MobileDrawer';
import { BottomNav } from './components/BottomNav';
import { ReviewModal } from './components/ReviewModal';
import { NotificationModal } from './components/NotificationModal';
import { AuthModal } from './components/AuthModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { ATSResumeAnalyzer } from './pages/ATSResumeAnalyzer';
import { InterviewHub } from './pages/InterviewHub';
import { LiveInterviewRoom } from './pages/LiveInterviewRoom';
import { AIReportPage } from './pages/AIReportPage';
import { PreviousReportsPage } from './pages/PreviousReportsPage';
import { CollegeIdVerificationPage } from './pages/CollegeIdVerificationPage';
import { RecruiterPortal } from './pages/RecruiterPortal';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { NewsPage } from './pages/NewsPage';
import { PersonaSelectionPage } from './pages/PersonaSelectionPage';
import { StudentOnboardingPage } from './pages/StudentOnboardingPage';
import { EmployeeOnboardingPage } from './pages/EmployeeOnboardingPage';

function MainApp() {
  const { role, switchRole } = useAuth();
  // Starts on landing-page when website is opened as requested
  const [currentPath, setCurrentPath] = useState<string>('landing-page');
  const [routeParams, setRouteParams] = useState<any>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  // Auth modal state (Login vs Sign In / New User with OTP)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const navigate = (path: string, params?: any) => {
    setCurrentPath(path);
    if (params) setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalTab(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedRole: 'candidate' | 'recruiter') => {
    switchRole(loggedRole);
    if (loggedRole === 'recruiter') {
      navigate('recruiter-portal');
    } else {
      // User requirement 4: after logging in display "hey [user name] i am and two options one is student and the other is employee"
      navigate('persona-selection');
    }
  };

  const isLiveInterview = currentPath === 'live-interview';

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Top Navbar with Centered GeoRecruit Logo and Top-Right Login / Sign In Options */}
      <Navbar
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenNotifications={() => setNotifModalOpen(true)}
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Slide-out Navigation Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentPath={currentPath}
        onNavigate={navigate}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        onNavigate={navigate}
      />

      {/* Global Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />

      {/* Auth Modal: Login (Email + Password) & Sign In (Email + Phone + OTP) */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-16 bg-surface">
        {currentPath === 'landing-page' && (
          <LandingPage
            onNavigate={navigate}
            onOpenReview={() => setReviewModalOpen(true)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Separated Candidate Dashboard */}
        {currentPath === 'candidate-dashboard' && (
          <CandidateDashboard onNavigate={navigate} onOpenReview={() => setReviewModalOpen(true)} />
        )}

        {currentPath === 'ats-resume-analyzer' && (
          <ATSResumeAnalyzer onNavigate={navigate} onOpenReview={() => setReviewModalOpen(true)} />
        )}

        {currentPath === 'interview-prep-hub' && (
          <InterviewHub
            onNavigate={navigate}
            initialRole={routeParams.role}
            initialMode={routeParams.mode}
            initialResumeText={routeParams.resumeText}
            initialResumeFileName={routeParams.resumeFileName}
          />
        )}

        {currentPath === 'live-interview' && (
          <LiveInterviewRoom
            onNavigate={navigate}
            role={routeParams.role}
            mode={routeParams.mode}
            difficulty={routeParams.difficulty}
            resumeText={routeParams.resumeText}
            resumeFileName={routeParams.resumeFileName}
          />
        )}

        {currentPath === 'evaluation-report' && (
          <AIReportPage onNavigate={navigate} reportId={routeParams.reportId} mode={routeParams.mode} />
        )}

        {currentPath === 'previous-reports' && (
          <PreviousReportsPage onNavigate={navigate} />
        )}

        {currentPath === 'college-id-verify' && (
          <CollegeIdVerificationPage onNavigate={navigate} />
        )}

        {/* Separated Recruiter Dashboard */}
        {currentPath === 'recruiter-portal' && (
          <RecruiterPortal onNavigate={navigate} />
        )}

        {currentPath === 'auth' && (
          <AuthPage onNavigate={navigate} initialMode={routeParams.mode} />
        )}

        {currentPath === 'profile' && (
          <ProfilePage onNavigate={navigate} />
        )}

        {currentPath === 'news' && (
          <NewsPage onNavigate={navigate} />
        )}

        {/* Persona Track Selection: Hey [User Name] I am (Student / Employee) */}
        {currentPath === 'persona-selection' && (
          <PersonaSelectionPage
            onSelectStudent={() => navigate('student-onboarding')}
            onSelectEmployee={() => navigate('employee-onboarding')}
          />
        )}

        {/* Student Onboarding: Personal info, Educational info, CGPA, College ID OCR Cross-check */}
        {currentPath === 'student-onboarding' && (
          <StudentOnboardingPage
            onSuccess={() => navigate('candidate-dashboard')}
            onBack={() => navigate('persona-selection')}
          />
        )}

        {/* Employee Onboarding: Personal info, Work Exp, Company Name, T&C verification */}
        {currentPath === 'employee-onboarding' && (
          <EmployeeOnboardingPage
            onSuccess={() => navigate('candidate-dashboard')}
            onBack={() => navigate('persona-selection')}
          />
        )}
      </main>

      {/* Global Floating "Give Review" CTA Button (Shown on non-interview screens) */}
      {!isLiveInterview && (
        <button
          aria-label="Give Review"
          className="fixed right-space-md bottom-24 z-30 h-11 px-space-md rounded-full bg-secondary text-on-secondary font-label-md text-label-md flex items-center gap-space-xs shadow-[0_10px_15px_-3px_rgba(15,23,42,0.12)] hover:opacity-95 active:scale-95 transition-all cursor-pointer font-bold"
          onClick={() => setReviewModalOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">rate_review</span>
          <span>Give Review</span>
        </button>
      )}

      {/* Bottom Sticky Navigation */}
      {!isLiveInterview && (
        <BottomNav currentPath={currentPath} onNavigate={navigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProctorProvider>
        <MainApp />
      </ProctorProvider>
    </AuthProvider>
  );
}
