import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Video, 
  FileText, 
  Award, 
  Settings,
  LogOut,
  BrainCircuit,
  Search,
  Star,
  Zap,
  User as UserIcon,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from './FirebaseProvider';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Skill Exchange', path: '/exchange' },
  { icon: BrainCircuit, label: 'AI Interview', path: '/interview' },
  { icon: Search, label: 'Resume Analyzer', path: '/resume-analyzer' },
  { icon: BookOpen, label: 'Study Materials', path: '/materials' },
  { icon: Star, label: 'Reviews', path: '/reviews' },
  { icon: Zap, label: 'Premium', path: '/premium' },
  { icon: MessageSquare, label: 'Messages', path: '/chat' },
  { icon: UserIcon, label: 'Profile', path: '/profile' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:top-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl font-display">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white">
            <BrainCircuit size={20} />
          </div>
          <span>SkillX</span>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
              isActive 
                ? "bg-blue-50 text-blue-600" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Credits</div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">
              {profile?.credits?.toLocaleString() || '0'}
            </span>
            <button className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-md font-bold uppercase">Top Up</button>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
