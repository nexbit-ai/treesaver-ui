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
import { Label } from '@/components/ui/label';
import TestCaseResults, { TestCaseResult } from './TestCaseResults';

interface DownloadResponse {
  documentId: string;
  downloadUrl: string;
  expiresIn: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface AnalysisStartResponse {
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

interface RequestTableProps {
  requests: DocumentRequest[];
  className?: string;
  showApproveReject?: boolean;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, className, showApproveReject = false }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [documents, setDocuments] = useState<Record<string, any[]>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<Set<string>>(new Set());
  const [testDialogOpen, setTestDialogOpen] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestCaseResult[]>>({});
  const [isLoadingResults, setIsLoadingResults] = useState<Record<string, boolean>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});
  const { uploadFiles, isUploading, updateStatus, getDocuments } = useDocumentRequests();
  const [isRunningTest, setIsRunningTest] = useState<Record<string, boolean>>({});
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
          // Update request status to InReview
          await updateStatus({ requestId, action: 'InReview' });
          
          // Fetch test results
          setIsLoadingResults(prev => {
            const newLoading = { ...prev };
            newLoading[requestId] = true;
            return newLoading;
          });
          try {
            const results = await apiService.getTestCaseResults(requestId);
            setTestResults(prev => {
              const newResults = { ...prev };
              newResults[requestId] = results;
              return newResults;
            });
          } catch (error) {
            console.error('Error fetching test results:', error);
            toast.error('Failed to fetch test results');
          } finally {
            setIsLoadingResults(prev => {
              const newLoading = { ...prev };
              newLoading[requestId] = false;
              return newLoading;
            });
          }
          
          // Refresh the documents list
          setLoadingDocuments(prev => new Set(prev).add(requestId));
          const docs = await getDocuments(requestId);
          setDocuments(prev => {
            const newDocs = { ...prev };
            newDocs[requestId] = docs;
            return newDocs;
          });
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
      case 'InReview':
        return 'bg-blue-100 text-blue-800';
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
      const analysisResponse = await apiService.runAnalysis(requestId, prompt) as AnalysisStartResponse;
      
      // Wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check the status
      const statusResponse = await apiService.getAnalysisStatus(
        requestId,
        analysisResponse.threadId,
        analysisResponse.runId
      ) as AnalysisStatusResponse;
      
      // Convert analysis response to test case result format
      const testResult: TestCaseResult = {
        testCaseName: "Document Analysis",
        result: statusResponse.Status === "completed" ? "pass" : "fail",
        files: "",
      };
      
      // Update test results with type safety
      const newResults: Record<string, TestCaseResult[]> = {
        ...testResults,
        [requestId]: [testResult]
      };
      setTestResults(newResults);
      
      if (statusResponse.Status === "completed") {
        toast.success("Analysis completed successfully");
      } else {
        toast.error("Analysis failed or timed out");
      }
    } catch (error) {
      console.error("Error running analysis:", error);
      toast.error("Failed to run analysis");
    } finally {
      setIsRunningTest(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRunAnalysis = async (requestId: string) => {
    try {
      setIsAnalyzing(prev => ({ ...prev, [requestId]: true }));
      const prompt = "Please analyze the uploaded documents for completeness and authenticity.";
      
      const analysisResponse = await apiService.runAnalysis(requestId, prompt) as AnalysisStartResponse;
      
      // Poll for analysis status
      const statusResponse = await apiService.getAnalysisStatus(
        requestId,
        analysisResponse.threadId,
        analysisResponse.runId
      ) as AnalysisStatusResponse;

      // Convert analysis response to test case result format
      const testResult: TestCaseResult = {
        testCaseName: "Document Analysis",
        result: statusResponse.Status === "completed" ? "pass" : "fail",
        files: "",
      };
      
      // Update test results with type safety
      const newResults: Record<string, TestCaseResult[]> = {
        ...testResults,
        [requestId]: [testResult]
      };
      setTestResults(newResults);
      
      if (statusResponse.Status === "completed") {
        toast.success("Analysis completed successfully");
      } else {
        toast.error("Analysis failed or timed out");
      }
    } catch (error) {
      console.error("Error running analysis:", error);
      toast.error("Failed to run analysis");
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn('rounded-xl overflow-hidden border bg-card')}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <React.Fragment key={request.id}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRow(request.id)}
                          className="p-1 hover:bg-accent rounded-md"
                        >
                          {expandedRows.has(request.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                        <span>{request.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(request.dueDate)}</span>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {getDaysRemaining(request.dueDate)} days left
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                              <DialogTitle>{request.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <FileUploader 
                                onFilesSelected={(files) => handleFilesSelected(request.id, files)} 
                                requestId={request.id}
                                isUploading={isUploading}
                              />
                              
                              {testResults[request.id] && (
                                <div className="space-y-2">
                                  <Label>Test Results</Label>
                                  {isLoadingResults[request.id] ? (
                                    <div className="flex items-center justify-center py-4">
                                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                  ) : (
                                    <TestCaseResults results={testResults[request.id]} />
                                  )}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {showApproveReject && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(request.id)}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(request.id) && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <div className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Uploaded Documents</h3>
                            {loadingDocuments.has(request.id) && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </div>
                          {documents[request.id]?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {documents[request.id].map((doc: any) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileIcon className="h-4 w-4" />
                                    <span className="font-medium">{doc.name}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownload(doc.id)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground">
                              No documents uploaded yet
                            </div>
                          )}
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
    </div>
  );
};

export default RequestTable;
