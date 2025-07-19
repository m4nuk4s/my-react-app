import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, FileText, Download, Lock, Search } from 'lucide-react';

// Initialize sample document data if none exists
const initSampleDocuments = () => {
  const existingDocs = localStorage.getItem('protectedDocuments');
  if (!existingDocs) {
    const sampleDocs = [
      {
        id: '1',
        title: 'System Maintenance Guide',
        description: 'Complete guide for system maintenance procedures',
        category: 'guides',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        fileUrl: '#',
        dateAdded: '2025-06-15',
      },
      {
        id: '2',
        title: 'Hardware Compatibility List',
        description: 'List of all compatible hardware components',
        category: 'reference',
        fileType: 'xlsx',
        fileSize: '1.8 MB',
        fileUrl: '#',
        dateAdded: '2025-06-20',
      },
      {
        id: '3',
        title: 'Software Installation Instructions',
        description: 'Step-by-step software installation procedures',
        category: 'guides',
        fileType: 'pdf',
        fileSize: '3.1 MB',
        fileUrl: '#',
        dateAdded: '2025-07-01',
      },
      {
        id: '4',
        title: 'Network Configuration Templates',
        description: 'Templates for standard network configurations',
        category: 'templates',
        fileType: 'docx',
        fileSize: '1.2 MB',
        fileUrl: '#',
        dateAdded: '2025-07-10',
      },
      {
        id: '5',
        title: 'Security Protocols',
        description: 'Latest security protocols and procedures',
        category: 'reference',
        fileType: 'pdf',
        fileSize: '4.5 MB',
        fileUrl: '#',
        dateAdded: '2025-07-15',
      },
    ];
    localStorage.setItem('protectedDocuments', JSON.stringify(sampleDocs));
    return sampleDocs;
  }
  return JSON.parse(existingDocs);
};

const Documents = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  // Redirect if not authenticated and load documents
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to access documents');
      navigate('/login', { state: { from: '/documents' } });
      return;
    }
    
    // Initialize and load documents
    const loadedDocuments = initSampleDocuments();
    setDocuments(loadedDocuments);
    setFilteredDocuments(loadedDocuments);
  }, [isAuthenticated, navigate]);

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
        doc.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredDocuments(results);
  }, [searchTerm, activeCategory, documents]);

  const handleViewDocument = (id: string) => {
    toast.success('Document opened for viewing');
    // In a real app, this would open the document or redirect to a document viewer
  };

  const handleDownloadDocument = (id: string) => {
    toast.success('Document download started');
    // In a real app, this would trigger a document download
  };

  // File type icon mapping
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Protected Documents</h1>
          <p className="text-muted-foreground mt-1">
            Access secure documents and resources
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-8 w-[200px] sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="reference">Reference</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeCategory} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <Card key={document.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(document.fileType)}
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">{document.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{document.fileType.toUpperCase()} • {document.fileSize}</span>
                      <span className="text-muted-foreground">Added {document.dateAdded}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleViewDocument(document.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="default" size="sm" onClick={() => handleDownloadDocument(document.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No documents found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm ? 'Try a different search term or category' : 'There are no documents in this category'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;