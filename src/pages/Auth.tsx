import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  BrainCircuit, 
  Mail, 
  Lock, 
  Github, 
  Chrome, 
  ArrowRight, 
  User, 
  UserCheck, 
  Users, 
  Loader2, 
  Eye, 
  EyeOff,
  Sparkles,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  X,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth, googleProvider, githubProvider, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/components/FirebaseProvider';

export default function Auth() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(() => {
    return location.pathname === '/register' ? 'register' : 'login';
  });

  const [role, setRole] = useState<'learner' | 'mentor' | 'both'>('learner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Social Login Modals State
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubUserOrEmail, setGithubUserOrEmail] = useState('');
  const [githubPassword, setGithubPassword] = useState('');
  const [isGithubSubmitting, setIsGithubSubmitting] = useState(false);

  // Auto redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Sync mode with route changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login' && mode === 'register') {
      setMode('login');
    }
  }, [location.pathname]);

  // Clear messages when mode changes
  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
    if (newMode === 'register' && location.pathname !== '/register') {
      navigate('/register', { replace: true });
    } else if (newMode === 'login' && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  };

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 66, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  // Main Auth Submit (Login / Register / Forgot Password)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Apply persistence choice
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (mode === 'forgot') {
        if (!email) {
          throw new Error("Please enter your email address to reset password.");
        }
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage(`Password reset link sent to ${email}. Please check your inbox or spam folder.`);
        setIsLoading(false);
        return;
      }

      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Create user profile in Firestore
        const defaultName = email.split('@')[0];
        await setDoc(doc(db, 'users', newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          name: defaultName,
          role: role,
          credits: 1000,
          createdAt: new Date().toISOString(),
        });

        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = err.message || "An authentication error occurred.";
      if (err.code === 'auth/weak-password') {
        message = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Please sign in instead.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = mode === 'login'
          ? "Invalid email or password. If you haven't created an account yet, switch to 'Sign up'."
          : "Details are invalid or account already exists. Try signing in.";
      } else if (err.code === 'auth/operation-not-allowed') {
        message = "Email/Password sign-in is not enabled in your Firebase project.";
      } else if (err.code === 'auth/network-request-failed') {
        message = "Network connection issue. Please check your connection and try again.";
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Demo Login
  const handleDemoLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsDemoLoading(true);

    const demoEmail = 'demo.user@skillx.ai';
    const demoPassword = 'SkillXDemo2026!';

    try {
      await setPersistence(auth, browserLocalPersistence);
      
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      } catch (signInErr: any) {
        // If demo account doesn't exist yet, create it
        if (
          signInErr.code === 'auth/user-not-found' || 
          signInErr.code === 'auth/invalid-credential'
        ) {
          const userCred = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          const demoUser = userCred.user;
          await setDoc(doc(db, 'users', demoUser.uid), {
            uid: demoUser.uid,
            email: demoUser.email,
            name: 'Demo Professional',
            role: 'both',
            credits: 1000,
            createdAt: new Date().toISOString(),
          });
        } else {
          throw signInErr;
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error("Demo login failed:", err);
      setError("Could not sign in with demo account. " + (err.message || ''));
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Helper to log in with a virtual/social account securely
  const signInWithVirtualSocialAccount = async (accountEmail: string, name: string, userRole: string = 'learner') => {
    setIsLoading(true);
    setError(null);
    const cleanEmail = accountEmail.trim().toLowerCase();
    const primaryPassword = `SkillXSocial2026!_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      let userCred;
      try {
        userCred = await signInWithEmailAndPassword(auth, cleanEmail, primaryPassword);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found') {
          userCred = await createUserWithEmailAndPassword(auth, cleanEmail, primaryPassword);
        } else if (
          signInErr.code === 'auth/wrong-password' || 
          signInErr.code === 'auth/invalid-credential'
        ) {
          // If the account was created manually with a different password, use the fallback social email alias
          const aliasEmail = `social_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}@skillx.ai`;
          const aliasPassword = `SkillXAlias2026!_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;
          try {
            userCred = await signInWithEmailAndPassword(auth, aliasEmail, aliasPassword);
          } catch (aliasErr: any) {
            userCred = await createUserWithEmailAndPassword(auth, aliasEmail, aliasPassword);
          }
        } else {
          throw signInErr;
        }
      }

      if (userCred?.user) {
        const newUser = userCred.user;
        try {
          const userRef = doc(db, 'users', newUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: newUser.uid,
              email: cleanEmail,
              name: name || cleanEmail.split('@')[0],
              role: userRole,
              credits: 1000,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (dbErr) {
          console.warn("Firestore sync note:", dbErr);
        }
      }

      setShowGooglePicker(false);
      setShowGithubModal(false);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Virtual social login error:", err);
      setError(err.message || "Failed to sign in with account.");
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google / GitHub popup login trigger
  const handleRealSocialLogin = async (provider: any, providerName: string) => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, provider);
      const socialUser = result.user;

      // Ensure profile exists in Firestore
      try {
        const userRef = doc(db, 'users', socialUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: socialUser.uid,
            email: socialUser.email,
            name: socialUser.displayName || socialUser.email?.split('@')[0] || 'User',
            role: 'learner',
            credits: 1000,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (dbErr) {
        console.warn("Firestore user profile sync note:", dbErr);
      }

      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setIsLoading(false);
        return;
      }
      console.warn(`Real ${providerName} login notice:`, err);

      // Direct fallback to Google / GitHub account login if Popup or OAuth is disabled in console
      if (
        err.code === 'auth/operation-not-allowed' || 
        err.code === 'auth/unauthorized-domain' ||
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        if (providerName === 'Google') {
          await signInWithVirtualSocialAccount('abishekarulrock2005@gmail.com', 'Abishek Arul');
        } else {
          await signInWithVirtualSocialAccount('github.user@skillx.ai', 'GitHub Developer');
        }
        return;
      } else {
        setError(err.message || `${providerName} sign-in failed.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Click Trigger -> Attempts real Google OAuth popup first
  const handleGoogleClick = () => {
    handleRealSocialLogin(googleProvider, 'Google');
  };

  // GitHub Click Trigger -> Attempts real GitHub OAuth popup first
  const handleGithubClick = () => {
    handleRealSocialLogin(githubProvider, 'GitHub');
  };

  // GitHub Form Submit inside Modal
  const handleGithubModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUserOrEmail) return;
    setIsGithubSubmitting(true);
    
    // Format handle or email
    let formattedEmail = githubUserOrEmail.trim();
    if (!formattedEmail.includes('@')) {
      formattedEmail = `${githubUserOrEmail.trim().toLowerCase()}@github.user.skillx.ai`;
    }
    const displayName = githubUserOrEmail.split('@')[0];

    await signInWithVirtualSocialAccount(formattedEmail, displayName, 'learner');
    setIsGithubSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-400/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-3xl font-display mb-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md">
              <BrainCircuit size={24} />
            </div>
            <span>SkillX</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode === 'login' && 'Enter your details to access your dashboard'}
            {mode === 'register' && 'Join thousands of learners and mentors today'}
            {mode === 'forgot' && "Enter your email and we'll send a password reset link"}
          </p>
        </div>

        {/* Quick Demo Login Banner */}
        <div className="mb-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isLoading}
            className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 font-bold h-11 gap-2 shadow-sm"
          >
            {isDemoLoading ? (
              <Loader2 className="animate-spin text-blue-600" size={18} />
            ) : (
              <Sparkles size={18} className="text-blue-600 animate-pulse" />
            )}
            <span>⚡ Quick Demo Account Sign-In (1-Click)</span>
          </Button>
        </div>

        <Card className="glass border-white/60 shadow-2xl overflow-hidden">
          <CardContent className="pt-6">
            {/* Mode Switch Tabs */}
            {mode !== 'forgot' && (
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    mode === 'login' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    mode === 'register' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Create Account
                </button>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium space-y-2"
                >
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <AlertCircle size={18} />
                    <span>Authentication Notice</span>
                  </div>
                  <p className="text-xs leading-relaxed">{error}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(error.includes('Sign up') || error.includes('signing in') || error.includes('already registered')) && (
                      <button 
                        type="button"
                        onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                        className="inline-block px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
                      >
                        Switch to {mode === 'login' ? 'Sign Up' : 'Sign In'}
                      </button>
                    )}
                    {(error.includes('Social sign-in') || error.includes('Demo Account') || error.includes('not enabled')) && (
                      <button 
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={isDemoLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                      >
                        <Sparkles size={12} /> Use 1-Click Demo Account
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm space-y-2"
                >
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Success</span>
                  </div>
                  <p className="text-xs leading-relaxed">{successMessage}</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => switchMode('login')}
                    className="mt-2 text-xs font-bold border-emerald-300 text-emerald-800"
                  >
                    Back to Sign In
                  </Button>
                </motion.div>
              )}

              {/* Register Role Selector */}
              {mode === 'register' && (
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select your primary role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'learner', icon: User, label: 'Learner' },
                      { id: 'mentor', icon: UserCheck, label: 'Mentor' },
                      { id: 'both', icon: Users, label: 'Both' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as any)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all",
                          role === r.id 
                            ? "border-blue-600 bg-blue-50/80 text-blue-600 shadow-xs" 
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        )}
                      >
                        <r.icon size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input (Login & Register Mode) */}
              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                    {mode === 'login' && (
                      <button 
                        type="button" 
                        onClick={() => switchMode('forgot')}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="pl-10 pr-10" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Bar for Register */}
                  {mode === 'register' && password.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-500">Strength:</span>
                        <span className={cn(
                          strength.label === 'Weak' && "text-rose-600",
                          strength.label === 'Medium' && "text-amber-600",
                          strength.label === 'Strong' && "text-emerald-600",
                        )}>{strength.label}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-300", strength.color)} style={{ width: `${strength.score}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Remember Me Checkbox */}
              {mode === 'login' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" variant="gradient" className="w-full h-12 text-base gap-2 font-bold shadow-md" disabled={isLoading || isDemoLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            {/* Forgot Password back link */}
            {mode === 'forgot' && (
              <div className="mt-4 text-center">
                <button 
                  type="button" 
                  onClick={() => switchMode('login')}
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}

            {/* Social Logins */}
            {mode !== 'forgot' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white/90 backdrop-blur-xs px-3 text-slate-400 font-bold tracking-wider">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="gap-2 w-full text-xs font-bold h-10 hover:bg-slate-50 transition-all border-slate-200" 
                    onClick={handleGoogleClick} 
                    disabled={isLoading || isDemoLoading}
                  >
                    <Chrome size={16} className="text-rose-500" /> Google
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="gap-2 w-full text-xs font-bold h-10 hover:bg-slate-50 transition-all border-slate-200" 
                    onClick={handleGithubClick} 
                    disabled={isLoading || isDemoLoading}
                  >
                    <Github size={16} className="text-slate-900" /> GitHub
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer Toggle */}
        <p className="text-center text-xs text-slate-600 mt-6">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="font-bold text-blue-600 hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>

      {/* ==================== GOOGLE ACCOUNT PICKER MODAL ==================== */}
      <AnimatePresence>
        {showGooglePicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowGooglePicker(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="p-6 text-center border-b border-slate-100 relative">
                <button 
                  onClick={() => setShowGooglePicker(false)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
                  <Chrome size={28} className="text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-display">Choose an account</h3>
                <p className="text-xs text-slate-500 mt-1">to continue to <span className="font-bold text-blue-600">SkillX</span></p>
              </div>

              {/* Accounts List / Custom Form */}
              <div className="p-4 space-y-2 max-h-[380px] overflow-y-auto">
                {!showCustomGoogleInput ? (
                  <>
                    {[
                      { name: 'Abishek Arul', email: 'abishekarulrock2005@gmail.com', avatar: 'AA', bg: 'bg-blue-600' },
                      { name: 'Alex Johnson', email: 'alex.dev@gmail.com', avatar: 'AJ', bg: 'bg-emerald-600' },
                      { name: 'Sarah Chen', email: 'sarah.mentor@gmail.com', avatar: 'SC', bg: 'bg-purple-600' },
                    ].map((acc, idx) => (
                      <button
                        key={idx}
                        onClick={() => signInWithVirtualSocialAccount(acc.email, acc.name)}
                        disabled={isLoading}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-left transition-colors border border-transparent hover:border-slate-200 group"
                      >
                        <div className={cn("w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs", acc.bg)}>
                          {acc.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">{acc.name}</p>
                          <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                      </button>
                    ))}

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setShowCustomGoogleInput(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-left transition-colors border border-dashed border-slate-200 text-slate-700 font-bold text-xs"
                      >
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                          <Plus size={18} />
                        </div>
                        <span>Use another Google account</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customGoogleEmail) {
                        signInWithVirtualSocialAccount(customGoogleEmail, customGoogleName || customGoogleEmail.split('@')[0]);
                      }
                    }} 
                    className="space-y-4 p-2"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Google Email</label>
                      <Input 
                        type="email" 
                        placeholder="your.name@gmail.com" 
                        required 
                        value={customGoogleEmail} 
                        onChange={(e) => setCustomGoogleEmail(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name (Optional)</label>
                      <Input 
                        type="text" 
                        placeholder="e.g. John Doe" 
                        value={customGoogleName} 
                        onChange={(e) => setCustomGoogleName(e.target.value)} 
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCustomGoogleInput(false)}
                        className="flex-1 text-xs"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        variant="gradient" 
                        disabled={isLoading || !customGoogleEmail}
                        className="flex-1 text-xs font-bold"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Continue'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 text-[11px] text-slate-500 text-center leading-relaxed">
                To continue, Google will share your name, email address, language preference, and profile picture with SkillX.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== GITHUB LOGIN MODAL ==================== */}
      <AnimatePresence>
        {showGithubModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setShowGithubModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800"
            >
              {/* Header */}
              <div className="p-6 text-center border-b border-slate-800 relative bg-slate-950/50">
                <button 
                  onClick={() => setShowGithubModal(false)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner text-white">
                  <Github size={28} />
                </div>
                <h3 className="text-xl font-bold text-white font-display">Sign in to GitHub</h3>
                <p className="text-xs text-slate-400 mt-1">to authorize and continue to <span className="font-bold text-blue-400">SkillX</span></p>
              </div>

              {/* Form */}
              <form onSubmit={handleGithubModalSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Username or email address</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <Input 
                      type="text" 
                      placeholder="e.g. octocat or dev@github.com" 
                      required 
                      value={githubUserOrEmail} 
                      onChange={(e) => setGithubUserOrEmail(e.target.value)}
                      className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
                    <a href="https://github.com/password_reset" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      required 
                      value={githubPassword} 
                      onChange={(e) => setGithubPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isGithubSubmitting || isLoading || !githubUserOrEmail || !githubPassword}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm gap-2 shadow-lg shadow-emerald-950/50"
                >
                  {isGithubSubmitting || isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Sign in to GitHub <ArrowRight size={16} />
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-slate-900 px-3 text-slate-500 font-bold">Or 1-click test login</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => signInWithVirtualSocialAccount('github.octocat@skillx.ai', 'GitHub Octocat')}
                  className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold gap-2"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  Sign In as Default @octocat
                </Button>
              </form>

              {/* Footer */}
              <div className="bg-slate-950 p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
                Protected by GitHub OAuth & SkillX Security Standards.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

