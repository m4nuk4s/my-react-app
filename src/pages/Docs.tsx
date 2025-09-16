import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  FileText, Eye, Search, Loader2, Plus, Edit, Trash2, 
  BookOpen, LayoutTemplate, Bookmark, RotateCw, Book, Wrench, Folder 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchDocuments, deleteDocument, Document } from '@/lib/supabase-docs';
import DocumentManagementDialog from '@/components/DocumentManagementDialog';
import BackVideo from "@/assets/wtpth/backvi.mp4"; // Import the video
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
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Redirect if not authenticated and load documents
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to access documents');
      navigate('/login', { state: { from: '/docs' } });
      return;
    }
    
    loadDocuments();
  }, [isAuthenticated, navigate]);

  const setupDocsTable = async () => {
    try {
      // First try to create the table using execute_sql RPC
      const { error: rpcError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS docs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            desc TEXT,
            down TEXT NOT NULL,
            category TEXT DEFAULT 'general',
            fileSize TEXT,
            dateAdded TIMESTAMPTZ DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS docs_title_idx ON docs(title);
          CREATE INDEX IF NOT EXISTS docs_type_idx ON docs(type);
          CREATE INDEX IF NOT EXISTS docs_category_idx ON docs(category);
        `
      });

      if (rpcError) {
        console.log('RPC method failed, table might already exist:', rpcError);
      } else {
        console.log('Docs table setup completed via RPC');
      }

      // Insert sample data if table is empty
      const { data: existingDocs, error: checkError } = await supabase
        .from('docs')
        .select('id')
        .limit(1);

      if (checkError) {
        console.error('Error checking existing docs:', checkError);
        return false;
      }

      if (!existingDocs || existingDocs.length === 0) {
        console.log('No documents found, inserting sample data...');
        
        const sampleDocs = [
          {
            title: 'System Maintenance Guide',
            type: 'pdf',
            desc: 'Complete guide for system maintenance procedures and best practices',
            down: '#sample-download-1',
            category: 'guides',
            fileSize: '2.4 MB'
          },
          {
            title: 'Hardware Compatibility List',
            type: 'xlsx',
            desc: 'Comprehensive list of all compatible hardware components and specifications',
            down: '#sample-download-2',
            category: 'reference',
            fileSize: '1.8 MB'
          },
          {
            title: 'Software Installation Instructions',
            type: 'pdf',
            desc: 'Step-by-step software installation procedures for various systems',
            down: '#sample-download-3',
            category: 'guides',
            fileSize: '3.1 MB'
          },
          {
            title: 'Network Configuration Templates',
            type: 'docx',
            desc: 'Ready-to-use templates for standard network configurations',
            down: '#sample-download-4',
            category: 'templates',
            fileSize: '1.2 MB'
          },
          {
            title: 'Security Protocols Documentation',
            type: 'pdf',
            desc: 'Latest security protocols and procedures for system protection',
            down: '#sample-download-5',
            category: 'reference',
            fileSize: '4.5 MB'
          }
        ];

        const { error: insertError } = await supabase
          .from('docs')
          .insert(sampleDocs);

        if (insertError) {
          console.error('Error inserting sample docs:', insertError);
        } else {
          console.log('Sample documents inserted successfully');
        }
      }

      return true;
    } catch (error) {
      console.error('Error setting up docs table:', error);
      return false;
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Setting up docs table...');
      await setupDocsTable();
      
      console.log('Fetching documents from database...');
      const docs = await fetchDocuments();
      
      console.log('Documents fetched:', docs);
      setDocuments(docs);
      setFilteredDocuments(docs);
      
      if (docs.length === 0) {
        setError('No documents found in the database');
        toast.info('No documents found in the database');
      } else {
        toast.success(`Loaded ${docs.length} documents`);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError(`Failed to load documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to load documents from database');
    } finally {
      setLoading(false);
    }
  };

  // Filter documents based on search term and active category
  useEffect(() => {
    let results = documents;
    
    if (activeCategory !== 'all') {
      results = results.filter(doc => doc.category === activeCategory);
    }
    
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
      // Open preview URL in new tab
      window.open(document.down, '_blank');
      toast.success(`Previewing ${document.title}`);
    } else {
      toast.info(`Sample preview for: ${document.title}`);
    }
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      const success = await deleteDocument(selectedDocument.id);
      if (success) {
        toast.success('Document deleted successfully');
        await loadDocuments(); // Reload documents
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleDialogSuccess = () => {
    loadDocuments(); // Reload documents after add/edit
  };

  // Category to Icon mapping with colors
  const getCategoryIcon = (category: string | null | undefined) => {
    const baseClassName = "h-8 w-8 flex-shrink-0";
  
    if (!category) {
        return <Folder className={`${baseClassName} text-gray-500`} />;
    }
    
    const normalized = category.trim().toLowerCase().replace(/[-_]/g, " ");
  
    switch (normalized) {
      case "general":
        return <FileText className={`${baseClassName} text-slate-500`} />;
      case "guides":
        return <BookOpen className={`${baseClassName} text-green-500`} />;
      case "templates":
        return <LayoutTemplate className={`${baseClassName} text-blue-500`} />;
      case "reference":
        return <Bookmark className={`${baseClassName} text-indigo-500`} />;
      case "reworks":
        return <RotateCw className={`${baseClassName} text-amber-500`} />;
      case "manual":
      case "manuals":
        return <Book className={`${baseClassName} text-sky-500`} />;
      case "issue fix":
        return <Wrench className={`${baseClassName} text-red-500`} />;
      default:
        return <Folder className={`${baseClassName} text-gray-500`} />;
    }
  };

  // Get unique categories from documents
  const categories = ['all', ...new Set(documents.map(doc => doc.category).filter(Boolean))];

  if (!isAuthenticated) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={BackVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold text-white">
            Technical Documents
          </h1>
          <p className="text-xl text-blue-50 mt-2 max-w-2xl text-center mx-auto drop-shadow">
            Access guides, reference tools, and templates for all your technical needs.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Documents Library</h2>
            <p className="text-muted-foreground mt-1">
              Search all available documents.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <div className="relative">
              
              <Input
                type="search"
                placeholder="🔎Search Documents..."
                className="pl-9 w-[200px] sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isAdmin && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDocuments}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </div>

        {error && (
            <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading documents...</span>
          </div>
        ) : (
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-6">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category === 'all' ? 'All Documents' : category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((document) => (
                    <Card key={document.id} className="hover:shadow-lg transition-shadow flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-4">
                          {getCategoryIcon(document.category)}
                          <div className="flex-1">
                             <CardTitle className="text-lg leading-snug">{document.title}</CardTitle>
                             <CardDescription className="mt-2 line-clamp-3 h-[60px]">{document.desc}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 flex-grow">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {document.type.toUpperCase()}
                            {document.fileSize && ` • ${document.fileSize}`}
                          </span>
                          {document.dateAdded && (
                            <span>
                              {new Date(document.dateAdded).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {document.category && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {document.category}
                            </span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-center gap-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handlePreviewDocument(document)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditDocument(document)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteDocument(document)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No documents found</h3>
                    <p className="text-muted-foreground mt-2">
                      {searchTerm ? 'Try a different search term or category' : 'There are no documents in this category'}
                    </p>
                    {isAdmin && (
                      <Button 
                        onClick={() => setIsAddDialogOpen(true)}
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Document
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Add Document Dialog */}
        <DocumentManagementDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSuccess={handleDialogSuccess}
          mode="add"
        />

        {/* Edit Document Dialog */}
        <DocumentManagementDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedDocument(null);
          }}
          onSuccess={handleDialogSuccess}
          document={selectedDocument}
          mode="edit"
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the document
                "{selectedDocument?.title}" from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedDocument(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteDocument}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Docs;