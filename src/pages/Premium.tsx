import React, { useState } from 'react';
import { 
  Zap, 
  Check, 
  Crown, 
  Star, 
  ShieldCheck, 
  Rocket, 
  Users, 
  BrainCircuit,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/FirebaseProvider';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const plans = [
  {
    name: 'Free',
    price: '0',
    credits: 1000,
    description: 'Perfect for getting started with skill exchange and basic interview prep.',
    features: [
      '5 AI Interview sessions / month',
      'Basic Resume Analysis',
      'Access to public study materials',
      'Standard community support',
      '1,000 monthly credits'
    ],
    variant: 'outline',
    popular: false
  },
  {
    name: 'Pro',
    price: '29',
    credits: 10000,
    description: 'For serious learners aiming for top tech roles at Google, Meta, or Stripe.',
    features: [
      'Unlimited AI Interview sessions',
      'Advanced Resume Analysis & ATS optimization',
      'Priority Mentor booking',
      'Exclusive premium study materials',
      '10,000 monthly credits',
      'Personalized AI learning roadmap'
    ],
    variant: 'gradient',
    popular: true
  },
  {
    name: 'Elite',
    price: '99',
    credits: 50000,
    description: 'The ultimate career acceleration package with 1-on-1 expert coaching.',
    features: [
      'Everything in Pro',
      '1-on-1 monthly session with top mentors',
      'Mock interview with industry experts',
      'Job referral assistance',
      '50,000 monthly credits',
      'Lifetime access to premium courses'
    ],
    variant: 'secondary',
    popular: false
  }
];

export default function Premium() {
  const { user, profile } = useAuth();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentPlan = profile?.plan || 'Free';

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    if (!user) return;
    if (plan.name === currentPlan) return;

    setUpgradingPlan(plan.name);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        plan: plan.name,
        credits: (profile?.credits || 1000) + plan.credits
      });

      setSuccessMessage(`Successfully upgraded to SkillX ${plan.name}! Added +${plan.credits.toLocaleString()} credits.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      console.error("Upgrade error:", e);
    } finally {
      setUpgradingPlan(null);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-4 py-1.5 font-extrabold uppercase tracking-widest text-xs">
          SkillX Membership
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          Accelerate Your Career with <span className="text-blue-600">SkillX Pro</span>
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          Unlock advanced AI tools, expert mentorship, and exclusive interview resources designed to help you land your dream tech job faster.
        </p>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-500"
          >
            <Check size={18} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => {
          const isCurrent = currentPlan === plan.name;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-blue-600 text-white border-none px-4 py-1 shadow-lg font-bold">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card className={cn(
                "h-full flex flex-col transition-all duration-300 hover:shadow-2xl border-slate-200",
                plan.popular ? "border-blue-300 shadow-xl ring-2 ring-blue-500/20" : "",
                isCurrent ? "bg-blue-50/30 border-blue-400" : ""
              )}>
                <CardHeader className="p-8 pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-bold",
                      plan.name === 'Free' ? "bg-slate-100 text-slate-600" :
                      plan.name === 'Pro' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {plan.name === 'Free' ? <Rocket size={24} /> :
                       plan.name === 'Pro' ? <Zap size={24} /> : <Crown size={24} />}
                    </div>
                    {isCurrent && (
                      <Badge className="bg-emerald-100 text-emerald-700 font-bold border-none text-[10px] uppercase">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-extrabold text-slate-900">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-slate-900 font-mono">${plan.price}</span>
                    <span className="text-slate-500 font-medium text-sm">/month</span>
                  </div>
                  <CardDescription className="mt-4 text-slate-500 min-h-[40px] text-xs leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-3.5 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                          <Check size={12} className="text-emerald-600 font-bold" />
                        </div>
                        <span className="text-xs text-slate-600 leading-tight font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant={isCurrent ? "outline" : (plan.variant as any)} 
                    disabled={isCurrent || upgradingPlan === plan.name}
                    onClick={() => handleSelectPlan(plan)}
                    className={cn(
                      "w-full h-12 rounded-xl font-extrabold transition-all",
                      isCurrent ? "bg-slate-100 text-slate-500 cursor-default" : ""
                    )}
                  >
                    {upgradingPlan === plan.name 
                      ? "Upgrading..." 
                      : isCurrent 
                      ? "Active Subscription" 
                      : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Highlights */}
      <div className="mt-20 space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">Why Go Premium?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              icon: BrainCircuit, 
              title: 'Advanced Gemini AI', 
              desc: 'Get deeper real-time insights from our Gemini-powered interview and resume tools.',
              color: 'text-blue-600',
              bg: 'bg-blue-50'
            },
            { 
              icon: ShieldCheck, 
              title: 'Verified Mentors', 
              desc: 'Direct access to industry experts from top tech companies like Google, Meta, and Netflix.',
              color: 'text-emerald-600',
              bg: 'bg-emerald-50'
            },
            { 
              icon: Sparkles, 
              title: 'Exclusive Resources', 
              desc: 'Unlock premium system design guides, video courses, and interview question banks.',
              color: 'text-amber-600',
              bg: 'bg-amber-50'
            },
            { 
              icon: Users, 
              title: 'Priority Support', 
              desc: 'Get your questions answered faster with our dedicated 1-on-1 support team.',
              color: 'text-purple-600',
              bg: 'bg-purple-50'
            }
          ].map((feature, i) => (
            <div key={i} className="text-center space-y-3 p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <div className={cn("w-14 h-14 rounded-2xl mx-auto flex items-center justify-center", feature.bg, feature.color)}>
                <feature.icon size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-900">{feature.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
