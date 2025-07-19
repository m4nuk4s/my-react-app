import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Eye, FileText, Download, Lock, Search, Plus, Trash2, Pencil, Save } from 'lucide-react';
import { Document, fetchDocuments, addDocument, updateDocument, deleteDocument, setupDocsTable } from '@/lib/supabase-docs';

const Documents = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New document form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    type: 'pdf',
    desc: '',
    down: '',
    category: 'guides',
    fileSize: ''
  });

  // Setup docs table and load documents
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to access documents');
      navigate('/login', { state: { from: '/documents' } });
      return;
    }
    
    async function initialize() {
      setLoading(true);
      
      try {
        // Setup docs table in Supabase if needed
        await setupDocsTable();
        
        // Fetch documents from database or localStorage
        const docsData = await fetchDocuments();
        setDocuments(docsData);
        setFilteredDocuments(docsData);
      } catch (error) {
        console.error('Error initializing documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    }
    
    initialize();
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
        doc.desc.toLowerCase().includes(term)
      );
    }
    
    setFilteredDocuments(results);
  }, [searchTerm, activeCategory, documents]);

  const handleViewDocument = (downloadUrl: string) => {
    if (downloadUrl.startsWith('http')) {
      window.open(downloadUrl, '_blank');
      toast.success('Document opened for viewing');
    } else {
      toast.error('Invalid document URL');
    }
  };

  const handleDownloadDocument = (downloadUrl: string) => {
    if (downloadUrl.startsWith('http')) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = '';
      link.click();
      toast.success('Document download started');
    } else {
      toast.error('Invalid document URL');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.title || !formData.type || !formData.down) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Create new document
      const newDoc = await addDocument({
        title: formData.title,
        type: formData.type,
        desc: formData.desc,
        down: formData.down,
        category: formData.category,
        fileSize: formData.fileSize || `${(Math.random() * 5 + 1).toFixed(1)} MB` // Generate random file size if not provided
      });
      
      if (newDoc) {
        setDocuments([newDoc, ...documents]);
        toast.success('Document added successfully');
        setIsAddDialogOpen(false);
        resetForm();
      } else {
        toast.error('Failed to add document');
      }
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
    }
  };

  const handleEditDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.id || !formData.title || !formData.type || !formData.down) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Update document
      const updatedDoc = await updateDocument({
        id: formData.id,
        title: formData.title,
        type: formData.type,
        desc: formData.desc,
        down: formData.down,
        category: formData.category,
        fileSize: formData.fileSize,
        dateAdded: formData.id ? documents.find(doc => doc.id === formData.id)?.dateAdded : new Date().toISOString().split('T')[0]
      });
      
      if (updatedDoc) {
        setDocuments(documents.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
        toast.success('Document updated successfully');
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        toast.error('Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const success = await deleteDocument(id);
        if (success) {
          setDocuments(documents.filter(doc => doc.id !== id));
          toast.success('Document deleted successfully');
        } else {
          toast.error('Failed to delete document');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  const editDocument = (doc: Document) => {
    setFormData({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      desc: doc.desc || '',
      down: doc.down,
      category: doc.category || 'guides',
      fileSize: doc.fileSize || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      type: 'pdf',
      desc: '',
      down: '',
      category: 'guides',
      fileSize: ''
    });
  };

  // File type icon mapping
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'xlsx':
      case 'excel':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'docx':
      case 'word':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />;
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
          {(isAdmin || user?.isAdmin) && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Document</DialogTitle>
                  <DialogDescription>
                    Add a new document to the repository. Fill in all the required fields.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDocument} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title*</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="Document title" 
                      value={formData.title}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="type">Document Type*</Label>
                    <Select 
                      name="type" 
                      value={formData.type}
                      onValueChange={(value) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="word">Word (DOCX)</SelectItem>
                        <SelectItem value="excel">Excel (XLSX)</SelectItem>
                        <SelectItem value="pptx">PowerPoint (PPTX)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      name="category" 
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guides">Guides</SelectItem>
                        <SelectItem value="templates">Templates</SelectItem>
                        <SelectItem value="reference">Reference</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea 
                      id="desc" 
                      name="desc" 
                      placeholder="Brief description of the document" 
                      value={formData.desc}
                      onChange={handleFormChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="down">Download URL*</Label>
                    <Input 
                      id="down" 
                      name="down" 
                      placeholder="https://example.com/document.pdf" 
                      value={formData.down}
                      onChange={handleFormChange}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Direct link to download the document
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="fileSize">File Size</Label>
                    <Input 
                      id="fileSize" 
                      name="fileSize" 
                      placeholder="1.2 MB" 
                      value={formData.fileSize}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Document
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
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
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((document) => (
                  <Card key={document.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(document.type)}
                        <CardTitle className="text-lg">{document.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-2">{document.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{document.type.toUpperCase()} • {document.fileSize}</span>
                        <span className="text-muted-foreground">Added {document.dateAdded}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleViewDocument(document.down)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleDownloadDocument(document.down)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      {(isAdmin || user?.isAdmin) && (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => editDocument(document)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(document.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
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
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the document information. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDocument} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title*</Label>
              <Input 
                id="edit-title" 
                name="title" 
                placeholder="Document title" 
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Document Type*</Label>
              <Select 
                name="type" 
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="word">Word (DOCX)</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="pptx">PowerPoint (PPTX)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select 
                name="category" 
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guides">Guides</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea 
                id="edit-desc" 
                name="desc" 
                placeholder="Brief description of the document" 
                value={formData.desc}
                onChange={handleFormChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-down">Download URL*</Label>
              <Input 
                id="edit-down" 
                name="down" 
                placeholder="https://example.com/document.pdf" 
                value={formData.down}
                onChange={handleFormChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                Direct link to download the document
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-fileSize">File Size</Label>
              <Input 
                id="edit-fileSize" 
                name="fileSize" 
                placeholder="1.2 MB" 
                value={formData.fileSize}
                onChange={handleFormChange}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Update Document
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;