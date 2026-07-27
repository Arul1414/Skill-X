import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Users, 
  Zap, 
  Shield, 
  Globe,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl font-display">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white">
              <BrainCircuit size={20} />
            </div>
            <span>SkillX</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/register">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="flex flex-col p-4 space-y-4">
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">Features</a>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">How it Works</a>
                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">Pricing</a>
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button variant="gradient" className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={14} />
              The Future of Skill Exchange
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-display text-slate-900 leading-[1.1] mb-6">
              Learn. Teach. <br />
              <span className="gradient-text">Get Hired with AI.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              SkillX is the world's first AI-powered skill exchange platform. Master new skills through peer-to-peer learning and ace your interviews with our advanced AI intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" variant="gradient" className="w-full sm:w-auto gap-2">
                  Start Learning <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/interview">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Try AI Interview
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-500">
                <span className="font-bold text-slate-900">10k+</span> users already learning
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
            
            <Card className="glass relative z-10 overflow-hidden border-white/40 shadow-2xl">
              <img 
                src="https://picsum.photos/seed/dashboard/1200/800" 
                alt="SkillX Dashboard" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </Card>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 glass p-4 rounded-2xl shadow-xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Interview Passed!</div>
                  <div className="text-[10px] text-slate-500">Score: 94/100</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4">Everything you need to level up</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our platform combines human expertise with AI intelligence to provide a seamless learning and career growth experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Skill Exchange",
                description: "Connect with mentors and learners globally. Teach what you know, learn what you don't.",
                color: "bg-blue-500"
              },
              {
                icon: BrainCircuit,
                title: "AI Interview Intelligence",
                description: "Practice with our advanced AI. Get real-time feedback on your communication and technical skills.",
                color: "bg-purple-500"
              },
              {
                icon: FileText,
                title: "Resume Analyzer",
                description: "Optimize your resume for ATS and get AI-driven suggestions to stand out to recruiters.",
                color: "bg-emerald-500"
              }
            ].map((feature, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow border-none">
                <CardContent className="pt-8">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6", feature.color)}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-2xl font-display mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <BrainCircuit size={20} />
              </div>
              <span>SkillX</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-6">
              Empowering the next generation of professionals through AI-driven skill exchange and interview intelligence.
            </p>
            <div className="flex gap-4">
              {/* Social icons placeholder */}
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Globe size={16} /></div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Shield size={16} /></div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Skill Exchange</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Interview</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Resume Analyzer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
          © 2026 SkillX Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
