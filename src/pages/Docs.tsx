import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Eye, Plus, Edit, Trash2, 
  BookOpen, LayoutTemplate, Bookmark, RotateCw, Book, Wrench, Folder, Activity 
} from 'lucide-react';
import { fetchDocuments, deleteDocument, Document } from '@/lib/supabase-docs';
import DocumentManagementDialog from '@/components/DocumentManagementDialog';
import BackVideo from "@/assets/wtpth/backvi.mp4";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const outlinePillButton =
  "relative rounded-md px-6 py-2 text-sm font-medium " +
  "text-slate-900 dark:text-white bg-transparent " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-slate-100 dark:hover:bg-red-600/20 " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400/40 " +
  "before:absolute before:inset-0 before:rounded-md before:border-2 " +
  "before:border-red-600 dark:before:border-red-600 before:opacity-0 " +
  "hover:before:opacity-100 active:scale-95";

const Docs = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to access documents');
      navigate('/login', { state: { from: '/docs' } });
      return;
    }
    loadDocuments();
  }, [isAuthenticated, navigate]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await fetchDocuments();
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let results = documents;
    if (activeCategory !== 'all') results = results.filter(doc => doc.category === activeCategory);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(doc => 
        doc.title.toLowerCase().includes(term) || 
        (doc.desc && doc.desc.toLowerCase().includes(term))
      );
    }
    setFilteredDocuments(results);
  }, [searchTerm, activeCategory, documents]);

  const handlePreviewDocument = (document: Document) => {
    if (document.down && document.down !== '#' && !document.down.startsWith('#sample')) {
      window.open(document.down, '_blank');
    } else {
      toast.info(`Sample preview for: ${document.title}`);
    }
  };

  const confirmDeleteDocument = async () => {
    if (!selectedDocument) return;
    const success = await deleteDocument(selectedDocument.id);
    if (success) {
      toast.success('Document deleted');
      await loadDocuments();
    }
    setIsDeleteDialogOpen(false);
  };

  const getCategoryIcon = (category: string | null | undefined) => {
    const baseClassName = "h-10 w-10 flex-shrink-0 mb-4 transition-transform duration-500 group-hover:scale-110";
    if (!category) return <Folder className={`${baseClassName} text-red-600`} />;
    const normalized = category.trim().toLowerCase().replace(/[-_]/g, " ");
    switch (normalized) {
      case "general": return <FileText className={`${baseClassName} text-slate-500`} />;
      case "guides": return <BookOpen className={`${baseClassName} text-green-500`} />;
      case "templates": return <LayoutTemplate className={`${baseClassName} text-blue-500`} />;
      case "reference": return <Bookmark className={`${baseClassName} text-indigo-500`} />;
      case "reworks": return <RotateCw className={`${baseClassName} text-amber-500`} />;
      case "manual": case "manuals": return <Book className={`${baseClassName} text-sky-500`} />;
      case "issue fix": return <Wrench className={`${baseClassName} text-red-600`} />;
      default: return <Folder className={`${baseClassName} text-gray-500`} />;
    }
  };

  const categories = ['all', ...new Set(documents.map(doc => doc.category).filter(Boolean))];

  if (!isAuthenticated) return null;

  return (
    <div className="relative min-h-screen transition-colors duration-700 overflow-hidden font-sans bg-[#f8f9fa] dark:bg-[#050505] text-slate-900 dark:text-white">
      
      {/* BACKGROUND - Matched to Windows.tsx */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          className="w-full h-full object-cover transition-opacity duration-1000 grayscale opacity-40 contrast-125 dark:opacity-40" 
          autoPlay loop muted playsInline
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 transition-all duration-700 bg-gradient-to-r from-[#f8f9fa]/60 via-[#f8f9fa]/20 to-transparent dark:from-[#050505] dark:via-[#050505]/80 dark:to-transparent" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION - Matched to Windows.tsx */}
        <section className="pt-24 pb-12 flex items-center">
          <div className="container mx-auto px-6">
            <motion.div  animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
              <div className="mb-6 flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 dark:text-zinc-500">
                <Activity size={14} className="text-red-600 animate-pulse" /> RESOURCE_HUB // DOC_DEPLOYMENT
              </div>
              
              <h1 className="text-4xl md:text-[5rem] font-black tracking-[-0.05em] uppercase leading-[0.8] text-slate-950 dark:text-white mb-6">
                Technical <br />
                <span className="outline-text">Documents</span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 font-medium">
                Access guides, reference tools, and templates for all your technical needs.
              </p>

              {/* ORIGINAL SEARCH BAR UI */}
              <div className="mt-10 max-w-3xl">
                <div className="relative flex items-center shadow-2xl gap-3">
                  <div className="relative flex-1">
                    <Input
                      placeholder="🔎 Search Documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-14 pl-6 pr-12 text-lg border-none rounded-xl bg-white/90 text-slate-950 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:text-white dark:ring-1 dark:ring-white/10 dark:placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-red-600 transition-all"
                    />
                  </div>
                  {isAdmin && (
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)} 
                      className="h-14 bg-red-600 hover:bg-red-700 px-8 rounded-xl font-bold uppercase shadow-lg transition-transform active:scale-95 text-white"
                    >
                      <Plus className="h-5 w-5 mr-2" /> ADD
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-6 pb-32">
          {/* TABS - Matched Windows.tsx styling */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid grid-cols-2 md:flex md:w-full gap-3 bg-white/40 backdrop-blur-md border border-slate-200/50 dark:bg-white/5 dark:border-white/10 p-1.5 mb-10 rounded-xl h-auto">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat} 
                  className="flex-1 capitalize transition-all duration-500 rounded-lg py-2 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  {cat === 'all' ? 'All Docs' : cat}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value={activeCategory} className="mt-0 outline-none">
                {loading ? (
                  <div className="text-center py-20 font-mono text-red-600 animate-pulse uppercase tracking-[0.3em] text-xs">
                    Initializing_Library...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDocuments.map((doc) => (
                      <motion.div 
                        key={doc.id}
                       
                       
                        onMouseEnter={() => setHoveredCard(doc.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        whileHover={{ y: -8 }}
                        className={`group relative overflow-hidden rounded-2xl border p-8 backdrop-blur-md transition-all duration-500
                          ${hoveredCard === doc.id 
                            ? 'translate-x-4 shadow-2xl bg-white dark:bg-zinc-900 border-red-600' 
                            : 'bg-white/40 border-slate-200/50 dark:bg-white/5 dark:border-white/10'
                          }`}
                      >
                        {/* Hover aura effect */}
                        <AnimatePresence>
                          {hoveredCard === doc.id && (
                            <motion.div 
                              layoutId="hoverAura"
                              className="absolute inset-0 bg-red-600/5 blur-3xl -z-10"
                             
                            />
                          )}
                        </AnimatePresence>

                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-4">
                            {getCategoryIcon(doc.category)} {/* Colorful Icons Kept */}
                            <span className="font-mono text-xs font-black text-red-600/60 uppercase">
                              {doc.category || 'General'}
                            </span>
                          </div>

                         <h3 className={`text-lg font-black uppercase tracking-tighter mb-2 transition-colors
  ${hoveredCard === doc.id ? 'text-red-600' : 'text-slate-950 dark:text-white'}
`}>
  {doc.title}
</h3>
                          
                          <p className="text-sm text-slate-600 dark:text-zinc-400 mb-8 font-semibold line-clamp-2 leading-relaxed">
                            {doc.desc}
                          </p>

                          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                            {/* PREVIEW BUTTON - Matches original */}
                            <Button 
                              onClick={() => handlePreviewDocument(doc)}
                              variant="ghost"
                              className="p-0 h-auto bg-transparent hover:bg-transparent text-red-600 dark:text-white font-bold uppercase tracking-wider text-xs transition-colors"
                            >
                              <span className="flex items-center">
                                Preview <Eye className="ml-2 h-4 w-4" />
                              </span>
                            </Button>
                            
                            <div className="flex gap-2">
                              {isAdmin && (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => { setSelectedDocument(doc); setIsEditDialogOpen(true); }} className="h-8 w-8 text-slate-600 hover:bg-red-600/10 dark:text-white border border-slate-200 dark:border-white/10">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => { setSelectedDocument(doc); setIsDeleteDialogOpen(true); }} className="h-8 w-8 text-red-500 hover:bg-red-600/10 border border-slate-200 dark:border-white/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <div className="text-[10px] font-mono font-black text-zinc-500 self-center ml-2">
                                {doc.fileSize}
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>

      <DocumentManagementDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onSuccess={loadDocuments} mode="add" />
      <DocumentManagementDialog isOpen={isEditDialogOpen} onClose={() => { setIsEditDialogOpen(false); setSelectedDocument(null); }} onSuccess={loadDocuments} document={selectedDocument} mode="edit" />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase text-red-600">Delete Document?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. This will permanently remove "{selectedDocument?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDocument(null)} className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 font-bold uppercase tracking-widest text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDocument} className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        .outline-text {
          -webkit-text-stroke: 2px #dc2626;
          color: transparent;
        }
        @media (max-width: 1024px) {
          .outline-text { -webkit-text-stroke: 1.5px #dc2626; }
        }
        @media (max-width: 640px) {
          .outline-text { -webkit-text-stroke: 1px #dc2626; }
        }
      `}</style>
    </div>
  );
};

export default Docs;