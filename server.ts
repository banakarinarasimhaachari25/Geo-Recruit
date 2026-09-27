import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { geminiService } from './server/services/geminiService.js';
import { resumeService } from './server/services/resumeService.js';
import { collegeIdService } from './server/services/collegeIdService.js';
import { dataStore, CandidateProfile, ReviewItem } from './server/services/dataStore.js';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 1. Config / Health Check
app.get('/api/config/status', (req: Request, res: Response) => {
  const isConfigured = geminiService.isConfigured();
  res.json({
    geminiConfigured: isConfigured,
    message: isConfigured
      ? 'Google Gemini API is active & connected.'
      : 'AI service is running in fallback test mode. Add GEMINI_API_KEY in environment to enable live LLM generation.',
  });
});

// 2. Authentication & Verification
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  // Strict check: Login details are mandatory
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || email.trim() === '' || password.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Email ID and Password are mandatory. Please enter your credentials to login.',
    });
  }

  // Derive friendly name from email if not preset
  const cleanEmail = email.trim();
  const rawPrefix = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
  const derivedName = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1);

  if (role === 'recruiter') {
    return res.json({
      success: true,
      token: 'jwt_mock_recruiter_token',
      user: {
        id: 'rec_1',
        email: cleanEmail,
        name: cleanEmail.toLowerCase().includes('google') ? 'Sarah Jensen' : derivedName || 'Recruiter Lead',
        role: 'recruiter',
        company: cleanEmail.toLowerCase().includes('google') ? 'Google' : 'Partner Enterprise',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      },
    });
  }

  const profile = dataStore.candidateProfiles.get('cand_1');
  const candidateName = cleanEmail.toLowerCase().includes('aryan') ? 'Aryan Sharma' : derivedName || profile?.name || 'Candidate';

  return res.json({
    success: true,
    token: 'jwt_mock_candidate_token',
    user: {
      id: profile?.id || 'cand_1',
      email: cleanEmail,
      name: candidateName,
      role: 'candidate',
      profile: profile ? { ...profile, name: candidateName, email: cleanEmail } : undefined,
    },
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { mobile, email, name, password, role } = req.body;

  // Strict check: Email and Phone number are mandatory
  if (!email || !mobile || typeof email !== 'string' || typeof mobile !== 'string' || email.trim() === '' || mobile.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Email ID and Phone Number are mandatory to register.',
    });
  }

  const cleanEmail = email.trim();
  const cleanMobile = mobile.trim();
  const rawPrefix = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
  const candidateName = name || rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1) || 'New User';

  const newId = `cand_${Date.now()}`;
  const newProfile: CandidateProfile = {
    id: newId,
    userId: `user_${Date.now()}`,
    name: candidateName,
    email: cleanEmail,
    phone: cleanMobile,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3OHx5h2WOBwJprjrL1w6Y5T-o34kBz9F05CggmEMNA9t8QsKbq1DovNQ-cZp4FBByS_mSYcRvqC12RS6NwolL5c7_xyhbdiaaTcp4DJ1jVfZ4iB3xO2o-pINyox8OVnp6odyRkrwOQsHSV8dKR-83OzdSsNhZHKlq9iZ0pKbtYyg-8UgKxt2gmHXdPg8evK6Xc-KE24h8NSEl-0nWoDFq34zN6Ek0VzgOJys_K7uwvGxisQCitopqw',
    college: 'National Institute of Technology',
    studentId: '2021CS0492',
    degree: 'B.Tech CS',
    batch: 'Batch of 2025',
    specialization: 'B.Tech / CSE',
    verifiedCollegeId: false,
    overallReadiness: 75,
    tier: 'Tier 1',
    mockSessionsCount: 0,
    avgAiScore: 0,
    integrityTrust: 100,
    targetRolesCount: 2,
    skills: [
      { name: 'Technical Knowledge', percentage: 70 },
      { name: 'Problem Solving & DSA', percentage: 70 },
      { name: 'Communication', percentage: 75 },
    ],
    coachNote: 'Complete your profile verification to unlock campus interview fast-tracking.',
  };

  dataStore.candidateProfiles.set(newId, newProfile);

  res.json({
    success: true,
    message: 'Candidate registration initialized. Please verify OTP.',
    userId: newId,
    step: 'OTP_VERIFICATION',
    user: {
      id: newId,
      name: candidateName,
      email: cleanEmail,
      role: role || 'candidate',
    },
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { otp, email } = req.body;
  // Accepts standard test OTP "123456" or any 6-digit number in test mode
  if (otp && (otp === '123456' || otp.length === 6)) {
    return res.json({
      success: true,
      message: 'Email OTP verified successfully.',
      verified: true,
    });
  }
  return res.status(400).json({
    success: false,
    message: 'Invalid OTP. Please enter 123456 or try again.',
  });
});

app.post('/api/auth/verify-college-id', async (req: Request, res: Response) => {
  const { fileName, fileBase64, name, college, studentId, course, department } = req.body;

  try {
    const extracted = await collegeIdService.extractCollegeIdData(fileName || 'college_id.png', fileBase64, {
      name,
      college,
      studentId,
      course,
      department,
    });

    const result = collegeIdService.verify(extracted, {
      name: name || 'Aryan Sharma',
      college: college,
      studentId: studentId,
      course: course,
      department: department,
    });

    if (result.verified) {
      const defaultProf = dataStore.candidateProfiles.get('cand_1');
      if (defaultProf) {
        defaultProf.verifiedCollegeId = true;
      }
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      verified: false,
      message: 'Failed to process document. Please try again.',
      error: err.message,
    });
  }
});

// 3. Resume Processing & ATS Analysis
app.post('/api/resume/analyze', (req: Request, res: Response) => {
  const { fileName, rawText } = req.body;
  const parsed = resumeService.parseResume(fileName || 'resume.pdf', rawText);
  res.json({
    success: true,
    fileName: fileName || 'Aryan_Sharma_Resume_2025.pdf',
    data: parsed,
  });
});

app.post('/api/resume/ats', async (req: Request, res: Response) => {
  const { role, fileName, resumeText, previousScore } = req.body;
  try {
    const result = await resumeService.analyzeATS(
      role || 'Full-Stack Software Engineer',
      fileName || 'Aryan_Sharma_Resume_2025.pdf',
      resumeText || '',
      previousScore || 68
    );

    dataStore.atsReports.unshift(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'ATS analysis failed', message: err.message });
  }
});

app.get('/api/resume/ats/history', (req: Request, res: Response) => {
  res.json(dataStore.atsReports);
});

// 4. Interview Engine & Question Generation
app.post('/api/interview/start', async (req: Request, res: Response) => {
  const { role, mode, difficulty, count = 5, resumeText, resumeFileName, skills, projects } = req.body;
  const sessionId = `session_${Date.now()}`;

  const questions = await geminiService.generateQuestions(
    role || 'Full-Stack Developer',
    difficulty || 'Hard',
    count,
    {
      resumeText,
      resumeFileName,
      skills: Array.isArray(skills) ? skills : undefined,
    }
  );

  const session = {
    id: sessionId,
    role: role || 'Full-Stack Developer',
    mode: mode || 'Interview',
    difficulty: difficulty || 'Hard',
    resumeFileName: resumeFileName || 'Aryan_Sharma_Resume.pdf',
    questions,
    startTime: Date.now(),
    answers: [] as { questionId: string; answer: string }[],
    violations: [] as { type: string; timestamp: string; count: number }[],
    status: 'In-Progress',
  };

  dataStore.activeSessions.set(sessionId, session);

  res.json({
    sessionId,
    role: session.role,
    mode: session.mode,
    difficulty: session.difficulty,
    resumeFileName: session.resumeFileName,
    totalQuestions: questions.length,
    firstQuestion: questions[0],
    questions,
  });
});

app.post('/api/interview/behavioral-feedback', async (req: Request, res: Response) => {
  const { question, answer, role } = req.body;
  if (!question || !answer || typeof answer !== 'string' || answer.trim().length === 0) {
    return res.status(400).json({ error: 'Question and answer are required.' });
  }

  try {
    const feedback = await geminiService.evaluateBehavioralAnswer(
      question,
      answer,
      role || 'Full-Stack Software Engineer'
    );
    res.json(feedback);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to evaluate behavioral response', message: err.message });
  }
});

app.post('/api/interview/generate-feedback-report', async (req: Request, res: Response) => {
  try {
    const { role, candidateName, questionsWithAnswers, videoTelemetry, transcriptTelemetry } = req.body;
    const report = await geminiService.generateInterviewFeedbackReport({
      role,
      candidateName,
      questionsWithAnswers,
      videoTelemetry,
      transcriptTelemetry,
    });
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate interview feedback report', message: err.message });
  }
});

app.post('/api/interview/violation', (req: Request, res: Response) => {
  const { sessionId, violationType, timestamp, violationCount } = req.body;
  const session = dataStore.activeSessions.get(sessionId);

  const violationRecord = {
    type: violationType,
    timestamp: timestamp || new Date().toISOString(),
    count: violationCount || 1,
  };

  if (session) {
    if (!session.violations) session.violations = [];
    session.violations.push(violationRecord);
    session.totalCount = violationCount || session.violations.length;
    if (violationCount >= 3) {
      session.status = 'Flagged — Repeated Violations';
    }
  } else {
    dataStore.activeSessions.set(sessionId, {
      id: sessionId,
      candidateId: 'cand_1',
      role: 'Full-Stack Developer',
      startedAt: new Date().toISOString(),
      status: violationCount >= 3 ? 'Flagged — Repeated Violations' : 'In Progress',
      violations: [violationRecord],
      totalCount: violationCount || 1,
      questions: [],
      transcripts: [],
    });
  }

  res.json({
    received: true,
    totalViolations: violationCount,
    action: violationCount === 1
      ? 'Please stay focused on the interview.'
      : violationCount === 2
      ? 'This is your second warning. Please remain in the interview window.'
      : 'Flagged — Repeated Violations',
    loggedRecord: violationRecord,
  });
});

app.get('/api/interview/session/:sessionId/integrity', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = dataStore.activeSessions.get(sessionId);
  if (!session) {
    return res.json({
      sessionId,
      violations: [],
      totalCount: 0,
      status: 'Clean Proctoring',
    });
  }
  res.json({
    sessionId,
    violations: session.violations || [],
    totalCount: session.violations?.length || 0,
    status: session.status || 'In Progress',
  });
});

app.post('/api/interview/evaluate', async (req: Request, res: Response) => {
  const { sessionId, role, mode, candidateName, questionsWithAnswers, integrityData, resumeText, resumeFileName } = req.body;

  const evaluation = await geminiService.evaluateInterview(
    role || 'Senior Systems Track',
    questionsWithAnswers || [],
    integrityData || { violationCount: 0, violations: [], completedDurationMins: 38 },
    resumeText
  );

  const newReportId = `rep_${Date.now()}`;
  const report: any = {
    id: newReportId,
    candidateId: 'cand_1',
    candidateName: candidateName || 'Candidate',
    role: role || 'Full-Stack Developer',
    mode: mode || 'professional',
    interviewMode: mode || 'professional',
    difficulty: req.body.difficulty || 'Medium',
    trackTitle: `${role || 'Technical'} Track`,
    overallScore: evaluation.overallScore,
    tier: evaluation.tier,
    sessionDurationMins: integrityData?.completedDurationMins || 15,
    integrityTrustPercent: evaluation.integrityScore,
    anomaliesCount: integrityData?.violationCount || 0,
    benchmarkRank: evaluation.overallScore >= 8.5 ? 'Top 4.2%' : evaluation.overallScore >= 7.0 ? 'Top 18%' : 'Top 55%',
    date: 'Just now',
    resumeFileName: resumeFileName || (resumeText ? 'Uploaded_Resume.pdf' : undefined),
    resumeAttached: !!(resumeText || resumeFileName),
    competencies: [
      { name: 'Problem Solving & Logic', score: evaluation.problemSolvingScore, color: 'bg-primary' },
      { name: 'Technical Depth', score: evaluation.technicalScore, color: 'bg-primary' },
      { name: 'Communication Clarity', score: evaluation.communicationScore, color: 'bg-primary' },
      { name: 'System Architecture', score: evaluation.domainKnowledgeScore, color: 'bg-primary' },
      { name: 'Behavioral (STAR Method)', score: Math.min(95, Math.max(30, evaluation.communicationScore)), color: 'bg-secondary' },
    ],
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    questionAnalysis: evaluation.questionAnalysis,
    coachNote: evaluation.coachNote,
    integrityReporting: {
      sessionId: sessionId || 'session_live',
      totalCount: integrityData?.violationCount || 0,
      violations: integrityData?.violations || [],
      status: integrityData?.isFlagged
        ? 'Flagged — Repeated Violations'
        : (integrityData?.violationCount > 0 ? 'Warnings Recorded' : 'Clean Proctoring'),
    },
  };

  dataStore.interviewReports.set(newReportId, report);

  res.json({
    reportId: newReportId,
    report,
  });
});

app.get('/api/interview/report/:id', (req: Request, res: Response) => {
  const report = dataStore.interviewReports.get(req.params.id) || dataStore.interviewReports.get('rep_1');
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

app.get('/api/interview/reports', (req: Request, res: Response) => {
  const list = Array.from(dataStore.interviewReports.values());
  res.json(list);
});

// Daily AI-generated Career & Interview Tip
app.get('/api/interview/daily-tip', async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const role = req.query.role ? String(req.query.role) : undefined;
    const tip = await geminiService.generateDailyTip(category, role);
    res.json(tip);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to generate daily tip',
      message: err.message,
    });
  }
});

// 5. Recruiter Portal
app.get('/api/candidates', (req: Request, res: Response) => {
  const { role, status, search } = req.query;
  let list = dataStore.recruiterCandidates;

  if (role && role !== 'all') {
    list = list.filter((c) => c.roleApplied.toLowerCase().includes(String(role).toLowerCase()));
  }
  if (status && status !== 'all') {
    list = list.filter((c) => c.status.toLowerCase() === String(status).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.college.toLowerCase().includes(q));
  }

  res.json(list);
});

app.post('/api/candidates/:id/shortlist', (req: Request, res: Response) => {
  const candidate = dataStore.recruiterCandidates.find((c) => c.id === req.params.id);
  if (candidate) {
    candidate.status = 'Shortlisted';
    return res.json({ success: true, candidate });
  }
  res.status(404).json({ error: 'Candidate not found' });
});

app.post('/api/candidates/:id/offer', (req: Request, res: Response) => {
  const candidate = dataStore.recruiterCandidates.find((c) => c.id === req.params.id);
  if (candidate) {
    candidate.status = 'Offered';
    return res.json({ success: true, candidate, offerLetterSent: true });
  }
  res.status(404).json({ error: 'Candidate not found' });
});

// 6. Reviews
app.get('/api/reviews', (req: Request, res: Response) => {
  res.json(dataStore.reviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { name, rating, review, role, avatarUrl } = req.body;
  const newReview: ReviewItem = {
    id: `rev_${Date.now()}`,
    name: name || 'TalentAI Member',
    role: role || 'Candidate',
    rating: Number(rating) || 5,
    review: review || 'Great experience preparing with TalentAI!',
    avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    date: 'Just now',
  };

  dataStore.reviews.unshift(newReview);
  res.json({ success: true, review: newReview });
});

// 7. News & Campus Drives
app.get('/api/news', (req: Request, res: Response) => {
  res.json(dataStore.news);
});

// 8. Profile
app.get('/api/profile', (req: Request, res: Response) => {
  const profile = dataStore.candidateProfiles.get('cand_1');
  res.json(profile);
});

app.put('/api/profile', (req: Request, res: Response) => {
  const updates = req.body;
  const profile = dataStore.candidateProfiles.get('cand_1');
  if (profile) {
    Object.assign(profile, updates);
    return res.json({ success: true, profile });
  }
  res.status(404).json({ error: 'Profile not found' });
});

// Initialize server with Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`TalentAI Platform running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
