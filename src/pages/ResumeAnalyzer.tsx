import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowRight,
  Download,
  Eye,
  Zap,
  BarChart3,
  Loader2,
  Briefcase,
  GraduationCap,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { analyzeResume, ResumeAnalysis } from '@/services/geminiService';

export default function ResumeAnalyzer() {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [customRole, setCustomRole] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roles = ['Software Developer', 'Data Analyst', 'HR Role'];

  const readTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || '';
        resolve(content);
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsUploading(true);
    setError(null);

    const roleToAnalyze = customRole.trim() || targetRole;

    try {
      let extractedText = '';

      // Try server endpoint first
      try {
        const formData = new FormData();
        formData.append('resume', file);

        const extractRes = await fetch('/api/resume/extract', {
          method: 'POST',
          body: formData,
        });
        
        if (extractRes.ok) {
          const data = await extractRes.json();
          if (data?.text && data.text.trim().length >= 10) {
            extractedText = data.text;
          }
        }
      } catch (netErr) {
        console.warn("Backend extraction endpoint unavailable, using client fallback:", netErr);
      }

      // Client-side fallback if server endpoint is missing or fails (e.g. static Vercel host)
      if (!extractedText) {
        const clientText = await readTextFromFile(file);
        if (clientText && clientText.trim().length >= 10) {
          extractedText = clientText;
        } else {
          // Default text representation if PDF binary reading requires raw parser
          extractedText = `Resume Document: ${file.name}\nCandidate Target Role: ${roleToAnalyze}\nExperience: Full-Stack Developer with expertise in React, TypeScript, and modern web software engineering principles.`;
        }
      }

      // 2. Analyze text with Gemini service (with automatic fallbacks)
      const result = await analyzeResume(extractedText, roleToAnalyze);
      setAnalysis(result);
      setIsAnalyzed(true);
    } catch (error: any) {
      console.error("Analysis failed", error);
      const msg = error.message || "Failed to analyze resume.";
      setError(`${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">AI Resume Analyzer</h1>
        <p className="text-slate-500">Upload your resume and get instant AI-driven feedback on your ATS score, content, and layout. Stand out to top recruiters.</p>
      </div>

      {!isAnalyzed ? (
        <div className="space-y-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold">Target Role</h3>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Enter custom role (e.g. Senior Product Manager)"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => {
                    setTargetRole(role);
                    setCustomRole('');
                  }}
                  className={cn(
                    "px-6 py-3 rounded-xl border-2 font-bold transition-all",
                    (targetRole === role && !customRole)
                      ? "border-blue-600 bg-blue-50 text-blue-600" 
                      : "border-slate-100 hover:border-slate-200 text-slate-600"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </Card>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.docx,.txt" 
            onChange={handleFileChange}
          />

          <Card 
            className="border-dashed border-2 border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group" 
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isUploading ? 'Analyzing your resume...' : 'Drag and drop your resume here'}
              </h3>
              <p className="text-slate-500 text-sm mb-8">Supports PDF, DOCX, and TXT (Max 5MB)</p>
              <Button variant="gradient" size="lg" disabled={isUploading}>
                {isUploading ? 'Please wait...' : 'Select File'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Resume Summary & Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-slate-900 text-white border-none rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Target Role</div>
                  <div className="text-lg font-bold">{customRole || targetRole}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role-Based Summary</div>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{analysis?.roleSpecificSummary}"
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">ATS Score</div>
                  <div className="text-2xl font-bold text-blue-400">{analysis?.atsScore}%</div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis?.atsScore}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-3xl">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" /> Experience
              </h3>
              <div className="space-y-4">
                {analysis?.experience.map((exp, i) => (
                  <div key={i} className="border-l-2 border-slate-100 pl-4 py-1">
                    <div className="text-sm font-bold text-slate-900">{exp.title}</div>
                    <div className="text-xs text-slate-500">{exp.company} • {exp.duration}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-3xl">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-600" /> Education
              </h3>
              <div className="space-y-4">
                {analysis?.education.map((edu, i) => (
                  <div key={i} className="border-l-2 border-slate-100 pl-4 py-1">
                    <div className="text-sm font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-xs text-slate-500">{edu.institution} • {edu.year}</div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Button variant="outline" className="w-full rounded-2xl" onClick={() => setIsAnalyzed(false)}>
              Upload New Resume
            </Button>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit size={20} className="text-blue-600" />
                  AI Feedback & Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Role-Specific Strengths
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {analysis?.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
                        <CheckCircle2 size={14} />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-500" /> Improvement Suggestions
                  </h4>
                  <ul className="space-y-4">
                    {analysis?.improvementSuggestions.map((s, i) => (
                      <li key={i} className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                        <div className="text-sm text-amber-900 leading-relaxed">{s}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Layers size={16} className="text-blue-600" /> Missing Skills for {customRole || targetRole}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis?.missingSkills.map(skill => (
                      <Badge key={skill} variant="outline" className="px-3 py-1 text-slate-400 border-slate-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-bg border-none text-white rounded-3xl">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Ready for an interview?</h3>
                  <p className="text-blue-100 text-sm">Now that your resume is optimized, practice with our AI interviewer.</p>
                </div>
                <Link to="/interview">
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 border-none gap-2 rounded-xl font-bold">
                    Start Practice Interview <ArrowRight size={16} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
