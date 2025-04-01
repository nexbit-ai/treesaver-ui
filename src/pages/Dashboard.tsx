import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import RequestTable from '@/components/requests/RequestTable';
import RequestCard from '@/components/requests/RequestCard';
import { Clock, CheckCircle, AlertCircle, Loader2, Eye, ArrowLeft } from 'lucide-react';
import { StatusType, Audit } from '@/types';
import { useDocumentRequests } from '@/hooks/useDocumentRequests';
import { useAudits } from '@/hooks/useAudits';
import { apiService } from '@/services/api';

const Dashboard = () => {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | StatusType>('all');
  const [audit, setAudit] = useState<Audit | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const isMobile = useIsMobile();
  
  const { requests, isLoading, getRequestsByStatus } = useDocumentRequests(auditId);
  const filteredRequests = getRequestsByStatus(activeTab);
  
  const statusCounts = {
    all: requests.length,
    pending: requests.filter(req => req.status === 'pending').length,
    review: requests.filter(req => req.status === 'review').length,
    approved: requests.filter(req => req.status === 'approved').length,
    rejected: requests.filter(req => req.status === 'rejected').length,
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'review':
        return <Loader2 className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 animate-spin" />;
      default:
        return null;
    }
  };

  // Create a handler function that ensures correct typing
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | StatusType);
  };

  // Fetch audit requests when auditId changes
  useEffect(() => {
    const fetchAuditData = async () => {
      if (!auditId) return;
      
      setIsLoadingAudit(true);
      try {
        const auditRequests = await apiService.getRequestsByAuditId(auditId);
        setAudit(auditRequests as unknown as Audit);
      } catch (error) {
        console.error('Error fetching audit details:', error);
      } finally {
        setIsLoadingAudit(false);
      }
    };

    fetchAuditData();
  }, [auditId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {auditId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {auditId ? (isLoadingAudit ? 'Loading...' : audit?.name || 'Audit Dashboard') : 'Document Portal'}
              </h1>
              <p className="text-muted-foreground">
                {auditId ? 'View and manage audit documents' : 'Upload and manage your documents'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {auditId && isLoadingAudit ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Document Requests</h2>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-6">
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
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </div>
                ) : (
                  <RequestTable requests={filteredRequests} />
                )}
                
                {!isLoading && filteredRequests.length === 0 && (
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
        )}
      </main>
    </div>
  );
};

export default Dashboard;
