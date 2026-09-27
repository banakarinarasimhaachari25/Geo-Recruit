import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DailyInterviewTip } from '../components/DailyInterviewTip';
import { PerformanceInsightsDashboard } from '../components/PerformanceInsightsDashboard';
import { GeorecruitLogo } from '../components/GeorecruitLogo';

interface CandidateDashboardProps {
  onNavigate: (path: string, params?: any) => void;
  onOpenReview: () => void;
}

interface JobRole {
  id: string;
  title: string;
  field: 'btech' | 'diploma' | 'bcom' | 'other';
  degreeLabel: string;
  company: string;
  companyLogoText: string;
  description: string;
  packageText: string;
  matchScore: number;
  skills: string[];
}

const ALL_JOB_ROLES: JobRole[] = [
  // B.Tech / BE Roles
  {
    id: 'btech_1',
    title: 'Full-Stack Software Engineer',
    field: 'btech',
    degreeLabel: 'B.Tech / BE',
    company: 'Google',
    companyLogoText: 'G',
    description: 'Build scalable distributed cloud web services using React, TypeScript, and microservice APIs.',
    packageText: '18 - 24 LPA',
    matchScore: 94,
    skills: ['React', 'TypeScript', 'Node.js', 'System Design', 'PostgreSQL'],
  },
  {
    id: 'btech_2',
    title: 'AI/ML Applications Engineer',
    field: 'btech',
    degreeLabel: 'B.Tech / BE',
    company: 'Microsoft',
    companyLogoText: 'M',
    description: 'Design, fine-tune, and deploy generative AI pipelines and computer vision models on Azure.',
    packageText: '20 - 26 LPA',
    matchScore: 92,
    skills: ['Python', 'PyTorch', 'LLMs', 'Vector DBs', 'FastAPI'],
  },
  {
    id: 'btech_3',
    title: 'Cloud DevOps & SRE Specialist',
    field: 'btech',
    degreeLabel: 'B.Tech / BE',
    company: 'Amazon',
    companyLogoText: 'A',
    description: 'Manage automated multi-region Kubernetes clusters, CI/CD pipelines, and cloud resilience.',
    packageText: '16 - 22 LPA',
    matchScore: 89,
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Linux'],
  },
  {
    id: 'btech_4',
    title: 'Distributed Systems & Backend Architect',
    field: 'btech',
    degreeLabel: 'B.Tech / BE',
    company: 'Cisco',
    companyLogoText: 'C',
    description: 'Develop low-latency networking event brokers, concurrent messaging protocols, and distributed storage.',
    packageText: '22 - 28 LPA',
    matchScore: 88,
    skills: ['Go', 'C++', 'gRPC', 'Distributed Systems', 'Kafka'],
  },
  {
    id: 'btech_5',
    title: 'Embedded Systems & IoT Firmware Engineer',
    field: 'btech',
    degreeLabel: 'B.Tech / BE',
    company: 'Qualcomm',
    companyLogoText: 'Q',
    description: 'Develop low-power real-time microcontrollers, RTOS kernels, and hardware sensor interfaces in C.',
    packageText: '15 - 20 LPA',
    matchScore: 85,
    skills: ['Embedded C', 'RTOS', 'ARM', 'UART/SPI/I2C', 'Hardware'],
  },
  {
    id: 'btech_6',
    title: 'Cybersecurity & Threat Defense Analyst',
    field: 'btech',
    degreeLabel: 'B.Tech / BE',
    company: 'Accenture',
    companyLogoText: 'AC',
    description: 'Conduct penetration vulnerability assessments, zero-trust audits, and intrusion detection.',
    packageText: '14 - 19 LPA',
    matchScore: 87,
    skills: ['Network Security', 'Ethical Hacking', 'SIEM', 'Cryptography', 'Linux'],
  },

  // Diploma Roles
  {
    id: 'dip_1',
    title: 'Junior Front-End Web Developer',
    field: 'diploma',
    degreeLabel: 'Diploma',
    company: 'TCS',
    companyLogoText: 'TCS',
    description: 'Build responsive web page layouts, client forms, and dynamic components using HTML, CSS & React.',
    packageText: '6 - 8 LPA',
    matchScore: 86,
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Git'],
  },
  {
    id: 'dip_2',
    title: 'Network & Systems Support Technician',
    field: 'diploma',
    degreeLabel: 'Diploma',
    company: 'Wipro',
    companyLogoText: 'W',
    description: 'Configure local LAN/WAN switches, firewalls, routers, and resolve client enterprise IT tickets.',
    packageText: '5 - 7 LPA',
    matchScore: 84,
    skills: ['CCNA Basics', 'Windows Server', 'Routing', 'Hardware Support'],
  },
  {
    id: 'dip_3',
    title: 'CAD & Engineering Design Drafter',
    field: 'diploma',
    degreeLabel: 'Diploma',
    company: 'L&T',
    companyLogoText: 'L&T',
    description: 'Draft 2D technical drawings and 3D architectural component blueprints using AutoCAD.',
    packageText: '5.5 - 7.5 LPA',
    matchScore: 82,
    skills: ['AutoCAD', 'SolidWorks', 'Technical Drafting', 'Geometric Tolerances'],
  },
  {
    id: 'dip_4',
    title: 'Technical Helpdesk & Hardware Associate',
    field: 'diploma',
    degreeLabel: 'Diploma',
    company: 'Infosys',
    companyLogoText: 'INF',
    description: 'Diagnose server desktop hardware issues, OS provisioning, peripheral setups, and ticket triage.',
    packageText: '4.8 - 6.8 LPA',
    matchScore: 85,
    skills: ['ITIL', 'Desktop Troubleshooting', 'Hardware Diagnostics', 'Linux'],
  },
  {
    id: 'dip_5',
    title: 'Industrial PLC & Automation Technician',
    field: 'diploma',
    degreeLabel: 'Diploma',
    company: 'Siemens',
    companyLogoText: 'S',
    description: 'Install and program ladder logic for PLC controllers, sensory relays, and manufacturing SCADA.',
    packageText: '6.5 - 8.5 LPA',
    matchScore: 81,
    skills: ['PLC Programming', 'SCADA', 'Sensors & Relays', 'Electrical Wiring'],
  },

  // B.Com Roles
  {
    id: 'bcom_1',
    title: 'Financial Analyst & Valuation Associate',
    field: 'bcom',
    degreeLabel: 'B.Com',
    company: 'Deloitte',
    companyLogoText: 'D',
    description: 'Perform company valuation models, quarterly financial ledger analysis, and fiscal forecasts.',
    packageText: '8 - 12 LPA',
    matchScore: 91,
    skills: ['Financial Modeling', 'Excel / VBA', 'Balance Sheet Analysis', 'Valuation'],
  },
  {
    id: 'bcom_2',
    title: 'Corporate Tax & Accounting Specialist',
    field: 'bcom',
    degreeLabel: 'B.Com',
    company: 'Deloitte',
    companyLogoText: 'D',
    description: 'Handle statutory corporate taxation filings, GST reconciliation, and balance sheet auditing.',
    packageText: '7.5 - 11 LPA',
    matchScore: 89,
    skills: ['Direct / Indirect Tax', 'Tally Prime', 'Statutory Compliance', 'IFRS'],
  },
  {
    id: 'bcom_3',
    title: 'Auditing & Regulatory Compliance Consultant',
    field: 'bcom',
    degreeLabel: 'B.Com',
    company: 'Accenture',
    companyLogoText: 'AC',
    description: 'Review corporate accounting practices, risk advisory assessments, and internal financial controls.',
    packageText: '8.5 - 13 LPA',
    matchScore: 87,
    skills: ['Internal Audit', 'SOX Compliance', 'Risk Management', 'Forensic Accounting'],
  },
  {
    id: 'bcom_4',
    title: 'Investment Banking Operations Analyst',
    field: 'bcom',
    degreeLabel: 'B.Com',
    company: 'Amazon',
    companyLogoText: 'A',
    description: 'Execute trade settlements, equity derivative allocations, and corporate merchant accounting.',
    packageText: '10 - 15 LPA',
    matchScore: 85,
    skills: ['Securities Settlement', 'Financial Markets', 'KYC/AML', 'Derivatives'],
  },
  {
    id: 'bcom_5',
    title: 'SAP / ERP Financial Consultant',
    field: 'bcom',
    degreeLabel: 'B.Com',
    company: 'TCS',
    companyLogoText: 'TCS',
    description: 'Implement and configure SAP FICO general ledger, accounts payable, and asset accounting modules.',
    packageText: '9 - 14 LPA',
    matchScore: 88,
    skills: ['SAP FICO', 'General Ledger', 'Enterprise ERP', 'Financial Reporting'],
  },

  // Other than CSE Roles
  {
    id: 'other_1',
    title: 'VLSI & Chip Design Engineer (ECE)',
    field: 'other',
    degreeLabel: 'Other than CSE',
    company: 'Qualcomm',
    companyLogoText: 'Q',
    description: 'Design digital ASIC chips, FPGA hardware verification, and RTL synthesis in Verilog.',
    packageText: '16 - 22 LPA',
    matchScore: 89,
    skills: ['Verilog/VHDL', 'ASIC Flow', 'FPGA', 'Static Timing Analysis'],
  },
  {
    id: 'other_2',
    title: 'Robotics & Mechatronics Automation Engineer (Mech)',
    field: 'other',
    degreeLabel: 'Other than CSE',
    company: 'L&T',
    companyLogoText: 'L&T',
    description: 'Develop robotic arm kinematics, automated manufacturing actuators, and servo controls.',
    packageText: '12 - 18 LPA',
    matchScore: 86,
    skills: ['Kinematics', 'Actuators & Sensors', 'MATLAB / Simulink', 'Robotics OS'],
  },
  {
    id: 'other_3',
    title: 'Smart Power Grid & Energy Systems Analyst (EEE)',
    field: 'other',
    degreeLabel: 'Other than CSE',
    company: 'Cisco',
    companyLogoText: 'C',
    description: 'Analyze renewable energy grid tie-ins, substation SCADA telemetry, and load distribution.',
    packageText: '11 - 16 LPA',
    matchScore: 84,
    skills: ['Power Systems', 'Renewable Energy', 'Microgrid', 'Switchgear'],
  },
  {
    id: 'other_4',
    title: 'BIM Structural Modeling Specialist (Civil)',
    field: 'other',
    degreeLabel: 'Other than CSE',
    company: 'L&T',
    companyLogoText: 'L&T',
    description: 'Create architectural Building Information Modeling (BIM) 3D frameworks in Revit and STAAD Pro.',
    packageText: '10 - 15 LPA',
    matchScore: 83,
    skills: ['Revit BIM', 'STAAD Pro', 'Structural Analysis', 'Civil CAD'],
  },
  {
    id: 'other_5',
    title: 'Computational Bioinformatician (Biotech)',
    field: 'other',
    degreeLabel: 'Other than CSE',
    company: 'Accenture',
    companyLogoText: 'AC',
    description: 'Perform DNA/RNA sequencing data algorithms, protein folding analysis, and drug discovery datasets.',
    packageText: '13 - 18 LPA',
    matchScore: 87,
    skills: ['Genomics Python', 'BLAST', 'Molecular Docking', 'Biostatistics'],
  },
];

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  onNavigate,
  onOpenReview,
}) => {
  const { profile, user, logout, updateProfileState } = useAuth();

  // 1. Three Dots (kebab) Menu & Modals State
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'edit' | 'delete' | 'privacy'>('edit');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // 2. Profile Info Modal / Popup State (just below three dots)
  const [showProfileInfoModal, setShowProfileInfoModal] = useState(false);

  // 3. Academics & Work Progress File (Side File Panel)
  const [showAcademicsSideFile, setShowAcademicsSideFile] = useState(false);

  // 4. Search and Dropdown Filter State
  const [searchQuery, setSearchQuery] = useState('');
  // User mandate: "options in drop down are btech/be, Diploma, Bcom, Other than cse and other drop down to select the company name"
  // "1 main thing is that when a user selects btech show the job roles related to btech only"
  const [selectedDegreeField, setSelectedDegreeField] = useState<'btech' | 'diploma' | 'bcom' | 'other' | 'all'>('btech');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  // Edit Profile Form State
  const [editName, setEditName] = useState(profile?.name || user?.name || 'Aryan Sharma');
  const [editPhone, setEditPhone] = useState(profile?.phone || '+91 98765 43210');
  const [editEmail, setEditEmail] = useState(profile?.email || user?.email || 'aryan.sharma@example.edu');
  const [editCollege, setEditCollege] = useState(profile?.college || 'National Institute of Technology');
  const [editDegree, setEditDegree] = useState(profile?.degree || 'B.Tech in Computer Science & Engineering');
  const [editCgpa, setEditCgpa] = useState(profile?.cgpa || '8.6');
  const [editSkills, setEditSkills] = useState(
    profile?.skills?.map((s) => s.name).join(', ') || 'React, TypeScript, Node.js, Python, DSA, SQL'
  );
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Privacy toggles
  const [privacyRecruiterVisible, setPrivacyRecruiterVisible] = useState(true);
  const [privacyProctoringRetention, setPrivacyProctoringRetention] = useState(false);
  const [privacyTelemetry, setPrivacyTelemetry] = useState(true);

  // Delete Account confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // User candidate details
  const candidateName = profile?.name || user?.name || 'Aryan Sharma';
  const candidatePhone = profile?.phone || '+91 98765 43210';
  const candidateEmail = profile?.email || user?.email || 'aryan.sharma@example.edu';
  const candidateDob = profile?.dob || '2003-05-14';
  const candidateCollege = profile?.college || 'National Institute of Technology';
  const candidateDegree = profile?.degree || 'B.Tech / BE (Computer Science)';
  const candidateCgpa = profile?.cgpa || '8.6';
  const candidateSkills = profile?.skills?.map((s) => s.name) || [
    'React.js',
    'TypeScript',
    'Node.js',
    'Python',
    'Data Structures & Algorithms',
    'SQL',
    'System Design',
  ];
  const candidatePersona = profile?.persona || 'student';

  // Resume Upload Before Interview State
  const [activeResumeFileName, setActiveResumeFileName] = useState('Aryan_Sharma_Resume_2025.pdf');
  const [activeResumeText, setActiveResumeText] = useState(
    `Aryan Sharma - Full-Stack & Systems Engineer
Education: B.Tech in Computer Science & Engineering, NIT (CGPA: 8.6)
Skills: React, TypeScript, Node.js, Python, PostgreSQL, Redis, Docker, AWS, Kubernetes, Distributed Systems, CI/CD
Projects:
1. E-Commerce Microservices Engine: Designed an event-driven architecture using Node.js, Redis pub/sub, and PostgreSQL, handling 15,000 req/sec with 99.98% uptime. Implemented idempotency keys and distributed locking.
2. AI Image & Audio Processing Pipeline: Developed Python FastAPI service with vector similarity search for multimodal data. Optimized inference latency by 38% using model batching.
3. Real-Time Collaborative Canvas: WebSockets, CRDTs, and React with TypeScript enabling multi-user low-latency document sync.
Experience: Software Engineering Intern at Tech Innovators (Built automated CI/CD pipeline reducing deployment failures by 42%).`
  );
  const [resumeUploadModalOpen, setResumeUploadModalOpen] = useState(false);
  const [pendingRoleForInterview, setPendingRoleForInterview] = useState<JobRole | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState<string | null>(null);

  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingResume(true);
    setActiveResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || file.name;
      setActiveResumeText(text);
      setIsUploadingResume(false);
      setUploadSuccessAlert(`"${file.name}" uploaded successfully! Questions will be tailored to this resume.`);
      setTimeout(() => setUploadSuccessAlert(null), 3000);
    };
    reader.onerror = () => {
      setIsUploadingResume(false);
    };
    reader.readAsText(file);
  };

  const handleStartRoleInterview = (role: JobRole) => {
    setPendingRoleForInterview(role);
    setResumeUploadModalOpen(true);
  };

  const handleConfirmAndStartInterview = () => {
    setResumeUploadModalOpen(false);
    if (!pendingRoleForInterview) return;
    onNavigate('interview-prep-hub', {
      role: pendingRoleForInterview.title,
      company: pendingRoleForInterview.company,
      resumeText: activeResumeText,
      resumeFileName: activeResumeFileName,
    });
  };

  // Handle Edit Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      name: editName,
      phone: editPhone,
      email: editEmail,
      college: editCollege,
      degree: editDegree,
      cgpa: editCgpa,
      skills: editSkills.split(',').map((s) => ({ name: s.trim(), percentage: 85 })),
    };
    await api.updateProfile(updated);
    updateProfileState(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      setShowSettingsModal(false);
    }, 900);
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteErrorMessage("Please type 'DELETE' exactly to confirm account deletion.");
      return;
    }
    logout();
    onNavigate('landing-page');
  };

  // Strict Filtering:
  // "1 main thing is that when a user selects btech show the job roles related to btech only"
  const filteredRoles = ALL_JOB_ROLES.filter((role) => {
    // 1. Degree field matching
    if (selectedDegreeField !== 'all') {
      if (selectedDegreeField === 'btech' && role.field !== 'btech') return false;
      if (selectedDegreeField === 'diploma' && role.field !== 'diploma') return false;
      if (selectedDegreeField === 'bcom' && role.field !== 'bcom') return false;
      if (selectedDegreeField === 'other' && role.field !== 'other') return false;
    }

    // 2. Company matching
    if (selectedCompany !== 'all') {
      if (role.company.toLowerCase() !== selectedCompany.toLowerCase()) return false;
    }

    // 3. Search query matching
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = role.title.toLowerCase().includes(q);
      const matchDesc = role.description.toLowerCase().includes(q);
      const matchCompany = role.company.toLowerCase().includes(q);
      const matchSkill = role.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCompany && !matchSkill) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-4 space-y-6 pb-32 animate-in fade-in relative">
      {/* ========================================================
          TOP HEADER:
          - Top Middle: Website Logo GeoRecruit
          - Top Right: Three Dots (⋮) kebab menu
          - Just Below: Profile Icon with full personal information
      ======================================================== */}
      <div className="flex items-center justify-between border-b border-surface-container pb-4 relative">
        {/* Left Side: Drawer / Back indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('landing-page')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
            title="Return to GeoRecruit Home"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Home</span>
          </button>

          {/* Quick Trigger to open the Academics & Progress Side File */}
          <button
            onClick={() => setShowAcademicsSideFile(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed text-xs font-bold shadow-2xs hover:opacity-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">folder_open</span>
            <span>Academics & Progress File</span>
          </button>
        </div>

        {/* TOP MIDDLE OF THE PAGE: Official Logo of Georecruit */}
        <div
          onClick={() => onNavigate('landing-page')}
          className="flex flex-col items-center justify-center cursor-pointer select-none"
        >
          <GeorecruitLogo
            variant="stacked"
            size="md"
            showTagline={false}
          />
        </div>

        {/* TOP RIGHT CORNER:
            Three Dots (⋮) Menu with Settings (edit profile, delete account, privacy), Help, About Us, Logout
            & Just Below it: Profile Icon with all personal info */}
        <div className="flex items-center gap-2">
          {/* JUST BELOW / BESIDE: Profile Icon (Clicking reveals all personal information) */}
          <button
            onClick={() => setShowProfileInfoModal(!showProfileInfoModal)}
            className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/50 hover:ring-primary shadow-xs transition-all cursor-pointer relative"
            title="View Personal Information Profile"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3OHx5h2WOBwJprjrL1w6Y5T-o34kBz9F05CggmEMNA9t8QsKbq1DovNQ-cZp4FBByS_mSYcRvqC12RS6NwolL5c7_xyhbdiaaTcp4DJ1jVfZ4iB3xO2o-pINyox8OVnp6odyRkrwOQsHSV8dKR-83OzdSsNhZHKlq9iZ0pKbtYyg-8UgKxt2gmHXdPg8evK6Xc-KE24h8NSEl-0nWoDFq34zN6Ek0VzgOJys_K7uwvGxisQCitopqw"
              alt={candidateName}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary ring-1 ring-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[8px] text-on-primary font-bold">check</span>
            </span>
          </button>

          {/* THREE DOTS (⋮) BUTTON */}
          <div className="relative">
            <button
              onClick={() => setShowThreeDotsMenu(!showThreeDotsMenu)}
              className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              aria-label="Account Settings and Options"
            >
              <span className="material-symbols-outlined text-[24px]">more_vert</span>
            </button>

            {/* THREE DOTS DROPDOWN MENU */}
            {showThreeDotsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThreeDotsMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container p-2 z-50 animate-in fade-in space-y-1">
                  <div className="px-3 py-2 border-b border-surface-container">
                    <p className="text-xs font-bold text-on-surface truncate">{candidateName}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{candidateEmail}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                      {candidatePersona === 'employee' ? 'Employee Track' : 'Student Track'}
                    </span>
                  </div>

                  {/* 1. Settings (Edit Profile, Delete Account, Privacy) */}
                  <button
                    onClick={() => {
                      setShowThreeDotsMenu(false);
                      setSettingsActiveTab('edit');
                      setShowSettingsModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 text-on-surface hover:bg-surface-container font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-primary text-[18px]">settings</span>
                    <span>Settings & Profile</span>
                  </button>

                  {/* Quick Sub-Option: Edit Profile */}
                  <button
                    onClick={() => {
                      setShowThreeDotsMenu(false);
                      setSettingsActiveTab('edit');
                      setShowSettingsModal(true);
                    }}
                    className="w-full text-left pl-7 pr-3 py-1.5 text-[11px] rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    <span>Edit Profile</span>
                  </button>

                  {/* Quick Sub-Option: Privacy Option */}
                  <button
                    onClick={() => {
                      setShowThreeDotsMenu(false);
                      setSettingsActiveTab('privacy');
                      setShowSettingsModal(true);
                    }}
                    className="w-full text-left pl-7 pr-3 py-1.5 text-[11px] rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">security</span>
                    <span>Privacy Options</span>
                  </button>

                  {/* Quick Sub-Option: Delete Account Option */}
                  <button
                    onClick={() => {
                      setShowThreeDotsMenu(false);
                      setSettingsActiveTab('delete');
                      setShowSettingsModal(true);
                    }}
                    className="w-full text-left pl-7 pr-3 py-1.5 text-[11px] rounded-lg text-error hover:bg-error-container/40 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete_forever</span>
                    <span>Delete Account</span>
                  </button>

                  <div className="border-t border-surface-container my-1" />

                  {/* 2. Help */}
                  <button
                    onClick={() => {
                      setShowThreeDotsMenu(false);
                      setShowHelpModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 text-on-surface hover:bg-surface-container font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-secondary text-[18px]">help</span>
                    <span>Help & Guide</span>
                  </button>

                  {/* 3. About Us */}
                  <button
                    onClick={() => {
                      setShowThreeDotsMenu(false);
                      setShowAboutModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 text-on-surface hover:bg-surface-container font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-tertiary text-[18px]">info</span>
                    <span>About Us</span>
                  </button>

                  <div className="border-t border-surface-container my-1" />

                  {/* 4. Logout Option */}
                  <button
                    onClick={() => {
                      setShowThreeDotsMenu(false);
                      logout();
                      onNavigate('landing-page');
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 text-error hover:bg-error-container/40 font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          PERSONAL INFORMATION PROFILE MODAL
          "Just below this there will be a profile icon that has all the personal information about the user"
      ======================================================== */}
      {showProfileInfoModal && (
        <div className="p-5 rounded-2xl bg-surface-container-lowest border-2 border-primary/20 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-lg">
                {candidateName.charAt(0)}
              </div>
              <div>
                <h3 className="font-title-md font-bold text-base text-on-surface flex items-center gap-1.5">
                  <span>{candidateName}</span>
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                </h3>
                <p className="text-xs text-on-surface-variant">{candidateDegree} • {candidateCollege}</p>
              </div>
            </div>
            <button
              onClick={() => setShowProfileInfoModal(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* User Personal Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Full Name:</span>
              <span className="font-bold text-on-surface text-sm">{candidateName}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Phone Number:</span>
              <span className="font-bold text-on-surface text-sm">{candidatePhone}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Email ID:</span>
              <span className="font-bold text-on-surface text-sm">{candidateEmail}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Date of Birth (DOB):</span>
              <span className="font-bold text-on-surface text-sm">{candidateDob}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Institution / Company:</span>
              <span className="font-bold text-on-surface text-sm">{candidateCollege}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low">
              <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Average CGPA / Grade:</span>
              <span className="font-bold text-primary text-sm">{candidateCgpa} / 10.0</span>
            </div>
          </div>

          {/* Skills */}
          <div>
            <span className="text-[11px] text-on-surface-variant uppercase font-semibold block mb-1.5">
              Verified Technical Skills:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {candidateSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-container">
            <span className="text-xs text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Credentials OCR Cross-Checked & Validated</span>
            </span>
            <button
              onClick={() => {
                setShowProfileInfoModal(false);
                setSettingsActiveTab('edit');
                setShowSettingsModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          DAILY INTERVIEW TIP:
          Concise, AI-generated career or interview advice snippet
      ======================================================== */}
      <section>
        <DailyInterviewTip
          onNavigate={onNavigate}
          preferredRole={candidateDegree || 'Full-Stack Software Engineer'}
        />
      </section>

      {/* ========================================================
          SEARCH BAR & DROPDOWNS:
          "and just below it there should be a search bar where user can search any job role
           and then below it there should be a drop down to select the field they have completed their degree
           options in drop down are btech/be, Diploma, Bcom, Other than cse
           and other drop down to select the company name
           1 main thing is that when a user selects btech show the job roles related to btech only"
      ======================================================== */}
      <section className="space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-[22px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any job role (e.g. Full-Stack, AI Engineer, Accountant, DevOps...)"
            className="w-full h-13 pl-12 pr-10 rounded-2xl bg-surface-container-lowest border-2 border-surface-container text-on-surface text-sm font-medium shadow-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* The Two Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dropdown 1: Completed Degree Field (btech/be, Diploma, Bcom, Other than cse) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider flex items-center justify-between">
              <span>Select Degree Field:</span>
              <span className="text-[10px] text-primary font-semibold">
                {selectedDegreeField === 'btech' ? 'Showing B.Tech Roles Only' : 'Dynamic Role Filter'}
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedDegreeField}
                onChange={(e) => setSelectedDegreeField(e.target.value as any)}
                className="w-full h-11 px-3 pr-8 rounded-xl bg-surface-container-lowest border border-surface-container text-on-surface text-xs font-bold shadow-2xs focus:outline-none focus:border-primary cursor-pointer appearance-none"
              >
                <option value="btech">B.Tech / BE (Engineering & Tech)</option>
                <option value="diploma">Diploma (Polytechnic & Technical)</option>
                <option value="bcom">B.Com (Commerce, Finance & Audit)</option>
                <option value="other">Other than CSE (ECE, Mech, Civil, Biotech)</option>
                <option value="all">All Fields & Degrees</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant pointer-events-none text-[18px]">
                arrow_drop_down
              </span>
            </div>
          </div>

          {/* Dropdown 2: Select Company Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
              Select Company Name:
            </label>
            <div className="relative">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full h-11 px-3 pr-8 rounded-xl bg-surface-container-lowest border border-surface-container text-on-surface text-xs font-bold shadow-2xs focus:outline-none focus:border-primary cursor-pointer appearance-none"
              >
                <option value="all">All Companies (Partner Ecosystem)</option>
                <option value="google">Google</option>
                <option value="microsoft">Microsoft</option>
                <option value="amazon">Amazon</option>
                <option value="cisco">Cisco</option>
                <option value="deloitte">Deloitte</option>
                <option value="accenture">Accenture</option>
                <option value="tcs">TCS</option>
                <option value="infosys">Infosys</option>
                <option value="wipro">Wipro</option>
                <option value="qualcomm">Qualcomm</option>
                <option value="l&t">L&T</option>
                <option value="siemens">Siemens</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant pointer-events-none text-[18px]">
                arrow_drop_down
              </span>
            </div>
          </div>
        </div>

        {/* Filter Summary Badge */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
          <span>
            Showing <strong>{filteredRoles.length}</strong> available job roles{' '}
            {selectedDegreeField === 'btech' && (
              <span className="text-primary font-bold">(Restricted strictly to B.Tech / BE tracks)</span>
            )}
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDegreeField('btech');
              setSelectedCompany('all');
            }}
            className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
          >
            Reset Filters (B.Tech default)
          </button>
        </div>
      </section>

      {/* ========================================================
          JOB ROLES BARS IN THE MIDDLE OF THE PAGE:
          "and then in the middle of the page there will be bars showing job roles
           and a 1 line description about the role and there will be start button showing there"
      ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">work</span>
            <h3 className="font-title-md text-sm font-bold text-on-surface">
              Job Roles ({selectedDegreeField === 'btech' ? 'B.Tech / BE Technical Tracks' : 'Selected Category'})
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-on-surface-variant">
            Instant AI Mock Interview Ready
          </span>
        </div>

        {filteredRoles.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-dashed border-surface-container text-center space-y-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[36px]">work_off</span>
            <p className="text-sm font-bold text-on-surface">No job roles match your search filters.</p>
            <p className="text-xs text-on-surface-variant">
              Try choosing "B.Tech / BE" or resetting the company filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDegreeField('btech');
                setSelectedCompany('all');
              }}
              className="mt-2 px-4 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
            >
              Reset to B.Tech Roles
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Role Details & 1-line Description */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surface-container font-extrabold text-xs text-primary flex items-center justify-center shrink-0">
                      {role.companyLogoText}
                    </span>
                    <h4 className="font-title-md text-sm font-bold text-on-surface truncate">
                      {role.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                      {role.degreeLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold">
                      {role.company}
                    </span>
                    <span className="text-[11px] font-bold text-secondary">
                      {role.packageText}
                    </span>
                  </div>

                  {/* 1-Line Description requested by user:
                      "and a 1 line description about the role and there will be start button showing there" */}
                  <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {role.skills.slice(0, 4).map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.2 rounded bg-surface-container-low text-[10px] text-on-surface-variant font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                    <span className="text-[10px] text-primary font-bold ml-1">
                      {role.matchScore}% Match
                    </span>
                  </div>
                </div>

                {/* START BUTTON */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => handleStartRoleInterview(role)}
                    className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-xs font-extrabold shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Start</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          PERFORMANCE INSIGHTS DASHBOARD (RECHARTS VISUALIZATION):
          Visualize skill proficiency progress over multiple mock interviews
      ======================================================== */}
      <div id="performance-insights" className="scroll-mt-6">
        <PerformanceInsightsDashboard
          candidateName={candidateName}
          targetRole={candidateDegree || 'Full-Stack Software Engineer'}
          onStartNewMock={() => {
            const defaultRole = ALL_JOB_ROLES[0];
            handleStartRoleInterview(defaultRole);
          }}
        />
      </div>

      {/* ========================================================
          FLOW CHART (MOVED TO THE END OF THE PAGE):
          "remove the platform workflow flowchart below the search bar in landing page and keep it in the end of the page"
      ======================================================== */}
      <section className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </div>
            <div>
              <h2 className="font-title-md text-sm font-bold text-on-surface">
                Platform Workflow Flowchart
              </h2>
              <p className="font-body-sm text-[11px] text-on-surface-variant">
                Follow this sequential 6-step recruitment pipeline to prepare, assess, and unlock enterprise offers.
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
            Interactive Roadmap
          </span>
        </div>

        {/* Visual Flowchart Nodes */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1">
          {/* Step 1 */}
          <div
            onClick={() => onNavigate('persona-selection')}
            className="p-3 rounded-xl bg-surface-container-low border border-primary/30 flex flex-col justify-between hover:bg-surface-container cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
            </div>
            <div>
              <h4 className="font-title-md text-xs font-bold text-on-surface group-hover:text-primary">
                Profile & ID Proof
              </h4>
              <p className="font-body-sm text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                OCR verification of College ID or Work proof.
              </p>
            </div>
            <span className="text-[10px] text-primary font-bold flex items-center gap-0.5">
              <span>Verified</span>
              <span className="material-symbols-outlined text-[12px]">check</span>
            </span>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => onNavigate('ats-resume-analyzer')}
            className="p-3 rounded-xl bg-surface-container-low border border-secondary/30 flex flex-col justify-between hover:bg-surface-container cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] font-bold flex items-center justify-center">
                2
              </span>
              <span className="material-symbols-outlined text-secondary text-[18px]">document_scanner</span>
            </div>
            <div>
              <h4 className="font-title-md text-xs font-bold text-on-surface group-hover:text-secondary">
                ATS Analyzer
              </h4>
              <p className="font-body-sm text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                Upload resume & test keyword score / 100.
              </p>
            </div>
            <span className="text-[10px] text-secondary font-bold flex items-center gap-0.5">
              <span>Run ATS</span>
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </span>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => {
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="p-3 rounded-xl bg-surface-container-low border border-tertiary/30 flex flex-col justify-between hover:bg-surface-container cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-tertiary text-on-tertiary text-[10px] font-bold flex items-center justify-center">
                3
              </span>
              <span className="material-symbols-outlined text-tertiary text-[18px]">search</span>
            </div>
            <div>
              <h4 className="font-title-md text-xs font-bold text-on-surface group-hover:text-tertiary">
                Role Filtering
              </h4>
              <p className="font-body-sm text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                Filter by degree (B.Tech, Diploma, B.Com).
              </p>
            </div>
            <span className="text-[10px] text-tertiary font-bold flex items-center gap-0.5">
              <span>Select Role</span>
              <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
            </span>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => onNavigate('interview-prep-hub', { role: 'Full-Stack Software Engineer' })}
            className="p-3 rounded-xl bg-surface-container-low border border-primary/30 flex flex-col justify-between hover:bg-surface-container cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                4
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">mic</span>
            </div>
            <div>
              <h4 className="font-title-md text-xs font-bold text-on-surface group-hover:text-primary">
                Live AI Interview
              </h4>
              <p className="font-body-sm text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                Proctored camera & speech interview session.
              </p>
            </div>
            <span className="text-[10px] text-primary font-bold flex items-center gap-0.5">
              <span>Start Session</span>
              <span className="material-symbols-outlined text-[12px]">play_arrow</span>
            </span>
          </div>

          {/* Step 5 */}
          <div
            onClick={() => onNavigate('evaluation-report')}
            className="p-3 rounded-xl bg-surface-container-low border border-secondary/30 flex flex-col justify-between hover:bg-surface-container cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] font-bold flex items-center justify-center">
                5
              </span>
              <span className="material-symbols-outlined text-secondary text-[18px]">analytics</span>
            </div>
            <div>
              <h4 className="font-title-md text-xs font-bold text-on-surface group-hover:text-secondary">
                AI Score Report
              </h4>
              <p className="font-body-sm text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                Competency scores & diagnostic PDF export.
              </p>
            </div>
            <span className="text-[10px] text-secondary font-bold flex items-center gap-0.5">
              <span>View Report</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            </span>
          </div>

          {/* Step 6 */}
          <div
            onClick={() => onNavigate('recruiter-portal')}
            className="p-3 rounded-xl bg-surface-container-low border border-primary/30 flex flex-col justify-between hover:bg-surface-container cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                6
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">business_center</span>
            </div>
            <div>
              <h4 className="font-title-md text-xs font-bold text-on-surface group-hover:text-primary">
                Recruiter Offers
              </h4>
              <p className="font-body-sm text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                Candidate shortlist & verified placement.
              </p>
            </div>
            <span className="text-[10px] text-primary font-bold flex items-center gap-0.5">
              <span>Recruiter Hub</span>
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </span>
          </div>
        </div>
      </section>

      {/* Floating Button to Open Academics & Progress Side File on Mobile */}
      <div className="fixed bottom-24 left-4 z-30">
        <button
          onClick={() => setShowAcademicsSideFile(true)}
          className="h-11 px-4 rounded-full bg-primary text-on-primary font-label-md text-xs font-bold flex items-center gap-1.5 shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">folder_open</span>
          <span>Academics & Progress File</span>
        </button>
      </div>

      {/* ========================================================
          ACADEMICS & PROGRESS SIDE FILE (SLIDE-OUT PANEL):
          "and coming to the academics file where user can access all his academics like:
           total interviews attended, total total mock interviews attended, and avg score,
           integrity flag rate,
           and also show his previous educational details like btech cgpa and skills he knows and etc
           and then a progress bar should be there to show his work progress it should be in a side file not in the main page"
      ======================================================== */}
      {showAcademicsSideFile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowAcademicsSideFile(false)}
          />

          {/* Side Drawer Panel */}
          <aside className="fixed top-0 right-0 bottom-0 z-50 w-96 max-w-[90vw] bg-surface-container-lowest shadow-2xl flex flex-col p-5 overflow-y-auto animate-in slide-in-from-right space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">folder_open</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    Academics & Work Progress File
                  </h3>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    Confidential Academic Records & Placement History
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAcademicsSideFile(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 1. WORK PROGRESS BAR (IN THIS SIDE FILE NOT IN MAIN PAGE) */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>Work Progress Tracker</span>
                </span>
                <span className="font-title-md text-sm font-extrabold text-primary">
                  78% Complete
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
                  style={{ width: '78%' }}
                />
              </div>

              {/* Sub-Milestones */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Profile & College ID Proof:</span>
                  <span className="font-bold text-primary">100% Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">ATS Resume Optimization:</span>
                  <span className="font-bold text-primary">85% Ready</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Mock Interviews Attended:</span>
                  <span className="font-bold text-secondary">70% Target</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Campus Placement Readiness:</span>
                  <span className="font-bold text-tertiary">90% Benchmark</span>
                </div>
              </div>
            </div>

            {/* 2. ACADEMIC METRICS:
                - total interviews attended
                - total mock interviews attended
                - avg score
                - integrity flag rate */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                Interview Performance Metrics:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Total Interviews Attended */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container text-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">videocam</span>
                  <span className="block font-headline-sm text-lg font-bold text-on-surface mt-1">
                    6
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    Total Interviews Attended
                  </span>
                </div>

                {/* Total Mock Interviews Attended */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container text-center">
                  <span className="material-symbols-outlined text-secondary text-[20px]">psychology</span>
                  <span className="block font-headline-sm text-lg font-bold text-on-surface mt-1">
                    4
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    Total Mock Interviews
                  </span>
                </div>

                {/* Avg Score */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container text-center">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">stars</span>
                  <span className="block font-headline-sm text-lg font-bold text-on-surface mt-1">
                    88.5 / 100
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    Average Score
                  </span>
                </div>

                {/* Integrity Flag Rate */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container text-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                  <span className="block font-headline-sm text-lg font-bold text-primary mt-1">
                    0.2%
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    Integrity Flag Rate (Clean)
                  </span>
                </div>
              </div>

              {/* Quick Jump to Performance Insights */}
              <button
                type="button"
                onClick={() => {
                  setShowAcademicsSideFile(false);
                  const el = document.getElementById('performance-insights');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">insights</span>
                <span>View Skill Proficiency Progress Charts</span>
              </button>
            </div>

            {/* 3. PREVIOUS EDUCATIONAL DETAILS:
                - btech cgpa
                - skills he knows
                - previous education & institution */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider block border-b border-surface-container pb-1">
                Previous Educational Details:
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Degree Field:</span>
                  <span className="font-bold text-on-surface">{candidateDegree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">College / University:</span>
                  <span className="font-bold text-on-surface">{candidateCollege}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">B.Tech CGPA / Score:</span>
                  <span className="font-extrabold text-primary text-sm">{candidateCgpa} / 10.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">High School / Class 12th:</span>
                  <span className="font-bold text-on-surface">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Verified Student Roll ID:</span>
                  <span className="font-bold text-primary">#2021CS0492</span>
                </div>
              </div>

              {/* Skills He Knows */}
              <div className="pt-2 border-t border-surface-container">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold block mb-1.5">
                  Skills He Knows:
                </span>
                <div className="flex flex-wrap gap-1">
                  {candidateSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-bold text-on-surface"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Side File Footer Action */}
            <button
              onClick={() => onNavigate('previous-reports')}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>View Comprehensive Report History</span>
            </button>
          </aside>
        </>
      )}

      {/* ========================================================
          SETTINGS MODAL:
          "settings - includes edit profile option delete account option privacy option"
      ======================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">settings</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Account Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Settings Tabs */}
            <div className="flex border-b border-surface-container gap-2 pb-2">
              <button
                onClick={() => setSettingsActiveTab('edit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settingsActiveTab === 'edit'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Edit Profile
              </button>
              <button
                onClick={() => setSettingsActiveTab('privacy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settingsActiveTab === 'privacy'
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Privacy Option
              </button>
              <button
                onClick={() => setSettingsActiveTab('delete')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settingsActiveTab === 'delete'
                    ? 'bg-error text-on-error shadow-xs'
                    : 'bg-surface-container text-error hover:bg-error-container/40'
                }`}
              >
                Delete Account
              </button>
            </div>

            {saveSuccessNotice && (
              <div className="p-3 rounded-xl bg-primary-container text-on-primary-container text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Profile updated successfully!</span>
              </div>
            )}

            {/* TAB 1: EDIT PROFILE OPTION */}
            {settingsActiveTab === 'edit' && (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
                      Average CGPA
                    </label>
                    <input
                      type="text"
                      required
                      value={editCgpa}
                      onChange={(e) => setEditCgpa(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
                    College Name / Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase mb-1">
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: PRIVACY OPTION */}
            {settingsActiveTab === 'privacy' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-low space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-on-surface block">Recruiter Visibility</span>
                      <span className="text-[11px] text-on-surface-variant">
                        Allow partner engineering teams across 68+ countries to review verified profile
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyRecruiterVisible}
                      onChange={(e) => setPrivacyRecruiterVisible(e.target.checked)}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-on-surface block">Proctoring Video Telemetry</span>
                      <span className="text-[11px] text-on-surface-variant">
                        Retain encrypted camera gaze frames for mock session review audits
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyProctoringRetention}
                      onChange={(e) => setPrivacyProctoringRetention(e.target.checked)}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-on-surface block">Anonymous Performance Analytics</span>
                      <span className="text-[11px] text-on-surface-variant">
                        Contribute anonymized interview metrics to placement percentile benchmarking
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyTelemetry}
                      onChange={(e) => setPrivacyTelemetry(e.target.checked)}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
                  >
                    Save Privacy Preferences
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DELETE ACCOUNT OPTION */}
            {settingsActiveTab === 'delete' && (
              <div className="p-4 rounded-xl bg-error-container text-on-error-container space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[24px]">warning</span>
                  <h4 className="font-title-md font-bold text-sm text-error">Delete Account Confirmation</h4>
                </div>
                <p>
                  Permanently erase your GeoRecruit profile, verified College ID records, mock interview transcripts, and ATS reports. This action cannot be undone.
                </p>

                {deleteErrorMessage && (
                  <p className="text-[11px] text-error font-bold">{deleteErrorMessage}</p>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => {
                      setDeleteConfirmText(e.target.value);
                      setDeleteErrorMessage(null);
                    }}
                    placeholder="DELETE"
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-error text-xs text-on-surface"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer"
                  >
                    Permanently Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          HELP MODAL
      ======================================================== */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">help</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">Help & Guidelines</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-on-surface-variant">
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <h4 className="font-bold text-on-surface">How do I start a mock interview?</h4>
                <p>Select your degree (e.g. B.Tech/BE) from the dropdown, find your target job role in the middle of the page, and click the <strong>Start</strong> button.</p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <h4 className="font-bold text-on-surface">Where are my previous reports & progress?</h4>
                <p>Click the <strong>📂 Academics & Progress File</strong> button to slide open your complete progress bar, total interviews, average score, and CGPA.</p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <h4 className="font-bold text-on-surface">How does College ID verification work?</h4>
                <p>Our automated OCR extracts your name, college, and student ID to match them with your profile details for an authentic verification check.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-on-secondary text-xs font-bold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABOUT US MODAL
      ======================================================== */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <GeorecruitLogo variant="icon" size="sm" />
                <h3 className="font-headline-sm text-base font-bold text-on-surface">About Georecruit</h3>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
              <p>
                <strong>GeoRecruit</strong> is a global recruitment infrastructure platform connecting verified candidates with premier tech enterprises across <strong>68+ countries</strong>, <strong>420+ institutional sites</strong>, and <strong>1,850+ job roles</strong>.
              </p>
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1.5">
                <div className="flex justify-between">
                  <span>Partner Campuses:</span>
                  <span className="font-bold text-primary">420+ Sites</span>
                </div>
                <div className="flex justify-between">
                  <span>Countries Active:</span>
                  <span className="font-bold text-primary">68+ Nations</span>
                </div>
                <div className="flex justify-between">
                  <span>Live Job Roles:</span>
                  <span className="font-bold text-primary">1,850+ Openings</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          RESUME UPLOAD BEFORE INTERVIEW BAR & MODAL:
          "when i click to satrt inetrview i want bar to ask the resume to upload before the interview and then start the inetrview so that ai can ask questions based on that"
      ======================================================== */}
      {resumeUploadModalOpen && pendingRoleForInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">description</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface">
                    Upload Resume Before Interview
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Applying for <strong className="text-on-surface">{pendingRoleForInterview.title}</strong> at {pendingRoleForInterview.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResumeUploadModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Explanation Banner */}
            <div className="p-3 rounded-xl bg-primary-container/20 border border-primary/20 flex items-start gap-2.5 text-xs text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                auto_awesome
              </span>
              <div>
                <span className="font-bold block text-primary">AI Interview Grounding Active</span>
                <span>
                  Our AI interviewer will parse your resume projects, tools, and technical accomplishments to generate tailored questions specifically about your real-world work.
                </span>
              </div>
            </div>

            {/* Upload Success Alert */}
            {uploadSuccessAlert && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{uploadSuccessAlert}</span>
              </div>
            )}

            {/* Drag & Drop Upload Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                Resume Document (.PDF, .DOCX, .TXT)
              </label>

              <label className="relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-primary/40 hover:border-primary rounded-xl bg-surface-container-low cursor-pointer transition-all group">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleResumeFileSelect}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                </div>
                <span className="text-xs font-bold text-on-surface">
                  Click or drag & drop to upload resume
                </span>
                <span className="text-[11px] text-on-surface-variant mt-0.5">
                  PDF, DOCX, or TXT up to 10MB
                </span>
              </label>
            </div>

            {/* Currently Attached Resume File Status Bar */}
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </div>
                <div className="truncate">
                  <span className="font-bold text-on-surface block truncate">
                    {activeResumeFileName}
                  </span>
                  <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    <span>Ready for AI Question Generation</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveResumeText(
                    `${candidateName} - ${candidateDegree}\nCollege: ${candidateCollege} (CGPA: ${candidateCgpa})\nSkills: ${candidateSkills.join(', ')}\nProjects: 1. Full-Stack Scalable Platform: React, Node.js, PostgreSQL with ACID compliance.\n2. Real-Time Distributed Messaging: WebSockets, Redis, and high-concurrency event handling.`
                  );
                  setActiveResumeFileName(`${candidateName.replace(/\s+/g, '_')}_Verified_Profile.pdf`);
                  setUploadSuccessAlert('Profile details and verified skills loaded as active resume!');
                  setTimeout(() => setUploadSuccessAlert(null), 3000);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] font-bold text-on-surface shrink-0 cursor-pointer"
              >
                Use Profile Details
              </button>
            </div>

            {/* Resume Content Summary / Projects Detected Preview */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Detected Resume Projects & Stack (AI will ask questions from this):
              </label>
              <textarea
                value={activeResumeText}
                onChange={(e) => setActiveResumeText(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface font-mono resize-none focus:outline-none focus:border-primary"
                placeholder="Paste or edit resume highlights, key projects, and accomplishments here..."
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => {
                  setResumeUploadModalOpen(false);
                  if (pendingRoleForInterview) {
                    onNavigate('interview-prep-hub', {
                      role: pendingRoleForInterview.title,
                      company: pendingRoleForInterview.company,
                      resumeText: '',
                      resumeFileName: '',
                    });
                  }
                }}
                className="text-xs text-on-surface-variant hover:text-on-surface underline cursor-pointer order-2 sm:order-1"
              >
                Skip without resume
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setResumeUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndStartInterview}
                  disabled={isUploadingResume}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Start Interview</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
