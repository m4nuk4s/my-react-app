import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { Document, fetchDocuments, addDocument, updateDocument, deleteDocument } from '@/lib/supabase-docs';

const DocumentEditor = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState<Document>({
    id: '',
    title: '',
    type: 'pdf',
    desc: '',
    down: '',
    category: 'guides',
    fileSize: '',
    dateAdded: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Check authentication and admin status
    if (!isAuthenticated) {
      toast.error('You must be logged in to access this page');
      navigate('/login', { state: { from: `/admin/documents${id ? `/edit/${id}` : '/new'}` } });
      return;
    }
    
    if (!isAdmin) {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }
    
    // Load document data if in edit mode
    async function loadDocument() {
      if (isEditMode) {
        setLoading(true);
        try {
          const documents = await fetchDocuments();
          const foundDocument = documents.find(doc => doc.id === id);
          
          if (foundDocument) {
            setDocument(foundDocument);
          } else {
            toast.error('Document not found');
            navigate('/admin/documents');
          }
        } catch (error) {
          console.error('Error loading document:', error);
          toast.error('Failed to load document');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    
    loadDocument();
  }, [isAuthenticated, isAdmin, navigate, id, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocument(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setDocument(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!document.title || !document.type || !document.down) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    
    try {
      if (isEditMode) {
        // Update existing document
        await updateDocument(document);
        toast.success('Document updated successfully');
      } else {
        // Add new document
        await addDocument({
          title: document.title,
          type: document.type,
          desc: document.desc,
          down: document.down,
          category: document.category,
          fileSize: document.fileSize || `${(Math.random() * 5 + 1).toFixed(1)} MB`
        });
        toast.success('Document added successfully');
      }
      
      navigate('/admin/documents');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isEditMode && window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        toast.success('Document deleted successfully');
        navigate('/admin/documents');
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/documents')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Document' : 'Add New Document'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Document Title*</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="Enter document title" 
                value={document.title} 
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Document Type*</Label>
              <Select 
                name="type" 
                value={document.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
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
                value={document.category} 
                onValueChange={(value) => handleSelectChange('category', value)}
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
                placeholder="Enter document description" 
                value={document.desc} 
                onChange={handleInputChange}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                A brief description of the document content
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="down">Download URL*</Label>
              <Input 
                id="down" 
                name="down" 
                placeholder="https://example.com/document.pdf" 
                value={document.down} 
                onChange={handleInputChange}
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
                value={document.fileSize} 
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground">
                Size of the document file (e.g., 2.4 MB)
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {isEditMode && (
              <Button type="button" variant="outline" onClick={handleDelete} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete Document
              </Button>
            )}
            <div className={`flex ${isEditMode ? 'justify-end' : 'justify-between'} flex-1 ${isEditMode ? 'ml-auto' : ''}`}>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/documents')}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="ml-2">
                {saving && <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />}
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Update Document' : 'Save Document'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default DocumentEditor;