import React, { useState } from 'react';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  Info,
  Check,
  CheckCheck,
  Circle,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/FirebaseProvider';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  status?: 'sent' | 'read';
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
  messages: Message[];
}

const initialContacts: Contact[] = [
  { 
    id: '1', 
    name: 'Sarah Wilson', 
    role: 'Senior Frontend Engineer @ Google',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    online: true, 
    messages: [
      { id: 'm1', text: 'Hi Sarah, I am excited about our upcoming React System Design prep session!', sender: 'me', time: '10:30 AM', status: 'read' },
      { id: 'm2', text: 'Hello! Great to connect. Please make sure to review component state patterns before we meet.', sender: 'them', time: '10:32 AM' },
      { id: 'm3', text: 'Will do! Is Thursday at 4 PM still good for you?', sender: 'me', time: '10:35 AM', status: 'read' },
      { id: 'm4', text: 'Yes, Thursday at 4 PM works perfectly. Looking forward to it!', sender: 'them', time: '10:40 AM' }
    ]
  },
  { 
    id: '2', 
    name: 'Michael Chen', 
    role: 'Product Manager @ Meta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    online: false, 
    messages: [
      { id: 'm1', text: 'Hi Michael, thanks for the product strategy tips!', sender: 'me', time: 'Yesterday', status: 'read' },
      { id: 'm2', text: 'You are welcome! Let me know if you need help reviewing your PRD mock.', sender: 'them', time: 'Yesterday' }
    ]
  },
  { 
    id: '3', 
    name: 'Elena Rodriguez', 
    role: 'UX Designer @ Airbnb',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    online: true, 
    messages: [
      { id: 'm1', text: 'Hey Elena, could you take a look at my Figma portfolio links?', sender: 'me', time: 'Oct 8', status: 'read' },
      { id: 'm2', text: 'Sure thing! Send them over and I will record a quick Loom video feedback.', sender: 'them', time: 'Oct 8' }
    ]
  },
  { 
    id: '4', 
    name: 'David Kim', 
    role: 'Backend Architect @ Netflix',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    online: false, 
    messages: [
      { id: 'm1', text: 'Thanks for explaining Kubernetes microservices architecture!', sender: 'me', time: 'Oct 5', status: 'read' }
    ]
  }
];

export default function Chat() {
  const { user, profile } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [activeContactId, setActiveContactId] = useState<string>(initialContacts[0].id);
  const [msgInput, setMsgInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!msgInput.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: Date.now().toString(),
      text: msgInput.trim(),
      sender: 'me',
      time: timeString,
      status: 'sent'
    };

    const currentMsgText = msgInput.trim();
    setMsgInput('');

    // Append message to active contact
    setContacts(prev => prev.map(c => {
      if (c.id === activeContactId) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    // Simulate smart mentor response after 1.2s
    setTimeout(() => {
      const replies = [
        `Thanks for sharing! That sounds like a solid approach. Let's cover that in detail during our next 1-on-1 session.`,
        `Got it! I reviewed your notes and agree. Feel free to send over any relevant code links or docs.`,
        `Awesome progress! Let me know if you run into any blockers before our scheduled call.`,
        `Sounds great! I'll prepare some practice interview questions based on what you mentioned.`
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: randomReply,
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setContacts(prev => prev.map(c => {
        if (c.id === activeContactId) {
          return {
            ...c,
            messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m).concat(replyMsg)
          };
        }
        return c;
      }));
    }, 1200);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 pb-6">
      {/* Sidebar / Contacts List */}
      <Card className="w-80 md:w-96 flex flex-col overflow-hidden border-slate-200">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 font-display">Messages</h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {contacts.length} Active
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9 h-10 text-xs bg-slate-50 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredContacts.map((contact) => {
            const lastMessage = contact.messages[contact.messages.length - 1];
            return (
              <div 
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer transition-colors border-l-4",
                  activeContactId === contact.id 
                    ? "bg-blue-50/80 border-blue-600" 
                    : "hover:bg-slate-50/80 border-transparent"
                )}
              >
                <div className="relative shrink-0">
                  <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" referrerPolicy="no-referrer" />
                  {contact.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{contact.name}</h4>
                    <span className="text-[10px] text-slate-400">{lastMessage?.time || ''}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {lastMessage ? lastMessage.text : 'Start conversation...'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Chat Conversation Window */}
      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-2xl object-cover" referrerPolicy="no-referrer" />
              {activeContact.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{activeContact.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{activeContact.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-500"><Phone size={18} /></Button>
            <Button variant="ghost" size="icon" className="text-slate-500"><Video size={18} /></Button>
            <Button variant="ghost" size="icon" className="text-slate-500"><Info size={18} /></Button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          <div className="flex justify-center">
            <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-2xs">
              End-to-End Encrypted Mentorship Chat
            </div>
          </div>

          {activeContact.messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[75%]",
                msg.sender === 'me' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-xs font-medium",
                msg.sender === 'me' 
                  ? "bg-blue-600 text-white rounded-tr-xs" 
                  : "bg-white text-slate-900 rounded-tl-xs border border-slate-200"
              )}>
                {msg.text}
              </div>
              <div className="flex items-center gap-1.5 mt-1 px-1">
                <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                {msg.sender === 'me' && (
                  msg.status === 'read' ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} className="text-slate-300" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
              <Paperclip size={20} />
            </Button>
            <div className="flex-1 relative">
              <Input 
                placeholder={`Message ${activeContact.name}...`} 
                className="pr-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 text-sm"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Smile size={18} />
              </button>
            </div>
            <Button type="submit" variant="gradient" size="icon" className="rounded-full w-10 h-10 shrink-0">
              <Send size={18} />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
