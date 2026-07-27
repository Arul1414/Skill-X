import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown, Menu, Check, Trash2, Calendar, Award, Sparkles, MessageSquare } from 'lucide-react';
import { Input } from './ui/Input';
import { useAuth } from './FirebaseProvider';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onMenuClick?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'session' | 'credit' | 'ai' | 'chat';
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, profile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Session Booking Confirmed',
      description: 'Your 1-on-1 mentorship session with Sarah Wilson (Google) is confirmed for Today, 4:00 PM.',
      time: '10m ago',
      read: false,
      type: 'session'
    },
    {
      id: '2',
      title: 'AI Resume Report Ready',
      description: 'Your ATS resume score is 88/100. Review recommended skill gap suggestions.',
      time: '1h ago',
      read: false,
      type: 'ai'
    },
    {
      id: '3',
      title: 'Credit Bonus Credited',
      description: '+1,000 learning credits added to your account for completing AI interview practice.',
      time: '3h ago',
      read: true,
      type: 'credit'
    },
    {
      id: '4',
      title: 'New Message from Michael Chen',
      description: 'Michael replied: "Please make sure to review component state patterns..."',
      time: '1d ago',
      read: true,
      type: 'chat'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarSrc = profile?.photoURL || user?.photoURL;

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:block flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search skills, mentors, or materials..." 
            className="pl-10 bg-slate-50 border-none focus-visible:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 relative">
        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Search size={20} />
        </button>

        {/* Bell Button & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors focus:outline-none"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button 
                      onClick={markAllRead} 
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                    <span className="text-slate-300">|</span>
                    <button 
                      onClick={clearAll} 
                      className="text-slate-400 hover:text-rose-600 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No new notifications right now.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
                        }}
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!item.read ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          item.type === 'session' ? 'bg-blue-100 text-blue-600' :
                          item.type === 'credit' ? 'bg-emerald-100 text-emerald-600' :
                          item.type === 'ai' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {item.type === 'session' && <Calendar size={18} />}
                          {item.type === 'credit' && <Award size={18} />}
                          {item.type === 'ai' && <Sparkles size={18} />}
                          {item.type === 'chat' && <MessageSquare size={18} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-xs font-bold ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-400">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-px bg-slate-200 mx-1 md:mx-2"></div>
        
        <Link to="/profile" className="flex items-center gap-2 md:gap-3 p-1 pr-2 md:pr-3 hover:bg-slate-100 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt={profile?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              getInitials(profile?.name || user?.email || 'User')
            )}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-semibold text-slate-900 leading-none truncate max-w-[120px]">
              {profile?.name || user?.email?.split('@')[0]}
            </div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate max-w-[120px]">
              {profile?.role || 'Learner'}
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </Link>
      </div>
    </header>
  );
}
