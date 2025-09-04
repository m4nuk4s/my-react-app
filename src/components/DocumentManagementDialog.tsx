import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { addDocument, updateDocument, Document } from '@/lib/supabase-docs';

interface DocumentManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  document?: Document | null;
  mode: 'add' | 'edit';
}

const DocumentManagementDialog = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  document, 
  mode 
}: DocumentManagementDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    desc: '',
    down: '',
    category: 'general',
    fileSize: ''
  });
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or document changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && document) {
        setFormData({
          title: document.title || '',
          type: document.type || '',
          desc: document.desc || '',
          down: document.down || '',
          category: document.category || 'general',
          fileSize: document.fileSize || ''
        });
      } else {
        setFormData({
          title: '',
          type: '',
          desc: '',
          down: '',
          category: 'general',
          fileSize: ''
        });
      }
    }
  }, [isOpen, mode, document]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.type.trim() || !formData.down.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      if (mode === 'edit' && document) {
        result = await updateDocument({
          ...document,
          ...formData
        });
      } else {
        result = await addDocument(formData);
      }

      if (result) {
        toast.success(`Document ${mode === 'edit' ? 'updated' : 'added'} successfully`);
        onSuccess();
        onClose();
      } else {
        toast.error(`Failed to ${mode} document`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing document:`, error);
      toast.error(`Failed to ${mode} document`);
    } finally {
      setLoading(false);
    }
  };

  const fileTypes = [
    { value: 'PDF', label: 'PDF' },
    { value: 'SOP', label: 'SOP' },
    { value: 'GUIDE', label: 'Procedure Guide' },
    { value: 'pptx', label: 'PowerPoint Presentation' },
    { value: 'txt', label: 'Text File' },
    { value: 'zip', label: 'Archive' }
  ];

  const categories = [
    { value: 'General', label: 'General' },
    { value: 'Guides', label: 'Guides' },
    { value: 'Templates', label: 'Templates' },
    { value: 'Reworks', label: 'Reworks' },
    { value: 'Manual', label: 'Manuals' },
    { value: 'Issue FIX', label: 'Issue FIX' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Document' : 'Add New Document'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Update the document information below.' 
              : 'Fill in the details to add a new document to the database.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">File Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {fileTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={formData.desc}
              onChange={(e) => handleInputChange('desc', e.target.value)}
              placeholder="Enter document description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="down">Download URL *</Label>
            <Input
              id="down"
              value={formData.down}
              onChange={(e) => handleInputChange('down', e.target.value)}
              placeholder="Enter download URL or file path"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileSize">File Size</Label>
            <Input
              id="fileSize"
              value={formData.fileSize}
              onChange={(e) => handleInputChange('fileSize', e.target.value)}
              placeholder="e.g., 2.4 MB"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Add Document')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentManagementDialog;