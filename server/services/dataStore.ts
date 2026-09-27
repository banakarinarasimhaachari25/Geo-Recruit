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
  overallReadiness: number; // 86%
  tier: string; // Tier 1
  mockSessionsCount: number;
  avgAiScore: number;
  integrityTrust: number; // 98%
  targetRolesCount: number;
  skills: { name: string; percentage: number }[];
  coachNote: string;
  resumeFileName?: string;
  resumeParsedData?: any;
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

export interface InterviewReport {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
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
}

export class DataStore {
  public candidateProfiles: Map<string, CandidateProfile> = new Map();
  public atsReports: any[] = [];
  public interviewReports: Map<string, InterviewReport> = new Map();
  public reviews: ReviewItem[] = [];
  public news: NewsItem[] = [];
  public recruiterCandidates: RecruiterCandidate[] = [];
  public activeSessions: Map<string, any> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Aryan Sharma Candidate Profile
    const aryanProfile: CandidateProfile = {
      id: 'cand_1',
      userId: 'user_aryan',
      name: 'Aryan Sharma',
      email: 'aryan.sharma@example.edu',
      phone: '+91 98765 43210',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3OHx5h2WOBwJprjrL1w6Y5T-o34kBz9F05CggmEMNA9t8QsKbq1DovNQ-cZp4FBByS_mSYcRvqC12RS6NwolL5c7_xyhbdiaaTcp4DJ1jVfZ4iB3xO2o-pINyox8OVnp6odyRkrwOQsHSV8dKR-83OzdSsNhZHKlq9iZ0pKbtYyg-8UgKxt2gmHXdPg8evK6Xc-KE24h8NSEl-0nWoDFq34zN6Ek0VzgOJys_K7uwvGxisQCitopqw',
      college: 'National Institute of Technology',
      studentId: '2021CS0492',
      degree: 'B.Tech CS',
      batch: 'Batch of 2025',
      specialization: 'B.Tech / CSE',
      verifiedCollegeId: true,
      overallReadiness: 86,
      tier: 'Tier 1',
      mockSessionsCount: 14,
      avgAiScore: 8.4,
      integrityTrust: 98,
      targetRolesCount: 4,
      skills: [
        { name: 'Technical Knowledge', percentage: 88 },
        { name: 'Problem Solving & DSA', percentage: 85 },
        { name: 'Domain Systems & Arch', percentage: 84 },
        { name: 'Communication & Articulation', percentage: 82 },
        { name: 'Confidence & Body Language', percentage: 79 },
      ],
      coachNote: 'Elevate your system design trade-off explanations to cross the 90th percentile threshold before final round scheduling.',
      resumeFileName: 'Aryan_Sharma_Resume_2025.pdf',
    };
    this.candidateProfiles.set(aryanProfile.id, aryanProfile);
    this.candidateProfiles.set('default', aryanProfile);

    // 2. Seed ATS History
    this.atsReports.push({
      id: 'ats_1',
      role: 'Full-Stack Software Engineer',
      fileName: 'Aryan_Sharma_Resume_2025.pdf',
      atsScore: 82,
      previousScore: 68,
      timestamp: '2025-05-10T14:30:00Z',
    });
    this.atsReports.push({
      id: 'ats_2',
      role: 'Frontend Architect',
      fileName: 'Aryan_Sharma_Resume_2025.pdf',
      atsScore: 86,
      previousScore: 82,
      timestamp: '2025-05-18T10:15:00Z',
    });

    // 3. Seed Interview Reports
    const sampleReport: InterviewReport = {
      id: 'rep_1',
      candidateId: 'cand_1',
      candidateName: 'Aryan Sharma',
      role: 'Full-Stack Developer',
      difficulty: 'Hard',
      trackTitle: 'Senior Systems Track',
      overallScore: 8.4,
      tier: 'Tier 1 Certified',
      sessionDurationMins: 38,
      integrityTrustPercent: 100,
      anomaliesCount: 0,
      benchmarkRank: 'Top 4.2%',
      date: 'Yesterday',
      competencies: [
        { name: 'Problem Solving & Logic', score: 88, color: 'bg-primary' },
        { name: 'Technical Depth', score: 86, color: 'bg-primary' },
        { name: 'Communication Clarity', score: 84, color: 'bg-primary' },
        { name: 'System Architecture', score: 82, color: 'bg-primary' },
        { name: 'Behavioral (STAR Method)', score: 80, color: 'bg-secondary' },
      ],
      strengths: [
        {
          title: '1. Graceful Concurrency Handling',
          description: 'Articulated thread pools, idempotency, and distributed locking strategies without prompting.',
        },
        {
          title: '2. Precise Time Complexity Analysis',
          description: 'Instantly recognized worst-case amortization on sliding window cache patterns.',
        },
      ],
      weaknesses: [
        {
          title: 'Quantify Impact in STAR Stories',
          description: 'When describing production incidents, explicitly mention percentage recovery or business metrics impacted.',
        },
        {
          title: 'Microservices Failover Granularity',
          description: 'Consider diving deeper into circuit breaker thresholds before proposing Redis replication.',
        },
      ],
      questionAnalysis: [
        {
          questionId: 'q1',
          prompt: 'How would you ensure high availability and prevent split-brain scenarios when coordinating state across multi-region microservices?',
          candidateAnswer: 'I would employ a Raft-based consensus quorum across three odd availability zones. If partition occurs, the minority partition stops writes and acts read-only to eliminate split-brain...',
          score: 9.1,
          aiFeedback: 'Superb identification of Paxos/Raft consensus tradeoffs. Follow-up recommendation: could briefly address cross-region egress cost considerations.',
          category: 'Architecture • Advanced',
        },
        {
          questionId: 'q2',
          prompt: 'Tell me about a time when a critical bug escaped into production on your watch.',
          candidateAnswer: 'Last year, an auth cache invalidation caused 500s for 4% of active sessions. I took ownership, rolled back the deployment within 9 minutes, and authored a post-mortem...',
          score: 7.8,
          aiFeedback: 'Strong ownership mindset. Try quantifying the team preventative safeguards (e.g. added 14 integration test suites) to close with impact.',
          category: 'Behavioral • STAR Approach',
        },
        {
          questionId: 'q3',
          prompt: 'Design an API rate limiter supporting 500,000 queries per second with sub-5ms response thresholds.',
          candidateAnswer: 'I used a token-bucket algorithm distributed across Redis cluster instances using Lua scripts to maintain atomicity and eliminate network round trips...',
          score: 8.6,
          aiFeedback: 'Excellent technical solution and algorithmic rigor. Lua scripting highlights deep engineering awareness.',
          category: 'System Design • Scale',
        },
      ],
      coachNote: 'Elevate your system design trade-off explanations to cross the 90th percentile threshold before final round scheduling.',
    };
    this.interviewReports.set('rep_1', sampleReport);

    // Additional reports for history
    const rep2: InterviewReport = {
      ...sampleReport,
      id: 'rep_2',
      trackTitle: 'DSA Round: Graphs & DP',
      overallScore: 8.7,
      date: 'Yesterday',
      sessionDurationMins: 42,
    };
    this.interviewReports.set('rep_2', rep2);

    const rep3: InterviewReport = {
      ...sampleReport,
      id: 'rep_3',
      trackTitle: 'Behavioral & Leadership',
      overallScore: 8.1,
      date: '3 days ago',
      sessionDurationMins: 28,
    };
    this.interviewReports.set('rep_3', rep3);

    const rep4: InterviewReport = {
      ...sampleReport,
      id: 'rep_4',
      trackTitle: 'Full Stack System Architecture',
      overallScore: 8.5,
      date: '5 days ago',
      sessionDurationMins: 45,
    };
    this.interviewReports.set('rep_4', rep4);

    // 4. Seed Reviews
    this.reviews = [
      {
        id: 'rev_1',
        name: 'Aryan Sharma',
        role: 'Placed at Amazon (SDE-1)',
        rating: 5,
        review: 'The live proctored AI interview environment pushed me to explain architecture tradeoffs clearly. Got selected in the campus super-dream drive!',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3OHx5h2WOBwJprjrL1w6Y5T-o34kBz9F05CggmEMNA9t8QsKbq1DovNQ-cZp4FBByS_mSYcRvqC12RS6NwolL5c7_xyhbdiaaTcp4DJ1jVfZ4iB3xO2o-pINyox8OVnp6odyRkrwOQsHSV8dKR-83OzdSsNhZHKlq9iZ0pKbtYyg-8UgKxt2gmHXdPg8evK6Xc-KE24h8NSEl-0nWoDFq34zN6Ek0VzgOJys_K7uwvGxisQCitopqw',
        date: '2 days ago',
      },
      {
        id: 'rev_2',
        name: 'Pooja Reddy',
        role: 'AI/ML Associate at Google',
        rating: 5,
        review: 'The ATS parser flagged table column concatenation bugs that regular grammar checkers completely missed. Bumped my score from 68 to 88.',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlf30n_IREEGrRToBkS7CxI3xlUuMRznGCFWPAMItOsTt4_2TviKKL9yOwgqEDr-r0wDz5pM1Oa-_kWiKqy3nvIX_TezwgOwWTf-21lULjzSRQMady-rXRYFhaUfyrJcGVkJajuvBLimEF8wowvnJTXg96bgP8lrDH9go4jig62vULFvAR7VOXPiLWUTbP5YESEgIA7BUYDzCNtUiDpHO5XnMYJvUFHFE66ucAMVcz-4mdBAKcdccP5g',
        date: '1 week ago',
      },
      {
        id: 'rev_3',
        name: 'Vikram Joshi',
        role: 'Campus Recruitment Lead, Tier-1 Tech',
        rating: 5,
        review: 'From a recruiter perspective, the AI Dossier with genuine integrity scoring cut down our first-round screening time by 75%.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        date: '2 weeks ago',
      },
    ];

    // 5. Seed News & Campus Drives
    this.news = [
      {
        id: 'news_1',
        title: 'Google Campus Drive 2025: Technical Sets Added',
        category: 'Jobs',
        companyOrOrg: 'Google Engineering',
        description: 'Google campus recruitment has updated their problem sets with 2 new distributed system architecture rounds.',
        date: 'Today',
        linkText: 'View Syllabus & Apply',
        featured: true,
      },
      {
        id: 'news_2',
        title: 'Microsoft India Summer Internship Cohort Announced',
        category: 'Internships',
        companyOrOrg: 'Microsoft IDC',
        description: 'Applications open for 2026 batch undergraduate software engineers across cloud, AI, and developer tools.',
        date: 'Yesterday',
        linkText: 'View Eligibility',
        featured: false,
      },
      {
        id: 'news_3',
        title: 'National AI & Systems Hackathon 2025',
        category: 'Hackathons',
        companyOrOrg: 'TalentAI Foundation',
        description: 'Build production-ready agentic AI pipelines with ₹5,00,000 in grand prize pool + direct interviews.',
        date: '3 days ago',
        linkText: 'Register Team',
        featured: false,
      },
      {
        id: 'news_4',
        title: 'Graduate Aptitude Test in Engineering (GATE) Guide',
        category: 'Examinations',
        companyOrOrg: 'IIT Roorkee',
        description: 'Key algorithmic problem-solving trends and weightage breakdown for CS/IT aspirants.',
        date: '5 days ago',
        linkText: 'Read Analysis',
        featured: false,
      },
    ];

    // 6. Seed Recruiter Authorized Candidates
    this.recruiterCandidates = [
      {
        id: 'cand_1',
        name: 'Aryan Sharma',
        email: 'aryan.sharma@example.edu',
        college: 'National Institute of Technology',
        degree: 'B.Tech CS',
        batch: 'Batch of 2025',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3OHx5h2WOBwJprjrL1w6Y5T-o34kBz9F05CggmEMNA9t8QsKbq1DovNQ-cZp4FBByS_mSYcRvqC12RS6NwolL5c7_xyhbdiaaTcp4DJ1jVfZ4iB3xO2o-pINyox8OVnp6odyRkrwOQsHSV8dKR-83OzdSsNhZHKlq9iZ0pKbtYyg-8UgKxt2gmHXdPg8evK6Xc-KE24h8NSEl-0nWoDFq34zN6Ek0VzgOJys_K7uwvGxisQCitopqw',
        roleApplied: 'Full-Stack Developer',
        atsScore: 86,
        interviewScore: 8.4,
        integrityStatus: 'Verified 100%',
        matchPercent: 91,
        status: 'Shortlisted',
        verifiedCollegeId: true,
        keySkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
        reportId: 'rep_1',
      },
      {
        id: 'cand_2',
        name: 'Ananya Verma',
        email: 'ananya.v@campus.ac.in',
        college: 'Indian Institute of Information Technology',
        degree: 'B.Tech IT',
        batch: 'Batch of 2025',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        roleApplied: 'AI/ML Associate Engineer',
        atsScore: 92,
        interviewScore: 8.9,
        integrityStatus: 'Verified 100%',
        matchPercent: 95,
        status: 'Offered',
        verifiedCollegeId: true,
        keySkills: ['Python', 'PyTorch', 'Transformers', 'LangChain', 'FastAPI'],
        reportId: 'rep_2',
      },
      {
        id: 'cand_3',
        name: 'Rohan Mehra',
        email: 'rohan.m@techuniv.edu',
        college: 'Delhi Technological University',
        degree: 'B.Tech Software Eng',
        batch: 'Batch of 2025',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        roleApplied: 'DevOps & Cloud Engineer',
        atsScore: 79,
        interviewScore: 7.8,
        integrityStatus: 'Clean',
        matchPercent: 82,
        status: 'Interviewed',
        verifiedCollegeId: true,
        keySkills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Go'],
        reportId: 'rep_3',
      },
      {
        id: 'cand_4',
        name: 'Sneha Patel',
        email: 'sneha.patel@eng.univ.edu',
        college: 'Vellore Institute of Technology',
        degree: 'B.Tech CSE',
        batch: 'Batch of 2025',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        roleApplied: 'Full-Stack Developer',
        atsScore: 84,
        interviewScore: 8.2,
        integrityStatus: 'Clean',
        matchPercent: 88,
        status: 'New',
        verifiedCollegeId: true,
        keySkills: ['React', 'Next.js', 'GraphQL', 'Node.js', 'MongoDB'],
        reportId: 'rep_4',
      },
    ];
  }
}

export const dataStore = new DataStore();
