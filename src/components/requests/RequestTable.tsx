import React, { useState, useRef } from 'react';
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
import { DocumentRequest, StatusType } from '@/types';
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
import { Separator } from '@/components/ui/separator';

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

interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

interface TimelineDocument {
  document_id: string;
  request_id: string;
  document_name: string;
  aws_location_id: string;
  file_type: string;
  file_size: number;
  status: string;
  uploaded_at: string;
  updated_at: string;
}

interface TimelineEntry {
  id: string;
  request_id: string;
  status: StatusType;
  comment: string;
  documents: TimelineDocument[];
  created_at: string;
}

interface RequestTableProps {
  requests: DocumentRequest[];
  className?: string;
  showApproveReject?: boolean;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, className, showApproveReject = false }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isUploadingState, setIsUploadingState] = useState<Record<string, boolean>>({});
  const [isAnalyzingDocuments, setIsAnalyzingDocuments] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [documents, setDocuments] = useState<Record<string, TimelineDocument[]>>({});
  const [timelineEntries, setTimelineEntries] = useState<Record<string, TimelineEntry[]>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<Set<string>>(new Set());
  const [isLoadingResults, setIsLoadingResults] = useState<Record<string, boolean>>({});
  const [testDialogOpen, setTestDialogOpen] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState<Record<string, boolean>>({});
  
  const [visibleDocuments, setVisibleDocuments] = useState<Set<string>>(new Set());
  
  const toggleDocumentVisibility = (entryId: string) => {
    setVisibleDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };
  
  const queryClient = useQueryClient();
  
  const { uploadFiles, getDocuments, updateStatus, getTestResults, getRequestTimeline } = useDocumentRequests();
  
  const toggleRow = async (requestId: string) => {
    try {
      const newExpandedRows = new Set(expandedRows);
      if (newExpandedRows.has(requestId)) {
        newExpandedRows.delete(requestId);
      } else {
        newExpandedRows.add(requestId);
        // Fetch documents and timeline data if not already loaded
        if (!documents[requestId] || !timelineEntries[requestId]) {
          setLoadingDocuments(prev => new Set(prev).add(requestId));
          try {
            // Fetch documents
            const docs = await apiService.getDocuments(requestId);
            setDocuments(prev => ({ 
              ...prev, 
              [requestId]: docs 
            }));

            // Fetch timeline data
            const timeline = await getRequestTimeline(requestId);
            const safeTimeline = Array.isArray(timeline) ? timeline : [];
            setTimelineEntries(prev => ({ 
              ...prev, 
              [requestId]: safeTimeline as TimelineEntry[] 
            }));
          } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load request data');
          } finally {
            setLoadingDocuments(prev => {
              const newSet = new Set(prev);
              newSet.delete(requestId);
              return newSet;
            });
          }
        }
      }
      setExpandedRows(newExpandedRows);
    } catch (error) {
      console.error('Error toggling row:', error);
      toast.error('Something went wrong');
    }
  };
  
  const handleFilesSelected = async (files: File[], requestId: string) => {
    try {
      setIsUploadingState(prev => ({ ...prev, [requestId]: true }));
      
      // Log the current state for debugging
      console.log('Current requests:', requests);
      console.log('Looking for request with ID:', requestId);
      
      // Validate request exists
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        console.error('Request not found in current list. Available requests:', requests);
        throw new Error(`Request with ID ${requestId} not found in the current list`);
      }

      // Upload files
      await uploadFiles.mutateAsync({ requestId, files });

      // Determine the new status based on current status
      let newStatus: StatusType;
      if (request.status === 'PUSH_BACK') {
        newStatus = 'RE_SUBMITTED';
      } else {
        newStatus = 'IN_REVIEW';
      }

      // Update status based on current status
      await updateStatus.mutateAsync({ 
        requestId, 
        action: newStatus,
        currentStatus: request.status  
      });

      // Show analyzing state for 3 seconds
      setIsAnalyzingDocuments(prev => ({ ...prev, [requestId]: true }));
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsAnalyzingDocuments(prev => ({ ...prev, [requestId]: false }));

      // Fetch test results
      const results = await getTestResults(requestId);
      setTestResults(prev => ({ ...prev, [requestId]: results }));

      // Refresh documents list
      const docs = await apiService.getDocuments(requestId);
      setDocuments(prev => ({ ...prev, [requestId]: docs }));

      // Invalidate document requests query
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      
    } catch (error) {
      console.error('Error in handleFilesSelected:', error);
      toast.error(error instanceof Error ? error.message : 'Error uploading files');
    } finally {
      setIsUploadingState(prev => ({ ...prev, [requestId]: false }));
    }
  };
  
  const handleStatusChange = async (requestId: string, action: StatusType) => {
    try {
      // Find the current request to get its current status
      const request = requests.find(req => req.id === requestId);
      if (!request) {
        console.error('Request not found:', requestId);
        toast.error('Error: Request not found');
        return;
      }
      
      await updateStatus.mutateAsync({ 
        requestId, 
        action, 
        currentStatus: request.status 
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
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

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PUSH_BACK':
        return 'bg-red-100 text-red-800';
      case 'RE_SUBMITTED':
        return 'bg-purple-100 text-purple-800';
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
      setIsAnalyzingDocuments(prev => ({ ...prev, [requestId]: true }));
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
      setIsAnalyzingDocuments(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getAvailableActions = (status: StatusType) => {
    switch (status) {
      case 'IN_REVIEW':
        return ['APPROVED', 'PUSH_BACK'];
      case 'RE_SUBMITTED':
        return ['APPROVED', 'PUSH_BACK'];
      default:
        return [];
    }
  };

  const renderStatusActions = (request: DocumentRequest) => {
    const availableActions = getAvailableActions(request.status);
    
    if (availableActions.length === 0) {
      return null;
    }

    return (
      <div className="flex gap-2">
        {availableActions.includes('APPROVED') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange(request.id, 'APPROVED')}
            className="text-green-600 hover:text-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
        )}
        {availableActions.includes('PUSH_BACK') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange(request.id, 'PUSH_BACK')}
            className="text-red-600 hover:text-red-700"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Push Back
          </Button>
        )}
      </div>
    );
  };

  // Safe formatter for dates
  const safeFormatDate = (dateString: string) => {
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return 'Invalid date';
    }
  };

  const safeFormatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      console.error("Error formatting time:", error, dateString);
      return '';
    }
  };

  // Get a human-readable time diff with error handling
  const getTimeDiff = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Invalid date
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return formatDate(dateString);
    } catch (error) {
      console.error("Error formatting time diff:", error);
      return '';
    }
  };

  // Render a single timeline entry with documents
  const renderTimelineEntry = (entry: TimelineEntry) => {
    // Safety check - if entry is invalid, don't try to render it
    if (!entry || typeof entry !== 'object') {
      console.error("Invalid timeline entry:", entry);
      return null;
    }

    // Make sure entry.id exists, or generate a fallback
    const entryId = entry.id || `fallback-${Math.random().toString()}`;
    
    // Safe access to documents array with fallback
    const documents = entry.documents || [];
    const hasDocuments = documents.length > 0;
    const isDocumentsVisible = visibleDocuments.has(entryId);

    return (
      <div className="border-l-2 border-primary/30 pl-5 pb-8 relative group">
        {/* Timeline dot */}
        <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary"></div>
        
        {/* Entry header with timestamp and status */}
        <div className="flex flex-col mb-2 bg-background rounded-md p-3 border shadow-sm hover:border-primary/50 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={entry.status || 'PENDING'} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {safeFormatDate(entry.created_at || '')}
              </span>
              <span className="text-xs text-muted-foreground">
                {entry.created_at ? `${safeFormatTime(entry.created_at)} · ${getTimeDiff(entry.created_at)}` : ''}
              </span>
            </div>
          </div>
          
          {/* Comment */}
          {entry.comment && (
            <p className="text-sm mt-1 text-foreground/90 border-l-2 border-muted pl-2">{entry.comment}</p>
          )}
          
          {/* Documents toggle button, only if there are documents */}
          {hasDocuments && (
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7 px-3 w-full justify-between"
                onClick={() => toggleDocumentVisibility(entryId)}
              >
                <span className="flex items-center">
                  <FileIcon className="h-3 w-3 mr-1" />
                  {documents.length} Document{documents.length > 1 ? 's' : ''}
                </span>
                {isDocumentsVisible ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
        </div>
        
        {/* Documents (collapsible) */}
        {hasDocuments && isDocumentsVisible && (
          <div className="mt-2 pl-2 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => {
                // Skip rendering if document is invalid
                if (!doc || typeof doc !== 'object') return null;
                
                return (
                  <div 
                    key={doc.document_id || Math.random().toString()}
                    className="flex items-start p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                      <FileIcon className="w-5 h-5 text-foreground/70" />
                    </div>
                    <div className="ml-3 min-w-0 flex-grow">
                      <p className="text-sm font-medium truncate" title={doc.document_name || ''}>
                        {doc.document_name || 'Unnamed document'}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` : 'Size unknown'}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-2 h-7 text-xs hover:bg-accent"
                          onClick={() => handleDownload(doc.document_id)}
                          disabled={!doc.document_id}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn('rounded-xl overflow-hidden border bg-card')}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Title</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[25%]">Due Date</TableHead>
                <TableHead className="w-[25%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const availableActions = getAvailableActions(request.status);
                const showActions = showApproveReject && availableActions.length > 0;
                
                return (
                  <React.Fragment key={request.id}>
                    <TableRow>
                      <TableCell colSpan={4} className="p-0">
                        <div className="flex flex-col">
                          <div className="grid grid-cols-4 items-center p-4">
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
                            <div className="flex items-center gap-2">
                              <StatusBadge status={request.status} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(request.dueDate)}</span>
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                {getDaysRemaining(request.dueDate)} days left
                              </Badge>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <div className="flex flex-wrap justify-center gap-2">
                                {showActions && (
                                  <>
                                    {availableActions.includes('APPROVED') && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(request.id, 'APPROVED')}
                                        className="text-green-600 hover:text-green-700 whitespace-nowrap"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                    )}
                                    {availableActions.includes('PUSH_BACK') && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(request.id, 'PUSH_BACK')}
                                        className="text-red-600 hover:text-red-700 whitespace-nowrap"
                                      >
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        Push Back
                                      </Button>
                                    )}
                                  </>
                                )}
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
                                      onClick={(e) => e.stopPropagation()}
                                      className="whitespace-nowrap"
                                    >
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
                                      {showApproveReject ? (
                                        // For CPA Dashboard - show test results and run analysis button
                                        <div className="space-y-4">
                                          {testResults[request.id] ? (
                                            <div className="space-y-2">
                                              <Label>Test Results</Label>
                                              {isAnalyzingDocuments[request.id] ? (
                                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                  <p className="text-muted-foreground font-medium">Analyzing documents...</p>
                                                </div>
                                              ) : isLoadingResults[request.id] ? (
                                                <div className="flex items-center justify-center py-4">
                                                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                </div>
                                              ) : (
                                                <TestCaseResults results={testResults[request.id]} />
                                              )}
                                            </div>
                                          ) : (
                                            <div className="text-center py-4">
                                              <p className="text-muted-foreground mb-4">No test results available yet.</p>
                                              <Button 
                                                onClick={() => handleRunAnalysis(request.id)}
                                                disabled={isAnalyzingDocuments[request.id]}
                                              >
                                                {isAnalyzingDocuments[request.id] ? (
                                                  <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Running Analysis...
                                                  </>
                                                ) : (
                                                  <>
                                                    <PlayCircle className="h-4 w-4 mr-2" />
                                                    Run Analysis
                                                  </>
                                                )}
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        // For regular dashboard - show file uploader
                                        <>
                                          {isAnalyzingDocuments[request.id] ? (
                                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                              <p className="text-muted-foreground font-medium">Analyzing documents...</p>
                                            </div>
                                          ) : (
                                            <FileUploader 
                                              onFilesSelected={(files, requestId) => handleFilesSelected(files, requestId)} 
                                              requestId={request.id}
                                              isUploading={isUploadingState[request.id]}
                                            />
                                          )}
                                          
                                          {testResults[request.id] && !isAnalyzingDocuments[request.id] && (
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
                                        </>
                                      )}
                                    </div>
                                    {showApproveReject && (
                                      <div className="flex justify-end gap-2 mt-4">
                                        {renderStatusActions(request)}
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>

                          {expandedRows.has(request.id) && (
                            <div className="border-t bg-muted/30 px-10 py-6">
                              {loadingDocuments.has(request.id) ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Loading request data...</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {/* Documents Section */}
                                  <div>
                                    <h3 className="text-lg font-medium mb-4">Documents</h3>
                                    {documents[request.id] && documents[request.id].length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {documents[request.id].map((doc) => (
                                          <div 
                                            key={doc.document_id}
                                            className="flex items-start p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors"
                                          >
                                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                                              <FileIcon className="w-5 h-5 text-foreground/70" />
                                            </div>
                                            <div className="ml-3 min-w-0 flex-grow">
                                              <p className="text-sm font-medium truncate" title={doc.document_name}>
                                                {doc.document_name}
                                              </p>
                                              <div className="flex justify-between items-center">
                                                <p className="text-xs text-muted-foreground">
                                                  {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` : 'Size unknown'}
                                                </p>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="px-2 h-7 text-xs hover:bg-accent"
                                                  onClick={() => handleDownload(doc.document_id)}
                                                >
                                                  <Download className="w-3 h-3 mr-1" />
                                                  Download
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                                          <FileIcon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium">No documents found</h3>
                                        <p className="text-muted-foreground mt-1">
                                          Upload documents using the button below.
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <Separator className="my-6" />

                                  {/* Timeline Section */}
                                  <div>
                                    <h3 className="text-lg font-medium mb-4">Timeline</h3>
                                    {timelineEntries[request.id] && timelineEntries[request.id].length > 0 ? (
                                      <div className="space-y-4">
                                        {timelineEntries[request.id].map((entry) => renderTimelineEntry(entry))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                                          <Clock className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium">No timeline data</h3>
                                        <p className="text-muted-foreground mt-1">
                                          Timeline will be updated as the request progresses.
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Upload Button */}
                                  <div className="flex justify-end mt-8">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button>
                                          <Upload className="h-4 w-4 mr-2" />
                                          Upload Documents
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>{request.title}</DialogTitle>
                                        </DialogHeader>
                                        <FileUploader 
                                          onFilesSelected={(files) => handleFilesSelected(files, request.id)} 
                                          requestId={request.id}
                                          isUploading={isUploadingState[request.id]}
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RequestTable;
