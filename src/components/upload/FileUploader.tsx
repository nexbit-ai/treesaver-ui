
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Upload, X, Check, FileIcon } from 'lucide-react';
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
  onFilesSelected: (files: File[]) => void;
  requestId: string;
  className?: string;
  isUploading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFilesSelected, 
  requestId,
  isUploading = false,
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
    if (!files) return;
    
    const newValidFiles = validateFiles(Array.from(files));
    if (newValidFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...newValidFiles];
      setSelectedFiles(updatedFiles);
      onFilesSelected(updatedFiles);
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
    // Clear the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const getFileTypeLabel = (file: File) => {
    return FILE_TYPE_MAP[file.type] || 'File';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 transition-all duration-300 bg-background',
          isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border',
          'flex flex-col items-center justify-center text-center cursor-pointer'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.xlsx"
          onChange={handleFileInputChange}
          aria-label="File upload"
        />
        
        <div className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300',
          isDragging ? 'bg-primary/20' : 'bg-muted'
        )}>
          <Upload 
            className={cn(
              'w-8 h-8 transition-all duration-300', 
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </div>
        
        <h3 className="text-lg font-medium mb-1">Drag and drop files here</h3>
        <p className="text-muted-foreground text-sm mb-4">
          or click to browse (PDF, JPEG, PNG, XLSX)
        </p>
        
        <Button 
          variant="outline" 
          className="group hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Upload className="mr-2 h-4 w-4 group-hover:scale-110 transition-all" />
          Select Files
        </Button>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-sm font-medium flex justify-between items-center">
            <span>Selected Files ({selectedFiles.length})</span>
            {selectedFiles.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setSelectedFiles([]);
                  onFilesSelected([]);
                }}
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="grid gap-2">
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="bg-card border rounded-lg p-3 flex items-center justify-between animate-slide-in shadow-sm"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center mr-3">
                    <FileIcon className="w-4 h-4 text-foreground/70" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <span className="whitespace-nowrap">{getFileTypeLabel(file)}</span>
                      <span className="mx-1">•</span>
                      <span className="whitespace-nowrap">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mt-4 transition-all hover:shadow-md"
            disabled={selectedFiles.length === 0 || isUploading}
            onClick={() => onFilesSelected(selectedFiles)}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
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
