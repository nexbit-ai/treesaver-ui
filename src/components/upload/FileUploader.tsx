import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Upload, X, Check, FileIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Allowed file types with proper MIME types
const ALLOWED_TYPES = [
  'application/pdf', // PDF
  'image/jpeg', // JPEG
  'image/png', // PNG
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-excel' // XLS
];

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Mapping of mime types to readable formats
const FILE_TYPE_MAP: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS'
};

interface FileUploaderProps {
  onFilesSelected: (files: File[], requestId: string) => void;
  requestId: string;
  className?: string;
  isUploading?: boolean;
  readOnly?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFilesSelected, 
  requestId,
  isUploading = false,
  readOnly = false,
  className 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const invalidFiles: {name: string, reason: string}[] = [];
    
    Array.from(files).forEach(file => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push({
          name: file.name, 
          reason: 'File type not supported'
        });
        return;
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push({
          name: file.name,
          reason: 'File exceeds 10MB limit'
        });
        return;
      }
      
      validFiles.push(file);
    });
    
    if (invalidFiles.length > 0) {
      const errorMessage = invalidFiles.map(f => 
        `${f.name}: ${f.reason}`
      ).join('\n');
      
      toast.error('Some files were rejected', {
        description: errorMessage,
        duration: 5000
      });
    }
    
    return validFiles;
  };
  
  const processFiles = (files: FileList | null) => {
    if (!files || readOnly) return;
    
    const newValidFiles = validateFiles(Array.from(files));
    if (newValidFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...newValidFiles];
      setSelectedFiles(updatedFiles);
      toast.success(`${newValidFiles.length} file(s) selected`);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    onFilesSelected(selectedFiles, requestId);
  };

  const getFileTypeLabel = (file: File) => {
    return FILE_TYPE_MAP[file.type] || 'File';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // If in readOnly mode, don't show the upload interface
  if (readOnly) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Show only uploaded files in read-only mode */}
        <div className="text-center py-6 bg-muted/20 rounded-lg border">
          <FileIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">View document details above</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted-foreground/25',
          'hover:border-primary hover:bg-primary/5 active:scale-[0.99]',
          readOnly && 'cursor-not-allowed opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !readOnly && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={readOnly}
        />
        <div className="space-y-2">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors',
            isDragging ? 'bg-primary/20' : 'bg-muted'
          )}>
            <Upload className={cn(
              'h-8 w-8 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          <p className="text-sm text-muted-foreground">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC, DOCX, XLS, XLSX (max 10MB each)
          </p>
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted"
              >
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={readOnly}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={isUploading || readOnly}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
