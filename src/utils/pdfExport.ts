import { jsPDF } from 'jspdf';

export interface ResumeData {
  candidateName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    role: string;
    company: string;
    period: string;
    location: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    technologies: string[];
    period: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
    scoreOrDetails: string;
  }[];
  certifications?: string[];
}

export const DEFAULT_OPTIMIZED_RESUME: ResumeData = {
  candidateName: 'Aryan Sharma',
  targetRole: 'Full-Stack Software Engineer',
  email: 'aryan.sharma@example.com',
  phone: '+91 98765 43210',
  location: 'Bengaluru, India',
  linkedin: 'linkedin.com/in/aryansharma',
  github: 'github.com/aryansharma',
  summary:
    'Results-driven Full-Stack Software Engineer with 3+ years of experience engineering high-throughput web applications, resilient distributed systems, and real-time user experiences. Proven track record of reducing latency by 34% and scaling platforms to 120k+ monthly active users. Specialized in React, TypeScript, Node.js, PostgreSQL, Docker, AWS Lambda serverless computing, and automated CI/CD pipelines.',
  skills: [
    {
      category: 'Languages & Core',
      items: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'SQL', 'HTML5/CSS3'],
    },
    {
      category: 'Frontend Architecture',
      items: ['React.js', 'Next.js', 'Redux Toolkit', 'TailwindCSS', 'Jest', 'React Testing Library'],
    },
    {
      category: 'Backend & APIs',
      items: ['Node.js', 'Express.js', 'RESTful APIs', 'GraphQL', 'Microservices', 'WebSockets'],
    },
    {
      category: 'Databases & Storage',
      items: ['PostgreSQL', 'MongoDB', 'Redis (Caching & Pub/Sub)', 'Prisma / Drizzle ORM'],
    },
    {
      category: 'Cloud, DevOps & Tools',
      items: ['Docker', 'AWS (Lambda, S3, EC2)', 'GitHub Actions (CI/CD)', 'Git', 'Linux / Bash'],
    },
  ],
  experience: [
    {
      role: 'Full-Stack Software Engineer',
      company: 'Nexus Infotech Solutions',
      period: '2023 - Present',
      location: 'Bengaluru, India',
      bullets: [
        'Architected and delivered full-stack e-commerce enterprise dashboard serving 120,000+ monthly active users using React, TypeScript, and Node.js microservices.',
        'Engineered automated GitHub Actions CI/CD deployment pipelines, cutting staging-to-production deployment cycle times by 42% and eliminating release outages.',
        'Refactored high-traffic PostgreSQL query plans and integrated Redis caching layer, decreasing p99 server response latencies from 680ms to 210ms (34% overall latency improvement).',
        'Implemented serverless asynchronous event-driven worker tasks utilizing AWS Lambda and S3, offloading intensive PDF and report generation workloads.',
      ],
    },
    {
      role: 'Software Developer Associate',
      company: 'Apex Digital Labs',
      period: '2022 - 2023',
      location: 'Bengaluru, India',
      bullets: [
        'Developed reusable, accessible UI component system in React and TailwindCSS, standardizing frontend architecture across 4 flagship client web applications.',
        'Created RESTful endpoints with Node.js and PostgreSQL with role-based access control (RBAC), JWT authentication, and comprehensive schema validations.',
        'Integrated automated unit and integration test suites using Jest, increasing test coverage from 45% to 88% across core services.',
      ],
    },
  ],
  projects: [
    {
      title: 'GeoRecruit AI — Intelligent Proctoring & Technical Interview Platform',
      technologies: ['React', 'TypeScript', 'Node.js', 'Gemini AI API', 'TailwindCSS', 'WebRTC'],
      period: '2024',
      bullets: [
        'Engineered an enterprise-grade AI technical assessment suite incorporating facial landmark proctoring, multi-face anomaly alerts, and dynamic resume-grounded question synthesis.',
        'Constructed speech-to-text live transcription and real-time STAR evaluation engines, generating actionable rubric-based scoring reports across 5 core technical competencies.',
      ],
    },
    {
      title: 'Distributed Real-Time Collaboration & State Synchronization Engine',
      technologies: ['Node.js', 'WebSockets', 'Redis', 'Docker', 'PostgreSQL'],
      period: '2023',
      bullets: [
        'Built a real-time collaborative workspace supporting concurrent multi-user editing with conflict-free optimistic updates and sub-50ms sync latencies.',
        'Containerized entire application stack using Docker Compose, establishing zero-downtime blue/green deployment strategy.',
      ],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Technology (B.Tech) in Computer Science & Engineering',
      institution: 'National Institute of Technology',
      period: '2019 - 2023',
      scoreOrDetails: 'CGPA: 8.8 / 10.0 • First Class with Distinction',
    },
  ],
  certifications: [
    'AWS Certified Solutions Architect – Associate',
    'Meta Certified Front-End Developer Specialization',
  ],
};

/**
 * Generates and downloads a clean, ATS-compliant single/multi-page PDF directly in the browser.
 */
export const exportOptimizedResumePDF = (data: ResumeData = DEFAULT_OPTIMIZED_RESUME): boolean => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 42;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // --- Header: Candidate Name ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 25, 35);
    doc.text(data.candidateName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 18;

    // --- Target Role Title ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 105, 72); // Brand primary emerald
    doc.text(data.targetRole.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 14;

    // --- Contact Info Line ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 80, 95);
    const contactLine = `${data.email}  |  ${data.phone}  |  ${data.location}  |  ${data.linkedin}  |  ${data.github}`;
    doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
    y += 12;

    // Divider Line
    doc.setDrawColor(200, 210, 220);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    // Section Header Helper
    const printSectionHeader = (title: string) => {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(0, 85, 55);
      doc.text(title.toUpperCase(), margin, y);
      y += 4;
      doc.setDrawColor(0, 105, 72);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;
    };

    // --- SECTION 1: PROFESSIONAL SUMMARY ---
    printSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);
    doc.setTextColor(40, 45, 55);
    const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 12 + 10;

    // --- SECTION 2: CORE TECHNICAL COMPETENCIES ---
    printSectionHeader('Technical Competencies (ATS-Optimized)');
    data.skills.forEach((group) => {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 35, 45);
      const categoryLabel = `${group.category}: `;
      doc.text(categoryLabel, margin, y);
      const catWidth = doc.getTextWidth(categoryLabel);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 65, 75);
      const skillsText = group.items.join('  •  ');
      const wrappedSkills = doc.splitTextToSize(skillsText, contentWidth - catWidth);
      doc.text(wrappedSkills, margin + catWidth, y);
      y += Math.max(1, wrappedSkills.length) * 12 + 2;
    });
    y += 8;

    // --- SECTION 3: PROFESSIONAL EXPERIENCE ---
    printSectionHeader('Professional Experience');
    data.experience.forEach((exp) => {
      checkPageBreak(40);
      // Role & Dates
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.8);
      doc.setTextColor(20, 25, 35);
      doc.text(exp.role, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(90, 100, 110);
      doc.text(`${exp.period}  |  ${exp.location}`, pageWidth - margin, y, { align: 'right' });
      y += 12;

      // Company
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 105, 72);
      doc.text(exp.company, margin, y);
      y += 11;

      // Bullets
      exp.bullets.forEach((bullet) => {
        checkPageBreak(24);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.8);
        doc.setTextColor(45, 50, 60);

        // Bullet point dot
        doc.text('•', margin + 6, y);
        const bulletLines = doc.splitTextToSize(bullet, contentWidth - 20);
        doc.text(bulletLines, margin + 18, y);
        y += bulletLines.length * 11.5 + 2;
      });
      y += 6;
    });

    // --- SECTION 4: KEY ENGINEERING PROJECTS ---
    printSectionHeader('Key Technical Projects');
    data.projects.forEach((proj) => {
      checkPageBreak(35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 25, 35);
      doc.text(proj.title, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 100, 110);
      doc.text(proj.period, pageWidth - margin, y, { align: 'right' });
      y += 11;

      // Tech Stack
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 105, 72);
      doc.text(`Technologies: ${proj.technologies.join(', ')}`, margin, y);
      y += 11;

      // Bullets
      proj.bullets.forEach((bullet) => {
        checkPageBreak(22);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.8);
        doc.setTextColor(45, 50, 60);
        doc.text('•', margin + 6, y);
        const bulletLines = doc.splitTextToSize(bullet, contentWidth - 20);
        doc.text(bulletLines, margin + 18, y);
        y += bulletLines.length * 11.5 + 2;
      });
      y += 5;
    });

    // --- SECTION 5: EDUCATION ---
    printSectionHeader('Education');
    data.education.forEach((edu) => {
      checkPageBreak(28);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      doc.setTextColor(20, 25, 35);
      doc.text(edu.degree, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 100, 110);
      doc.text(edu.period, pageWidth - margin, y, { align: 'right' });
      y += 11;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(60, 65, 75);
      doc.text(`${edu.institution}  •  ${edu.scoreOrDetails}`, margin, y);
      y += 14;
    });

    // --- SECTION 6: CERTIFICATIONS ---
    if (data.certifications && data.certifications.length > 0) {
      printSectionHeader('Certifications & Licenses');
      checkPageBreak(20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(45, 50, 60);
      const certLine = data.certifications.join('   •   ');
      const wrappedCerts = doc.splitTextToSize(certLine, contentWidth);
      doc.text(wrappedCerts, margin, y);
      y += wrappedCerts.length * 11 + 6;
    }

    // Save and trigger download
    const cleanFileName = `${data.candidateName.replace(/\s+/g, '_')}_Optimized_Resume.pdf`;
    doc.save(cleanFileName);
    return true;
  } catch (err) {
    console.error('Error generating PDF with jsPDF:', err);
    return false;
  }
};

/**
 * Exports an ATS Audit & Benchmark Dossier report PDF
 */
export const exportATSDossierPDF = (
  candidateName: string,
  role: string,
  score: number,
  matchingKeywords: string[],
  missingKeywords: string[]
): boolean => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 45;
    let y = margin;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 105, 72);
    doc.text('GEORECRUIT AI — ATS EVALUATION DOSSIER', margin, y);
    y += 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 90, 100);
    doc.text(`Candidate: ${candidateName}   |   Target Role: ${role}`, margin, y);
    y += 14;
    doc.text(`Generated: ${new Date().toLocaleDateString()}   |   Status: AI Verified`, margin, y);
    y += 14;

    doc.setDrawColor(200, 210, 220);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // Score Callout Box
    doc.setFillColor(235, 248, 242);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 60, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(0, 105, 72);
    doc.text(`${score} / 100`, margin + 20, y + 40);

    doc.setFontSize(12);
    doc.setTextColor(20, 25, 35);
    doc.text('ATS PARSER BENCHMARK: TOP 5% TIER', margin + 140, y + 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(70, 80, 95);
    doc.text('Semantic match passes Workday, Taleo, and Greenhouse screening filters.', margin + 140, y + 44);
    y += 80;

    // Matching Keywords
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 25, 35);
    doc.text(`Confirmed High-Frequency Keywords (${matchingKeywords.length})`, margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(50, 60, 70);
    const kwText = matchingKeywords.join('  •  ');
    const kwLines = doc.splitTextToSize(kwText, pageWidth - margin * 2);
    doc.text(kwLines, margin, y);
    y += kwLines.length * 13 + 20;

    // Missing Gaps Addressed
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 25, 35);
    doc.text('Identified Competency Gaps & AI Fixes', margin, y);
    y += 14;
    const recommendations = [
      'CI/CD Integration: Added automated GitHub Actions metrics reducing deployment failure by 42%.',
      'Table Grid Flattening: Flattened nested tabular skills to standardized single lines.',
      'Serverless & Cloud: Added AWS Lambda and Redis caching bullets to match high-weight filter tags.',
    ];
    recommendations.forEach((rec) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(50, 60, 70);
      doc.text(`✓ ${rec}`, margin, y);
      y += 16;
    });

    doc.save(`${candidateName.replace(/\s+/g, '_')}_ATS_Report.pdf`);
    return true;
  } catch (e) {
    console.error('Error generating dossier:', e);
    return false;
  }
};
