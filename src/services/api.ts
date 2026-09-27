import {
  ATSReport,
  CandidateProfile,
  InterviewReport,
  NewsItem,
  RecruiterCandidate,
  ReviewItem,
  User,
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Config / Health
  async getConfigStatus(): Promise<{ geminiConfigured: boolean; message: string }> {
    try {
      const res = await fetch(`${BASE_URL}/config/status`);
      return await res.json();
    } catch {
      return {
        geminiConfigured: false,
        message: 'AI service is not configured yet. Please add the required API key.',
      };
    }
  },

  // Auth
  async login(email?: string, password?: string, role: string = 'candidate'): Promise<{ success: boolean; token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    return await res.json();
  },

  async register(data: { mobile: string; email: string; name: string; password?: string; role?: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async verifyOtp(otp: string, email: string): Promise<{ success: boolean; message: string; verified: boolean }> {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, email }),
    });
    return await res.json();
  },

  async verifyCollegeId(payload: {
    fileName: string;
    fileBase64?: string;
    name?: string;
    college?: string;
    studentId?: string;
    course?: string;
    department?: string;
  }): Promise<{
    verified: boolean;
    message: string;
    extractedData: any;
    mismatches?: string[];
  }> {
    const res = await fetch(`${BASE_URL}/auth/verify-college-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  // Resume & ATS
  async analyzeResume(fileName: string, rawText?: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/resume/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, rawText }),
    });
    return await res.json();
  },

  async analyzeATS(role: string, fileName: string, resumeText?: string, previousScore?: number): Promise<ATSReport> {
    const res = await fetch(`${BASE_URL}/resume/ats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, fileName, resumeText, previousScore }),
    });
    return await res.json();
  },

  async getAtsHistory(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/resume/ats/history`);
    return await res.json();
  },

  // Interview
  async startInterview(
    role: string,
    mode: string = 'Interview',
    difficulty: string = 'Hard',
    count: number = 5,
    resumeText?: string,
    resumeFileName?: string,
    skills?: string[]
  ): Promise<any> {
    const res = await fetch(`${BASE_URL}/interview/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, mode, difficulty, count, resumeText, resumeFileName, skills }),
    });
    return await res.json();
  },

  async sendViolation(sessionId: string, violationType: string, violationCount: number): Promise<any> {
    const res = await fetch(`${BASE_URL}/interview/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, violationType, violationCount }),
    });
    return await res.json();
  },

  async evaluateInterview(payload: {
    sessionId: string;
    role: string;
    mode?: string;
    candidateName?: string;
    resumeText?: string;
    resumeFileName?: string;
    difficulty?: string;
    questionsWithAnswers: { question: string; answer: string; category: string }[];
    integrityData: {
      violationCount: number;
      violations: string[];
      completedDurationMins: number;
      isFlagged?: boolean;
    };
  }): Promise<{ reportId: string; report: InterviewReport }> {
    const res = await fetch(`${BASE_URL}/interview/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async getInterviewReport(id: string): Promise<InterviewReport> {
    const res = await fetch(`${BASE_URL}/interview/report/${id}`);
    return await res.json();
  },

  async getInterviewReports(): Promise<InterviewReport[]> {
    const res = await fetch(`${BASE_URL}/interview/reports`);
    return await res.json();
  },

  // Recruiter
  async getCandidates(params?: { role?: string; status?: string; search?: string }): Promise<RecruiterCandidate[]> {
    const q = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE_URL}/candidates?${q}`);
    return await res.json();
  },

  async shortlistCandidate(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/candidates/${id}/shortlist`, {
      method: 'POST',
    });
    return await res.json();
  },

  async sendOffer(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/candidates/${id}/offer`, {
      method: 'POST',
    });
    return await res.json();
  },

  // Reviews
  async getReviews(): Promise<ReviewItem[]> {
    const res = await fetch(`${BASE_URL}/reviews`);
    return await res.json();
  },

  async submitReview(reviewData: Partial<ReviewItem>): Promise<any> {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    return await res.json();
  },

  // News
  async getNews(): Promise<NewsItem[]> {
    const res = await fetch(`${BASE_URL}/news`);
    return await res.json();
  },

  // Daily AI Interview Tip
  async getDailyInterviewTip(category?: string, role?: string): Promise<any> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (role) params.append('role', role);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/interview/daily-tip${queryString}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch daily tip: ${res.statusText}`);
    }
    return await res.json();
  },

  // Behavioral AI Chat Companion Feedback
  async getBehavioralFeedback(payload: {
    question: string;
    answer: string;
    role?: string;
  }): Promise<{
    score: number;
    overallRating: 'Strong' | 'Good' | 'Needs Work';
    starBreakdown: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
    strengths: string[];
    areasToImprove: string[];
    polishedSample: string;
    followUpQuestion: string;
    coachMessage: string;
  }> {
    const res = await fetch(`${BASE_URL}/interview/behavioral-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Failed to get behavioral feedback: ${res.statusText}`);
    }
    return await res.json();
  },

  // Deep AI Feedback Generator (Transcript + Video Analysis)
  async generateAIFeedbackReport(payload: {
    role?: string;
    candidateName?: string;
    questionsWithAnswers?: { question: string; answer: string; category?: string }[];
    videoTelemetry?: {
      eyeContactPercent?: number;
      postureStabilityPercent?: number;
      facialEngagementPercent?: number;
      headCenteredPercent?: number;
      lightingScore?: number;
      anomaliesDetected?: number;
      primaryFacialEmotion?: string;
    };
    transcriptTelemetry?: {
      totalWords?: number;
      averageWpm?: number;
      fillerWordsCount?: number;
      starMethodScore?: number;
      technicalVocabularyDensity?: number;
      clarityAndConcisionScore?: number;
    };
  }): Promise<any> {
    const res = await fetch(`${BASE_URL}/interview/generate-feedback-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Failed to generate feedback report: ${res.statusText}`);
    }
    return await res.json();
  },

  // Profile
  async getProfile(): Promise<CandidateProfile> {
    const res = await fetch(`${BASE_URL}/profile`);
    return await res.json();
  },

  async updateProfile(updates: Partial<CandidateProfile>): Promise<any> {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return await res.json();
  },
};
