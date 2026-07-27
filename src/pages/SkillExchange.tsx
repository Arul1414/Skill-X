import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, Clock, Calendar, ChevronRight, BookOpen, Check, X, ShieldCheck, Sparkles, Plus, MessageSquare, Award, Briefcase, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/FirebaseProvider';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

import sarahImg from '../assets/images/sarah_avatar_1784971927147.jpg';
import michaelImg from '../assets/images/michael_avatar_1784971950558.jpg';
import elenaImg from '../assets/images/elena_avatar_1784971966054.jpg';
import davidImg from '../assets/images/david_avatar_1784971982822.jpg';
import jessicaImg from '../assets/images/jessica_avatar_1784972220338.jpg';
import alexImg from '../assets/images/alex_avatar_1784972237370.jpg';
import priyaImg from '../assets/images/priya_avatar_1784972250286.jpg';

interface MentorReview {
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  skills: string[];
  rating: number;
  reviewsCount: number;
  price: number;
  avatar: string;
  availability: string;
  bio: string;
  about: string;
  experienceYears: number;
  pastReviews: MentorReview[];
}

const mentors: Mentor[] = [
  {
    id: 'm1',
    name: 'Sarah Wilson',
    role: 'Senior Frontend Engineer',
    company: 'Google',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'System Design', 'Performance Tuning'],
    rating: 4.9,
    reviewsCount: 124,
    price: 50,
    avatar: sarahImg,
    availability: 'Available Today, 4:00 PM',
    bio: 'Ex-Facebook & current Tech Lead at Google with 8+ years experience in large-scale web systems.',
    about: 'I specialize in helping software engineers navigate frontend technical interviews, React system architecture, performance optimization, and career progression in Tier-1 tech companies.',
    experienceYears: 8,
    pastReviews: [
      { userName: 'Alex Johnson', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', rating: 5, comment: 'Sarah helped me clear my Google L5 interview! Her system design framework was invaluable.', date: '3 days ago' },
      { userName: 'David K.', userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', rating: 5, comment: 'Clear, actionable feedback on component optimization.', date: '1 week ago' }
    ]
  },
  {
    id: 'm2',
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'Meta',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analytics', 'PRD Writing'],
    rating: 4.8,
    reviewsCount: 89,
    price: 45,
    avatar: michaelImg,
    availability: 'Available Tomorrow, 2:00 PM',
    bio: 'Product Strategist specializing in AI products, user growth loops, and tech interviews.',
    about: 'Passionate about guiding aspiring Product Managers through product sense, metric design, and execution cases. I have interviewed 100+ PM candidates.',
    experienceYears: 6,
    pastReviews: [
      { userName: 'Emily Chen', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', rating: 5, comment: 'The product execution session gave me exact confidence for Meta PM interviews.', date: '2 days ago' }
    ]
  },
  {
    id: 'm3',
    name: 'Elena Rodriguez',
    role: 'UX Designer',
    company: 'Airbnb',
    skills: ['Figma', 'Visual Design', 'Prototyping', 'Design Systems', 'Accessibility'],
    rating: 5.0,
    reviewsCount: 56,
    price: 60,
    avatar: elenaImg,
    availability: 'Available Thursday, 10:00 AM',
    bio: 'Senior UX Designer passionate about human-centered design, accessibility, and design portfolios.',
    about: 'I focus on portfolio teardowns, interactive prototype reviews, and helping designers craft strong design stories that get noticed by hiring managers.',
    experienceYears: 7,
    pastReviews: [
      { userName: 'Marcus M.', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', rating: 5, comment: 'Elena pointed out key contrast & flow issues in my portfolio. Highly recommended!', date: '5 days ago' }
    ]
  },
  {
    id: 'm4',
    name: 'David Kim',
    role: 'Backend Architect',
    company: 'Netflix',
    skills: ['Node.js', 'Go', 'Kubernetes', 'Microservices', 'Distributed Systems'],
    rating: 4.7,
    reviewsCount: 210,
    price: 55,
    avatar: davidImg,
    availability: 'Available Today, 6:30 PM',
    bio: 'Distributed systems engineer focused on cloud infrastructure, scalability, and API optimization.',
    about: 'Building fault-tolerant backend services processing millions of RPS. Let us break down database sharding, caching strategies, and event-driven pipelines.',
    experienceYears: 10,
    pastReviews: [
      { userName: 'Sophia L.', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', rating: 5, comment: 'David explains microservices concepts with amazing real-world Netflix examples.', date: 'Yesterday' }
    ]
  },
  {
    id: 'm5',
    name: 'Jessica Lee',
    role: 'Data Scientist & AI Engineer',
    company: 'Amazon',
    skills: ['Python', 'Machine Learning', 'SQL', 'PyTorch', 'LLMs'],
    rating: 4.9,
    reviewsCount: 142,
    price: 50,
    avatar: jessicaImg,
    availability: 'Available Tomorrow, 11:00 AM',
    bio: 'AI researcher helping engineers master Machine Learning pipelines and data algorithms.',
    about: 'Expertise in fine-tuning GenAI models, feature engineering, and high-scale ML data pipelines.',
    experienceYears: 5,
    pastReviews: [
      { userName: 'Ryan T.', userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80', rating: 5, comment: 'Super clear explanation of PyTorch neural net optimization!', date: '4 days ago' }
    ]
  },
  {
    id: 'm6',
    name: 'Alex Turner',
    role: 'Full Stack Developer',
    company: 'Stripe',
    skills: ['React', 'Ruby on Rails', 'PostgreSQL', 'GraphQL', 'Stripe API'],
    rating: 4.8,
    reviewsCount: 75,
    price: 45,
    avatar: alexImg,
    availability: 'Available Today, 8:00 PM',
    bio: 'Full Stack specialist helping developers write clean code and build production APIs.',
    about: 'I teach web architecture, API security, payment integrations, and effective full-stack debugging.',
    experienceYears: 6,
    pastReviews: [
      { userName: 'Jessica M.', userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', rating: 5, comment: 'Alex helped me fix complex state management bugs in 30 minutes!', date: '6 days ago' }
    ]
  },
  {
    id: 'm7',
    name: 'Priya Sharma',
    role: 'Lead Cloud Architect',
    company: 'Microsoft',
    skills: ['Azure', 'AWS', 'Docker', 'Terraform', 'DevOps'],
    rating: 4.9,
    reviewsCount: 98,
    price: 55,
    avatar: priyaImg,
    availability: 'Available Friday, 3:00 PM',
    bio: 'Cloud Infrastructure Expert specializing in Kubernetes orchestration, CI/CD pipelines, and multi-cloud security.',
    about: 'I help developers transition into DevOps/Cloud roles, master Terraform Infrastructure as Code, and design resilient cloud solutions.',
    experienceYears: 9,
    pastReviews: [
      { userName: 'Vikram R.', userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', rating: 5, comment: 'Priya guided me through complex Kubernetes ingress configurations step by step.', date: '2 days ago' }
    ]
  }
];

export default function SkillExchange() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Detail Modal state
  const [viewingMentor, setViewingMentor] = useState<Mentor | null>(null);

  // Booking Modal state
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [bookingTime, setBookingTime] = useState<string>('Today at 4:00 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Top Up Modal
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);

  const categories = ['All', 'Engineering', 'Design', 'Product', 'Data Science'];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || 
      (selectedCategory === 'Engineering' && (mentor.role.includes('Engineer') || mentor.role.includes('Developer') || mentor.role.includes('Architect'))) ||
      (selectedCategory === 'Product' && mentor.role.includes('Product')) ||
      (selectedCategory === 'Design' && mentor.role.includes('Designer')) ||
      (selectedCategory === 'Data Science' && (mentor.role.includes('Data') || mentor.role.includes('AI')));
      
    return matchesSearch && matchesCategory;
  });

  const handleConfirmBooking = async () => {
    if (!selectedMentor) return;
    if (!user || !profile) {
      setToastMessage({ type: 'error', text: 'Please log in to book a session.' });
      return;
    }

    const currentCredits = profile.credits ?? 1000;
    if (currentCredits < selectedMentor.price) {
      setToastMessage({ type: 'error', text: 'Insufficient credits. Click Top Up to add more credits.' });
      setShowTopUpModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'sessions'), {
        userId: user.uid,
        mentorId: selectedMentor.id,
        mentorName: selectedMentor.name,
        skill: selectedMentor.skills[0],
        price: selectedMentor.price,
        status: 'scheduled',
        time: bookingTime || selectedMentor.availability,
        timestamp: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', user.uid), {
        credits: currentCredits - selectedMentor.price
      });

      setToastMessage({ 
        type: 'success', 
        text: `Successfully booked 1-on-1 session with ${selectedMentor.name}!` 
      });

      setSelectedMentor(null);
      setViewingMentor(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (error) {
      console.error("Booking error:", error);
      setToastMessage({ type: 'error', text: 'Failed to book session. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopUpCredits = async (amount: number) => {
    if (!user) return;
    setIsToppingUp(true);
    try {
      const currentCredits = profile?.credits ?? 1000;
      await updateDoc(doc(db, 'users', user.uid), {
        credits: currentCredits + amount
      });
      setToastMessage({ type: 'success', text: `Added +${amount} credits to your account!` });
      setShowTopUpModal(false);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error("Top Up failed:", e);
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-display">Peer Skill Exchange</h1>
          <p className="text-slate-500 text-sm md:text-base">Book 1-on-1 mentorship sessions with verified tech experts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-3">
            <img 
              src={profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
              alt={profile?.displayName || 'User'} 
              className="w-8 h-8 rounded-full object-cover border border-blue-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Credit Balance</span>
              <span className="text-base font-extrabold text-blue-600 font-mono">
                {profile?.credits?.toLocaleString() ?? 1000}
              </span>
            </div>
          </div>
          <Button variant="gradient" className="font-bold gap-2 rounded-2xl" onClick={() => setShowTopUpModal(true)}>
            <Plus size={16} /> Top Up
          </Button>
        </div>
      </div>

      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2 text-white border",
              toastMessage.type === 'success' ? "bg-emerald-600 border-emerald-500" : "bg-rose-600 border-rose-500"
            )}
          >
            {toastMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Category Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by mentor name, skill (e.g., React, Go), or company..." 
            className="pl-10 h-12 text-sm bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                selectedCategory === cat 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div 
                className="flex items-start justify-between gap-4 cursor-pointer"
                onClick={() => setViewingMentor(mentor)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={mentor.avatar} 
                      alt={mentor.name} 
                      className="w-14 h-14 rounded-2xl object-cover shadow-xs border border-slate-200 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors flex items-center gap-1">
                      {mentor.name}
                      <ShieldCheck size={16} className="text-blue-500 shrink-0" />
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{mentor.role} @ <strong className="text-slate-700">{mentor.company}</strong></p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-800">{mentor.rating}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({mentor.reviewsCount} sessions)</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-blue-600">{mentor.price}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Credits</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {mentor.bio}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {mentor.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-700 font-medium text-[11px]">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50"
                  onClick={() => setViewingMentor(mentor)}
                >
                  View Profile
                </Button>
                <Button 
                  size="sm" 
                  variant="gradient" 
                  className="font-bold text-xs gap-1"
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setBookingTime(mentor.availability);
                  }}
                >
                  Book Session <ChevronRight size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mentor Profile Details Modal */}
      <AnimatePresence>
        {viewingMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 relative border border-slate-200"
            >
              <button 
                onClick={() => setViewingMentor(null)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-5 border-b border-slate-100 pb-6">
                <div className="relative shrink-0">
                  <img src={viewingMentor.avatar} alt={viewingMentor.name} className="w-24 h-24 rounded-3xl object-cover shadow-lg border-2 border-white" referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                    Online
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-900 font-display">{viewingMentor.name}</h2>
                    <ShieldCheck size={20} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    {viewingMentor.role} at <span className="text-blue-600 font-bold">{viewingMentor.company}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star size={14} className="fill-amber-400" /> {viewingMentor.rating} ({viewingMentor.reviewsCount} reviews)
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <Briefcase size={14} /> {viewingMentor.experienceYears}+ Years Exp.
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <Clock size={14} /> {viewingMentor.availability.split(',')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & About */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Mentor</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {viewingMentor.about}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expertise & Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingMentor.skills.map((skill) => (
                    <Badge key={skill} className="bg-blue-50 text-blue-700 border-blue-100 font-bold px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Student Reviews */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Learner Reviews</h4>
                <div className="space-y-2">
                  {viewingMentor.pastReviews.map((rev, i) => (
                    <div key={i} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                            alt={rev.userName} 
                            className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block leading-none">{rev.userName}</span>
                            <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                              {[...Array(rev.rating || 5)].map((_, idx) => (
                                <Star key={idx} size={10} className="fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-10 leading-relaxed font-normal">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-600">{viewingMentor.price}</span>
                  <span className="text-xs text-slate-500 font-bold uppercase">Credits / Session</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none gap-2"
                    onClick={() => {
                      setViewingMentor(null);
                      navigate('/chat');
                    }}
                  >
                    <MessageSquare size={16} /> Send Message
                  </Button>
                  <Button 
                    variant="gradient" 
                    className="flex-1 sm:flex-none font-bold gap-2"
                    onClick={() => {
                      setSelectedMentor(viewingMentor);
                      setBookingTime(viewingMentor.availability);
                    }}
                  >
                    Book Session <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full space-y-6 relative border border-slate-200"
            >
              <button 
                onClick={() => setSelectedMentor(null)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>

              <div className="border-b border-slate-100 pb-5 space-y-3">
                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                      alt="Learner" 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Learner</span>
                      <span className="text-xs font-bold text-slate-900">{profile?.displayName || user?.displayName || 'You'}</span>
                    </div>
                  </div>

                  <div className="text-center px-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">1-ON-1</span>
                    <span className="text-xs font-bold text-blue-600">⚡ SESSION</span>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Mentor</span>
                      <span className="text-xs font-bold text-slate-900">{selectedMentor.name}</span>
                    </div>
                    <img 
                      src={selectedMentor.avatar} 
                      alt={selectedMentor.name} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] uppercase font-bold">
                    {selectedMentor.company} • {selectedMentor.role}
                  </Badge>
                  <span className="font-bold text-blue-600 font-mono text-sm">{selectedMentor.price} Credits</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Select Available Session Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      selectedMentor.availability,
                      'Tomorrow at 3:00 PM',
                      'Friday at 5:00 PM',
                      'Saturday at 11:00 AM'
                    ].map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setBookingTime(slot)}
                        className={cn(
                          "p-3 rounded-xl text-xs font-bold border text-left transition-all",
                          bookingTime === slot 
                            ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20" 
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mentor Hourly Rate:</span>
                    <span className="font-bold text-slate-900">{selectedMentor.price} Credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Your Credit Balance:</span>
                    <span className="font-bold text-blue-600">{profile?.credits ?? 1000} Credits</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Balance After Booking:</span>
                    <span className={cn((profile?.credits ?? 1000) - selectedMentor.price >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {(profile?.credits ?? 1000) - selectedMentor.price} Credits
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedMentor(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="gradient" 
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="font-bold px-6"
                >
                  {isSubmitting ? 'Booking Session...' : 'Confirm & Reserve Session'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Up Credits Modal */}
      <AnimatePresence>
        {showTopUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6 relative border border-slate-200"
            >
              <button 
                onClick={() => setShowTopUpModal(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Top Up Credits</h3>
                <p className="text-xs text-slate-500">Refill your credits to continue booking 1-on-1 mentorship sessions.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { amount: 500, label: '+500 Credits', desc: 'Standard Refill', price: '$9.99' },
                  { amount: 1000, label: '+1,000 Credits', desc: 'Popular Choice', price: '$18.99', badge: 'Best Value' },
                  { amount: 2500, label: '+2,500 Credits', desc: 'Pro Learner Pack', price: '$39.99' }
                ].map((pack) => (
                  <div 
                    key={pack.amount}
                    onClick={() => handleTopUpCredits(pack.amount)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base group-hover:text-blue-600">{pack.label}</span>
                        {pack.badge && <Badge className="bg-amber-500 text-white text-[9px] uppercase">{pack.badge}</Badge>}
                      </div>
                      <span className="text-xs text-slate-400">{pack.desc}</span>
                    </div>
                    <Button size="sm" variant="gradient" disabled={isToppingUp}>
                      Add {pack.price}
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
