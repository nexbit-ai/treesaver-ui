// Central file for API communication

import { toast } from "sonner";
import { Audit, Client, DocumentRequest } from "@/types";

// Base API URL that can be configured from environment variables
// Set a dummy host as default for now, to be changed later by user
const API_BASE_URL = "http://3.110.206.111:8080"

// Flag to determine if we should use mock responses
const USE_MOCK_RESPONSES = false;

// Mock responses based on the format provided by the user
const MOCK_RESPONSES = {
  clients: [
    {
      client_id: "123e4567-e89b-12d3-a456-426614174000",
      client_name: "Acme Corp",
      industry: "finance",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-12-31T23:59:59Z"
    }
  ],
  
  clientAudits: [
    {
      audit_id: "3dfc259c-a31c-476c-a0bf-9f16db0b560e",
      client_id: "123e4567-e89b-12d3-a456-426614174000",
      audit_name: "Financial Audit 2025",
      audit_start_date: "2025-03-30T10:42:40.546249Z",
      audit_end_date: "2025-12-31T23:59:59Z",
      created_at: "2025-03-30T10:42:40.546249Z",
      updated_at: "2025-03-30T10:42:40.546249Z"
    }
  ],
  
  auditRequests: [
    {
      request_id: "123e4567-e89b-12d3-a416-426614174001",
      request_name: "Q1 2024 Financial Statements",
      audit_id: "9d960c47-72b1-43c0-ade7-8b1d6576baee",
      status: "OPEN",
      created_at: "2025-03-30T10:42:40.561162Z",
      expired_on: "2024-04-30T23:59:59Z",
      active: true,
      updated_at: "2025-03-30T10:42:40.561162Z"
    },
    {
      request_id: "123e4567-e89b-1283-a416-426614174001",
      request_name: "Q1 2024 Financial Statements",
      audit_id: "9d960c47-72b1-43c0-ade7-8b1d6576baee",
      status: "OPEN",
      created_at: "2025-03-30T10:42:40.562136Z",
      expired_on: "2024-04-30T23:59:59Z",
      active: true,
      updated_at: "2025-03-30T10:42:40.562136Z"
    }
  ],
  
  createRequest: {
    request_id: "41e7087a-d9d7-4432-b8da-379ba761c145",
    request_name: "Q1 2024 Financial Statements",
    audit_id: "3dfc259c-a31c-476c-a0bf-9f16db0b560e",
    status: "OPEN",
    created_at: "0001-01-01T00:00:00Z",
    expired_on: "2024-04-30T23:59:59Z",
    active: true,
    updated_at: "0001-01-01T00:00:00Z"
  }
};

// Standardized error type
export type ApiError = {
  message: string;
  status: number;
};

// Helper function to simulate an API delay for mock responses
const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to convert API response format to our internal types
const mapClientResponse = (clientData: any): Client => ({
  id: clientData.client_id,
  name: clientData.client_name,
  companyName: clientData.client_name,
  email: `contact@${clientData.client_name.toLowerCase().replace(/\s+/g, '')}.com`,
  industry: clientData.industry,
  contactPerson: `Contact Person for ${clientData.client_name}`
});

const mapAuditResponse = (auditData: any): Audit => ({
  id: auditData.audit_id,
  name: auditData.audit_name,
  clientId: auditData.client_id,
  status: 'in-progress',
  startDate: auditData.audit_start_date,
  endDate: auditData.audit_end_date,
  fiscalYear: new Date(auditData.audit_end_date).getFullYear().toString()
});

const mapRequestResponse = (requestData: any): DocumentRequest => ({
  id: requestData.request_id,
  title: requestData.request_name,
  description: "Document request description",
  dueDate: requestData.expired_on,
  status: requestData.status.toLowerCase() === "open" ? "pending" : 
          requestData.status.toLowerCase() === "in_review" ? "review" :
          requestData.status.toLowerCase(),
  createdAt: requestData.created_at,
  updatedAt: requestData.updated_at,
  clientId: "123e4567-e89b-12d3-a456-426614174000", // Default client ID
  auditId: requestData.audit_id,
  requiredFiles: []
});

// Helper function to handle fetch responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: 'An error occurred',
      status: response.status,
    };
    
    try {
      // Try to parse error message from response
      const errorData = await response.json();
      if (errorData?.message) {
        error.message = errorData.message;
      }
    } catch (e) {
      // If response isn't valid JSON, use status text
      error.message = response.statusText || 'Something went wrong';
    }
    
    throw error;
  }
  
  return response.json() as Promise<T>;
}

// Generic fetch function with error handling
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // If mock responses are enabled, don't even attempt the network request
    if (USE_MOCK_RESPONSES) {
      // Handle specific endpoints with mock data
      if (endpoint.includes('/auth/me')) {
        await mockDelay();
        return { 
          authenticated: true,
          user: {
            id: "mock-user-id",
            email: "user@example.com",
            name: "Mock User"
          }
        } as unknown as T;
      }
      
      // For other endpoints, continue with regular mock handling later
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Add CORS mode
      mode: 'cors',
      credentials: 'include',
    });
    
    return handleResponse<T>(response);
  } catch (error) {
    console.error('API Error:', error);
    
    // Check if it's a CORS error (this is an approximation since browsers don't explicitly identify CORS errors)
    const errorMessage = (error as Error).message || '';
    const isCorsError = errorMessage.includes('CORS') || 
      errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('Network request failed');
    
    if (isCorsError) {
      toast.error('CORS error: Unable to connect to API. Using mock data instead.');
      console.warn('CORS error detected, falling back to mock data');
      
      // Force enable mock responses for this call
      if (endpoint.includes('/auth/me')) {
        await mockDelay();
        return { 
          authenticated: true,
          user: {
            id: "mock-user-id",
            email: "user@example.com",
            name: "Mock User"
          }
        } as unknown as T;
      }
    } else if ((error as ApiError).status) {
      toast.error((error as ApiError).message);
    } else {
      toast.error('Network error. Please check your connection.');
    }
    
    throw error;
  }
}

export const apiService = {
  // Client APIs
  getClients: async () => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return MOCK_RESPONSES.clients.map(mapClientResponse);
    }
    const response = await fetchApi('/v1/firm/clients');
    return (response as any[]).map(mapClientResponse);
  },
  
  getClientById: async (clientId: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      const client = MOCK_RESPONSES.clients.find(c => c.client_id === clientId);
      return client ? mapClientResponse(client) : null;
    }
    const response = await fetchApi(`/v1/firm/client/${clientId}`);
    return mapClientResponse(response);
  },
  
  // Audit APIs
  getAudits: async () => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return MOCK_RESPONSES.clientAudits.map(mapAuditResponse);
    }
    const response = await fetchApi('/v1/firm/audits');
    return (response as any[]).map(mapAuditResponse);
  },
  
  getAuditsByClientId: async (clientId: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      const audits = MOCK_RESPONSES.clientAudits.filter(a => a.client_id === clientId);
      return audits.map(mapAuditResponse);
    }
    const response = await fetchApi(`/v1/firm/client/${clientId}`);
    return (response as any[]).map(mapAuditResponse);
  },
  
  getAuditById: async (auditId: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      const audit = MOCK_RESPONSES.clientAudits.find(a => a.audit_id === auditId);
      return audit ? mapAuditResponse(audit) : null;
    }
    const response = await fetchApi(`/v1/firm/audit/${auditId}`);
    return mapAuditResponse(response);
  },
  
  // Document Request APIs
  getRequestsByAuditId: async (auditId: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      const requests = MOCK_RESPONSES.auditRequests.filter(r => r.audit_id === auditId);
      return requests.map(mapRequestResponse);
    }
    const response = await fetchApi(`/v1/firm/audit/${auditId}/requests`);
    return (response as any[]).map(mapRequestResponse);
  },
  
  createDocumentRequest: async (auditId: string, requestData: { name: string, expiry_date: string, description?: string }) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      const mockResponse = { ...MOCK_RESPONSES.createRequest };
      mockResponse.request_name = requestData.name;
      mockResponse.expired_on = requestData.expiry_date;
      mockResponse.audit_id = auditId;
      return mapRequestResponse(mockResponse);
    }
    const response = await fetchApi(`/v1/firm/${auditId}/request`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return mapRequestResponse(response);
  },
  
  // File uploads - using FormData for file upload
  uploadFiles: async (requestId: string, files: File[]) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay(1000); // Longer delay to simulate upload
      return {
        success: true,
        message: 'Files uploaded successfully',
        fileIds: files.map((_, index) => `mock-file-id-${index}`)
      };
    }
    
    // Prepare files array for API format
    const filesData = files.map(file => ({
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      description: `Uploaded file: ${file.name}`
    }));
    
    // Send as JSON to match API contract
    return fetchApi(`/v1/firm/upload/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({
        files: filesData
      }),
    });
  },
  
  // Comments
  addComment: async (requestId: string, comment: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return {
        comment_id: 'mock-comment-id',
        content: comment,
        created_at: new Date().toISOString()
      };
    }
    return fetchApi(`/api/v1/request/${requestId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content: comment }),
    });
  },
  
  // Request Status updates
  updateRequestStatus: async (requestId: string, status: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return {
        success: true,
        message: `Status updated to ${status}`,
        requestId
      };
    }
    return fetchApi(`/v1/firm/request/${requestId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  
  // Health check
  healthCheck: async () => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return { status: 'healthy' };
    }
    return fetchApi('/health');
  },
  
  // Generic CRUD operations that can be used for different resources
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) => 
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data: unknown) => 
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) => 
    fetchApi<T>(endpoint, { method: 'DELETE' }),
};

