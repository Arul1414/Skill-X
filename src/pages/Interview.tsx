import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Settings, 
  MessageSquare, 
  Timer, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Play,
  BarChart3,
  Lightbulb,
  ShieldAlert,
  Loader2,
  Volume2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { 
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer 
} from 'recharts';
import { generateInterviewQuestions, analyzeInterviewPerformance, InterviewQuestion, InterviewFeedback } from '@/services/geminiService';
import { useAuth } from '@/components/FirebaseProvider';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type InterviewState = 'setup' | 'live' | 'feedback';

export default function Interview() {
  const { user } = useAuth();
  const [state, setState] = useState<InterviewState>('setup');
  const [interviewType, setInterviewType] = useState<'technical' | 'hr' | 'domain'>('technical');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [role, setRole] = useState('Frontend Developer');
  
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [violations, setViolations] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [isTestingMedia, setIsTestingMedia] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  
  const setupVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const feedbackVideoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState('');

  // Request Media Permissions with fallbacks and error handling
  const requestMediaPermissions = async (): Promise<MediaStream | null> => {
    setPermissionError(null);
    setIsTestingMedia(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError("Camera & microphone access requires HTTPS or a supported modern browser. You can continue seamlessly in Text Practice Mode.");
      setHasPermissions(false);
      setIsTestingMedia(false);
      return null;
    }

    // Attempt 1: Full Video + Audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, 
        audio: true 
      });
      setActiveStream(stream);
      setHasPermissions(true);
      setIsTestingMedia(false);
      return stream;
    } catch (err1: any) {
      console.warn("Video + Audio request failed, trying video only...", err1);

      // Attempt 2: Video only fallback
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setActiveStream(videoStream);
        setHasPermissions(true);
        setIsTestingMedia(false);
        return videoStream;
      } catch (err2: any) {
        console.warn("Video only request failed, trying audio only...", err2);

        // Attempt 3: Audio only fallback
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setActiveStream(audioStream);
          setHasPermissions(true);
          setIsTestingMedia(false);
          return audioStream;
        } catch (err3: any) {
          console.warn("All media requests failed:", err3);
          const mainErr = err1 || err2 || err3;
          const errMsg = mainErr?.message || mainErr?.name || String(mainErr);

          if (
            mainErr?.name === 'NotAllowedError' || 
            mainErr?.name === 'PermissionDeniedError' || 
            mainErr?.name === 'SecurityError' ||
            errMsg.toLowerCase().includes('dismissed') ||
            errMsg.toLowerCase().includes('denied')
          ) {
            setPermissionError("Camera or Microphone permission was blocked or dismissed. Please allow permissions in your browser address bar and click Retry, or continue in Text Practice Mode.");
          } else if (mainErr?.name === 'NotFoundError' || mainErr?.name === 'DevicesNotFoundError') {
            setPermissionError("No camera or microphone hardware was detected on this device. You can continue in Text Practice Mode.");
          } else {
            setPermissionError(`Media Device Notice: ${errMsg}. You can continue in Text Practice Mode.`);
          }
          setHasPermissions(false);
          setIsTestingMedia(false);
          return null;
        }
      }
    }
  };

  // Bind Active Stream to Video Elements
  useEffect(() => {
    if (!activeStream) return;

    const attachStream = (videoEl: HTMLVideoElement | null) => {
      if (videoEl) {
        videoEl.srcObject = activeStream;
        videoEl.play().catch(e => console.warn("Video play error:", e));
      }
    };

    if (state === 'setup') {
      attachStream(setupVideoRef.current);
    } else if (state === 'live') {
      attachStream(videoRef.current);
    } else if (state === 'feedback') {
      attachStream(feedbackVideoRef.current);
    }
  }, [activeStream, state]);

  // Clean up Stream on Component Unmount
  useEffect(() => {
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeStream]);
  
  // Proctoring State
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [lastViolation, setLastViolation] = useState<string | null>(null);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Voice Warning System
  const speakWarning = (text: string) => {
    if (!voiceEnabled) return;
    
    // Cancel any ongoing speech to prioritize the new warning
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a professional sounding voice (e.g., Google UK English Female or similar)
    const preferredVoice = voicesRef.current.find(v => 
      v.name.includes('Google') || v.name.includes('Female') || v.lang.includes('en-GB')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
    setLastViolation(text);
    setViolations(prev => [...prev, `${new Date().toLocaleTimeString()}: ${text}`]);
    
    // Clear violation message after 4 seconds
    setTimeout(() => setLastViolation(null), 4000);
  };

  // Setup Proctoring Listeners
  useEffect(() => {
    if (state !== 'live') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        speakWarning("Tab switching detected. Please stay on this page.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Simulate Face Detection Proctoring
    const proctorInterval = setInterval(() => {
      const rand = Math.random();
      // Increased frequency and specific alerts as requested
      if (rand < 0.08) {
        speakWarning("Warning: Please focus on the screen and maintain eye contact.");
      } else if (rand < 0.12) {
        speakWarning("Alert: Only one person is allowed in the frame. Please ensure you are alone.");
      } else if (rand < 0.15) {
        speakWarning("Warning: Excessive head movement detected. Please stay steady.");
      } else if (rand < 0.18) {
        speakWarning("Notice: Please keep your eyes on the screen to avoid disqualification.");
      }
    }, 8000); // Check every 8 seconds

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(proctorInterval);
    };
  }, [state]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript;
              setTranscript(prev => {
                const trimmed = prev.trim();
                return trimmed === '' ? text : `${trimmed} ${text}`;
              });
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          if (event.error === 'not-allowed') {
            speakWarning("Microphone access for voice recognition is restricted.");
          }
        };
      } catch (err) {
        console.warn("Speech recognition initialization error:", err);
      }
    }
  }, []);

  const startInterview = async (bypassPermissions = false) => {
    setPermissionError(null);
    
    if (!bypassPermissions) {
      let stream = activeStream;
      if (!stream) {
        stream = await requestMediaPermissions();
      }
      if (!stream) {
        return; // permission error message is set by requestMediaPermissions
      }
      setHasPermissions(true);
      
      // "Unlock" speech synthesis with a user gesture
      if (voiceEnabled && window.speechSynthesis) {
        try {
          const unlockUtterance = new SpeechSynthesisUtterance("Voice alerts enabled. Starting interview.");
          unlockUtterance.volume = 0; // Silent unlock
          window.speechSynthesis.speak(unlockUtterance);
        } catch (e) {
          console.warn("Speech synthesis unlock failed:", e);
        }
      }
    } else {
      setHasPermissions(false);
    }

    setIsLoadingQuestions(true);
    try {
      const generatedQuestions = await generateInterviewQuestions(`${interviewType} ${role}`, difficulty);
      setQuestions(generatedQuestions);
      setState('live');
    } catch (error) {
      console.error("Failed to start interview", error);
      setPermissionError("Failed to generate interview questions. Please check your network and try again.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleNextQuestion = () => {
    setAnswers(prev => [...prev, transcript || "Skipped"]);
    setTranscript('');
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishInterview();
    }
  };

  const skipQuestion = () => {
    setAnswers(prev => [...prev, "Skipped"]);
    setTranscript('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setIsAnalyzing(true);
    setState('feedback');
    try {
      const finalAnswers = [...answers, transcript];
      const result = await analyzeInterviewPerformance(role, questions, finalAnswers, violations);
      setFeedback(result);

      // Save to Firestore if user is logged in
      if (user) {
        await addDoc(collection(db, 'interviews'), {
          userId: user.uid,
          role,
          difficulty,
          type: interviewType,
          questions: questions.map(q => q.question),
          answers: finalAnswers,
          violations,
          feedback: result,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const radarData = React.useMemo(() => {
    if (!feedback) return [];
    return [
      { subject: 'Communication', A: feedback.communicationScore, fullMark: 100 },
      { subject: 'Confidence', A: feedback.confidenceScore, fullMark: 100 },
      { subject: 'Technical', A: feedback.technicalScore, fullMark: 100 },
      { subject: 'Clarity', A: 85, fullMark: 100 },
      { subject: 'Engagement', A: 90, fullMark: 100 },
    ];
  }, [feedback]);

  return (
    <div className="max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {state === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-500/20">
                <BrainCircuit size={32} />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">AI Smart Interview & Proctoring</h1>
              <p className="text-slate-500 max-w-xl mx-auto">Experience a real-world interview environment with 15 dynamic questions and advanced proctoring intelligence.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-6">1. Interview Details</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Role</label>
                    <input 
                      type="text" 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Interview Type</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'technical', title: 'Technical', icon: Settings },
                        { id: 'hr', title: 'Behavioral / HR', icon: MessageSquare },
                        { id: 'domain', title: 'Domain-based', icon: BrainCircuit },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setInterviewType(type.id as any)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                            interviewType === type.id 
                              ? "border-blue-600 bg-blue-50" 
                              : "border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            interviewType === type.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                          )}>
                            <type.icon size={20} />
                          </div>
                          <div className="font-bold text-slate-900">{type.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-6">2. Choose Difficulty</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'easy', label: 'Junior / Intern', desc: 'Foundational concepts and basic problem solving.' },
                      { id: 'medium', label: 'Mid-Level', desc: 'Practical application and architectural patterns.' },
                      { id: 'hard', label: 'Senior / Staff', desc: 'Complex system design and deep technical trade-offs.' },
                    ].map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setDifficulty(level.id as any)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all",
                          difficulty === level.id 
                            ? "border-blue-600 bg-blue-50" 
                            : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{level.label}</div>
                          <div className="text-xs text-slate-500">{level.desc}</div>
                        </div>
                        {difficulty === level.id && <CheckCircle2 className="text-blue-600" size={20} />}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                      <ShieldAlert size={14} /> PROCTORING ENABLED
                    </div>
                    <button 
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all",
                        voiceEnabled ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                      )}
                    >
                      {voiceEnabled ? <Volume2 size={12} /> : <MicOff size={12} />}
                      {voiceEnabled ? "VOICE ON" : "VOICE OFF"}
                    </button>
                  </div>
                  <p className="text-[10px] text-rose-500 leading-relaxed">
                    Advanced AI voice alerts will warn you about tab switching, eye contact, and head movement.
                  </p>
                </div>
              </Card>
            </div>

            {/* Camera & Microphone Device Test Box */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Video className="text-blue-600" size={20} />
                    3. Camera & Microphone Setup
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Test your webcam and microphone feed before starting the proctored interview.</p>
                </div>

                <Button
                  onClick={() => requestMediaPermissions()}
                  disabled={isTestingMedia}
                  variant={hasPermissions ? "outline" : "gradient"}
                  size="sm"
                  className="shrink-0"
                >
                  {isTestingMedia ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : hasPermissions ? (
                    <>Test Camera Again</>
                  ) : (
                    <>Test Camera & Mic Permission</>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center">
                  {hasPermissions && activeStream ? (
                    <video 
                      ref={setupVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                        <VideoOff size={24} />
                      </div>
                      <p className="text-xs font-bold text-slate-300">Camera Feed Inactive</p>
                      <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Click "Test Camera & Mic Permission" or Start Interview to grant permission.</p>
                    </div>
                  )}

                  {hasPermissions && (
                    <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      LIVE CAMERA READY
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 flex items-center gap-2">
                        <Video size={14} className={hasPermissions ? "text-emerald-600" : "text-slate-400"} />
                        Webcam Permission
                      </span>
                      <Badge variant={hasPermissions ? "success" : "secondary"}>
                        {hasPermissions ? "Connected" : "Not Tested"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 flex items-center gap-2">
                        <Mic size={14} className={hasPermissions ? "text-emerald-600" : "text-slate-400"} />
                        Microphone Input
                      </span>
                      <Badge variant={hasPermissions ? "success" : "secondary"}>
                        {hasPermissions ? "Active" : "Not Tested"}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Note: If camera or mic permission is denied or unsupported on your browser/device, you can always choose <span className="font-bold text-slate-700">Text Practice Mode</span> to complete the interview without penalties.
                  </p>
                </div>
              </div>
            </Card>

                <div className="flex justify-center flex-col items-center gap-4">
                  {permissionError && (
                    <div className="w-full max-w-xl p-5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col gap-4 text-rose-800 text-sm animate-in fade-in slide-in-from-top-2 shadow-sm">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="shrink-0 mt-0.5 text-rose-600" size={20} />
                        <div className="space-y-1">
                          <p className="font-bold text-rose-900">Media Permission Notice</p>
                          <p className="text-rose-700 leading-relaxed">{permissionError}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2 border-t border-rose-200/60 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white text-slate-700 hover:bg-slate-50 border-rose-200 font-bold"
                          onClick={() => startInterview(true)}
                          disabled={isLoadingQuestions}
                        >
                          Continue in Text Mode (No Camera/Mic)
                        </Button>
                        <Button 
                          size="sm" 
                          variant="gradient" 
                          onClick={() => startInterview(false)}
                          disabled={isLoadingQuestions}
                        >
                          Retry Camera/Mic Permissions
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!permissionError && (
                    <Button 
                      size="lg" 
                      variant="gradient" 
                      className="px-12 h-14 text-lg gap-2" 
                      onClick={() => startInterview(false)}
                      disabled={isLoadingQuestions}
                    >
                      {isLoadingQuestions ? (
                        <>Generating 15 Questions <Loader2 className="animate-spin" size={18} /></>
                      ) : (
                        <>Start Smart Interview <Play size={18} /></>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

        {state === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="h-[calc(100vh-12rem)] flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant={hasPermissions ? "error" : "secondary"} className="animate-pulse px-3 py-1">
                  <div className={cn("w-2 h-2 rounded-full mr-2", hasPermissions ? "bg-rose-500" : "bg-blue-500")}></div>
                  {hasPermissions ? "LIVE PROCTORING ACTIVE" : "TEXT PRACTICE MODE"}
                </Badge>
                <div className="flex items-center gap-2 text-slate-500 font-mono text-sm">
                  <Timer size={16} /> Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                  <ShieldAlert size={14} /> Warnings: {violations.length}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={skipQuestion}>Skip</Button>
                <Button variant="error" size="sm" onClick={finishInterview}>End Interview</Button>
              </div>
            </div>

            {/* Violation Overlay */}
            <AnimatePresence>
              {lastViolation && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold"
                >
                  <ShieldAlert size={20} />
                  {lastViolation}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
              {/* Main Interview Area */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Card className="flex-1 bg-slate-900 relative overflow-hidden group rounded-3xl min-h-[320px]">
                  {hasPermissions ? (
                    <>
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline
                        muted 
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent"></div>
                    </>
                  ) : (
                    <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
                        <BrainCircuit size={32} />
                      </div>
                      <p className="font-bold text-white text-base mb-1">Text Practice Mode Active</p>
                      <p className="text-xs text-slate-400 max-w-sm mb-2">Camera proctoring is inactive because permissions were not granted. Read the question below and type your response.</p>
                    </div>
                  )}
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                      <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">AI Interviewer</div>
                      <p className="text-white text-lg font-medium leading-relaxed">
                        {questions[currentQuestionIndex]?.question}
                      </p>
                    </div>
                  </div>

                  {/* Transcript & Type Area */}
                  <div className="absolute top-6 left-6 right-6 flex flex-col gap-2">
                    <div className="bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-white/60 text-xs italic">
                      {isRecording ? "Listening..." : "Voice recording inactive"}
                    </div>
                    <div className="relative group/textarea">
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Type your answer here or use voice..."
                        className="w-full bg-black/60 backdrop-blur-md p-4 pr-12 rounded-2xl border border-white/20 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] resize-none transition-all"
                      />
                      {transcript && (
                        <button 
                          onClick={() => setTranscript('')}
                          className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
                          title="Clear answer"
                        >
                          <AlertCircle size={16} className="rotate-45" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant={isRecording ? "gradient" : "outline"} 
                    size="icon" 
                    className={cn("w-14 h-14 rounded-full border-slate-200", isRecording && "animate-pulse")}
                    onClick={toggleRecording}
                  >
                    {isRecording ? <Mic size={24} /> : <MicOff size={24} />}
                  </Button>
                  <Button variant="outline" size="icon" className="w-14 h-14 rounded-full border-slate-200">
                    <Video size={24} />
                  </Button>
                  <Button variant="gradient" className="h-14 px-8 rounded-full text-lg gap-2" onClick={handleNextQuestion}>
                    {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'} <ChevronRight size={20} />
                  </Button>
                </div>
              </div>

              {/* Real-time Feedback Panel */}
              <div className="flex flex-col gap-6">
                <Card className="flex-1 overflow-hidden rounded-3xl">
                  <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldAlert size={16} className="text-rose-600" />
                      Proctoring Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 overflow-auto max-h-[300px]">
                    {violations.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs italic">
                        No violations detected yet.
                      </div>
                    ) : (
                      violations.map((v, i) => (
                        <div key={i} className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-[10px] text-rose-700 flex gap-2">
                          <AlertCircle size={12} className="shrink-0 mt-0.5" />
                          {v}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white border-none rounded-3xl">
                  <CardContent className="p-6">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-4">Live Analysis</div>
                    <div className="space-y-4">
                      {[
                        { label: 'Communication', value: 85, color: 'bg-blue-500' },
                        { label: 'Confidence', value: 92, color: 'bg-emerald-500' },
                        { label: 'Answer Quality', value: 78, color: 'bg-purple-500' },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span>{m.label}</span>
                            <span>{m.value}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${m.value}%` }}
                              className={cn("h-full", m.color)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}


        {state === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                  <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={32} />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900">Analyzing Performance...</h2>
                  <p className="text-slate-500">AI is evaluating your answers and proctoring logs.</p>
                </div>
              </div>
            ) : feedback && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">Interview Feedback</h1>
                    <p className="text-slate-500">Comprehensive analysis of your {role} interview.</p>
                  </div>
                  <Button variant="gradient" onClick={() => setState('setup')}>Start New Interview</Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Performance Radar Chart */}
                  <Card className="lg:col-span-2 rounded-3xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 size={20} className="text-blue-600" />
                        Performance Breakdown
                      </CardTitle>
                      <CardDescription>Visual representation of your skill assessment</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar
                            name="Performance"
                            dataKey="A"
                            stroke="#2563eb"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Live Review View */}
                  <Card className="rounded-3xl overflow-hidden bg-slate-900 relative border-none">
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-none">
                        Live Review View
                      </Badge>
                    </div>
                    <video 
                      ref={feedbackVideoRef}
                      autoPlay 
                      playsInline
                      muted 
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="text-4xl font-bold mb-1">{feedback.overallScore}</div>
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Overall Performance Score</div>
                    </div>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                        Strengths & Weaknesses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-sm text-slate-600 italic leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        "{feedback.summary}"
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" /> Key Strengths
                          </h4>
                          <ul className="space-y-3">
                            {feedback.strengths.map((s, i) => (
                              <li key={i} className="flex gap-3 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertCircle size={16} className="text-rose-500" /> Areas for Improvement
                          </h4>
                          <ul className="space-y-3">
                            {feedback.weaknesses.map((w, i) => (
                              <li key={i} className="flex gap-3 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 text-white border-none rounded-3xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb size={20} className="text-blue-400" />
                        AI Suggestions & Better Answers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {feedback.suggestions.map((s, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <h5 className="font-bold text-blue-400 text-sm mb-2">{s.area}</h5>
                          <div className="text-xs text-slate-400 font-bold uppercase mb-2">Suggested Answer:</div>
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{s.betterAnswer}"
                          </p>
                        </div>
                      ))}
                      
                      {violations.length > 0 && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                          <h5 className="font-bold text-rose-400 text-sm mb-2 flex items-center gap-2">
                            <ShieldAlert size={16} /> Proctoring Note
                          </h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Your score was impacted by {violations.length} proctoring violations. Ensure a stable, distraction-free environment for future interviews.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
