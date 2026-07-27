import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Star, 
  Zap, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  TrendingUp, 
  Flame, 
  Target, 
  Share2, 
  Download, 
  Sparkles, 
  Medal, 
  GraduationCap, 
  Clock, 
  ArrowUpRight,
  BarChart2,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/FirebaseProvider';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Interview' | 'Resume' | 'Exchange' | 'Streak' | 'Certification';
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  badgeLevel: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  skills: string[];
}

export default function Achievements() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'certificates'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const achievementsList: Achievement[] = [
    {
      id: 'a1',
      title: 'Interview Maestro',
      description: 'Complete 5 AI Interview practice sessions with a score above 80%',
      category: 'Interview',
      icon: '🎙️',
      progress: 5,
      maxProgress: 5,
      unlocked: true,
      unlockedAt: 'July 20, 2026',
      xpReward: 500,
      badgeLevel: 'Gold'
    },
    {
      id: 'a2',
      title: 'ATS Resume Perfectionist',
      description: 'Achieve an ATS score of 85+ on your uploaded resume',
      category: 'Resume',
      icon: '📄',
      progress: 88,
      maxProgress: 100,
      unlocked: true,
      unlockedAt: 'July 22, 2026',
      xpReward: 350,
      badgeLevel: 'Gold'
    },
    {
      id: 'a3',
      title: 'Skill Swapper Supreme',
      description: 'Complete 3 peer-to-peer skill exchange sessions on SkillX',
      category: 'Exchange',
      icon: '🤝',
      progress: 3,
      maxProgress: 3,
      unlocked: true,
      unlockedAt: 'July 18, 2026',
      xpReward: 400,
      badgeLevel: 'Silver'
    },
    {
      id: 'a4',
      title: 'Consistency Legend',
      description: 'Maintain a 7-day continuous learning and practice streak',
      category: 'Streak',
      icon: '🔥',
      progress: 7,
      maxProgress: 7,
      unlocked: true,
      unlockedAt: 'July 24, 2026',
      xpReward: 600,
      badgeLevel: 'Diamond'
    },
    {
      id: 'a5',
      title: 'Full-Stack Mastery',
      description: 'Earn certified level status in React & Node.js System Architecture',
      category: 'Certification',
      icon: '🎓',
      progress: 100,
      maxProgress: 100,
      unlocked: true,
      unlockedAt: 'July 15, 2026',
      xpReward: 1000,
      badgeLevel: 'Diamond'
    },
    {
      id: 'a6',
      title: 'Proctoring Champion',
      description: 'Complete an AI interview with 0 proctoring warnings or tab switches',
      category: 'Interview',
      icon: '🛡️',
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: 'July 21, 2026',
      xpReward: 250,
      badgeLevel: 'Silver'
    },
    {
      id: 'a7',
      title: 'AI Prompt Engineer',
      description: 'Interact with AI Tutor for over 20 learning queries',
      category: 'Streak',
      icon: '🧠',
      progress: 16,
      maxProgress: 20,
      unlocked: false,
      xpReward: 300,
      badgeLevel: 'Bronze'
    },
    {
      id: 'a8',
      title: 'Community Mentor',
      description: 'Host 5 skill exchange learning rooms and receive 5-star ratings',
      category: 'Exchange',
      icon: '🌟',
      progress: 2,
      maxProgress: 5,
      unlocked: false,
      xpReward: 750,
      badgeLevel: 'Gold'
    }
  ];

  const certificates: Certificate[] = [
    {
      id: 'cert-1',
      title: 'AI-Driven Interview Excellence',
      issuer: 'SkillX Learning Platform',
      issueDate: 'July 20, 2026',
      credentialId: 'SKX-2026-INT-9982',
      skills: ['Technical Problem Solving', 'Behavioral Communication', 'Mock Interview Mastery']
    },
    {
      id: 'cert-2',
      title: 'Advanced Full-Stack Engineering & System Architecture',
      issuer: 'SkillX Certification Board',
      issueDate: 'July 15, 2026',
      credentialId: 'SKX-2026-FS-4410',
      skills: ['React 19', 'TypeScript', 'Node.js Express', 'Firestore DB']
    }
  ];

  const categories = ['All', 'Interview', 'Resume', 'Exchange', 'Streak', 'Certification'];

  const filteredAchievements = achievementsList.filter(a => {
    if (activeTab === 'unlocked' && !a.unlocked) return false;
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    return true;
  });

  const unlockedCount = achievementsList.filter(a => a.unlocked).length;
  const totalXP = achievementsList.filter(a => a.unlocked).reduce((acc, curr) => acc + curr.xpReward, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 p-8 md:p-10 text-white overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <Trophy size={14} className="text-amber-400" /> SkillX Rewards & Milestones
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">
              Your Learning <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">Achievements</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Track your mock interview milestones, ATS resume enhancements, peer skill exchanges, and verified certificates.
            </p>
          </div>

          {/* XP Card */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 w-full md:w-auto shrink-0 flex items-center gap-5 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Flame size={32} />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total XP Earned</p>
              <p className="text-3xl font-black text-amber-400">{totalXP.toLocaleString()} <span className="text-sm font-bold text-slate-300">XP</span></p>
              <p className="text-xs text-blue-300 mt-0.5 font-medium">{unlockedCount} of {achievementsList.length} Badges Unlocked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Award size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Level Status</p>
              <h4 className="text-xl font-extrabold text-slate-900">Level 8 Pro</h4>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Badges</p>
              <h4 className="text-xl font-extrabold text-slate-900">{unlockedCount} / {achievementsList.length}</h4>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certificates</p>
              <h4 className="text-xl font-extrabold text-slate-900">{certificates.length} Issued</h4>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Flame size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Day Streak</p>
              <h4 className="text-xl font-extrabold text-slate-900">7 Days 🔥</h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Main View Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === 'all' ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            All Achievements ({achievementsList.length})
          </button>
          <button
            onClick={() => setActiveTab('unlocked')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === 'unlocked' ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === 'certificates' ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Certificates ({certificates.length})
          </button>
        </div>

        {/* Category Pills */}
        {activeTab !== 'certificates' && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  selectedCategory === cat 
                    ? "bg-slate-900 text-white font-bold" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'certificates' ? (
        /* Certificates Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden border-slate-200 hover:border-blue-300 transition-all shadow-xs hover:shadow-lg group">
              <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <GraduationCap size={26} />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono text-[10px]">
                    VERIFIED CERTIFICATE
                  </Badge>
                </div>
                <h3 className="text-xl font-bold font-display mt-4 mb-1 group-hover:text-blue-300 transition-colors">{cert.title}</h3>
                <p className="text-xs text-slate-400">Issued by {cert.issuer} • {cert.issueDate}</p>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Verified Competencies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cert.skills.map((s, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs font-normal">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-mono text-slate-400 text-[11px]">{cert.credentialId}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-xs font-bold hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setSelectedCertificate(cert)}
                  >
                    View Certificate <ArrowUpRight size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Achievements Badges Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((ach) => (
            <Card 
              key={ach.id} 
              className={cn(
                "relative overflow-hidden transition-all border",
                ach.unlocked 
                  ? "bg-white border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1" 
                  : "bg-slate-50/70 border-slate-200/60 opacity-80"
              )}
            >
              {/* Top Accent line based on level */}
              <div className={cn("h-1.5 w-full", 
                ach.badgeLevel === 'Diamond' ? "bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500" :
                ach.badgeLevel === 'Gold' ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                ach.badgeLevel === 'Silver' ? "bg-gradient-to-r from-slate-300 to-slate-400" :
                "bg-gradient-to-r from-amber-700 to-amber-800"
              )} />

              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs border shrink-0",
                    ach.unlocked ? "bg-slate-50 border-slate-200" : "bg-slate-200 border-slate-300 text-slate-400 grayscale"
                  )}>
                    {ach.icon}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5", 
                      ach.badgeLevel === 'Diamond' ? "bg-purple-100 text-purple-700 border-purple-200" :
                      ach.badgeLevel === 'Gold' ? "bg-amber-100 text-amber-800 border-amber-200" :
                      ach.badgeLevel === 'Silver' ? "bg-slate-100 text-slate-700 border-slate-200" :
                      "bg-amber-900/10 text-amber-900 border-amber-800/20"
                    )}>
                      {ach.badgeLevel}
                    </Badge>
                    <span className="text-xs font-black text-amber-600">+{ach.xpReward} XP</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    {ach.title}
                    {ach.unlocked && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ach.description}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">{ach.unlocked ? "Completed" : "Progress"}</span>
                    <span className="text-slate-900">{ach.progress} / {ach.maxProgress}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div 
                      className={cn("h-full transition-all duration-500 rounded-full",
                        ach.unlocked ? "bg-emerald-500" : "bg-blue-600"
                      )}
                      style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Footer status */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Category: <strong className="text-slate-600 font-medium">{ach.category}</strong></span>
                  {ach.unlocked ? (
                    <span className="text-emerald-600 font-medium text-[11px]">Unlocked {ach.unlockedAt}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Lock size={12} /> Locked
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 relative"
            >
              <button 
                onClick={() => setSelectedCertificate(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-12 text-center border-8 border-slate-900 m-4 rounded-xl bg-gradient-to-b from-slate-50 via-white to-blue-50/30 relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-500 shadow-md">
                  <Award size={36} />
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Official SkillX Credential</p>
                <h2 className="text-2xl md:text-3xl font-black font-display text-slate-900 mb-6">{selectedCertificate.title}</h2>

                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">This certificate is proudly awarded to</p>
                <h3 className="text-2xl font-bold text-blue-600 mb-6 font-display">{profile?.name || user?.displayName || 'SkillX Developer'}</h3>

                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
                  For demonstrating exceptional proficiency in {selectedCertificate.skills.join(', ')} verified through AI practice simulations.
                </p>

                <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-6 max-w-md mx-auto text-xs text-slate-500">
                  <div className="text-left">
                    <p className="font-bold text-slate-900">SkillX Certification Board</p>
                    <p className="text-[11px] text-slate-400">Issued: {selectedCertificate.issueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] font-bold text-slate-800">{selectedCertificate.credentialId}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">✓ Authenticated</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedCertificate(null)}>
                  Close
                </Button>
                <Button variant="gradient" size="sm" className="gap-2 font-bold" onClick={() => alert('Certificate downloaded as PDF!')}>
                  <Download size={16} /> Download Certificate
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
