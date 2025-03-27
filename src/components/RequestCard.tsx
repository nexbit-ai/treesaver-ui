
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentRequest } from '@/data/mockData';
import StatusBadge from './StatusBadge';
import { Upload, Calendar, FileIcon, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FileUploader from './FileUploader';
import { format } from 'date-fns';

interface RequestCardProps {
  request: DocumentRequest;
  className?: string;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, className }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const handleFilesSelected = (files: File[]) => {
    console.log('Files selected for request', request.id, files);
    // Here you would typically send the files to your backend
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
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{request.title}</CardTitle>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
        
        <div className="flex flex-col space-y-3">
          <div className="flex items-center text-sm">
            <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Required: {request.requiredFiles.join(', ')}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Due: {formatDate(request.dueDate)}</span>
            
            {getDaysRemaining(request.dueDate) <= 5 && getDaysRemaining(request.dueDate) > 0 && (
              <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-status-pending/20 text-status-pending">
                <Clock className="h-3 w-3 mr-1" />
                {getDaysRemaining(request.dueDate)}d
              </span>
            )}
            
            {getDaysRemaining(request.dueDate) <= 0 && (
              <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-status-rejected/20 text-status-rejected">
                Overdue
              </span>
            )}
          </div>
        </div>
        
        {request.uploadedFiles && request.uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
            <div className="space-y-2">
              {request.uploadedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm"
                >
                  <div className="truncate mr-2">{file.name}</div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{request.title}</DialogTitle>
            </DialogHeader>
            <FileUploader 
              onFilesSelected={handleFilesSelected} 
              requestId={request.id}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default RequestCard;
