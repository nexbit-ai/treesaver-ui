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
import { Upload, ChevronDown, ChevronUp, Calendar, FileIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import FileUploader from '@/components/upload/FileUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useDocumentRequests } from '@/hooks/useDocumentRequests';

interface RequestTableProps {
  requests: DocumentRequest[];
  className?: string;
  showApproveReject?: boolean;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, className, showApproveReject = false }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const { uploadFiles, isUploading, updateStatus } = useDocumentRequests();
  
  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  
  const handleFilesSelected = (requestId: string, files: File[]) => {
    uploadFiles({ requestId, files });
    setOpenDialogId(null);
  };
  
  const handleApprove = (requestId: string) => {
    updateStatus({ requestId, status: 'approved' });
  };

  const handleReject = (requestId: string) => {
    updateStatus({ requestId, status: 'rejected' });
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
                  expandedRow === request.id && "bg-muted/30"
                )}>
                  <TableCell
                    className="font-medium py-4"
                    onClick={() => toggleRow(request.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {expandedRow === request.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
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
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {showApproveReject && request.status === 'review' ? (
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
                      <Dialog open={openDialogId === request.id} onOpenChange={(open) => {
                        if (open) {
                          setOpenDialogId(request.id);
                        } else {
                          setOpenDialogId(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            <Upload className="h-3.5 w-3.5 mr-1" />
                            {showApproveReject ? 'View' : 'Upload'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{request.title}</DialogTitle>
                          </DialogHeader>
                          <div className="mt-2 text-muted-foreground">
                            {request.description}
                          </div>
                          <div className="my-4">
                            <h4 className="text-sm font-medium mb-2">Required Files:</h4>
                            <div className="flex flex-wrap gap-2">
                              {request.requiredFiles.map((file, index) => (
                                <div 
                                  key={index} 
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                                >
                                  <FileIcon className="h-3 w-3 mr-1.5" />
                                  {file}
                                </div>
                              ))}
                            </div>
                          </div>
                          <FileUploader 
                            onFilesSelected={(files) => handleFilesSelected(request.id, files)} 
                            requestId={request.id}
                            isUploading={isUploading}
                            readOnly={showApproveReject}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
                
                {expandedRow === request.id && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <div className="bg-muted/30 px-10 py-4 border-t">
                        <div className="text-sm text-muted-foreground mb-4">
                          {request.description}
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Required Files:</h4>
                          <div className="flex flex-wrap gap-2">
                            {request.requiredFiles.map((file, index) => (
                              <div 
                                key={index} 
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted border border-border"
                              >
                                <FileIcon className="h-3 w-3 mr-1.5" />
                                {file}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {request.uploadedFiles && request.uploadedFiles.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
                            <div className="space-y-2 mb-4">
                              {request.uploadedFiles.map((file, index) => (
                                <div 
                                  key={index}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-background border"
                                >
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center mr-3">
                                      <FileIcon className="w-4 h-4 text-foreground/70" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {(file.size / (1024 * 1024)).toFixed(1)} MB • Uploaded on {formatDate(file.uploadedAt)}
                                      </p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">View</Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4">
                          {showApproveReject && request.status === 'review' ? (
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button>
                                  <Upload className="h-4 w-4 mr-2" />
                                  {showApproveReject ? 'View Documents' : 'Upload Documents'}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{request.title}</DialogTitle>
                                </DialogHeader>
                                <FileUploader 
                                  onFilesSelected={(files) => handleFilesSelected(request.id, files)} 
                                  requestId={request.id}
                                  isUploading={isUploading}
                                  readOnly={showApproveReject}
                                />
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
