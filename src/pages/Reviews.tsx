import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  ChevronRight, 
  Filter,
  Search,
  User,
  MoreVertical,
  Flag,
  X,
  Check,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/FirebaseProvider';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
  category: string;
  mentorName: string;
}

const initialReviews: Review[] = [
  {
    id: '1',
    userName: 'Alex Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Sarah is an incredible mentor. Her deep knowledge of React and System Design helped me land my dream job at a top tech company. Highly recommended!',
    date: '2024-03-15',
    helpfulCount: 24,
    category: 'Engineering',
    mentorName: 'Sarah Wilson'
  },
  {
    id: '2',
    userName: 'Emily Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 4,
    comment: 'The interview prep session with Michael was very structured. He gave me specific feedback on my communication style that I hadn\'t noticed before.',
    date: '2024-03-12',
    helpfulCount: 12,
    category: 'Product',
    mentorName: 'Michael Chen'
  },
  {
    id: '3',
    userName: 'Marcus Miller',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Elena\'s design review was eye-opening. She pointed out accessibility issues I completely missed. My portfolio looks 10x better now.',
    date: '2024-03-10',
    helpfulCount: 18,
    category: 'Design',
    mentorName: 'Elena Rodriguez'
  },
  {
    id: '4',
    userName: 'Sophia Lee',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Great session on backend architecture. David explained complex microservices concepts in a very simple way.',
    date: '2024-03-08',
    helpfulCount: 9,
    category: 'Engineering',
    mentorName: 'David Kim'
  }
];

export default function Reviews() {
  const { user, profile } = useAuth();
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Write Review Modal state
  const [showModal, setShowModal] = useState(false);
  const [mentorName, setMentorName] = useState('Sarah Wilson');
  const [category, setCategory] = useState('Engineering');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const categories = ['All', 'Engineering', 'Product', 'Design', 'Data Science'];

  const filteredReviews = reviewsList.filter(review => {
    const matchesFilter = filter === 'All' || review.category === filter;
    const matchesSearch = review.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddReview = () => {
    if (!comment.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      userName: profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Verified Learner',
      userAvatar: profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      category,
      mentorName
    };

    setReviewsList([newReview, ...reviewsList]);
    setComment('');
    setShowModal(false);
  };

  const handleHelpful = (id: string) => {
    setReviewsList(reviewsList.map(r => r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
  };

  // Calculate dynamic stats
  const avgRating = (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-display">Reviews & Community Ratings</h1>
          <p className="text-slate-500">Read verified learner feedback and share your mentorship experience.</p>
        </div>
        <Button variant="gradient" className="gap-2 font-bold" onClick={() => setShowModal(true)}>
          <Star size={18} /> Write a Review
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-bg text-white border-none shadow-xl">
          <CardContent className="p-6">
            <div className="text-4xl font-extrabold mb-1 font-mono">{avgRating}</div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star 
                  key={i} 
                  size={16} 
                  className={cn("fill-white text-white", i > Math.round(Number(avgRating)) ? "opacity-30" : "")} 
                />
              ))}
            </div>
            <div className="text-blue-100 text-xs font-bold uppercase tracking-wider">Average Community Rating</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="text-4xl font-extrabold text-slate-900 mb-1 font-mono">{reviewsList.length + 1240}</div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Verified Reviews</div>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[92%]"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="text-4xl font-extrabold text-slate-900 mb-1 font-mono">99%</div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Satisfaction Rate</div>
            <div className="mt-3 flex -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                +1.2k
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search reviews or mentors..." 
            className="pl-10 h-12 text-sm bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                filter === cat 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="border-slate-200 hover:border-slate-300 transition-colors p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{review.userName}</h4>
                  <p className="text-xs text-slate-500">Reviewed <strong className="text-blue-600">{review.mentorName}</strong> ({review.category})</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={cn(
                        i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      )} 
                    />
                  ))}
                  <span className="text-xs font-bold text-amber-700 ml-1">{review.rating}.0</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{review.date}</span>
              </div>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed mb-4">
              "{review.comment}"
            </p>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <button 
                onClick={() => handleHelpful(review.id)}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors font-medium"
              >
                <ThumbsUp size={14} /> Helpful ({review.helpfulCount})
              </button>
              <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">
                Verified Session
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full space-y-6 relative border border-slate-200"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-slate-900">Write a Mentor Review</h3>
                <p className="text-xs text-slate-500">Share your session experience to help other learners.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Select Mentor
                  </label>
                  <select 
                    value={mentorName} 
                    onChange={(e) => setMentorName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  >
                    <option value="Sarah Wilson">Sarah Wilson (Senior Frontend Engineer)</option>
                    <option value="Michael Chen">Michael Chen (Product Manager)</option>
                    <option value="Elena Rodriguez">Elena Rodriguez (UX Designer)</option>
                    <option value="David Kim">David Kim (Backend Architect)</option>
                    <option value="Jessica Lee">Jessica Lee (Data Scientist)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Category
                  </label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star 
                          size={28} 
                          className={cn(
                            (hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          )} 
                        />
                      </button>
                    ))}
                    <span className="text-sm font-bold text-slate-700 ml-2">{rating}.0 / 5.0</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Your Review
                  </label>
                  <textarea 
                    placeholder="Describe how the session helped you, mentor feedback, or key takeaways..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="gradient" className="font-bold px-6" onClick={handleAddReview}>
                  Submit Review
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
