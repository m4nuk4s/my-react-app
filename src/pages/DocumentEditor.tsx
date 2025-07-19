import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";

// Document model
interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: string;
  fileUrl: string;
  dateAdded: string;
}

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [document, setDocument] = useState<Document>({
    id: "",
    title: "",
    description: "",
    category: "guides",
    fileType: "pdf",
    fileSize: "",
    fileUrl: "",
    dateAdded: new Date().toISOString().split('T')[0]
  });
  
  const [file, setFile] = useState<File | null>(null);
  
  // Check if editing or creating a new document
  const isEditing = !!id;
  
  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/admin");
      return;
    }
    
    // If editing, load the document data
    if (isEditing) {
      const loadDocument = () => {
        try {
          const storedDocuments = localStorage.getItem('protectedDocuments') || '[]';
          const documents = JSON.parse(storedDocuments);
          const foundDocument = documents.find((doc: Document) => doc.id === id);
          
          if (foundDocument) {
            setDocument(foundDocument);
          } else {
            toast.error("Document not found");
            navigate("/admin");
          }
        } catch (error) {
          console.error("Error loading document:", error);
          toast.error("Failed to load document");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadDocument();
    } else {
      setIsLoading(false);
    }
  }, [id, isAdmin, navigate, isEditing]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocument(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setDocument(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Update document with file information
      setDocument(prev => ({ 
        ...prev, 
        fileType: selectedFile.name.split('.').pop() || 'unknown',
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      }));
    }
  };
  
  const handleSave = () => {
    try {
      // Validate required fields
      if (!document.title || !document.description || !document.category) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // For a real application, we would upload the file here
      // Since we're using localStorage for this demo, we'll simulate file storage
      let fileUrl = document.fileUrl;
      if (file) {
        // In a real app, this would be a cloud storage URL
        fileUrl = URL.createObjectURL(file);
      }
      
      // Get existing documents
      const storedDocuments = localStorage.getItem('protectedDocuments') || '[]';
      const documents = JSON.parse(storedDocuments);
      
      // Create or update document
      if (isEditing) {
        // Update existing document
        const updatedDocuments = documents.map((doc: Document) => 
          doc.id === id ? { ...document, fileUrl } : doc
        );
        localStorage.setItem('protectedDocuments', JSON.stringify(updatedDocuments));
        toast.success("Document updated successfully");
      } else {
        // Create new document
        const newDocument = {
          ...document,
          id: Date.now().toString(),
          dateAdded: new Date().toISOString().split('T')[0],
          fileUrl
        };
        localStorage.setItem('protectedDocuments', JSON.stringify([...documents, newDocument]));
        toast.success("Document added successfully");
      }
      
      // Navigate back to admin documents tab
      navigate("/admin/documents");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    }
  };
  
  if (isLoading) {
    return <div className="container py-6">Loading...</div>;
  }
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={() => navigate("/admin/documents")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Document" : "Add New Document"}</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Update document information and upload a new file if needed" 
              : "Fill in the document information and upload a file"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                name="title"
                value={document.title}
                onChange={handleInputChange}
                placeholder="Document Title"
                required
              />
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
              <Select
                value={document.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guides">Guides</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              name="description"
              value={document.description}
              onChange={handleInputChange}
              placeholder="Brief description of the document"
              rows={3}
              required
            />
          </div>
          
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="max-w-md"
              />
              {document.fileUrl && !file && (
                <div className="text-sm text-muted-foreground">
                  Current file: {document.fileType.toUpperCase()} ({document.fileSize})
                </div>
              )}
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/documents")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isEditing ? "Update Document" : "Save Document"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentEditor;