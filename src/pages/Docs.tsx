	import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from "framer-motion";
import { 
  FileText, Eye, Loader2, Plus, Edit, Trash2, 
  BookOpen, LayoutTemplate, Bookmark, RotateCw, Book, Wrench, Folder 
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

const Docs = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

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
    const baseClassName = "h-8 w-8 flex-shrink-0 mb-4";
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
    <div className="relative min-h-screen text-foreground bg-[#050505] selection:bg-red-500/30">
      
      {/* Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video className="w-full h-full object-cover opacity-40 contrast-125 saturate-100" autoPlay loop muted playsInline>
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      <div className="relative z-10">
        <section className="pt-20 pb-12">
          <div className="container mx-auto px-6">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4 text-white">
                Technical <span className="font-bold uppercase text-red-600">Documents</span>
              </h1>
              <p className="text-lg text-zinc-200 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 drop-shadow-md">
                Access guides, reference tools, and templates for all your technical needs.
              </p>

         <div className="mt-10 max-w-3xl">
  <div className="relative flex items-center shadow-2xl gap-3">
    <div className="relative flex-1">
      <Input
        placeholder="🔎 Search Documents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-14 pl-6 pr-12 text-lg border-none rounded-xl 
          /* Light Mode Styles */
          bg-white/90 text-slate-950 shadow-lg
          /* Dark Mode Styles */
          dark:bg-white/5 dark:backdrop-blur-xl dark:text-white 
          dark:ring-1 dark:ring-white/10 dark:placeholder:text-zinc-500
          /* Interaction Styles */
          focus-visible:ring-2 focus-visible:ring-red-600 transition-all"
      />
    </div>
    
    {isAdmin && (
      <Button 
        onClick={() => setIsAddDialogOpen(true)} 
        className="h-14 bg-red-600 hover:bg-red-700 px-8 rounded-xl font-bold uppercase shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-5 w-5 mr-2" /> 
        Add
      </Button>
    )}
  </div>
</div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-6 pb-32">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="flex w-full bg-slate-100 bold dark:bg-slate-800 p-1 mb-12 rounded-lg h-auto">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat} 
                  className="flex-1 capitalize py-1.5 px-3 text-xs md:text-sm transition-all data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-sm rounded-md text-slate-600 dark:text-zinc-400"
                >
                  {cat === 'all' ? 'All Docs' : cat}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              {loading ? (
                <div className="text-center py-20 text-white animate-pulse uppercase tracking-widest text-sm">
                  Loading Library...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((doc) => (
                    <div 
                      key={doc.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/80 p-8 backdrop-blur-xl border border-slate-200 transition-all duration-300 hover:scale-[1.01] hover:bg-white/95 dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/20"
                    >
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="group-hover:scale-110 transition-transform duration-300 origin-left">
                          {getCategoryIcon(doc.category)}
                        </div>

                        <h3 className="text-xl font-bold mb-2 tracking-tight uppercase text-slate-950 dark:text-white group-hover:text-red-600 transition-colors">
                          {doc.title}
                        </h3>
                        
                        <p className="text-sm text-slate-800 dark:text-zinc-100/80 leading-relaxed mb-6 line-clamp-2 font-medium">
                          {doc.desc}
                        </p>

                        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                          {/* PREVIEW BUTTON - FIXED COLORS */}
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
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedDocument(doc); setIsEditDialogOpen(true); }} className="h-8 w-8 text-slate-600 hover:bg-transparent dark:text-white border border-slate-200 dark:border-white/10">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedDocument(doc); setIsDeleteDialogOpen(true); }} className="h-8 w-8 text-red-500 hover:bg-transparent border border-slate-200 dark:border-white/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 self-center ml-2">
                              {doc.fileSize}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <DocumentManagementDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onSuccess={loadDocuments} mode="add" />
      <DocumentManagementDialog isOpen={isEditDialogOpen} onClose={() => { setIsEditDialogOpen(false); setSelectedDocument(null); }} onSuccess={loadDocuments} document={selectedDocument} mode="edit" />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. This will permanently remove "{selectedDocument?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDocument(null)} className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDocument} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Docs;