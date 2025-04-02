import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { DocumentRequest } from '@/types';
import TestCaseResults from './TestCaseResults';

interface UploadDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: DocumentRequest;
  onUploadComplete?: () => void;
}

const UploadDocumentsDialog: React.FC<UploadDocumentsDialogProps> = ({
  open,
  onOpenChange,
  request,
  onUploadComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [testResults, setTestResults] = useState<Array<{
    testCaseName: string;
    result: 'pass' | 'fail';
    files: string;
  }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const queryClient = useQueryClient();

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      // Upload files
      await Promise.all(
        uploadedFiles.map(file => 
          apiService.uploadDocument(request.id, file)
        )
      );

      // Update request status
      await apiService.updateRequestStatus(request.id, 'InReview');

      // Fetch test results
      setIsLoadingResults(true);
      const results = await apiService.getTestCaseResults(request.id);
      setTestResults(results as Array<{
        testCaseName: string;
        result: 'pass' | 'fail';
        files: string;
      }>);
      setShowResults(true);

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      
      toast.success("Documents uploaded successfully");
      onUploadComplete?.();
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
    } finally {
      setIsUploading(false);
      setIsLoadingResults(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload documents for the request: {request.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="documents">Documents</Label>
            <Input
              id="documents"
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setUploadedFiles(files);
              }}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files</Label>
              <div className="space-y-2 rounded-md border p-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedFiles(files => files.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showResults && (
            <div className="space-y-2">
              <Label>Test Results</Label>
              {isLoadingResults ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <TestCaseResults results={testResults} />
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
          {!showResults && (
            <Button 
              type="button" 
              onClick={handleUpload}
              disabled={isUploading || uploadedFiles.length === 0}
            >
              {isUploading ? (
                <>
                  <span className="mr-2">Uploading...</span>
                  <span className="animate-spin">⧗</span>
                </>
              ) : (
                "Upload Documents"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentsDialog; 