import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReviewItem, NewsItem } from '../types';
import { GeorecruitLogo } from '../components/GeorecruitLogo';

interface LandingPageProps {
  onNavigate: (path: string, params?: any) => void;
  onOpenReview: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenReview,
  onOpenAuth,
}) => {
  const { isAuthenticated, role } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsItem | null>(null);

  useEffect(() => {
    api.getReviews().then((r) => setReviews(r.slice(0, 4)));
    api.getNews().then((n) => setNews(n.slice(0, 4)));
  }, []);

  const handleCandidateEntry = () => {
    // Prompt 4: "login details are mandatory to be entered to login without entering details dont give access"
    if (!isAuthenticated) {
      onOpenAuth('login');
    } else {
      onNavigate('persona-selection');
    }
  };

  const handleRecruiterEntry = () => {
    if (!isAuthenticated || role !== 'recruiter') {
      onOpenAuth('login');
    } else {
      onNavigate('recruiter-portal');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-8 space-y-12 pb-32 animate-in fade-in">
      {/* Educational Article Detail Modal */}
      {selectedNewsArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-[10px] px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold uppercase">
                {selectedNewsArticle.category}
              </span>
              <button
                onClick={() => setSelectedNewsArticle(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold text-base">
              {selectedNewsArticle.title}
            </h3>

            <div className="text-xs text-on-surface-variant flex items-center gap-2">
              <span className="font-semibold text-primary">{selectedNewsArticle.companyOrOrg}</span>
              <span>•</span>
              <span>{selectedNewsArticle.date}</span>
            </div>

            <p className="font-body-md text-body-md text-on-surface text-xs leading-relaxed pt-2">
              {selectedNewsArticle.description}
            </p>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedNewsArticle(null)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm cursor-pointer"
              >
                Close Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION:
          "when we open website it should show the website logo in the top middle of the page and then website anme is GeoRecruit"
          "welcome to our website and any two lines" */}
      <section className="text-center pt-2 pb-4 space-y-5">
        {/* Top Middle Website Logo: Official Georecruit Emblem, Wordmark & Tagline "Find • Hire • Grow" */}
        <div className="flex flex-col items-center justify-center pb-2">
          <GeorecruitLogo
            variant="stacked"
            size="xl"
            showTagline={true}
          />
        </div>

        {/* Prompt requirement: "in the below we will have welcome to our website and any two lines" */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight text-3xl md:text-4xl">
            Welcome to our website
          </h1>

          {/* The two lines */}
          <div className="space-y-2 text-on-surface font-body-lg text-sm md:text-base leading-relaxed text-left sm:text-center">
            <p className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container shadow-2xs">
              <strong>Line 1:</strong> GeoRecruit empowers students, job seekers, and industry employees with advanced AI-driven mock interviews, real-time proctored evaluation, and automated ATS resume optimization.
            </p>
            <p className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container shadow-2xs">
              <strong>Line 2:</strong> We connect qualified talent directly with top global enterprises and accredited campus placement drives through verified academic credentials and work experience cross-checking.
            </p>
          </div>
        </div>

        {/* Separated Dashboards CTA - Mandatory Login Protection */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            onClick={handleCandidateEntry}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary text-on-primary font-title-md text-sm font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">school</span>
            <span>Enter Candidate Dashboard</span>
            {!isAuthenticated && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 ml-1">Login Required</span>
            )}
          </button>

          <button
            onClick={handleRecruiterEntry}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-secondary text-on-secondary font-title-md text-sm font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">business_center</span>
            <span>Enter Recruiter Dashboard</span>
            {!isAuthenticated && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 ml-1">Login Required</span>
            )}
          </button>
        </div>

        {/* Top-Right Quick Guide Notice */}
        <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container max-w-md mx-auto text-xs text-on-surface-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">info</span>
            <span>Login or Sign In via top-right corner to get started</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-2.5 py-1 rounded bg-surface-container font-bold text-primary hover:underline cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-2.5 py-1 rounded bg-primary text-on-primary font-bold shadow-2xs hover:opacity-90 cursor-pointer"
            >
              Sign In (OTP)
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION:
          "in the below how many job roles are available in our website need to be displayed
           and then how many sites does it include
           and how many countries are collaborated with us" */}
      <section className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
        <div className="text-center mb-6">
          <span className="font-label-md text-label-md text-primary uppercase font-bold tracking-wider">
            Live Global Statistics
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold text-xl md:text-2xl mt-0.5">
            GeoRecruit Global Network & Opportunities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-surface-container">
          {/* Stat 1: How many job roles are available in our website */}
          <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed mb-2">
              <span className="material-symbols-outlined text-[26px]">work</span>
            </div>
            <span className="font-headline-lg text-4xl font-extrabold text-primary tracking-tight">
              1,850+
            </span>
            <span className="font-title-md text-sm font-bold text-on-surface mt-1">
              Job Roles Available in our website
            </span>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 max-w-[220px]">
              Including Full-Stack, AI/ML engineering, Systems Architecture, Data Science, Cloud DevOps & more.
            </p>
          </div>

          {/* Stat 2: How many sites does it include */}
          <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed mb-2">
              <span className="material-symbols-outlined text-[26px]">domain</span>
            </div>
            <span className="font-headline-lg text-4xl font-extrabold text-secondary tracking-tight">
              420+
            </span>
            <span className="font-title-md text-sm font-bold text-on-surface mt-1">
              Sites Included
            </span>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 max-w-[220px]">
              University campuses, corporate testing centers, global testing sites & regional assessment hubs.
            </p>
          </div>

          {/* Stat 3: How many countries are collaborated with us */}
          <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed mb-2">
              <span className="material-symbols-outlined text-[26px]">travel_explore</span>
            </div>
            <span className="font-headline-lg text-4xl font-extrabold text-tertiary tracking-tight">
              68+
            </span>
            <span className="font-title-md text-sm font-bold text-on-surface mt-1">
              Countries Collaborated with us
            </span>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 max-w-[220px]">
              International corporate recruiting partners across Americas, Europe, Asia, Australia, and Africa.
            </p>
          </div>
        </div>
      </section>

      {/* 3. WHAT IS THE USE OF OUR WEBSITE */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="font-label-md text-label-md text-primary uppercase font-bold tracking-wider">
            Features & Capabilities
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold text-2xl md:text-3xl">
            What is the Use of Our Website?
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-xs md:text-sm">
            GeoRecruit is an end-to-end recruitment and career preparation ecosystem built for both candidates and hiring managers:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Use 1 */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">videocam</span>
            </div>
            <h3 className="font-title-md text-on-surface font-bold text-sm">
              1. AI-Powered Live Mock Interviews
            </h3>
            <p className="font-body-sm text-on-surface-variant text-xs leading-relaxed">
              Practice real technical and behavioral interview questions with genuine AI speech-to-text, text-to-speech, camera gaze monitoring, and proctoring warnings to simulate real-world interviews.
            </p>
          </div>

          {/* Use 2 */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">document_scanner</span>
            </div>
            <h3 className="font-title-md text-on-surface font-bold text-sm">
              2. Precision ATS Resume Analyzer
            </h3>
            <p className="font-body-sm text-on-surface-variant text-xs leading-relaxed">
              Upload your resume in PDF/DOCX and benchmark it against specific job descriptions. Get ATS scores out of 100, keyword matches, missing skills, and actionable formatting feedback.
            </p>
          </div>

          {/* Use 3 */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <h3 className="font-title-md text-on-surface font-bold text-sm">
              3. Automated College ID & Employment Verification
            </h3>
            <p className="font-body-sm text-on-surface-variant text-xs leading-relaxed">
              Upload your College ID or Employee work proof. Our automated cross-check validates your student credentials or corporate experience to unlock verified talent badges.
            </p>
          </div>

          {/* Use 4 */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">business_center</span>
            </div>
            <h3 className="font-title-md text-on-surface font-bold text-sm">
              4. Recruiter Portal & Instant Hiring Pipeline
            </h3>
            <p className="font-body-sm text-on-surface-variant text-xs leading-relaxed">
              Recruiters can post job roles, review comprehensive AI evaluation reports, inspect proctoring trust scores, and directly issue shortlists and offer letters to top performers.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEW REVIEWS OF USERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-md text-label-md text-secondary uppercase font-bold tracking-wider">
              Community Feedback
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold text-xl md:text-2xl">
              Few Reviews of Users
            </h2>
          </div>
          <button
            onClick={onOpenReview}
            className="px-3.5 py-1.5 rounded-full bg-secondary text-on-secondary font-label-md text-xs font-semibold shadow-xs hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">rate_review</span>
            <span>Give Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                  {[...Array(rev.rating)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface text-xs italic leading-relaxed">
                  "{rev.review}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container flex items-center gap-2">
                <img
                  src={rev.avatarUrl}
                  alt={rev.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/30"
                />
                <div className="min-w-0">
                  <h4 className="font-title-md text-on-surface text-xs font-bold truncate">
                    {rev.name}
                  </h4>
                  <p className="font-body-sm text-on-surface-variant text-[10px] truncate">
                    {rev.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. NEWS ABOUT THE LATEST EDUCATIONAL UPDATES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-md text-label-md text-primary uppercase font-bold tracking-wider">
              Educational Radar
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold text-xl md:text-2xl">
              News About the Latest Educational Updates
            </h2>
          </div>
          <button
            onClick={() => onNavigate('news')}
            className="text-primary font-label-md text-xs font-bold hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>View All Educational News</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {news.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedNewsArticle(item)}
              className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs hover:bg-surface-container-low transition-colors cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold uppercase">
                  {item.category}
                </span>
                <span className="font-label-sm text-on-surface-variant text-xs">{item.date}</span>
              </div>

              <h4 className="font-title-md text-on-surface font-bold text-sm line-clamp-1">
                {item.title}
              </h4>

              <p className="font-body-sm text-on-surface-variant text-xs line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-1 flex items-center justify-between text-xs text-primary font-semibold">
                <span className="text-on-surface-variant text-[11px] font-normal">
                  Source: <strong>{item.companyOrOrg}</strong>
                </span>
                <span className="flex items-center gap-0.5">
                  <span>Read full update</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-surface-container text-center text-xs text-on-surface-variant space-y-4">
        <div className="flex justify-center">
          <GeorecruitLogo
            variant="horizontal"
            size="sm"
            showTagline={true}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        </div>
        <div className="flex items-center justify-center gap-4 font-label-md">
          <button onClick={handleCandidateEntry} className="hover:text-primary cursor-pointer">
            Candidate Dashboard
          </button>
          <span>•</span>
          <button onClick={handleRecruiterEntry} className="hover:text-primary cursor-pointer">
            Recruiter Dashboard
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('ats-resume-analyzer')} className="hover:text-primary cursor-pointer">
            ATS Analyzer
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('news')} className="hover:text-primary cursor-pointer">
            Educational Updates
          </button>
        </div>
        <p>© 2026 GeoRecruit Platform. Global Placement & AI-Proctored Recruitment Ecosystem.</p>
      </footer>
    </div>
  );
};
