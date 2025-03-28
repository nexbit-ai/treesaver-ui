
import React, { useState } from 'react';
import { documentRequests } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { StatusType } from '@/types';
import RequestTable from '@/components/requests/RequestTable';
import RequestCard from '@/components/requests/RequestCard';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye,
  PlusCircle,
  BarChart
} from 'lucide-react';
import { useDocumentRequests } from '@/hooks/useDocumentRequests';
import CreateRequestDialog from '@/components/requests/CreateRequestDialog';

const CPADashboard = () => {
  const [activeTab, setActiveTab] = useState<'all' | StatusType>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const isMobile = useIsMobile();
  
  const { 
    requests, 
    isLoading, 
    error, 
    getRequestsByStatus 
  } = useDocumentRequests();
  
  const filteredRequests = getRequestsByStatus(activeTab);
  
  const statusCounts = {
    all: requests.length,
    pending: requests.filter(req => req.status === 'pending').length,
    seen: requests.filter(req => req.status === 'seen').length,
    review: requests.filter(req => req.status === 'review').length,
    approved: requests.filter(req => req.status === 'approved').length,
    rejected: requests.filter(req => req.status === 'rejected').length,
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'seen':
        return <Eye className="h-4 w-4" />;
      case 'review':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Create a handler function that ensures correct typing
  const handleTabChange = (value: string) => {
    // Type assertion to ensure value is treated as 'all' | StatusType
    setActiveTab(value as 'all' | StatusType);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">CPA Dashboard</h1>
            <p className="text-muted-foreground">Manage client document requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Request
            </Button>
            <Button>
              <BarChart className="h-4 w-4 mr-2" />
              Audit Overview
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Document Requests</h2>
            {/* Additional actions could go here */}
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
              <TabsTrigger value="all" className="flex items-center justify-center gap-1.5">
                All
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                  {statusCounts.all}
                </span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center justify-center gap-1.5">
                <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
                Pending
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                  {statusCounts.pending}
                </span>
              </TabsTrigger>
              <TabsTrigger value="seen" className="flex items-center justify-center gap-1.5">
                <Eye className="h-3.5 w-3.5 mr-1 opacity-70" />
                Seen
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                  {statusCounts.seen}
                </span>
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center justify-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 mr-1 opacity-70" />
                In Review
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                  {statusCounts.review}
                </span>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center justify-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 mr-1 opacity-70" />
                Approved
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                  {statusCounts.approved}
                </span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center justify-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 mr-1 opacity-70" />
                Rejected
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                  {statusCounts.rejected}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <Separator className="my-6" />
            
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : isMobile ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredRequests.map((request) => (
                    <RequestCard 
                      key={request.id} 
                      request={request} 
                      showApproveReject={true}
                    />
                  ))}
                </div>
              ) : (
                <RequestTable 
                  requests={filteredRequests} 
                  showApproveReject={true}
                />
              )}
              
              {filteredRequests.length === 0 && !isLoading && (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    {getStatusIcon(activeTab)}
                  </div>
                  <h3 className="text-lg font-medium">No {activeTab !== 'all' ? activeTab : ''} requests found</h3>
                  <p className="text-muted-foreground mt-1">
                    {activeTab === 'all'
                      ? "You don't have any document requests at the moment."
                      : `You don't have any ${activeTab} requests at the moment.`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Request Dialog */}
      <CreateRequestDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default CPADashboard;
