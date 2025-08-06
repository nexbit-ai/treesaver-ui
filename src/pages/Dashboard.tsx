import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import RequestTable from '@/components/requests/RequestTable';
import RequestCard from '@/components/requests/RequestCard';
import { Clock, CheckCircle, AlertCircle, Loader2, Eye, ArrowLeft, Building } from 'lucide-react';
import { StatusType, Audit } from '@/types';
import { useDocumentRequests } from '@/hooks/useDocumentRequests';
import { useAudits } from '@/hooks/useAudits';
import { apiService } from '@/services/api';
import { documentRequests } from '@/data/mockData';
import { clients, audits } from '@/data/mockClients';

const Dashboard = () => {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | StatusType>('all');
  const [audit, setAudit] = useState<Audit | null>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const isMobile = useIsMobile();
  
  // Use dummy data instead of API calls
  const requests = documentRequests;
  const [isLoading] = useState(false);
  const filteredRequests = activeTab === 'all' ? requests : requests.filter(req => req.status === activeTab);
  
  const statusCounts = {
    all: requests.length,
    PENDING: requests.filter(req => req.status === 'PENDING').length,
    IN_REVIEW: requests.filter(req => req.status === 'IN_REVIEW').length,
    APPROVED: requests.filter(req => req.status === 'APPROVED').length,
    PUSH_BACK: requests.filter(req => req.status === 'PUSH_BACK').length,
    RE_SUBMITTED: requests.filter(req => req.status === 'RE_SUBMITTED').length,
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'IN_REVIEW':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PUSH_BACK':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'RE_SUBMITTED':
        return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />;
      default:
        return null;
    }
  };

  // Create a handler function that ensures correct typing
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | StatusType);
  };

  // Fetch audit and organization data when auditId changes
  useEffect(() => {
    const fetchAuditData = async () => {
      if (!auditId) {
        console.warn('No audit ID provided');
        return;
      }
      
      setIsLoadingAudit(true);
      try {
        // Find audit in mock data
        const foundAudit = audits.find(a => a.id === auditId);
        if (foundAudit) {
          setAudit(foundAudit);
          
          // Find the organization (client) for this audit
          const foundClient = clients.find(c => c.id === foundAudit.clientId);
          if (foundClient) {
            setOrganization(foundClient);
          }
        }
      } catch (error) {
        console.error('Error fetching audit details:', error);
      } finally {
        setIsLoadingAudit(false);
      }
    };

    fetchAuditData();
  }, [auditId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 flex flex-col">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-lg border-b shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
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
              <h1 className="text-3xl font-bold tracking-tight text-primary drop-shadow-sm">
                {auditId ? (isLoadingAudit ? 'Loading...' : audit?.name || 'Audit Dashboard') : 'Document Portal'}
              </h1>
              {auditId && organization && (
                <div className="flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-base">
                    {organization.companyName} • {organization.industry}
                  </p>
                </div>
              )}
              {!auditId && (
                <p className="text-muted-foreground text-base mt-1">
                  Upload, view, and manage your document requests
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10">
        {auditId && isLoadingAudit ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mb-8">
            {auditId && audit && organization && (
              <div className="mb-8 p-6 bg-card rounded-xl border shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2 text-primary">{audit.name}</h2>
                    <p className="text-muted-foreground text-lg mb-4">{audit.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Organization:</span>
                        <span className="font-medium">{organization.companyName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="font-medium">{organization.industry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Fiscal Year:</span>
                        <span className="font-medium">{audit.fiscalYear}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      audit.status === 'completed' ? 'bg-green-100 text-green-800' :
                      audit.status === 'in-progress' ? 'bg-amber-100 text-amber-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <h2 className="text-2xl font-semibold mb-6 text-primary">Document Requests</h2>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8 bg-muted/60 p-2 rounded-xl shadow-sm">
                <TabsTrigger value="all" className="flex items-center justify-center gap-1.5">
                  All
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5 ml-1">
                    {statusCounts.all}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="PENDING" className="flex items-center justify-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
                  Pending
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5 ml-1">
                    {statusCounts.PENDING}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="IN_REVIEW" className="flex items-center justify-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 mr-1 opacity-70" />
                  In Review
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5 ml-1">
                    {statusCounts.IN_REVIEW}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="APPROVED" className="flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 mr-1 opacity-70" />
                  Approved
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5 ml-1">
                    {statusCounts.APPROVED}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="PUSH_BACK" className="flex items-center justify-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 mr-1 opacity-70" />
                  Pushed-Back
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5 ml-1">
                    {statusCounts.PUSH_BACK}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="RE_SUBMITTED" className="flex items-center justify-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 mr-1 opacity-70" />
                  Re-Submitted
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5 ml-1">
                    {statusCounts.RE_SUBMITTED}
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
