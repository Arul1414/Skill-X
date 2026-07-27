import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Settings, 
  Camera,
  Edit3,
  Github,
  Linkedin,
  Globe,
  Plus,
  ChevronRight,
  BrainCircuit,
  Loader2,
  TrendingUp,
  Target,
  Sparkles,
  Twitter,
  Trash2,
  X,
  Check,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { analyzeUserProfile, ProfileAnalysis } from '@/services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useAuth } from '@/components/FirebaseProvider';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import sarahImg from '../assets/images/sarah_avatar_1784971927147.jpg';
import michaelImg from '../assets/images/michael_avatar_1784971950558.jpg';
import elenaImg from '../assets/images/elena_avatar_1784971966054.jpg';
import davidImg from '../assets/images/david_avatar_1784971982822.jpg';

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  desc: string;
}

export default function Profile() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Profile Form States
  const [userData, setUserData] = useState({
    name: "",
    role: "",
    company: "",
    location: "",
    email: "",
    website: "",
    github: "",
    linkedin: "",
    twitter: "",
    about: "",
    photoURL: "",
    coverGradient: "gradient-bg"
  });

  const [expertiseSkills, setExpertiseSkills] = useState<string[]>([
    'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'System Design'
  ]);
  const [learningSkills, setLearningSkills] = useState<string[]>([
    'Rust', 'Web3', 'AI/ML'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newSkillType, setNewSkillType] = useState<'expertise' | 'learning'>('expertise');

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    { 
      id: 'e1',
      role: 'Senior Frontend Engineer', 
      company: 'TechFlow Inc.', 
      period: '2021 - Present', 
      desc: 'Leading core UI architecture, optimizing React performance, and building responsive web apps.'
    },
    { 
      id: 'e2',
      role: 'Full Stack Developer', 
      company: 'InnoSoft', 
      period: '2018 - 2021', 
      desc: 'Developed client-facing dashboards using React, Node.js, and PostgreSQL.'
    }
  ]);

  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [newExp, setNewExp] = useState({ role: '', company: '', period: '', desc: '' });

  // Preset covers
  const coverPresets = [
    { label: 'Deep Blue Tech', class: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900' },
    { label: 'Aurora Cyan', class: 'bg-gradient-to-r from-teal-800 via-cyan-900 to-blue-900' },
    { label: 'Sunset Amber', class: 'bg-gradient-to-r from-purple-900 via-pink-900 to-rose-900' },
    { label: 'Emerald Forest', class: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900' }
  ];

  // Preset avatars
  const avatarPresets = [
    sarahImg,
    michaelImg,
    elenaImg,
    davidImg,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  ];

  useEffect(() => {
    if (authProfile) {
      setUserData({
        name: authProfile.name || user?.displayName || (user?.email ? user.email.split('@')[0] : "Learner"),
        role: authProfile.role || "Full-Stack Software Engineer",
        company: authProfile.company || "SkillX Learning Community",
        location: authProfile.location || "San Francisco, CA",
        email: authProfile.email || user?.email || "learner@skillx.ai",
        website: authProfile.website || "https://skillx.ai",
        github: authProfile.github || "https://github.com",
        linkedin: authProfile.linkedin || "https://linkedin.com",
        twitter: authProfile.twitter || "https://twitter.com",
        about: authProfile.about || "Passionate about full-stack web development, AI engineering, system architecture, and peer skill exchanges.",
        photoURL: authProfile.photoURL || user?.photoURL || avatarPresets[0],
        coverGradient: authProfile.coverGradient || coverPresets[0].class
      });

      if (authProfile.expertiseSkills) setExpertiseSkills(authProfile.expertiseSkills);
      if (authProfile.learningSkills) setLearningSkills(authProfile.learningSkills);
      if (authProfile.experiences) setExperiences(authProfile.experiences);
    }
  }, [authProfile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsEditing(false);
    try {
      const updateData = {
        ...userData,
        expertiseSkills,
        learningSkills,
        experiences
      };
      await setDoc(doc(db, 'users', user.uid), updateData, { merge: true });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (newSkillType === 'expertise') {
      if (!expertiseSkills.includes(newSkillInput.trim())) {
        const updated = [...expertiseSkills, newSkillInput.trim()];
        setExpertiseSkills(updated);
        saveSkillsToFirestore(updated, learningSkills);
      }
    } else {
      if (!learningSkills.includes(newSkillInput.trim())) {
        const updated = [...learningSkills, newSkillInput.trim()];
        setLearningSkills(updated);
        saveSkillsToFirestore(expertiseSkills, updated);
      }
    }
    setNewSkillInput('');
  };

  const saveSkillsToFirestore = async (exp: string[], learn: string[]) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        expertiseSkills: exp,
        learningSkills: learn
      });
    } catch (e) {
      console.warn("Save skills failed:", e);
    }
  };

  const removeSkill = (skill: string, type: 'expertise' | 'learning') => {
    if (type === 'expertise') {
      const updated = expertiseSkills.filter(s => s !== skill);
      setExpertiseSkills(updated);
      saveSkillsToFirestore(updated, learningSkills);
    } else {
      const updated = learningSkills.filter(s => s !== skill);
      setLearningSkills(updated);
      saveSkillsToFirestore(expertiseSkills, updated);
    }
  };

  const handleAddExperience = async () => {
    if (!newExp.role || !newExp.company) return;
    const item: ExperienceItem = {
      id: Date.now().toString(),
      ...newExp
    };
    const updated = [item, ...experiences];
    setExperiences(updated);
    setNewExp({ role: '', company: '', period: '', desc: '' });
    setShowAddExpModal(false);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { experiences: updated });
      } catch (e) {
        console.warn("Save experience failed:", e);
      }
    }
  };

  const removeExperience = async (id: string) => {
    const updated = experiences.filter(e => e.id !== id);
    setExperiences(updated);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { experiences: updated });
      } catch (e) {
        console.warn("Delete exp failed:", e);
      }
    }
  };

  const handleAnalyzeProfile = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeUserProfile({
        ...userData,
        skills: {
          expertise: expertiseSkills,
          learning: learningSkills
        },
        experience: experiences
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Profile analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-none shadow-xl">
        <div className={cn("h-48 relative transition-all duration-300", userData.coverGradient)}>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowCoverModal(true)}
            className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white border-none hover:bg-white/30 font-bold"
          >
            <Edit3 size={16} className="mr-2" /> Edit Cover
          </Button>
        </div>

        <CardContent className="relative pt-0 pb-8 px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl border-4 border-white bg-slate-100 overflow-hidden shadow-lg relative">
                <img 
                  src={userData.photoURL || avatarPresets[0]} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <button 
                onClick={() => setShowPhotoModal(true)}
                className="absolute bottom-2 right-2 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                title="Change Photo"
              >
                <Camera size={18} />
              </button>
            </div>

            <div className="flex-1 pb-2 w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
                <div className="text-center sm:text-left">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input 
                        value={userData.name} 
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                        className="h-10 text-xl font-bold"
                        placeholder="Your Name"
                      />
                      <Input 
                        value={userData.role} 
                        onChange={(e) => setUserData({...userData, role: e.target.value})}
                        className="h-8 text-sm text-slate-600"
                        placeholder="Primary Job Title"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{userData.name}</h1>
                      <p className="text-slate-500 font-medium">{userData.role} {userData.company ? `@ ${userData.company}` : ''}</p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-3 w-full sm:w-auto">
                  {isEditing ? (
                    <Button variant="gradient" size="sm" className="flex-1 sm:flex-none font-bold gap-2" onClick={handleSaveProfile}>
                      <Check size={16} /> Save Changes
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none font-bold" onClick={() => setIsEditing(true)}>
                      <Settings size={16} className="mr-2" /> Edit Profile
                    </Button>
                  )}
                  <Button 
                    variant="gradient" 
                    size="sm" 
                    onClick={handleAnalyzeProfile}
                    disabled={isAnalyzing}
                    className="gap-2 flex-1 sm:flex-none font-bold"
                  >
                    {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                    AI Career Analysis
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-medium border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" /> 
              {isEditing ? (
                <Input 
                  value={userData.location} 
                  onChange={(e) => setUserData({...userData, location: e.target.value})}
                  className="h-8 w-40 text-xs"
                />
              ) : userData.location}
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-slate-400" /> 
              {isEditing ? (
                <Input 
                  value={userData.email} 
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  className="h-8 w-44 text-xs"
                />
              ) : userData.email}
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-slate-400" /> 
              {isEditing ? (
                <Input 
                  value={userData.website} 
                  onChange={(e) => setUserData({...userData, website: e.target.value})}
                  className="h-8 w-44 text-xs"
                />
              ) : (
                <a href={userData.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {userData.website.replace('https://', '')}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Career Analysis Result Section */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles size={120} />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-none px-3 py-1 font-bold">Gemini AI Analysis</Badge>
                  <span className="text-slate-400 text-xs font-medium">Updated live</span>
                </div>
                <CardTitle className="text-2xl font-bold">Career Growth & Market Insights</CardTitle>
                <CardDescription className="text-slate-400">
                  Custom evaluation built from your current profile, skill stack, and project history.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <TrendingUp size={16} /> Recommended Target Path
                    </h4>
                    <p className="text-slate-200 leading-relaxed italic text-sm font-medium">
                      "{analysis.careerPath}"
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Market Benchmark</div>
                      <div className="text-lg font-bold text-emerald-400">{analysis.marketValue}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Interview Readiness</div>
                      <div className="text-lg font-bold text-blue-400">{analysis.overallReadiness}%</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Target size={16} /> Best Fit Job Roles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.suggestedRoles.map(role => (
                        <Badge key={role} className="bg-white/10 text-white border-none font-medium text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-[280px] bg-white/5 rounded-3xl p-5 border border-white/10">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Skill Competency Map</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.skillGapAnalysis} layout="vertical">
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis 
                        dataKey="skill" 
                        type="category" 
                        width={100} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-xl">
                                <div className="text-xs font-bold text-white mb-1">{data.skill}</div>
                                <div className="text-[10px] text-slate-400 mb-2 uppercase">{data.status}</div>
                                <div className="text-[10px] text-blue-300 max-w-[200px]">{data.recommendation}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey={(d) => d.status === 'expert' ? 100 : d.status === 'intermediate' ? 70 : d.status === 'beginner' ? 40 : 10} radius={[0, 4, 4, 0]}>
                        {analysis.skillGapAnalysis.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.status === 'expert' ? '#10b981' : entry.status === 'intermediate' ? '#3b82f6' : entry.status === 'beginner' ? '#f59e0b' : '#ef4444'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Skills & Social Links */}
        <div className="lg:col-span-1 space-y-8">
          {/* Skills Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Skills Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add skill form */}
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a new skill..." 
                    value={newSkillInput} 
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    className="h-9 text-xs"
                  />
                  <Button size="sm" variant="gradient" onClick={handleAddSkill} className="h-9 px-3">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="skillType" 
                      checked={newSkillType === 'expertise'} 
                      onChange={() => setNewSkillType('expertise')} 
                    />
                    Expertise
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="skillType" 
                      checked={newSkillType === 'learning'} 
                      onChange={() => setNewSkillType('learning')} 
                    />
                    Learning
                  </label>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Core Expertise</div>
                <div className="flex flex-wrap gap-2">
                  {expertiseSkills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 px-2.5 py-1 text-xs flex items-center gap-1.5 group">
                      {skill}
                      <button onClick={() => removeSkill(skill, 'expertise')} className="text-blue-400 hover:text-rose-600 transition-colors">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Currently Learning</div>
                <div className="flex flex-wrap gap-2">
                  {learningSkills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-slate-600 border-slate-200 px-2.5 py-1 text-xs flex items-center gap-1.5">
                      {skill}
                      <button onClick={() => removeSkill(skill, 'learning')} className="text-slate-400 hover:text-rose-600 transition-colors">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social & Online Profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">GitHub Profile</label>
                    <Input 
                      value={userData.github} 
                      onChange={(e) => setUserData({...userData, github: e.target.value})}
                      placeholder="https://github.com/username"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">LinkedIn Profile</label>
                    <Input 
                      value={userData.linkedin} 
                      onChange={(e) => setUserData({...userData, linkedin: e.target.value})}
                      placeholder="https://linkedin.com/in/username"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Twitter / X</label>
                    <Input 
                      value={userData.twitter} 
                      onChange={(e) => setUserData({...userData, twitter: e.target.value})}
                      placeholder="https://twitter.com/username"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <a href={userData.github} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Github size={18} className="text-slate-900" />
                      <span className="text-xs font-bold text-slate-800">GitHub</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </a>

                  <a href={userData.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Linkedin size={18} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">LinkedIn</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </a>

                  <a href={userData.twitter} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Twitter size={18} className="text-sky-500" />
                      <span className="text-xs font-bold text-slate-800">Twitter / X</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </a>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: About & Experience */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">About Me</CardTitle>
              {!isEditing && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                  <Edit3 size={16} />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea 
                  value={userData.about}
                  onChange={(e) => setUserData({...userData, about: e.target.value})}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 text-sm min-h-[120px]"
                />
              ) : (
                <p className="text-slate-600 leading-relaxed text-sm">
                  {userData.about}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Work Experience Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Work Experience</CardTitle>
              <Button variant="gradient" size="sm" onClick={() => setShowAddExpModal(true)} className="gap-1 text-xs font-bold">
                <Plus size={16} /> Add Experience
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {experiences.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No work experiences added yet.</p>
              ) : (
                experiences.map((exp) => (
                  <div key={exp.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 relative group">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{exp.role}</h4>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{exp.period}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">{exp.company}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{exp.desc}</p>
                    </div>
                    <button 
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-3 right-3 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cover Gradient Modal */}
      <AnimatePresence>
        {showCoverModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Select Cover Theme</h3>
                <button onClick={() => setShowCoverModal(false)}><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {coverPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setUserData({ ...userData, coverGradient: preset.class });
                      setShowCoverModal(false);
                    }}
                    className={cn("h-16 rounded-xl p-3 text-white font-bold text-left flex items-center justify-between shadow-xs hover:scale-[1.02] transition-transform", preset.class)}
                  >
                    <span>{preset.label}</span>
                    {userData.coverGradient === preset.class && <Check size={20} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Photo Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Update Profile Photo</h3>
                <button onClick={() => setShowPhotoModal(false)}><X size={20} /></button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block">Choose from Presets</label>
                <div className="grid grid-cols-4 gap-3">
                  {avatarPresets.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setUserData({ ...userData, photoURL: url });
                        setShowPhotoModal(false);
                      }}
                      className={cn("w-16 h-16 rounded-2xl overflow-hidden border-2 transition-transform hover:scale-105", userData.photoURL === url ? "border-blue-600 ring-2 ring-blue-500/30" : "border-slate-200")}
                    >
                      <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Or enter Image URL</label>
                <Input 
                  placeholder="https://example.com/my-photo.jpg" 
                  value={userData.photoURL}
                  onChange={(e) => setUserData({ ...userData, photoURL: e.target.value })}
                  className="text-xs"
                />
              </div>

              <Button variant="gradient" className="w-full font-bold" onClick={() => setShowPhotoModal(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Experience Modal */}
      <AnimatePresence>
        {showAddExpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Add Work Experience</h3>
                <button onClick={() => setShowAddExpModal(false)}><X size={20} /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Job Title / Role</label>
                  <Input 
                    placeholder="e.g. Senior React Engineer" 
                    value={newExp.role}
                    onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Company</label>
                  <Input 
                    placeholder="e.g. Acme Tech" 
                    value={newExp.company}
                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Time Period</label>
                  <Input 
                    placeholder="e.g. 2022 - Present" 
                    value={newExp.period}
                    onChange={(e) => setNewExp({ ...newExp, period: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Key Responsibilities / Impact</label>
                  <textarea 
                    placeholder="Describe your achievements..." 
                    value={newExp.desc}
                    onChange={(e) => setNewExp({ ...newExp, desc: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddExpModal(false)}>Cancel</Button>
                <Button variant="gradient" size="sm" onClick={handleAddExperience} className="font-bold">Add Experience</Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
