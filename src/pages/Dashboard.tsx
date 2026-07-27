import React from 'react';
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/components/FirebaseProvider';
import { cn } from '@/lib/utils';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Link } from 'react-router-dom';

import sarahImg from '../assets/images/sarah_avatar_1784971927147.jpg';
import michaelImg from '../assets/images/michael_avatar_1784971950558.jpg';
import elenaImg from '../assets/images/elena_avatar_1784971966054.jpg';
import davidImg from '../assets/images/david_avatar_1784971982822.jpg';

const data = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 72 },
  { name: 'Wed', score: 68 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 82 },
  { name: 'Sat', score: 90 },
  { name: 'Sun', score: 94 },
];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', user.uid),
      where('status', '==', 'scheduled'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUpcomingSessions(sessions);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, {profile?.name || user?.email?.split('@')[0]}! 👋</h1>
          <p className="text-slate-500 text-sm md:text-base">Here's what's happening with your learning journey today.</p>
        </div>
        <Link to="/exchange" className="w-full sm:w-auto">
          <Button variant="gradient" className="gap-2 w-full">
            <Calendar size={18} />
            Schedule Session
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Skills Learned', value: '12', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Sessions Completed', value: '48', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Interview Score', value: '94%', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Growth Rate', value: '+24%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                  <stat.icon size={20} />
                </div>
                <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-none">
                  <ArrowUpRight size={12} className="mr-1" /> 12%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Interview Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Sessions</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 mb-4">No sessions scheduled yet.</p>
                <Link to="/exchange">
                  <Button variant="outline" size="sm">Find a Mentor</Button>
                </Link>
              </div>
            ) : (
              upcomingSessions.map((session, i) => {
                const avatarMap: Record<string, string> = {
                  'm1': sarahImg,
                  'm2': michaelImg,
                  'm3': elenaImg,
                  'm4': davidImg
                };
                const mentorAvatar = avatarMap[session.mentorId] || sarahImg;
                return (
                  <div key={session.id} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img src={mentorAvatar} alt={session.mentorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{session.mentorName}</div>
                      <div className="text-xs text-slate-500">{session.skill}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
                        <Clock size={10} /> {session.time}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {upcomingSessions.length > 0 && (
              <Button className="w-full mt-4 bg-slate-900 text-white hover:bg-slate-800">
                Quick Action: Start Next Session
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { type: 'interview', title: 'Completed Technical Interview', desc: 'Score: 92/100 • Feedback received', time: '2 hours ago' },
              { type: 'skill', title: 'New Skill Badge Earned', desc: 'Advanced TypeScript Mastery', time: '5 hours ago' },
              { type: 'message', title: 'New Message from Sarah', desc: "Looking forward to our session!", time: 'Yesterday' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <div className="w-px h-full bg-slate-100 mx-auto mt-2"></div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{activity.title}</div>
                  <div className="text-xs text-slate-500 mb-1">{activity.desc}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{activity.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gradient-bg border-none text-white">
          <CardContent className="p-8 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready for your next challenge?</h3>
              <p className="text-blue-100 text-sm mb-6">Our AI has analyzed your recent performance and suggests a Technical Interview on "Distributed Systems".</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-400 bg-blue-300 overflow-hidden">
                    <img src={`https://picsum.photos/seed/ai${i}/100/100`} alt="AI" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <Link to="/interview">
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 border-none font-bold">
                  Start AI Interview <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


