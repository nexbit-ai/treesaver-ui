import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DocumentRequest } from '@/types';
import StatusBadge from '@/components/ui/status-badge';
import { Upload, ChevronDown, ChevronUp, Calendar, FileIcon, Clock, CheckCircle, AlertCircle, ChevronRight, Download, PlayCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import FileUploader from '@/components/upload/FileUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useDocumentRequests } from '@/hooks/useDocumentRequests';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface RequestTableProps {
  requests: DocumentRequest[];
  className?: string;
  showApproveReject?: boolean;
}

interface DownloadResponse {
  documentId: string;
  downloadUrl: string;
  expiresIn: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface AnalysisResponse {
  createdAt: string;
  message: string;
  runId: string;
  status: string;
  threadId: string;
}

interface AnalysisStatusResponse {
  ThreadID: string;
  RunID: string;
  Response: string;
  Status: string;
  CreatedAt: string;
  CompletedAt: string;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, className, showApproveReject = false }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [documents, setDocuments] = useState<Record<string, any[]>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<Set<string>>(new Set());
  const [testDialogOpen, setTestDialogOpen] = useState<string | null>(null);
  const { uploadFiles, isUploading, updateStatus, getDocuments } = useDocumentRequests();
  const [isRunningTest, setIsRunningTest] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, AnalysisStatusResponse>>({});
  const queryClient = useQueryClient();
  
  const toggleRow = async (requestId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(requestId)) {
      newExpandedRows.delete(requestId);
    } else {
      newExpandedRows.add(requestId);
      // Fetch documents if not already loaded
      if (!documents[requestId]) {
        setLoadingDocuments(prev => new Set(prev).add(requestId));
        const docs = await getDocuments(requestId);
        setDocuments(prev => ({ ...prev, [requestId]: docs }));
        setLoadingDocuments(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    }
    setExpandedRows(newExpandedRows);
  };
  
  const handleFilesSelected = async (requestId: string, files: File[]) => {
    try {
      await uploadFiles({ 
        requestId, 
        files,
        onSuccess: async () => {
          // Close the upload dialog
          setTestDialogOpen(null);
          
          // Update request status to InReview
          await updateStatus({ requestId, action: 'InReview' });
          
          // Refresh the documents list
          setLoadingDocuments(prev => new Set(prev).add(requestId));
          const docs = await getDocuments(requestId);
          setDocuments(prev => ({ ...prev, [requestId]: docs }));
          setLoadingDocuments(prev => {
            const newSet = new Set(prev);
            newSet.delete(requestId);
            return newSet;
          });

          // Invalidate the document requests query to refresh the list
          queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
        }
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    }
  };
  
  const handleApprove = (requestId: string) => {
    updateStatus({ requestId, action: 'Approved' });
  };

  const handleReject = (requestId: string) => {
    updateStatus({ requestId, action: 'Rejected' });
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getDaysRemaining = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response = await apiService.getDocumentDownloadUrl(documentId) as DownloadResponse;
      // Open the download URL in a new tab
      window.open(response.downloadUrl, '_blank');
    } catch (error) {
      toast.error('Failed to download document');
      console.error('Download error:', error);
    }
  };

  const handleRunTest = async (requestId: string, auditorExpectation: string, systemPrompt: string) => {
    try {
      setIsRunningTest(prev => ({ ...prev, [requestId]: true }));
      
      // Combine auditor expectation and system prompt
      const prompt = `${auditorExpectation}\n\n${systemPrompt}`;
      
      // Start the analysis
      const analysisResponse = await apiService.runAnalysis(requestId, prompt) as AnalysisResponse;
      
      // Wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check the status
      const statusResponse = await apiService.getAnalysisStatus(
        requestId,
        analysisResponse.threadId,
        analysisResponse.runId
      ) as AnalysisStatusResponse;
      
      setTestResults(prev => ({ ...prev, [requestId]: statusResponse }));
      
      if (statusResponse.Status === 'completed') {
        // TODO: Call the next API when it's ready
        toast.success('Analysis completed successfully');
      } else {
        toast.error('Analysis failed or timed out');
      }
    } catch (error) {
      console.error('Error running analysis:', error);
      toast.error('Failed to run analysis');
    } finally {
      setIsRunningTest(prev => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <div className={cn('rounded-xl overflow-hidden border bg-card', className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Document Request</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <React.Fragment key={request.id}>
                <TableRow className={cn(
                  "cursor-pointer group transition-colors",
                  expandedRows.has(request.id) && "bg-muted/30"
                )}>
                  <TableCell
                    className="font-medium py-4"
                    onClick={() => toggleRow(request.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {expandedRows.has(request.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span>{request.title}</span>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => toggleRow(request.id)}>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(request.dueDate)}</span>
                      
                      {getDaysRemaining(request.dueDate) <= 5 && getDaysRemaining(request.dueDate) > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-pending/20 text-status-pending">
                              <Clock className="h-3 w-3 mr-1" />
                              {getDaysRemaining(request.dueDate)}d
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getDaysRemaining(request.dueDate)} days remaining
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {getDaysRemaining(request.dueDate) <= 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-rejected/20 text-status-rejected">
                          Overdue
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center" onClick={() => toggleRow(request.id)}>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {showApproveReject && request.status === 'inreview' ? (
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(request.id);
                          }}
                        >
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(request.id);
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <Dialog 
                        open={testDialogOpen === request.id} 
                        onOpenChange={(open) => {
                          if (open) {
                            setTestDialogOpen(request.id);
                          } else {
                            setTestDialogOpen(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {showApproveReject ? (
                              <>
                                <PlayCircle className="h-3.5 w-3.5 mr-1" />
                                Run Tests
                              </>
                            ) : (
                              <>
                                <Upload className="h-3.5 w-3.5 mr-1" />
                                Upload
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              {showApproveReject ? `Run Tests for ${request.title}` : request.title}
                            </DialogTitle>
                          </DialogHeader>
                          {showApproveReject ? (
                            <div className="py-4">
                              {isRunningTest[request.id] ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                  <p className="text-muted-foreground">Running analysis...</p>
                                </div>
                              ) : testResults[request.id] ? (
                                <div className="space-y-4">
                                  <div className="bg-muted p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Analysis Result</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {testResults[request.id].Response}
                                    </p>
                                  </div>
                                  <div className="flex justify-end">
                                    <Button 
                                      onClick={() => handleRunTest(
                                        request.id,
                                        request.auditor_expectation || '',
                                        request.system_prompt || ''
                                      )}
                                    >
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Run Again
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="bg-muted p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Test Configuration</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Auditor Expectation: {request.auditor_expectation || 'Not set'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      System Prompt: {request.system_prompt || 'Not set'}
                                    </p>
                                  </div>
                                  <div className="flex justify-end">
                                    <Button 
                                      onClick={() => handleRunTest(
                                        request.id,
                                        request.auditor_expectation || '',
                                        request.system_prompt || ''
                                      )}
                                    >
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Run Test
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <FileUploader 
                              onFilesSelected={(files) => handleFilesSelected(request.id, files)} 
                              requestId={request.id}
                              isUploading={isUploading}
                              readOnly={false}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
                
                {expandedRows.has(request.id) && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <div className="bg-muted/30 px-10 py-4 border-t">
                        {documents[request.id] && documents[request.id].length > 0 ? (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium">Documents</h4>
                            <div className="grid grid-cols-3 gap-4">
                              {documents[request.id].map((doc) => (
                                <div 
                                  key={doc.id}
                                  className="bg-card border rounded-lg p-3 flex items-center justify-between group"
                                >
                                  <div className="flex items-center min-w-0">
                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center mr-3 shrink-0">
                                      <FileIcon className="w-4 h-4 text-foreground/70" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{doc.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {format(new Date(doc.uploadedAt), 'MMM d, yyyy')} • {doc.fileType}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDownload(doc.id)}
                                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-muted-foreground">No documents uploaded yet</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4">
                          {showApproveReject && request.status === 'inreview' ? (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => handleReject(request.id)}
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button 
                                onClick={() => handleApprove(request.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          ) : (
                            <Dialog 
                              open={testDialogOpen === request.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setTestDialogOpen(request.id);
                                } else {
                                  setTestDialogOpen(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button onClick={(e) => e.stopPropagation()}>
                                  {showApproveReject ? (
                                    <>
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Run Tests
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload Documents
                                    </>
                                  )}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    {showApproveReject ? `Run Tests for ${request.title}` : request.title}
                                  </DialogTitle>
                                </DialogHeader>
                                {showApproveReject ? (
                                  <div className="py-4">
                                    {isRunningTest[request.id] ? (
                                      <div className="flex flex-col items-center justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">Running analysis...</p>
                                      </div>
                                    ) : testResults[request.id] ? (
                                      <div className="space-y-4">
                                        <div className="bg-muted p-4 rounded-lg">
                                          <h4 className="font-medium mb-2">Analysis Result</h4>
                                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {testResults[request.id].Response}
                                          </p>
                                        </div>
                                        <div className="flex justify-end">
                                          <Button 
                                            onClick={() => handleRunTest(
                                              request.id,
                                              request.auditor_expectation || '',
                                              request.system_prompt || ''
                                            )}
                                          >
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Run Again
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        <div className="bg-muted p-4 rounded-lg">
                                          <h4 className="font-medium mb-2">Test Configuration</h4>
                                          <p className="text-sm text-muted-foreground">
                                            Auditor Expectation: {request.auditor_expectation || 'Not set'}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            System Prompt: {request.system_prompt || 'Not set'}
                                          </p>
                                        </div>
                                        <div className="flex justify-end">
                                          <Button 
                                            onClick={() => handleRunTest(
                                              request.id,
                                              request.auditor_expectation || '',
                                              request.system_prompt || ''
                                            )}
                                          >
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Run Test
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <FileUploader 
                                    onFilesSelected={(files) => handleFilesSelected(request.id, files)} 
                                    requestId={request.id}
                                    isUploading={isUploading}
                                    readOnly={false}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RequestTable;
