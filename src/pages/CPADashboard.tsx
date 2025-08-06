import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ChevronRight,
  Users,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { documentRequests } from '@/data/mockData';
import { clients, audits } from '@/data/mockClients';
import CreateRequestDialog from '@/components/requests/CreateRequestDialog';

const CPADashboard = () => {
  const [activeTab, setActiveTab] = useState<'all' | StatusType>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const isMobile = useIsMobile();
  
  // Use dummy data instead of API calls
  const clientsData = clients;
  const requests = documentRequests;
  const isLoadingClients = false;
  const isLoadingAudits = false;
  const isLoading = false;
  
  // Use the enhanced audits data from mockClients
  const mockAudits = audits;
  
  // Filter requests based on selections
  const filteredRequests = selectedAudit 
    ? requests.filter(req => req.auditId === selectedAudit.id)
    : selectedClient 
      ? requests.filter(req => req.clientId === selectedClient.id)
      : activeTab === 'all' 
        ? requests 
        : requests.filter(req => req.status === activeTab);
  
  // Filter audits for selected client
  const clientAudits = selectedClient ? mockAudits.filter(audit => audit.clientId === selectedClient.id) : [];

  // Group audits by client for the overview section
  const clientsWithAudits = clients.map(client => {
    const clientAudits = audits.filter(audit => audit.clientId === client.id);
    return {
      ...client,
      audits: clientAudits
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-amber-100 text-amber-800';
      case 'planned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'planned':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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

  const getStatusIconForRequests = (status: string) => {
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

  // Calculate status counts for the current view
  const statusCounts = {
    all: filteredRequests.length,
    PENDING: filteredRequests.filter(req => req.status === 'PENDING').length,
    IN_REVIEW: filteredRequests.filter(req => req.status === 'IN_REVIEW').length,
    APPROVED: filteredRequests.filter(req => req.status === 'APPROVED').length,
    PUSH_BACK: filteredRequests.filter(req => req.status === 'PUSH_BACK').length,
    RE_SUBMITTED: filteredRequests.filter(req => req.status === 'RE_SUBMITTED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 flex flex-col">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-lg border-b shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary drop-shadow-sm">
              Auditor Dashboard
            </h1>
            <p className="text-muted-foreground text-base mt-1">
              Manage client document requests and audits
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCreateRequest} disabled={!selectedAudit}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Request
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <BarChart className="h-4 w-4 mr-2" />
              Audit Overview
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10">
        {/* Overview Section - Only show when no specific client/audit is selected */}
        {!selectedClient && !selectedAudit && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{clients.length}</div>
                  <p className="text-sm text-muted-foreground">Organizations</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{audits.length}</div>
                  <p className="text-sm text-muted-foreground">Active Audits</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-sm text-muted-foreground">Industries</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">2024</div>
                  <p className="text-sm text-muted-foreground">Current Year</p>
                </CardContent>
              </Card>
            </div>

            {/* Organizations Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-primary">Organizations & Audits</h2>
              <p className="text-muted-foreground mb-8">
                Select an organization to view their audits and document requests
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {clientsWithAudits.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        {client.name}
                      </CardTitle>
                      <Badge variant="outline">{client.industry}</Badge>
                    </div>
                    <CardDescription className="text-base">{client.companyName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-2">Contact: {client.contactPerson}</p>
                        <p className="text-muted-foreground">Email: {client.email}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Active Audits ({client.audits.length})</h4>
                        <div className="space-y-2">
                          {client.audits.slice(0, 3).map((audit) => (
                            <div key={audit.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{audit.name}</p>
                                <p className="text-xs text-muted-foreground">FY {audit.fiscalYear}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${getStatusColor(audit.status)}`}>
                                  {getStatusIcon(audit.status)}
                                  {audit.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {client.audits.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{client.audits.length - 3} more audits
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          asChild 
                          className="flex-1"
                          onClick={() => handleClientSelect(client)}
                        >
                          <div>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Client
                          </div>
                        </Button>
                        {client.audits.length > 0 && (
                          <Button asChild variant="outline">
                            <div onClick={() => handleAuditSelect(client.audits[0])}>
                              <ArrowRight className="h-4 w-4 mr-2" />
                              View Audit
                            </div>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator className="my-8" />
          </>
        )}

        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex flex-wrap items-center gap-2 bg-muted/40 rounded-lg p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToClients}
            className={!selectedClient ? "invisible" : "hover:bg-background"}
          >
            <Users className="h-4 w-4 mr-2" />
            All Clients
          </Button>
          
          {selectedClient && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToAudits}
                className={!selectedAudit ? "invisible" : "hover:bg-background"}
              >
                <Building className="h-4 w-4 mr-2" />
                {selectedClient.name}
              </Button>
            </>
          )}
          
          {selectedAudit && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button variant="ghost" size="sm" className="hover:bg-background">
                <ClipboardList className="h-4 w-4 mr-2" />
                {selectedAudit.name}
              </Button>
            </>
          )}
        </div>
        
        {isLoadingClients ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : !selectedClient ? (
          // Client List View
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-primary">Select a Client</h2>
              <p className="text-muted-foreground">Choose a client to view their audits and requests</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientsData.map((client) => (
                <Card 
                  key={client.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 group"
                  onClick={() => handleClientSelect(client)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      {client.name}
                    </CardTitle>
                    <CardDescription className="text-base">{client.companyName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="font-medium">{client.industry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Contact:</span>
                        <span className="font-medium">{client.contactPerson}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : !selectedAudit ? (
          // Audits List View
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-primary">{selectedClient.name}</h2>
              <p className="text-muted-foreground text-lg">{selectedClient.companyName}</p>
            </div>
            
            {isLoadingAudits ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : clientAudits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientAudits.map((audit) => (
                  <Card 
                    key={audit.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 group"
                    onClick={() => handleAuditSelect(audit)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <ClipboardList className="h-5 w-5 text-primary" />
                        </div>
                        {audit.name}
                      </CardTitle>
                      <CardDescription className="text-base">Fiscal Year: {audit.fiscalYear}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            audit.status === 'completed' ? 'bg-green-100 text-green-800' :
                            audit.status === 'in-progress' ? 'bg-amber-100 text-amber-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {new Date(audit.startDate).toLocaleDateString()} - {new Date(audit.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/40 rounded-xl border border-dashed">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6 shadow">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No audits found</h3>
                <p className="text-muted-foreground text-base">
                  There are no audits configured for this client yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Request List View for a specific audit
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-primary">{selectedAudit.name}</h2>
              <p className="text-muted-foreground text-lg">
                {selectedAudit.description || `Fiscal Year: ${selectedAudit.fiscalYear}`}
              </p>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Document Requests</h3>
              <Button onClick={handleCreateRequest} className="bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="space-y-6">
                <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6 bg-muted/60 p-2 rounded-xl shadow-sm">
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
                    <RequestTable 
                      requests={filteredRequests} 
                      showApproveReject={true}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/40 rounded-xl border border-dashed">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6 shadow">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No requests found</h3>
                <p className="text-muted-foreground text-base">
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
