import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.login': 'Login',
    'nav.signin': 'Sign In',
    'nav.candidateDashboard': 'Candidate Dashboard',
    'nav.recruiterDashboard': 'Recruiter Dashboard',
    'nav.academics': 'Academics & Progress File',
    'nav.menu': 'Menu',

    // Landing / Dashboard
    'landing.title': 'Global Campus & Enterprise AI Placement Network',
    'landing.subtitle': 'Empowering 68+ countries, 420+ universities, and over 1,850+ verified enterprise job roles.',
    'landing.searchPlaceholder': 'Search any job role (e.g. Full-Stack, AI Engineer, Accountant, DevOps...)',
    'landing.selectDegree': 'Select Degree / Field:',
    'landing.selectCompany': 'Select Company:',
    'landing.allDegrees': 'All Degrees',
    'landing.allCompanies': 'All Companies',
    'landing.rolesAvailable': 'Job Roles Matching Your Criteria',
    'landing.start': 'Start',
    'landing.workflow': 'Platform Workflow Flowchart',
    'landing.workflowDesc': 'Follow this sequential 6-step recruitment pipeline to prepare, assess, and unlock enterprise offers.',

    // Resume Modal
    'resume.modalTitle': 'Upload Resume to Start Interview',
    'resume.modalSubtitle': 'Upload your resume so the AI interviewer can generate tailored questions based on your projects, degree, and skills.',
    'resume.dragDrop': 'Drop your Resume PDF, DOCX or TXT here',
    'resume.useProfile': 'Use Profile Details',
    'resume.startInterview': 'Start AI Interview',
    'resume.skipWithout': 'Skip without resume',
    'resume.cancel': 'Cancel',

    // Interview Room
    'interview.maxDuration': 'Maximum 15 Minutes Session',
    'interview.warmupTitle': 'Human Introduction & Background Check',
    'interview.warmupDesc': 'Dr. Aris Thorne will first interact with you with voice about your educational qualifications.',
    'interview.aiSpeaking': 'AI Speaking...',
    'interview.yourAnswer': 'Your Answer / Response:',
    'interview.speakOrType': 'Speak into your microphone or type your response...',
    'interview.sendAnswer': 'Submit & Continue',
    'interview.cleanCamTitle': 'Candidate Proctoring Camera (Clean Feed)',
    'interview.alertLookingBeside': 'LOOKING BESIDE DETECTED: Please face the screen directly and avoid looking sideways.',
    'interview.alertSomeoneFound': 'MULTIPLE PERSONS DETECTED: Someone found near you! Only the candidate may be in the room.',
    'interview.alertCheatTerminated': 'Session Terminated: Repeated Cheating or Looking Sideways Detected (3/3 Violations).',
    'interview.finishInterview': 'Finish Interview',
    'interview.nextQuestion': 'Next Question',
    'interview.videoCannotBeTurnedOff': 'Video is strictly mandatory for proctored sessions and cannot be turned off.',
  },
  hi: {
    // Nav
    'nav.login': 'लॉगिन',
    'nav.signin': 'साइन इन (नया खाता)',
    'nav.candidateDashboard': 'उम्मीदवार डैशबोर्ड',
    'nav.recruiterDashboard': 'भर्तीकर्ता डैशबोर्ड',
    'nav.academics': 'शैक्षणिक और प्रगति फ़ाइल',
    'nav.menu': 'मेनू',

    // Landing / Dashboard
    'landing.title': 'ग्लोबल कैंपस और एंटरप्राइज एआई प्लेसमेंट नेटवर्क',
    'landing.subtitle': '68+ देश, 420+ विश्वविद्यालय और 1,850+ से अधिक सत्यापित कॉर्पोरेट नौकरियां।',
    'landing.searchPlaceholder': 'कोई भी नौकरी खोजें (उदा. फुल-स्टैक, एआई इंजीनियर, अकाउंटेंट...)',
    'landing.selectDegree': 'डिग्री / संकाय चुनें:',
    'landing.selectCompany': 'कंपनी चुनें:',
    'landing.allDegrees': 'सभी डिग्रियां',
    'landing.allCompanies': 'सभी कंपनियां',
    'landing.rolesAvailable': 'उपलब्ध नौकरियां',
    'landing.start': 'शुरू करें',
    'landing.workflow': 'प्लेटफ़ॉर्म कार्यप्रवाह फ़्लोचार्ट',
    'landing.workflowDesc': 'तैयारी, मूल्यांकन और एंटरप्राइज़ ऑफ़र अनलॉक करने के लिए 6-चरणीय पाइपलाइन का पालन करें।',

    // Resume Modal
    'resume.modalTitle': 'इंटरव्यू शुरू करने के लिए बायोडाटा (रिज्यूमे) अपलोड करें',
    'resume.modalSubtitle': 'अपना रिज्यूमे अपलोड करें ताकि एआई आपके प्रोजेक्ट्स और कौशल के आधार पर सवाल पूछ सके।',
    'resume.dragDrop': 'अपना रिज्यूमे PDF, DOCX या TXT यहां खींचें या चुनें',
    'resume.useProfile': 'प्रोफ़ाइल विवरण का उपयोग करें',
    'resume.startInterview': 'एआई इंटरव्यू शुरू करें',
    'resume.skipWithout': 'बिना रिज्यूमे के आगे बढ़ें',
    'resume.cancel': 'रद्द करें',

    // Interview Room
    'interview.maxDuration': 'सत्र की अधिकतम अवधि 15 मिनट',
    'interview.warmupTitle': 'मानवीय परिचय और पृष्ठभूमि जांच',
    'interview.warmupDesc': 'डॉ. एरिस थोर्न पहले आपकी शैक्षणिक योग्यताओं के बारे में आवाज से बातचीत करेंगे।',
    'interview.aiSpeaking': 'एआई बोल रहा है...',
    'interview.yourAnswer': 'आपका उत्तर / प्रतिक्रिया:',
    'interview.speakOrType': 'माइक में बोलें या अपना उत्तर टाइप करें...',
    'interview.sendAnswer': 'जमा करें और आगे बढ़ें',
    'interview.cleanCamTitle': 'उम्मीदवार प्रॉक्टरिंग कैमरा (स्वच्छ फ़ीड)',
    'interview.alertLookingBeside': 'पास में देखना पकड़ा गया: कृपया सीधे स्क्रीन की ओर देखें और इधर-उधर न देखें।',
    'interview.alertSomeoneFound': 'पास में अन्य व्यक्ति का पता चला! कमरे में केवल उम्मीदवार ही उपस्थित होना चाहिए।',
    'interview.alertCheatTerminated': 'सत्र समाप्त: लगातार 3 बार अनुचित व्यवहार या किनारे देखने के कारण सत्र बंद कर दिया गया।',
    'interview.finishInterview': 'इंटरव्यू समाप्त करें',
    'interview.nextQuestion': 'अगला प्रश्न',
    'interview.videoCannotBeTurnedOff': 'प्रॉक्टरिंग सत्र के लिए वीडियो कैमरा अनिवार्य है और इसे बंद नहीं किया जा सकता।',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('georecruit_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('georecruit_language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || translations.en[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
