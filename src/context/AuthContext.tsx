import React, { createContext, useContext, useState, useEffect } from 'react';
import { CandidateProfile, User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: CandidateProfile | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  configStatus: { geminiConfigured: boolean; message: string };
  login: (email?: string, password?: string, asRole?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  refreshProfile: () => Promise<void>;
  updateProfileState: (updated: Partial<CandidateProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [role, setRole] = useState<UserRole>('candidate');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [configStatus, setConfigStatus] = useState<{ geminiConfigured: boolean; message: string }>({
    geminiConfigured: false,
    message: 'Checking AI service status...',
  });

  const checkStatus = async () => {
    const status = await api.getConfigStatus();
    setConfigStatus(status);
  };

  const refreshProfile = async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  };

  useEffect(() => {
    checkStatus();

    // Check localStorage for persisted session
    const savedUser = localStorage.getItem('georecruit_user') || localStorage.getItem('talentai_user');
    const savedRole = (localStorage.getItem('georecruit_role') || localStorage.getItem('talentai_role')) as UserRole;
    const savedToken = localStorage.getItem('georecruit_token') || localStorage.getItem('talentai_token');

    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setRole(savedRole || 'candidate');
        setToken(savedToken);
        refreshProfile();
      } catch {
        setUser(null);
        setToken(null);
      }
    } else {
      // Login details are mandatory: do NOT automatically grant access without logging in
      setUser(null);
      setRole('guest');
      setToken(null);
    }

    setIsLoading(false);
  }, []);

  const login = async (email?: string, password?: string, asRole: UserRole = 'candidate'): Promise<boolean> => {
    if (!email || !password || email.trim() === '' || password.trim() === '') {
      return false;
    }

    try {
      setIsLoading(true);
      const res = await api.login(email.trim(), password.trim(), asRole);
      if (res.success && res.user) {
        setUser(res.user);
        setRole(asRole);
        setToken(res.token);
        localStorage.setItem('georecruit_user', JSON.stringify(res.user));
        localStorage.setItem('georecruit_role', asRole);
        localStorage.setItem('georecruit_token', res.token);
        await refreshProfile();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setRole('guest');
    setToken(null);
    localStorage.removeItem('georecruit_user');
    localStorage.removeItem('georecruit_role');
    localStorage.removeItem('georecruit_token');
    localStorage.removeItem('talentai_user');
    localStorage.removeItem('talentai_role');
    localStorage.removeItem('talentai_token');
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'recruiter') {
      const recUser: User = {
        id: 'rec_1',
        name: 'Sarah Jensen',
        email: 'sarah.jensen@recruitment.com',
        role: 'recruiter',
        company: 'Google',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      };
      setUser(recUser);
      setRole('recruiter');
      localStorage.setItem('talentai_user', JSON.stringify(recUser));
      localStorage.setItem('talentai_role', 'recruiter');
    } else if (newRole === 'candidate') {
      const candUser: User = {
        id: 'cand_1',
        name: 'Aryan Sharma',
        email: 'aryan.sharma@example.edu',
        role: 'candidate',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3OHx5h2WOBwJprjrL1w6Y5T-o34kBz9F05CggmEMNA9t8QsKbq1DovNQ-cZp4FBByS_mSYcRvqC12RS6NwolL5c7_xyhbdiaaTcp4DJ1jVfZ4iB3xO2o-pINyox8OVnp6odyRkrwOQsHSV8dKR-83OzdSsNhZHKlq9iZ0pKbtYyg-8UgKxt2gmHXdPg8evK6Xc-KE24h8NSEl-0nWoDFq34zN6Ek0VzgOJys_K7uwvGxisQCitopqw',
      };
      setUser(candUser);
      setRole('candidate');
      localStorage.setItem('talentai_user', JSON.stringify(candUser));
      localStorage.setItem('talentai_role', 'candidate');
      refreshProfile();
    } else {
      logout();
    }
  };

  const updateProfileState = (updated: Partial<CandidateProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : (updated as CandidateProfile)));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        token,
        isAuthenticated: !!user && role !== 'guest',
        isLoading,
        configStatus,
        login,
        logout,
        switchRole,
        refreshProfile,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
