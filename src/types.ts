export interface User {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'mentor' | 'both';
  avatar?: string;
  skills: string[];
  bio?: string;
  rating?: number;
  credits: number;
}

export interface SkillSession {
  id: string;
  mentorId: string;
  learnerId: string;
  skill: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Interview {
  id: string;
  type: 'technical' | 'hr';
  difficulty: 'easy' | 'medium' | 'hard';
  date: string;
  score?: {
    communication: number;
    confidence: number;
    technical: number;
    overall: number;
  };
  feedback?: string[];
}
