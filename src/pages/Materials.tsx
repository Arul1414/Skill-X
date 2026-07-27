import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Download, 
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Plus,
  Loader2,
  X,
  Eye,
  Check,
  FileCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Material {
  id: string;
  title: string;
  type: string;
  url: string;
  uploadedBy: string;
  category: string;
  description?: string;
  timestamp: string;
}

const fallbackMaterials: Material[] = [
  {
    id: "m1",
    title: "System Design Primer & Architecture Cheat Sheet",
    type: "pdf",
    url: "/api/materials/download/m1",
    uploadedBy: "SkillX Admin",
    category: "Engineering",
    description: "Complete guide covering Load Balancers, Microservices, Caching Strategies (Redis), Database Sharding, and Event-Driven Pipelines.",
    timestamp: new Date().toISOString()
  },
  {
    id: "m2",
    title: "React 19 & TypeScript Performance Tuning",
    type: "notes",
    url: "/api/materials/download/m2",
    uploadedBy: "Sarah Wilson (Google)",
    category: "Engineering",
    description: "Proven practices for optimizing React component re-renders, useMemo/useCallback memoization, code splitting, and bundle size reduction.",
    timestamp: new Date().toISOString()
  },
  {
    id: "m3",
    title: "Product Strategy & Metric Frameworks",
    type: "pdf",
    url: "/api/materials/download/m3",
    uploadedBy: "Michael Chen (Meta)",
    category: "Product",
    description: "Frameworks for answering Product Sense, Execution, and A/B Testing interview questions at top Tier-1 tech companies.",
    timestamp: new Date().toISOString()
  },
  {
    id: "m4",
    title: "Data Structures & Algorithms Cheat Sheet",
    type: "pdf",
    url: "/api/materials/download/m4",
    uploadedBy: "David Kim (Netflix)",
    category: "Engineering",
    description: "Quick reference guide for Big-O time complexity, Binary Search Trees, Dynamic Programming patterns, and Graph Traversals.",
    timestamp: new Date().toISOString()
  },
  {
    id: "m5",
    title: "UX Design System & Accessibility Guidelines",
    type: "link",
    url: "https://www.behance.net/",
    uploadedBy: "Elena Rodriguez (Airbnb)",
    category: "Design",
    description: "WCAG 2.1 accessibility checklists, contrast ratios, micro-interactions, and design token naming conventions.",
    timestamp: new Date().toISOString()
  },
  {
    id: "m6",
    title: "Machine Learning & LLM Fine-Tuning Guide",
    type: "video",
    url: "https://www.coursera.org/",
    uploadedBy: "Jessica Lee (Amazon)",
    category: "Data Science",
    description: "Comprehensive crash course on PyTorch, RAG architectures, prompt engineering, and model deployment pipelines.",
    timestamp: new Date().toISOString()
  }
];

export default function Materials() {
  const [selectedTab, setSelectedTab] = useState('All');
  const [materials, setMaterials] = useState<Material[]>(fallbackMaterials);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  const tabs = ['All', 'pdf', 'notes', 'video', 'link'];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/materials');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMaterials(data);
        }
      }
    } catch (error) {
      console.warn("Failed to fetch materials, using rich fallback dataset", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setIsUploading(true);
    try {
      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        setIsUploadModalOpen(false);
        fetchMaterials();
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesTab = selectedTab === 'All' || m.type === selectedTab;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-display">Study Materials & Notes</h1>
          <p className="text-slate-500 text-sm md:text-base">Curated system design guides, cheat sheets, and technical interview notes.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/api/documentation/download" download>
            <Button variant="outline" className="gap-2 rounded-xl font-bold border-slate-200">
              <Download size={16} /> Download Project Doc PDF
            </Button>
          </a>
          <Button variant="gradient" className="gap-2 rounded-xl font-bold" onClick={() => setIsUploadModalOpen(true)}>
            <Plus size={18} /> Upload Resource
          </Button>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search resources, topics, or authors..." 
            className="pl-10 h-12 text-sm bg-white border-slate-200" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap",
                selectedTab === tab 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium">Loading resources...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((resource) => (
            <Card key={resource.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-none shadow-md",
                      resource.type === 'video' ? "bg-rose-500 text-white" :
                      resource.type === 'pdf' ? "bg-blue-600 text-white" :
                      resource.type === 'notes' ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
                    )}>
                      {resource.type}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(resource.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-2 text-blue-400 group-hover:scale-110 transition-transform">
                    {resource.type === 'video' ? <Video size={44} /> :
                     resource.type === 'pdf' ? <FileText size={44} /> :
                     resource.type === 'notes' ? <FileCode size={44} /> : <LinkIcon size={44} />}
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block">{resource.category}</span>
                  </div>
                </div>

                <CardContent className="p-6 space-y-3">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {resource.description || 'Comprehensive resource notes and interview preparation material.'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Uploaded by <span className="font-bold text-slate-700">{resource.uploadedBy}</span>
                  </p>
                </CardContent>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 flex items-center gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-xs font-semibold text-slate-700 gap-1"
                  onClick={() => setPreviewMaterial(resource)}
                >
                  <Eye size={14} /> Preview
                </Button>

                <a 
                  href={resource.url.startsWith('/') ? resource.url : resource.url} 
                  target={resource.url.startsWith('http') ? "_blank" : "_self"}
                  rel="noopener noreferrer" 
                  download={resource.type === 'pdf'}
                  className="flex-1"
                >
                  <Button size="sm" variant="gradient" className="w-full text-xs font-bold gap-1">
                    {resource.type === 'link' ? 'Visit Link' : 'Download'} <Download size={14} />
                  </Button>
                </a>
              </div>
            </Card>
          ))}

          {filteredMaterials.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No resources found</h3>
              <p className="text-slate-500 text-xs">Try adjusting your search query or filter tab.</p>
            </div>
          )}
        </div>
      )}

      {/* Material Preview Modal */}
      <AnimatePresence>
        {previewMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-xl w-full space-y-6 relative border border-slate-200"
            >
              <button 
                onClick={() => setPreviewMaterial(null)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>

              <div className="space-y-2">
                <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] font-bold uppercase tracking-widest">
                  {previewMaterial.category} • {previewMaterial.type}
                </Badge>
                <h3 className="text-2xl font-extrabold text-slate-900">{previewMaterial.title}</h3>
                <p className="text-xs text-slate-400">Uploaded by {previewMaterial.uploadedBy}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Resource Summary</h4>
                <p>{previewMaterial.description || 'Full PDF document containing detailed notes, architectural diagrams, and sample questions for technical interview prep.'}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[11px] text-emerald-600 font-bold">
                  <Check size={14} /> Verified High-Yield Study Notes
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setPreviewMaterial(null)}>
                  Close
                </Button>
                <a 
                  href={previewMaterial.url.startsWith('/') ? previewMaterial.url : previewMaterial.url} 
                  target={previewMaterial.url.startsWith('http') ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  download
                >
                  <Button variant="gradient" className="font-bold gap-2 px-6">
                    <Download size={16} /> Download File
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-900">Upload Study Resource</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Title</label>
                  <Input name="title" placeholder="e.g. Advanced System Design Notes" required className="rounded-xl h-10 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category</label>
                  <Input name="category" placeholder="e.g. Engineering" required className="rounded-xl h-10 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Type</label>
                  <select name="type" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium">
                    <option value="pdf">PDF Document</option>
                    <option value="notes">Study Notes</option>
                    <option value="video">Video Lesson</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Short Summary</label>
                  <textarea name="description" placeholder="Brief description of key topics covered..." className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">File / URL</label>
                  <Input name="material" type="file" className="rounded-xl h-10 text-xs" />
                  <div className="text-[10px] text-slate-400">Or enter external link URL:</div>
                  <Input name="url" placeholder="https://..." className="rounded-xl h-10 text-xs" />
                </div>
                <Button type="submit" variant="gradient" className="w-full h-11 rounded-xl font-bold mt-2" disabled={isUploading}>
                  {isUploading ? <Loader2 className="animate-spin" /> : 'Upload Resource'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
