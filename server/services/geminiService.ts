import { GoogleGenAI } from '@google/genai';

export interface GeneratedQuestion {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prompt: string;
  keywords: string[];
  expectedPoints: string[];
}

export interface EvaluationResult {
  overallScore: number; // 0 - 10
  tier: string;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  domainKnowledgeScore: number;
  integrityScore: number;
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

export class GeminiService {
  private hasKey: boolean;

  constructor() {
    this.hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0 && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  }

  public isConfigured(): boolean {
    return this.hasKey;
  }

  public async generateQuestions(
    role: string,
    difficulty: string,
    count: number = 5,
    candidateContext?: { skills?: string[]; education?: string; experience?: string; resumeText?: string; resumeFileName?: string }
  ): Promise<GeneratedQuestion[]> {
    if (!this.hasKey) {
      return this.getMockQuestions(role, difficulty, candidateContext);
    }

    try {
      const ai = new GoogleGenAI();
      const resumeSection = candidateContext?.resumeText
        ? `\nCANDIDATE UPLOADED RESUME CONTENT (${candidateContext.resumeFileName || 'Resume'}):
${candidateContext.resumeText.slice(0, 3500)}
CRITICAL: Generate interview questions directly tailored to the candidate's uploaded resume, including their specific listed projects, work experiences, tools, and technical accomplishments from their resume.`
        : '';

      const prompt = `
You are a senior technical interviewer at a top technology company evaluating for the role of "${role}".
Difficulty: ${difficulty}.
Candidate Skills: ${candidateContext?.skills?.join(', ') || 'Domain Engineering'}.
Candidate Education: ${candidateContext?.education || 'Engineering & Technology'}.
${resumeSection}

Generate ${count} targeted, realistic interview questions for this candidate.
If a resume was provided, make sure at least 2 questions specifically reference their projects or stated experience (e.g., "From your resume, I see you built...").

Return ONLY valid JSON array with objects containing:
[
  {
    "id": "q1",
    "category": "Topic Name",
    "difficulty": "${difficulty}",
    "prompt": "Detailed interview question",
    "keywords": ["key1", "key2", "key3"],
    "expectedPoints": ["point 1", "point 2"]
  }
]
No extra markdown, just valid JSON array.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: item.id || `q_${idx + 1}`,
          category: item.category || `${role} Assessment`,
          difficulty: (item.difficulty as any) || difficulty,
          prompt: item.prompt || 'Explain your technical approach and reasoning.',
          keywords: Array.isArray(item.keywords) ? item.keywords : ['Engineering', 'Architecture'],
          expectedPoints: Array.isArray(item.expectedPoints) ? item.expectedPoints : ['Accuracy', 'Clarity'],
        }));
      }
    } catch (err) {
      console.warn('Gemini API question generation notice, falling back to tailored generator:', err);
    }

    return this.getMockQuestions(role, difficulty, candidateContext);
  }

  public async evaluateInterview(
    role: string,
    questionsWithAnswers: { question: string; answer: string; category: string }[],
    integrityData: { violationCount: number; violations: string[]; completedDurationMins: number },
    resumeText?: string
  ): Promise<EvaluationResult> {
    if (!this.hasKey) {
      return this.getMockEvaluation(role, questionsWithAnswers, integrityData, resumeText);
    }

    try {
      const ai = new GoogleGenAI();
      const prompt = `
You are an expert, objective, and fair AI Technical Interview Proctor and Hiring Lead evaluating a candidate for the role: "${role}".
Integrity Data: ${integrityData.violationCount} integrity warnings/tab switches reported. Violations: ${integrityData.violations.join(', ') || 'None'}.

CANDIDATE UPLOADED RESUME (IF AVAILABLE):
${resumeText ? resumeText.slice(0, 2500) : 'No resume uploaded.'}

CANDIDATE'S ACTUAL SUBMITTED ANSWERS TO EACH QUESTION:
${JSON.stringify(questionsWithAnswers, null, 2)}

STRICT AND FAIR EVALUATION CRITERIA:
1. FAIRNESS & INTEGRITY: Grade each question strictly on what the candidate ACTUALLY answered.
   - If an answer is blank, empty, single-word (e.g. "ok", "yes", "idk"), trivial, or off-topic: award 1.5 to 4.0 out of 10. In aiFeedback, honestly state that no technical reasoning or architectural solution was presented.
   - If an answer is brief or conceptual without implementation trade-offs: award 4.5 to 6.5 out of 10. State constructive missing details.
   - If an answer is sound and directly answers the question: award 6.8 to 7.9 out of 10.
   - If an answer is thorough, accurate, and demonstrates high technical mastery with trade-offs: award 8.0 to 9.5 out of 10.
2. The overallScore MUST be the true mathematical average of all question scores, rounded to 1 decimal place (deduct 0.2 per integrity violation).
3. Do NOT invent unearned praise or give an unearned high score if answers were poor. The review must be completely fair and realistic so candidates know where they stand.
4. Tier assignment based on overallScore:
   - >= 8.5: "Tier 1 - Enterprise Certified / Strong Hire"
   - 7.0 - 8.4: "Tier 2 - Placement Ready / Hire with Standard Onboarding"
   - 5.0 - 6.9: "Tier 3 - Improvement Needed"
   - < 5.0: "Needs Fundamental Preparation"
5. Strengths: 2 to 3 concise points praising what the candidate genuinely demonstrated well.
6. Weaknesses (Areas to be Improved): 2 to 3 concrete, honest, and actionable points highlighting what was missing from their actual answers.
7. Return strictly valid JSON:
{
  "overallScore": 8.2,
  "tier": "Tier 2 - Placement Ready",
  "technicalScore": 84,
  "communicationScore": 82,
  "problemSolvingScore": 85,
  "confidenceScore": 80,
  "domainKnowledgeScore": 83,
  "integrityScore": ${Math.max(60, 100 - integrityData.violationCount * 12)},
  "strengths": [
    { "title": "Strength Title", "description": "Specific observation on what candidate answered well" }
  ],
  "weaknesses": [
    { "title": "Area to Improve", "description": "Specific critique of what was missing in their actual answers" }
  ],
  "questionAnalysis": [
    {
      "questionId": "q1",
      "prompt": "Question text",
      "candidateAnswer": "Actual candidate response",
      "score": 8.0,
      "aiFeedback": "Honest, fair feedback on candidate's answer",
      "category": "Topic Name"
    }
  ],
  "coachNote": "Constructive hiring manager verdict reflecting actual answers"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.overallScore === 'number') {
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini evaluation notice, using calibrated algorithmic evaluator:', err);
    }

    return this.getMockEvaluation(role, questionsWithAnswers, integrityData, resumeText);
  }

  public async analyzeResumeWithAI(
    role: string,
    resumeText: string
  ): Promise<{
    score: number;
    matchingKeywords: string[];
    missingKeywords: string[];
    strengths: string[];
    formattingWarnings: string[];
    actionableFixes: string[];
    categoryCoverage: { category: string; coverage: number; found: string; gap: string }[];
  }> {
    if (!this.hasKey) {
      return this.getMockATSAnalysis(role, resumeText);
    }

    try {
      const ai = new GoogleGenAI();
      const prompt = `
Analyze this candidate resume for the target job role "${role}".
Resume Content:
${resumeText.slice(0, 4000)}

Evaluate ATS score (0-100), keyword matches, missing high-impact keywords, strengths, formatting warnings, and actionable bullet fixes.
Return JSON with this schema:
{
  "score": 84,
  "matchingKeywords": ["React.js", "TypeScript", "REST API", "Docker", "PostgreSQL", "Git"],
  "missingKeywords": ["GraphQL", "CI/CD Pipeline", "AWS Lambda", "Kubernetes", "Unit Testing (Jest)"],
  "strengths": [
    "Clear quantifiable metrics with impact percentages",
    "Strong project impact statements following Google X-Y-Z formula"
  ],
  "formattingWarnings": [
    "Multi-column tables may get flattened improperly by older ATS scrapers"
  ],
  "actionableFixes": [
    "Integrate CI/CD pipeline accomplishments in experience section",
    "Flatten two-column skills grid into standard comma-separated lists",
    "Explicitly mention AWS Lambda / Serverless microservices"
  ],
  "categoryCoverage": [
    { "category": "Frontend Architecture", "coverage": 90, "found": "React, TypeScript, Tailwind", "gap": "Jest Tests" },
    { "category": "Backend & Data Layer", "coverage": 78, "found": "Node.js, PostgreSQL, REST", "gap": "GraphQL" },
    { "category": "DevOps & Cloud Infra", "coverage": 65, "found": "Docker, Git", "gap": "AWS Lambda, K8s, CI/CD" }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      return JSON.parse(text);
    } catch (err) {
      console.warn('Gemini ATS analysis fallback:', err);
    }

    return this.getMockATSAnalysis(role, resumeText);
  }

  private getMockQuestions(
    role: string,
    difficulty: string,
    candidateContext?: { skills?: string[]; education?: string; experience?: string; resumeText?: string; resumeFileName?: string }
  ): GeneratedQuestion[] {
    const isHard = difficulty === 'Hard';
    const isEasy = difficulty === 'Easy';
    const roleLower = role.toLowerCase();
    const resume = candidateContext?.resumeText || '';

    // Extract real projects or key terms from uploaded resume if present
    let detectedProject = 'your featured portfolio project';
    let detectedTech = 'your primary tech stack';

    if (resume.length > 20) {
      const resumeLines = resume.split('\n').map((l) => l.trim()).filter(Boolean);
      // Look for project indicators
      const projectLine = resumeLines.find((l) =>
        /(project|built|developed|created|system|portal|platform|app|application)/i.test(l) &&
        l.length > 10 && l.length < 90
      );
      if (projectLine) {
        detectedProject = projectLine.replace(/^(project:?|built|developed|created|-|\*)\s*/i, '').trim();
      }

      // Check for technology keywords in resume
      const techKeywords = ['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'FastAPI', 'Spring Boot', 'Next.js', 'C++', 'Go', 'Financial Modeling', 'GST', 'Tally', 'AutoCAD'];
      const matched = techKeywords.filter((tk) => new RegExp(`\\b${tk}\\b`, 'i').test(resume));
      if (matched.length > 0) {
        detectedTech = matched.slice(0, 3).join(', ');
      }
    } else if (candidateContext?.resumeFileName) {
      detectedProject = `the key project highlighted in ${candidateContext.resumeFileName}`;
    }

    const statedSkills = candidateContext?.skills && candidateContext.skills.length > 0
      ? candidateContext.skills
      : ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];

    if (candidateContext?.skills && candidateContext.skills.length > 0) {
      detectedTech = candidateContext.skills.slice(0, 4).join(', ');
    }

    const primarySkill = statedSkills[0] || 'React';
    const secondarySkill = statedSkills[1] || 'Node.js';
    const tertiarySkill = statedSkills[2] || 'PostgreSQL';

    // Role-specific tailored questions with resume grounding & candidate-stated skills
    if (roleLower.includes('full-stack') || roleLower.includes('software engineer') || roleLower.includes('developer')) {
      return [
        {
          id: 'q1',
          category: `Candidate Stated Skill • ${primarySkill}`,
          difficulty: isHard ? 'Hard' : isEasy ? 'Easy' : 'Medium',
          prompt: `In your introduction, you highlighted your experience with ${primarySkill}. Could you walk me through a complex production feature or system you built using ${primarySkill}? How did you structure your components, manage application state, and ensure optimal render cycles?`,
          keywords: [primarySkill, 'State Architecture', 'Component Lifecycles', 'Render Optimization'],
          expectedPoints: ['Architectural design decisions', 'State management approach', 'Real-world edge case resolution', 'Performance considerations'],
        },
        {
          id: 'q2',
          category: `Candidate Stated Skill • ${secondarySkill}`,
          difficulty: isHard ? 'Hard' : 'Medium',
          prompt: `You also mentioned working extensively with ${secondarySkill}. How do you design APIs, handle asynchronous error propagation, and optimize backend throughput and latency when scaling ${secondarySkill} services?`,
          keywords: [secondarySkill, 'Throughput Optimization', 'Error Handling', 'Asynchronous Flow'],
          expectedPoints: ['Middleware/Pipeline design', 'Profiling & latency reduction', 'Fault tolerance & graceful degradation', 'Database connection management'],
        },
        {
          id: 'q3',
          category: `Data & Infrastructure • ${tertiarySkill}`,
          difficulty: isHard ? 'Hard' : 'Medium',
          prompt: `Connecting with your background in ${tertiarySkill}, how do you ensure data integrity, prevent race conditions during concurrent write operations, and structure your schema or caching layers?`,
          keywords: [tertiarySkill, 'ACID & Transactions', 'Concurrency Controls', 'Caching Layers'],
          expectedPoints: ['Optimistic vs pessimistic locking', 'Indexing strategies', 'Data normalization/denormalization trade-offs', 'Resilience under peak traffic'],
        },
        {
          id: 'q4',
          category: 'End-to-End System Design & CI/CD',
          difficulty: isEasy ? 'Easy' : 'Medium',
          prompt: `How do you tie together ${primarySkill} and ${secondarySkill} into a modern automated CI/CD pipeline with containerization, automated testing, and zero-downtime blue/green deployment?`,
          keywords: ['Docker / Containers', 'CI/CD Pipelines', 'Automated Testing', 'Deployment Strategies'],
          expectedPoints: ['Unit & integration testing suites', 'Continuous deployment automation', 'Container orchestration', 'Monitoring and rollback triggers'],
        },
        {
          id: 'q5',
          category: 'STAR Problem Solving & Project Delivery',
          difficulty: 'Easy',
          prompt: `Reflecting on "${detectedProject}" or past experiences with ${primarySkill}, describe a challenging technical roadblock you encountered. Using the STAR method (Situation, Task, Action, Result), how did you resolve it?`,
          keywords: ['STAR Methodology', 'Root Cause Analysis', 'Technical Resilience', 'Measurable Impact'],
          expectedPoints: ['Clear problem context', 'Ownership and specific actions taken', 'Measurable positive outcome', 'Post-incident learnings'],
        },
      ];
    }

    if (roleLower.includes('ai') || roleLower.includes('ml') || roleLower.includes('data')) {
      return [
        {
          id: 'q1',
          category: 'Resume Project Deep-Dive',
          difficulty: isHard ? 'Hard' : isEasy ? 'Easy' : 'Medium',
          prompt: `Reviewing "${detectedProject}" on your resume utilizing ${detectedTech}, how did you select your model architecture, preprocess noisy training data, and prevent overfitting or data leakage?`,
          keywords: ['Feature Engineering', 'Model Selection', 'Cross-Validation', 'Overfitting'],
          expectedPoints: ['Data preprocessing pipeline', 'Hyperparameter tuning', 'Validation splits', 'Inference latency optimization'],
        },
        {
          id: 'q2',
          category: 'Model Serving & Scale',
          difficulty: isHard ? 'Hard' : 'Medium',
          prompt: 'How do you design a low-latency model inference microservice that can handle bursty user traffic with vector search or embeddings?',
          keywords: ['Vector Databases', 'Batching', 'Quantization / ONNX', 'Caching'],
          expectedPoints: ['Inference batching', 'Vector index indexing (HNSW)', 'Quantization benefits', 'Horizontal autoscaling'],
        },
        {
          id: 'q3',
          category: 'Evaluation & Drift',
          difficulty: 'Medium',
          prompt: 'How do you detect and mitigate model drift and hallucination when deploying models into live production environments?',
          keywords: ['Data Drift (KS-test)', 'Grounding / RAG', 'Monitoring Telemetry', 'Confidence Thresholds'],
          expectedPoints: ['Grounding mechanisms', 'Statistical distribution monitoring', 'Human-in-the-loop fallback', 'Continuous re-evaluation'],
        },
        {
          id: 'q4',
          category: 'Behavioral & Product Impact',
          difficulty: 'Easy',
          prompt: 'Tell me about how you explained a complex machine learning concept or technical limitation to a non-technical stakeholder.',
          keywords: ['STAR Approach', 'Clear Metaphors', 'Business Metrics', 'Expectation Setting'],
          expectedPoints: ['Translating accuracy to business value', 'Setting clear expectations', 'Active stakeholder empathy'],
        },
      ];
    }

    if (roleLower.includes('bcom') || roleLower.includes('financ') || roleLower.includes('account') || roleLower.includes('tax')) {
      return [
        {
          id: 'q1',
          category: 'Resume Project & Academic Core',
          difficulty: 'Medium',
          prompt: `Based on your academic training and resume experience with ${detectedTech}, explain how you construct a Three-Statement Financial Model, and how depreciation links the income statement, balance sheet, and cash flow statement.`,
          keywords: ['Income Statement', 'Cash Flow', 'Balance Sheet', 'Depreciation Schedule'],
          expectedPoints: ['Income statement operating expense', 'Cash flow non-cash add-back', 'PP&E asset reduction on Balance sheet'],
        },
        {
          id: 'q2',
          category: 'Corporate Taxation & Compliance',
          difficulty: 'Medium',
          prompt: 'How do you perform statutory reconciliation between book profits and taxable income under prevailing corporate tax regulations?',
          keywords: ['Book vs Tax Differences', 'Deferred Tax Assets/Liabilities', 'GST Reconciliation', 'Compliance'],
          expectedPoints: ['Permanent vs timing differences', 'Deferred tax calculations', 'Input tax credit validation'],
        },
        {
          id: 'q3',
          category: 'Internal Audit & Risk Controls',
          difficulty: 'Hard',
          prompt: 'Walk me through how you conduct an internal audit of accounts payable to detect discrepancies, duplicate billings, or fraud.',
          keywords: ['Three-Way Matching', 'Internal Controls', 'SOX Compliance', 'Audit Sampling'],
          expectedPoints: ['Purchase order, invoice & receipt matching', 'Segregation of duties', 'Sampling methodology'],
        },
      ];
    }

    // Default universal technical questions
    return [
      {
        id: 'q1',
        category: 'Resume Background & Foundations',
        difficulty: isHard ? 'Hard' : isEasy ? 'Easy' : 'Medium',
        prompt: `Based on your resume and experience applying for ${role}, what was the most technically complex challenge you solved in "${detectedProject}"?`,
        keywords: ['Problem Formulation', 'Technical Decisions', 'Execution', 'Outcome'],
        expectedPoints: ['Precise problem definition', 'Trade-off analysis between alternatives', 'Quantifiable project impact'],
      },
      {
        id: 'q2',
        category: 'Core Competency & Scalability',
        difficulty: isHard ? 'Hard' : 'Medium',
        prompt: `How do you structure systems and codebases for ${role} to ensure modularity, high performance, and ease of automated testing?`,
        keywords: ['Modularity', 'Clean Architecture', 'Testing Automation', 'Design Patterns'],
        expectedPoints: ['Separation of concerns', 'Dependency injection / contracts', 'Automated test coverage'],
      },
      {
        id: 'q3',
        category: 'STAR Problem Solving',
        difficulty: 'Medium',
        prompt: 'Describe a production or project deadline under which you had to make a difficult technical trade-off. How did you decide what to prioritize?',
        keywords: ['STAR Methodology', 'Trade-offs', 'Prioritization', 'Delivery'],
        expectedPoints: ['Clear Situation and Task', 'Decisive Action taken', 'Business and engineering Result'],
      },
    ];
  }

  private getMockEvaluation(
    role: string,
    questionsWithAnswers: { question: string; answer: string; category: string }[],
    integrityData: { violationCount: number; violations: string[]; completedDurationMins: number },
    resumeText?: string
  ): EvaluationResult {
    // Proctor penalty: 12 points per warning
    const penalty = integrityData.violationCount * 12;
    const integrityScore = Math.max(50, 100 - penalty);

    // Compute genuinely fair per-question evaluation based on what the candidate ACTUALLY answered
    let totalScoreSum = 0;
    const questionAnalysis = questionsWithAnswers.map((qa, idx) => {
      const rawAns = (qa.answer || '').trim();
      const isBlankOrDummy =
        !rawAns ||
        rawAns.length === 0 ||
        rawAns === 'No answer recorded for this question.' ||
        rawAns === 'Detailed architectural response provided.' ||
        /^(idk|no|none|na|n\/a|asdf|test|\.\.\.)$/i.test(rawAns);

      const words = rawAns.split(/\s+/).filter(Boolean);
      const wordCount = isBlankOrDummy ? 0 : words.length;

      let qScore = 0;
      let feedback = '';

      if (isBlankOrDummy || wordCount < 4) {
        // Fair score for no / trivial response
        qScore = 2.0;
        feedback = `No substantive answer recorded. Candidate did not articulate technical principles, architectural patterns, or problem-solving logic for this question.`;
      } else if (wordCount >= 4 && wordCount < 16) {
        // Very brief conceptual mention
        qScore = 5.0;
        feedback = `Very brief conceptual mention. While the response touches on the topic, it lacks implementation specifics, trade-off analysis, and concrete architectural depth required for ${role}.`;
      } else if (wordCount >= 16 && wordCount < 40) {
        // Moderate answer
        qScore = +(6.8 + Math.min(1.0, (wordCount / 40) * 1.0)).toFixed(1);
        feedback = `Solid answer addressing the core question. Demonstrated clear understanding of ${role} concepts. To elevate further, include production error handling and quantifiable performance trade-offs.`;
      } else {
        // Thorough, comprehensive answer
        qScore = +(8.2 + Math.min(1.2, (wordCount / 90) * 1.2)).toFixed(1);
        feedback = `Excellent in-depth response! Clearly structured problem breakdown, sound terminology, and practical engineering judgment aligned with top hiring standards.`;
      }

      totalScoreSum += qScore;

      return {
        questionId: `q${idx + 1}`,
        prompt: qa.question,
        candidateAnswer: rawAns || 'No verbal or written answer recorded for this question.',
        score: Math.min(9.6, qScore),
        aiFeedback: feedback,
        category: qa.category || `${role} Assessment`,
      };
    });

    const count = questionsWithAnswers.length || 1;
    const rawAverage = +(totalScoreSum / count).toFixed(1);

    // Apply small proctor integrity deduction to overall score
    const proctorDeduction = Math.min(2.0, +(integrityData.violationCount * 0.3).toFixed(1));
    const overallScore = Math.max(1.8, Math.min(9.5, +(rawAverage - proctorDeduction).toFixed(1)));

    // Accurately assign Tier according to real performance
    let tier = 'Needs Fundamental Preparation';
    if (overallScore >= 8.5) {
      tier = 'Tier 1 - Enterprise Certified / Strong Hire';
    } else if (overallScore >= 7.0) {
      tier = 'Tier 2 - Placement Ready / Hire';
    } else if (overallScore >= 5.0) {
      tier = 'Tier 3 - Improvement Needed';
    } else {
      tier = 'Needs Fundamental Preparation';
    }

    // Mathematical alignment of sub-competency scores to overall performance
    const basePercent = Math.round(overallScore * 10);
    const technicalScore = Math.min(98, Math.max(20, basePercent + 2));
    const communicationScore = Math.min(98, Math.max(25, basePercent - 2));
    const problemSolvingScore = Math.min(98, Math.max(20, basePercent + 3));
    const domainKnowledgeScore = Math.min(98, Math.max(20, basePercent));
    const confidenceScore = Math.min(95, Math.max(25, basePercent - 4));

    // Dynamic, honest strengths reflecting performance
    const strengths = overallScore >= 7.0
      ? [
          {
            title: `1. Solid ${role} Foundations`,
            description: `Candidate articulated technical terminology and core concepts accurately across the evaluated questions.`,
          },
          {
            title: '2. Structured Problem Solving',
            description: `Demonstrated ability to break problems down logically and explain solutions with structured flow.`,
          },
          {
            title: '3. Practical Implementation Awareness',
            description: `Grounding in practical system architecture and practical trade-offs.`,
          },
        ]
      : [
          {
            title: '1. Basic Conceptual Familiarity',
            description: `Familiarity with high-level terminology and role definitions.`,
          },
          {
            title: '2. Assessment Participation',
            description: `Completed the assessment session within allocated time constraints.`,
          },
        ];

    // Dynamic, honest weaknesses reflecting performance
    const weaknesses = overallScore < 7.0
      ? [
          {
            title: 'Deepen Technical Architecture & Implementation Details',
            description: `Answers were too brief or lacked substantive code and system architecture depth. Practice explaining end-to-end design patterns, state management, and edge-case handling.`,
          },
          {
            title: 'Adopt Structured STAR Methodology',
            description: `When answering interview prompts, structure responses clearly: Situation, Task, Action taken, and quantifiable Result (STAR). Avoid single-line or vague answers.`,
          },
          {
            title: 'Quantify Engineering Impact with Metrics',
            description: `Support claims with specific numbers (e.g. reduced load time by 30%, handled 5,000 req/sec, cut database query latency by 45%).`,
          },
        ]
      : [
          {
            title: 'Quantify Impact with Concrete Business Metrics (STAR)',
            description: `When discussing engineering solutions, explicitly quantify business metrics (e.g. latency reduced by X%, uptime maintained at 99.9%).`,
          },
          {
            title: 'Explore Second-Order Architectural Trade-offs',
            description: `Proactively compare two competing technical patterns or libraries before stating your chosen solution to demonstrate senior engineering rigor.`,
          },
        ];

    const coachNote = overallScore >= 7.0
      ? `Candidate demonstrated solid technical preparedness for ${role}. Refining your trade-off explanations and quantifiable metrics will position you in the top 5% of candidate shortlists.`
      : `Candidate requires further hands-on project practice and mock interview rehearsal for ${role}. Focus on elaborating technical explanations in depth, studying core architecture patterns, and practicing out-loud articulation.`;

    return {
      overallScore,
      tier,
      technicalScore,
      communicationScore,
      problemSolvingScore,
      confidenceScore,
      domainKnowledgeScore,
      integrityScore,
      strengths,
      weaknesses,
      questionAnalysis,
      coachNote,
    };
  }

  private getMockATSAnalysis(role: string, resumeText: string) {
    return {
      score: 84,
      matchingKeywords: [
        'React.js',
        'TypeScript',
        'REST API',
        'Docker',
        'PostgreSQL',
        'Git',
        'TailwindCSS',
        'State Management',
      ],
      missingKeywords: [
        'GraphQL',
        'CI/CD Pipeline',
        'AWS Lambda',
        'Kubernetes',
        'Unit Testing (Jest)',
      ],
      strengths: [
        'Detected concrete data achievements with percentage impact metrics. Recruiters rank this in top percentile.',
        'Strong Project Impact Statements: Bullet formulations follow the Google X-Y-Z formula cleanly.',
      ],
      formattingWarnings: [
        'Standard single-column formatting recommended for legacy ATS systems.',
      ],
      actionableFixes: [
        'Integrate CI/CD pipeline accomplishments in experience section.',
        'Flatten skills section into clean comma-delimited technical categories.',
        'Explicitly mention cloud deployment tools matching target role job description.',
      ],
      categoryCoverage: [
        { category: 'Frontend Architecture', coverage: 90, found: 'React, TS, Tailwind', gap: 'Jest Tests' },
        { category: 'Backend & Data Layer', coverage: 82, found: 'Node.js, PostgreSQL, REST', gap: 'GraphQL' },
        { category: 'DevOps & Cloud Infra', coverage: 68, found: 'Docker, Git', gap: 'AWS Lambda, K8s, CI/CD' },
      ],
    };
  }

  public async generateDailyTip(category?: string, role?: string): Promise<{
    id: string;
    category: string;
    title: string;
    snippet: string;
    actionableStep: string;
    takeaway: string;
    source: 'ai_generated' | 'curated';
  }> {
    const curatedTips = [
      {
        id: 'tip_1',
        category: 'Behavioral & STAR',
        title: 'The 60-Second STAR Ratio',
        snippet: 'When answering behavioral questions, candidates spend too much time on background setup. Structure your response with 15% on Situation/Task, 70% on your specific individual Action, and 15% on measurable Result.',
        actionableStep: 'State the metric or business outcome in your opening sentence before diving into how you solved it.',
        takeaway: 'Focus on what YOU did, not what the team did in general.',
        source: 'curated' as const,
      },
      {
        id: 'tip_2',
        category: 'System Design',
        title: 'Always State Two Disadvantages',
        snippet: 'Interviewers evaluate senior candidates not by their choice of technology, but by how well they understand its trade-offs. Never advocate for an architecture like microservices or NoSQL without stating two operational drawbacks.',
        actionableStep: 'Whenever you introduce Redis or Kafka in a system design interview, explicitly mention cache invalidation complexity or network latency overhead.',
        takeaway: 'There are no silver bullets in engineering, only trade-offs.',
        source: 'curated' as const,
      },
      {
        id: 'tip_3',
        category: 'Camera & Proctoring',
        title: 'Eye Level Habituation for High Integrity',
        snippet: 'AI proctoring models analyze gaze vector and facial landmark stability. Looking down at notes or having your camera positioned below chin level can falsely trigger gaze anomaly alerts.',
        actionableStep: 'Prop your laptop up on books or adjust your webcam so the lens is directly at eye level, and look straight into the camera lens when making key points.',
        takeaway: 'Camera-level eye contact signals both high confidence and interview integrity.',
        source: 'curated' as const,
      },
      {
        id: 'tip_4',
        category: 'Coding & DSA',
        title: 'The 2-Minute Constraint Clarification Rule',
        snippet: 'Junior candidates jump directly into writing code without clarifying boundary conditions. Top performers spend the first 2 minutes confirming input sizes, nullability, duplicates, and edge values.',
        actionableStep: 'Before writing line 1, ask: "Can the array be empty? Are values bounded within 32-bit integers? Should the solution be thread-safe?"',
        takeaway: 'Clarifying constraints demonstrates software craftsmanship before writing any code.',
        source: 'curated' as const,
      },
      {
        id: 'tip_5',
        category: 'Technical Communication',
        title: 'Navigating Unknowns Gracefully',
        snippet: 'When asked about a framework or protocol you have not used, never bluff. Say: "I have not used tool X directly in production, but based on my experience with tool Y, I expect it handles concurrency by..."',
        actionableStep: 'Bridge the question from what you don\'t know to the fundamental principles you do know.',
        takeaway: 'Admitting knowledge boundaries with structured deduction beats pretending.',
        source: 'curated' as const,
      },
      {
        id: 'tip_6',
        category: 'Resume Grounding',
        title: 'Quantify Projects with Google\'s X-Y-Z Formula',
        snippet: 'AI interview engines extract keywords from your resume to generate deep-dive questions. Bullet points without quantitative metrics are often skipped by recruiters and ATS screeners.',
        actionableStep: 'Phrase accomplishments as: "Accomplished [X], as measured by [Y]%, by implementing [Z]."',
        takeaway: 'Numbers turn subjective claims into verifiable engineering achievements.',
        source: 'curated' as const,
      },
    ];

    if (!this.hasKey) {
      const filtered = category && category !== 'All'
        ? curatedTips.filter(t => t.category.toLowerCase().includes(category.toLowerCase()))
        : curatedTips;
      return filtered.length > 0
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : curatedTips[Math.floor(Math.random() * curatedTips.length)];
    }

    try {
      const ai = new GoogleGenAI();
      const categoryPrompt = category && category !== 'All' ? `specifically in the category of "${category}"` : 'across technical interviews, behavioral STAR communication, or anti-cheating video proctoring';
      const rolePrompt = role ? `tailored for someone preparing for a "${role}" role` : 'for technology and engineering candidates';

      const prompt = `
You are a principal technical recruiter and executive interview coach at a top global tech company.
Generate a concise, punchy "Daily Interview Tip" ${categoryPrompt} ${rolePrompt}.

Return a single JSON object with EXACTLY this structure:
{
  "category": "Behavioral & STAR" | "System Design" | "Coding & DSA" | "Camera & Proctoring" | "Technical Communication" | "Resume Grounding",
  "title": "Short catchy title (3 to 6 words)",
  "snippet": "Concise, actionable advice snippet (2 to 3 sentences maximum, clear and practical)",
  "actionableStep": "One concrete thing the candidate can immediately do in their next mock interview",
  "takeaway": "A single memorable punchline or rule of thumb (1 sentence)"
}
Return ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (parsed && parsed.snippet) {
        return {
          id: `tip_ai_${Date.now()}`,
          category: parsed.category || category || 'Career & Interview Strategy',
          title: parsed.title || 'Daily Interview Advice',
          snippet: parsed.snippet,
          actionableStep: parsed.actionableStep || 'Practice this concept aloud in your next mock interview session.',
          takeaway: parsed.takeaway || 'Consistency and structured communication win interviews.',
          source: 'ai_generated',
        };
      }
    } catch (err) {
      console.warn('Gemini daily tip generation notice, falling back to curated:', err);
    }

    const fallback = curatedTips[Math.floor(Math.random() * curatedTips.length)];
    return fallback;
  }

  public async evaluateBehavioralAnswer(
    question: string,
    answer: string,
    role: string = 'Full-Stack Software Engineer'
  ): Promise<{
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
    if (!this.hasKey) {
      return this.getMockBehavioralFeedback(question, answer, role);
    }

    try {
      const ai = new GoogleGenAI();
      const prompt = `
You are Coach Maya Lin, an executive behavioral interview coach evaluating a candidate for the role of "${role}".
The candidate was asked the behavioral question:
"${question}"

The candidate submitted this response:
"${answer}"

Evaluate this answer rigorously using the STAR method (Situation, Task, Action, Result).
Return ONLY a valid JSON object matching this structure:
{
  "score": 85,
  "overallRating": "Strong",
  "starBreakdown": {
    "situation": "Review of the context setup and clarity...",
    "task": "Review of their assigned task, obstacle, or goal...",
    "action": "Review of their specific personal ownership, technical decisions, and individual execution...",
    "result": "Review of the quantifiable outcomes, business metrics, and long-term impact..."
  },
  "strengths": [
    "Highlight of what the candidate did effectively",
    "Another specific positive element"
  ],
  "areasToImprove": [
    "Specific high-impact suggestion to polish their response",
    "Another actionable advice"
  ],
  "polishedSample": "An inspiring, executive-level rewrite of their exact answer showcasing concise STAR structure, strong first-person ownership, and measurable impact.",
  "followUpQuestion": "A realistic probe question the interviewer will ask next to dig deeper into their story.",
  "coachMessage": "A warm, encouraging paragraph from Coach Maya providing conversational feedback and confidence before their live video interview."
}
No extra text or markdown formatting, just the valid JSON object.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (parsed && parsed.starBreakdown) {
        return {
          score: typeof parsed.score === 'number' ? parsed.score : 80,
          overallRating: parsed.overallRating || (parsed.score >= 80 ? 'Strong' : parsed.score >= 65 ? 'Good' : 'Needs Work'),
          starBreakdown: {
            situation: parsed.starBreakdown.situation || 'Context was established.',
            task: parsed.starBreakdown.task || 'Core task was identified.',
            action: parsed.starBreakdown.action || 'Key personal actions described.',
            result: parsed.starBreakdown.result || 'Outcomes and learning articulated.',
          },
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clear narrative structure.'],
          areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove : ['Quantify the final result with numbers.'],
          polishedSample: parsed.polishedSample || answer,
          followUpQuestion: parsed.followUpQuestion || 'How did your team reflect on this outcome during post-mortem?',
          coachMessage: parsed.coachMessage || 'Great rehearsal! Keep your delivery crisp and focus on your individual contribution.',
        };
      }
    } catch (err) {
      console.warn('Gemini behavioral evaluation notice, using heuristic fallback:', err);
    }

    return this.getMockBehavioralFeedback(question, answer, role);
  }

  private getMockBehavioralFeedback(
    question: string,
    answer: string,
    role: string
  ): {
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
  } {
    const wordCount = answer.trim().split(/\s+/).length;
    const lower = answer.toLowerCase();

    // Check for metrics/numbers
    const hasNumbers = /\d+%?|\b(reduced|scaled|increased|decreased|slashed|doubled|latency|throughput)\b/i.test(answer);
    // Check for personal ownership
    const firstPersonCount = (answer.match(/\b(I|my|mine|myself)\b/gi) || []).length;
    const teamCount = (answer.match(/\b(we|our|us)\b/gi) || []).length;
    const hasGoodOwnership = firstPersonCount >= 2;

    let score = 70;
    if (wordCount > 60) score += 8;
    if (wordCount > 120) score += 6;
    if (hasNumbers) score += 8;
    if (hasGoodOwnership) score += 6;
    if (wordCount < 30) score = Math.max(45, score - 20);

    const overallRating: 'Strong' | 'Good' | 'Needs Work' =
      score >= 82 ? 'Strong' : score >= 65 ? 'Good' : 'Needs Work';

    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    if (hasGoodOwnership) {
      strengths.push('Strong individual ownership: Clearly distinguished your personal contributions from the wider team.');
    } else {
      areasToImprove.push('Anchor your contribution: Replace vague "we" language with "I designed", "I coordinated", or "I led".');
    }

    if (hasNumbers) {
      strengths.push('Quantified Business Impact: Anchored the outcome with concrete metrics and verifiable resolution.');
    } else {
      areasToImprove.push('Quantify the Result: Include exact numbers (e.g. "% latency reduced", "days ahead of deadline", or "users supported").');
    }

    if (wordCount >= 70 && wordCount <= 220) {
      strengths.push('Optimal Pacing & Concision: Well-balanced answer length for a 2-minute verbal interview delivery.');
    } else if (wordCount < 50) {
      areasToImprove.push('Flesh out the Action phase: Elaborate on the specific tools and trade-offs you evaluated.');
    }

    if (strengths.length === 0) {
      strengths.push('Addresses the prompt directly with an authentic engineering scenario.');
    }
    if (areasToImprove.length === 0) {
      areasToImprove.push('Consider highlighting long-term cultural or process improvements that remained in place.');
    }

    return {
      score,
      overallRating,
      starBreakdown: {
        situation: wordCount > 25
          ? 'Set the stage clearly with the operational context, project stakes, and team dynamics.'
          : 'Context was a bit brief; introduce the project stakes and timeline earlier.',
        task: 'Defined your explicit challenge and what was at risk if left unresolved.',
        action: hasGoodOwnership
          ? 'Clear articulation of the technical decisions, communication bridges, and actions you spearheaded.'
          : 'Focus more on what YOU specifically decided and executed, rather than collective team efforts.',
        result: hasNumbers
          ? 'Excellent metric-driven wrap-up showing real business impact and engineering stability.'
          : 'Wrap up with measurable results (e.g., SLA maintained, deployment velocity improved, or client satisfaction).',
      },
      strengths,
      areasToImprove,
      polishedSample: `In my role as a ${role}, I encountered a scenario where ${
        lower.includes('deadline') ? 'a high-priority client release was threatened by sudden scope creep' : 'a complex architecture decision sparked conflicting opinions across team members'
      }. My objective was to reconcile priorities without slipping our 2-week sprint commitment. I initiated a structured 30-minute decision matrix where I evaluated trade-offs between tech debt and feature velocity. I individually took ownership of refactoring the core API integration while delegating frontend wiring. As a result, we met our release deadline with zero Sev-1 incidents, slashed operational latency by 28%, and established a reusable decision template adopted team-wide.`,
      followUpQuestion: lower.includes('conflict')
        ? 'If the dissenting team member still disagreed after the project launch, how would you rebuild rapport?'
        : 'Looking back with the benefit of hindsight, what is one architectural trade-off you would approach differently?',
      coachMessage: `You've got a compelling foundation here! With behavioral interviews, recruiters evaluate executive maturity and problem ownership. Practice saying this out loud using the STAR structure, and when you step into the video mock interview, deliver it with a steady, confident cadence.`,
    };
  }

  public async generateInterviewFeedbackReport(payload: {
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
    const role = payload.role || 'Full-Stack Software Engineer';
    const candidateName = payload.candidateName || 'Candidate';
    const qaList = payload.questionsWithAnswers || [];
    const video = payload.videoTelemetry || {
      eyeContactPercent: 82,
      postureStabilityPercent: 88,
      facialEngagementPercent: 85,
      headCenteredPercent: 92,
      lightingScore: 90,
      anomaliesDetected: 0,
      primaryFacialEmotion: 'Attentive & Composed',
    };
    const transcript = payload.transcriptTelemetry || {
      totalWords: 580,
      averageWpm: 142,
      fillerWordsCount: 8,
      starMethodScore: 84,
      technicalVocabularyDensity: 86,
      clarityAndConcisionScore: 82,
    };

    if (this.hasKey) {
      try {
        const ai = new GoogleGenAI();
        const prompt = `
You are an Executive Interview Coach & Senior Technical Evaluator.
Analyze this completed interview for ${candidateName} applying for "${role}".

Interview Transcript:
${qaList.map((qa, i) => `Q${i + 1} (${qa.category || 'General'}): ${qa.question}\nAnswer: ${qa.answer}`).join('\n\n')}

Video & Non-Verbal Telemetry:
- Eye Contact: ${video.eyeContactPercent}%
- Posture Stability: ${video.postureStabilityPercent}%
- Facial Engagement: ${video.facialEngagementPercent}% (${video.primaryFacialEmotion || 'Composed'})
- Head Centered: ${video.headCenteredPercent}%
- Proctor / Motion Anomalies: ${video.anomaliesDetected || 0}

Speech & Linguistic Telemetry:
- Total Word Count: ${transcript.totalWords}
- Speaking Pace: ${transcript.averageWpm} WPM
- Filler Words Count: ${transcript.fillerWordsCount}
- STAR Alignment: ${transcript.starMethodScore}%

Provide a rigorous, structured AI feedback report parsing both transcript and video telemetry.
Return ONLY a valid JSON object matching this structure:
{
  "id": "aifb_${Date.now()}",
  "role": "${role}",
  "candidateName": "${candidateName}",
  "overallScore": 84,
  "deliveryScore": 82,
  "technicalDepthScore": 87,
  "executivePresenceScore": 85,
  "verdict": "Placement Ready / Recommended for Tier-1 Round",
  "summaryExecutiveNote": "2-3 sentences summarizing strengths in architecture and key delivery areas to polish.",
  "transcriptTelemetry": {
    "totalWords": ${transcript.totalWords},
    "averageWpm": ${transcript.averageWpm},
    "fillerWordsCount": ${transcript.fillerWordsCount},
    "fillerWordsBreakdown": [
      { "word": "um", "count": 4 },
      { "word": "like", "count": 2 },
      { "word": "basically", "count": 2 }
    ],
    "starMethodScore": ${transcript.starMethodScore},
    "technicalVocabularyDensity": ${transcript.technicalVocabularyDensity},
    "clarityAndConcisionScore": ${transcript.clarityAndConcisionScore}
  },
  "videoAnalysisTelemetry": {
    "eyeContactPercent": ${video.eyeContactPercent},
    "postureStabilityPercent": ${video.postureStabilityPercent},
    "facialEngagementPercent": ${video.facialEngagementPercent},
    "headCenteredPercent": ${video.headCenteredPercent},
    "lightingScore": ${video.lightingScore || 90},
    "anomaliesDetected": ${video.anomaliesDetected || 0},
    "primaryFacialEmotion": "${video.primaryFacialEmotion || 'Attentive & Composed'}"
  },
  "actionableImprovements": [
    {
      "id": "imp_1",
      "category": "STAR Storytelling",
      "priority": "High",
      "title": "Quantify Engineering Outcomes with Concrete Numbers",
      "observedPattern": "Described positive outcome without mentioning throughput, latency, or time saved.",
      "interviewerImpact": "Recruiters cannot verify the magnitude of your engineering impact without hard metrics.",
      "actionablePrescription": "Anchor the 'Result' phase with at least 2 numbers: percentage improvement and time/money saved.",
      "beforeExample": "We fixed the bug and the app became much faster.",
      "afterExample": "We refactored the caching tier, slashing P99 latency by 34% and cutting server compute costs by $18,000/yr."
    },
    {
      "id": "imp_2",
      "category": "Video & Presence",
      "priority": "Medium",
      "title": "Camera Gaze Calibration During Conceptual Formulation",
      "observedPattern": "Eyes drifted down and to the left for 4-6 seconds while recalling architecture decisions.",
      "interviewerImpact": "Can be misread as hesitation or reading off secondary notes under proctor scrutiny.",
      "actionablePrescription": "Take a deliberate 2-second pause while maintaining direct lens contact before speaking.",
      "beforeExample": "[Candidate looks away to desk corner while saying: 'Um, let me think...']",
      "afterExample": "[Candidate pauses, breathes, holds camera contact: 'That is a great question on partition tolerance. I evaluate two options...']"
    },
    {
      "id": "imp_3",
      "category": "Verbal Delivery",
      "priority": "Medium",
      "title": "Eliminate Filler Word Bridges Between Clauses",
      "observedPattern": "Used 'basically' and 'you know' as bridge crutches when bridging complex ideas.",
      "interviewerImpact": "Dilutes technical authority in front of staff-level interviewers.",
      "actionablePrescription": "Replace the filler sound with complete silence; silence conveys composure.",
      "beforeExample": "So basically we used Redis, you know, because it was fast.",
      "afterExample": "We selected Redis specifically for atomic sub-millisecond key lookups."
    }
  ],
  "questionEvaluations": [
    {
      "questionId": "q1",
      "prompt": "Sample question",
      "candidateTranscript": "Sample transcript",
      "videoObservation": "Steady eye contact, open posture.",
      "score": 8.5,
      "elevatedResponse": "Executive polished response",
      "keyFeedback": "Specific technical note."
    }
  ],
  "sevenDayActionPlan": [
    {
      "dayRange": "Day 1 - 2",
      "focus": "STAR Narrative Architecture",
      "exercise": "Draft 3 core projects using Situation, Task, Action, and Quantified Result index cards.",
      "milestone": "Memorize 3 metric-backed victory stories."
    },
    {
      "dayRange": "Day 3 - 4",
      "focus": "Camera Lens Gaze & Ergonomics",
      "exercise": "Record 2-minute answers with eyes locked directly on the webcam lens using sticky note indicator.",
      "milestone": "Exceed 90% direct camera contact ratio."
    },
    {
      "dayRange": "Day 5 - 6",
      "focus": "Filler Word Eradication & Strategic Pauses",
      "exercise": "Practice deliberate 2-second silence before answering complex technical trade-offs.",
      "milestone": "Zero 'basically' or 'you know' crutches across 5-minute technical explanation."
    },
    {
      "dayRange": "Day 7",
      "focus": "Full Mock Simulation",
      "exercise": "Run full 15-minute proctored mock interview combining video posture and STAR cadence.",
      "milestone": "Achieve overall feedback score above 90/100."
    }
  ]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        if (parsed && parsed.overallScore && parsed.actionableImprovements) {
          return {
            ...parsed,
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Gemini interview feedback report generation notice, using fallback:', err);
      }
    }

    return this.getMockInterviewFeedbackReport(role, candidateName, qaList, video, transcript);
  }

  private getMockInterviewFeedbackReport(
    role: string,
    candidateName: string,
    qaList: { question: string; answer: string; category?: string }[],
    video: any,
    transcript: any
  ): any {
    const wordCount = transcript.totalWords || 580;
    const wpm = transcript.averageWpm || 142;
    const fillers = transcript.fillerWordsCount || 8;
    const eyeContact = video.eyeContactPercent || 84;
    const posture = video.postureStabilityPercent || 89;

    let overallScore = 82;
    if (eyeContact > 80) overallScore += 3;
    if (wpm >= 130 && wpm <= 160) overallScore += 3;
    if (fillers <= 6) overallScore += 2;
    if (posture > 85) overallScore += 2;

    const deliveryScore = Math.min(96, Math.max(65, Math.round((eyeContact * 0.5) + (posture * 0.3) + 15)));
    const technicalDepthScore = Math.min(95, Math.max(60, overallScore + 3));
    const executivePresenceScore = Math.min(95, Math.max(65, Math.round((posture * 0.6) + (eyeContact * 0.4))));

    const evaluatedQuestions = (qaList.length > 0 ? qaList : [
      {
        question: 'How do you design scalable APIs that handle sudden traffic spikes?',
        answer: 'I would use load balancers, caching with Redis, and auto-scaling compute pods. Also database connection pooling so the backend does not crash.',
        category: 'System Architecture',
      },
      {
        question: 'Describe a high-stakes disagreement with an engineering lead.',
        answer: 'Our lead wanted to stick with MongoDB, but I advocated for PostgreSQL because of relational ACID constraints. We did a benchmark spike and picked Postgres.',
        category: 'STAR Behavioral',
      },
    ]).map((qa, idx) => ({
      questionId: `q${idx + 1}`,
      prompt: qa.question,
      candidateTranscript: qa.answer,
      videoObservation: idx === 0
        ? 'High posture stability (94%), steady eye level, clear articulation.'
        : 'Slight head tilt when describing conflict; maintained calm facial composure.',
      score: +(8.0 + (idx * 0.4)).toFixed(1),
      elevatedResponse: idx === 0
        ? 'In my architecture, I implement a 3-tier defense: Cloudflare rate limiting at edge, distributed Redis token-bucket cluster with sub-2ms latency, and Kubernetes horizontal pod autoscalers triggered on CPU/network thresholds. This prevents cascading database saturation while guaranteeing 99.99% uptime.'
        : 'When evaluating data models for our transaction ledger, I respected our lead’s familiarity with Mongo while objectively highlighting our ACID consistency obligations. I spearheaded a 48-hour benchmark measuring write throughput under contention. The empirical data demonstrated Postgres reduced deadlock risk by 42%, securing team-wide consensus.',
      keyFeedback: idx === 0
        ? 'Excellent foundational concepts. Quantifying exact throughput numbers (e.g. 50k QPS) elevates you from mid to senior candidate.'
        : 'Good conflict resolution. Explicitly mention the post-implementation relationship with your lead.',
    }));

    return {
      id: `aifb_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      role,
      candidateName,
      overallScore,
      deliveryScore,
      technicalDepthScore,
      executivePresenceScore,
      verdict: overallScore >= 85 ? 'Strong Hire / Tier-1 Certified' : 'Hire / Placement Ready with Targeted Polish',
      summaryExecutiveNote: `Candidate demonstrated solid technical grounding and composed non-verbal composure throughout the evaluation for ${role}. Verbal pacing averaged ${wpm} WPM (optimal range: 130–160 WPM) with ${eyeContact}% camera contact. Actionable improvements center on eliminating bridge filler words and embedding quantified metrics into STAR answers.`,
      transcriptTelemetry: {
        totalWords: wordCount,
        averageWpm: wpm,
        fillerWordsCount: fillers,
        fillerWordsBreakdown: [
          { word: 'um', count: Math.ceil(fillers * 0.4) },
          { word: 'basically', count: Math.ceil(fillers * 0.3) },
          { word: 'like', count: Math.max(1, Math.floor(fillers * 0.2)) },
          { word: 'you know', count: 1 },
        ],
        starMethodScore: 84,
        technicalVocabularyDensity: 88,
        clarityAndConcisionScore: 82,
      },
      videoAnalysisTelemetry: {
        eyeContactPercent: eyeContact,
        postureStabilityPercent: posture,
        facialEngagementPercent: video.facialEngagementPercent || 86,
        headCenteredPercent: video.headCenteredPercent || 92,
        lightingScore: video.lightingScore || 90,
        anomaliesDetected: video.anomaliesDetected || 0,
        primaryFacialEmotion: video.primaryFacialEmotion || 'Attentive & Composed',
      },
      actionableImprovements: [
        {
          id: 'imp_1',
          category: 'STAR Storytelling',
          priority: 'High',
          title: 'Quantify Engineering Outcomes with Concrete Numbers',
          observedPattern: 'Addressed problem and resolution directly, but left final business and performance impact qualitative.',
          interviewerImpact: 'Hiring managers cannot gauge project scope or engineering rigor without empirical metrics.',
          actionablePrescription: 'Conclude every scenario with 2 concrete numbers: % latency/efficiency gain, and business value protected.',
          beforeExample: 'We deployed the fix and the database stopped locking up.',
          afterExample: 'We deployed the connection pool fix within 22 minutes, eliminating deadlocks and slashing P99 checkout latency by 45%.',
        },
        {
          id: 'imp_2',
          category: 'Video & Presence',
          priority: 'Medium',
          title: 'Direct Camera Lens Contact During Solution Formulation',
          observedPattern: `Eye gaze drifted to monitor corner for 3-5 seconds when transitioning between technical trade-offs (${eyeContact}% total contact).`,
          interviewerImpact: 'Looking away during complex technical recall can be misinterpreted as searching for external hints.',
          actionablePrescription: 'Place a small visual cue right beside the camera aperture. Hold camera contact while pausing silently.',
          beforeExample: '[Gaze shifts to lower desktop taskbar while gathering thoughts]',
          afterExample: '[Eyes held steady on camera aperture with quiet 2-second breath before starting response]',
        },
        {
          id: 'imp_3',
          category: 'Verbal Delivery',
          priority: 'Medium',
          title: 'Replace Verbal Crutch Fillers with Deliberate Pauses',
          observedPattern: `Detected ${fillers} filler words ('basically', 'um') predominantly at sentence boundaries.`,
          interviewerImpact: 'Excessive filler words diminish perceptions of executive decisiveness.',
          actionablePrescription: 'Practice the "Breathe-Pause-Speak" rule. A 1.5-second silence sounds thoughtful to an interviewer.',
          beforeExample: 'So basically what happened was, like, our service was overloaded...',
          afterExample: 'During our Black Friday traffic peak, our auth microservice experienced an unexpected 4x throughput surge.',
        },
        {
          id: 'imp_4',
          category: 'Technical Precision',
          priority: 'Polish',
          title: 'Proactively Highlight Architectural Trade-Offs',
          observedPattern: 'Immediately presented chosen tool without contrasting against alternative paradigms.',
          interviewerImpact: 'Distinguishes senior engineers who understand trade-offs from engineers who know only one stack.',
          actionablePrescription: 'Structure technical answers with: 1) What we chose, 2) The alternative considered, and 3) Why the alternative was rejected.',
          beforeExample: 'I would use Redis cache for session management.',
          afterExample: 'While Memcached offers high multi-threaded simplicity, we selected Redis for its native pub/sub capabilities and sorted sets.',
        },
      ],
      questionEvaluations: evaluatedQuestions,
      sevenDayActionPlan: [
        {
          dayRange: 'Day 1 - 2',
          focus: 'Metric-Driven STAR Story Bank',
          exercise: 'Write down 4 engineering stories with exact metrics (% latency, scale, headcount, revenue).',
          milestone: 'Deliver each story under 90 seconds without notes.',
        },
        {
          dayRange: 'Day 3 - 4',
          focus: 'Webcam Eye Gaze & Framing Alignment',
          exercise: 'Position webcam at eye level. Practice 3 technical questions maintaining 90%+ camera contact.',
          milestone: 'Zero downward glances during problem setup.',
        },
        {
          dayRange: 'Day 5 - 6',
          focus: 'Filler Word Elimination & Pause Control',
          exercise: 'Record verbal responses with audio analyzer. Tap table whenever tempted to say "basically".',
          milestone: 'Under 2 filler words across 10 minutes of speaking.',
        },
        {
          dayRange: 'Day 7',
          focus: 'Full Proctored Rehearsal Simulation',
          exercise: 'Complete a full timed video mock session integrating all video and transcript fixes.',
          milestone: 'Exceed 90/100 composite interview readiness index.',
        },
      ],
    };
  }
}

export const geminiService = new GeminiService();

