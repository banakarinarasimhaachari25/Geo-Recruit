export type UserRole = 'candidate' | 'recruiter' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  company?: string;
  persona?: 'student' | 'employee';
}

export interface CandidateProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  college: string;
  studentId: string;
  degree: string;
  batch: string;
  specialization: string;
  verifiedCollegeId: boolean;
  overallReadiness: number;
  tier: string;
  mockSessionsCount: number;
  avgAiScore: number;
  integrityTrust: number;
  targetRolesCount: number;
  skills: { name: string; percentage: number }[];
  coachNote: string;
  resumeFileName?: string;
  // Student & Employee onboarding fields
  persona?: 'student' | 'employee';
  dob?: string;
  educationField?: string;
  cgpa?: string;
  workExperience?: string;
  company?: string;
  termsAccepted?: boolean;
}

export interface ATSReport {
  id: string;
  role: string;
  fileName: string;
  atsScore: number;
  previousScore?: number;
  matchPercentage: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  detectedSkills: string[];
  missingSkills: string[];
  educationMatch: string;
  experienceMatch: string;
  projectRelevance: string;
  resumeStrengths: string[];
  formattingWarnings: string[];
  actionableFixes: string[];
  categoryCoverage: { category: string; coverage: number; found: string; gap: string }[];
  timestamp: string;
}

export interface QuestionItem {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prompt: string;
  keywords: string[];
  expectedPoints: string[];
}

export interface InterviewReport {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
  mode?: string;
  interviewMode?: string;
  difficulty: string;
  trackTitle: string;
  overallScore: number;
  tier: string;
  sessionDurationMins: number;
  integrityTrustPercent: number;
  anomaliesCount: number;
  benchmarkRank: string;
  date: string;
  competencies: { name: string; score: number; color?: string }[];
  strengths: { title: string; description: string }[];
  weaknesses: { title: string; description: string }[];
  questionAnalysis: {
    questionId: string;
    prompt: string;
    candidateAnswer: string;
    score: number;
    aiFeedback: string;
    category: string;
  }[];
  coachNote: string;
  resumeFileName?: string;
  resumeAttached?: boolean;
  integrityReporting?: {
    sessionId: string;
    totalCount: number;
    violations: any[];
    status: string;
  };
}

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  review: string;
  avatarUrl: string;
  date: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Jobs' | 'Internships' | 'Education' | 'Scholarships' | 'Hackathons' | 'Examinations' | 'Career';
  description: string;
  companyOrOrg: string;
  date: string;
  linkText: string;
  featured?: boolean;
}

export interface RecruiterCandidate {
  id: string;
  name: string;
  email: string;
  college: string;
  degree: string;
  batch: string;
  avatarUrl: string;
  roleApplied: string;
  atsScore: number;
  interviewScore: number;
  integrityStatus: 'Verified 100%' | 'Clean' | '1 Warning' | 'Flagged';
  matchPercent: number;
  status: 'New' | 'Shortlisted' | 'Interviewed' | 'Offered' | 'Archived';
  verifiedCollegeId: boolean;
  keySkills: string[];
  reportId?: string;
}

export interface DailyInterviewTip {
  id: string;
  category: string;
  title: string;
  snippet: string;
  actionableStep: string;
  takeaway: string;
  source: 'ai_generated' | 'curated';
}
