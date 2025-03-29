
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { StatusType, Client, Audit } from '@/types';
import RequestTable from '@/components/requests/RequestTable';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye,
  PlusCircle,
  BarChart,
  Building,
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import { useDocumentRequests } from '@/hooks/useDocumentRequests';
import { useClients } from '@/hooks/useClients';
import { useAudits } from '@/hooks/useAudits';
import CreateRequestDialog from '@/components/requests/CreateRequestDialog';

const CPADashboard = () => {
  const [activeTab, setActiveTab] = useState<'all' | StatusType>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const isMobile = useIsMobile();
  
  const { clients, isLoading: isLoadingClients } = useClients();
  const { getAuditsByClientId, getAuditById } = useAudits();
  const { requests, isLoading, error, getRequestsByStatus } = useDocumentRequests();
  
  // Filter requests based on selections
  const filteredRequests = selectedAudit 
    ? requests.filter(req => req.auditId === selectedAudit.id)
    : selectedClient 
      ? requests.filter(req => req.clientId === selectedClient.id)
      : getRequestsByStatus(activeTab);
  
  const clientAudits = selectedClient 
    ? getAuditsByClientId(selectedClient.id) 
    : [];

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    setSelectedAudit(null);
  };

  const handleAuditSelect = (audit: Audit) => {
    setSelectedAudit(audit);
  };

  const handleCreateRequest = () => {
    setShowCreateDialog(true);
  };

  const handleBackToClients = () => {
    setSelectedClient(null);
    setSelectedAudit(null);
  };

  const handleBackToAudits = () => {
    setSelectedAudit(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
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
            <Button variant="outline" onClick={handleCreateRequest} disabled={!selectedAudit}>
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
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToClients}
            className={!selectedClient ? "invisible" : ""}
          >
            All Clients
          </Button>
          
          {selectedClient && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToAudits}
                className={!selectedAudit ? "invisible" : ""}
              >
                {selectedClient.name}
              </Button>
            </>
          )}
          
          {selectedAudit && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button variant="ghost" size="sm">
                {selectedAudit.name}
              </Button>
            </>
          )}
        </div>
        
        {isLoadingClients ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !selectedClient ? (
          // Client List View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card 
                key={client.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleClientSelect(client)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    {client.name}
                  </CardTitle>
                  <CardDescription>{client.companyName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Industry: {client.industry}</p>
                    <p className="text-muted-foreground">Contact: {client.contactPerson}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !selectedAudit ? (
          // Audits List View
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{selectedClient.name}</h2>
              <p className="text-muted-foreground">{selectedClient.companyName}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientAudits.map((audit) => (
                <Card 
                  key={audit.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleAuditSelect(audit)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-muted-foreground" />
                      {audit.name}
                    </CardTitle>
                    <CardDescription>Fiscal Year: {audit.fiscalYear}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          audit.status === 'completed' ? 'bg-green-100 text-green-800' :
                          audit.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {new Date(audit.startDate).toLocaleDateString()} - {new Date(audit.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Request List View for a specific audit
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{selectedAudit.name}</h2>
              <p className="text-muted-foreground">
                {selectedAudit.description || `Fiscal Year: ${selectedAudit.fiscalYear}`}
              </p>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Document Requests</h2>
              <Button onClick={handleCreateRequest}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRequests.length > 0 ? (
              <RequestTable 
                requests={filteredRequests} 
                showApproveReject={true}
              />
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No requests found</h3>
                <p className="text-muted-foreground mt-1">
                  Create your first document request by clicking the "New Request" button.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Request Dialog */}
      <CreateRequestDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        selectedClientId={selectedClient?.id}
        selectedAuditId={selectedAudit?.id}
      />
    </div>
  );
};

export default CPADashboard;
