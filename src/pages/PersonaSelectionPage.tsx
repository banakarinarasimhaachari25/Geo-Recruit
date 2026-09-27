import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PersonaSelectionPageProps {
  onSelectStudent: () => void;
  onSelectEmployee: () => void;
}

export const PersonaSelectionPage: React.FC<PersonaSelectionPageProps> = ({
  onSelectStudent,
  onSelectEmployee,
}) => {
  const { user } = useAuth();
  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'there');

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8 max-w-xl mx-auto text-center space-y-8 animate-in fade-in">
      {/* Brand Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center shadow-lg ring-4 ring-primary/10">
        <span className="material-symbols-outlined text-[32px]">public</span>
      </div>

      {/* Greeting specified by user: "hey [user name] i am and two options one is student and the other is employee" */}
      <div className="space-y-2">
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold text-2xl sm:text-3xl">
          Hey {userName}, I am
        </h1>
        <p className="font-body-md text-on-surface-variant text-sm max-w-md mx-auto">
          Please select your profile track so we can personalize your placement roadmap, verified credentials, and dashboard tools.
        </p>
      </div>

      {/* The Two Options: Student vs Employee */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {/* OPTION 1: STUDENT */}
        <div
          onClick={onSelectStudent}
          className="group p-6 rounded-2xl bg-surface-container-lowest border-2 border-surface-container hover:border-primary shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[36px]">school</span>
          </div>

          <div className="space-y-1">
            <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
              Student
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Undergraduate or college student preparing for campus recruitment drives, internships, and technical placement rounds.
            </p>
          </div>

          <span className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-title-md text-xs font-bold shadow-sm group-hover:opacity-95">
            <span>Continue as Student</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>

        {/* OPTION 2: EMPLOYEE */}
        <div
          onClick={onSelectEmployee}
          className="group p-6 rounded-2xl bg-surface-container-lowest border-2 border-surface-container hover:border-secondary shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[36px]">business_center</span>
          </div>

          <div className="space-y-1">
            <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-secondary transition-colors">
              Employee
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Working professional or industry engineer seeking senior career switches, recruitment opportunities, and corporate evaluation.
            </p>
          </div>

          <span className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-on-secondary font-title-md text-xs font-bold shadow-sm group-hover:opacity-95">
            <span>Continue as Employee</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  );
};
