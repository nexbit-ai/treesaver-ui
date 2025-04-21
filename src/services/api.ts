// Central file for API communication

import { toast } from "sonner";
import { Audit, Client, DocumentRequest, StatusType } from "@/types";
import { TestCaseResult } from "@/components/requests/TestCaseResults";

// Base API URL that can be configured from environment variables
// Set a dummy host as default for now, to be changed later by user
const API_BASE_URL = "http://43.204.236.42:8080"

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
    },
    {
      client_id: "223e4567-e89b-12d3-a456-426614174001",
      client_name: "Tech Solutions Inc.",
      industry: "technology",
      created_at: "2024-01-15T00:00:00Z",
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
    },
    {
      audit_id: "4dfc259c-a31c-476c-a0bf-9f16db0b561f",
      client_id: "123e4567-e89b-12d3-a456-426614174000",
      audit_name: "Tax Audit 2024",
      audit_start_date: "2024-01-15T08:30:00.000000Z",
      audit_end_date: "2024-04-15T23:59:59Z",
      created_at: "2024-01-10T10:00:00.000000Z",
      updated_at: "2024-01-10T10:00:00.000000Z"
    },
    {
      audit_id: "5dfc259c-a31c-476c-a0bf-9f16db0b562g",
      client_id: "223e4567-e89b-12d3-a456-426614174001",
      audit_name: "Compliance Audit 2024",
      audit_start_date: "2024-02-01T09:00:00.000000Z",
      audit_end_date: "2024-05-30T23:59:59Z",
      created_at: "2024-01-20T11:15:00.000000Z",
      updated_at: "2024-01-20T11:15:00.000000Z"
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
      updated_at: "2025-03-30T10:42:40.561162Z",
      auditor_expectation: "Please verify all financial statements are complete and accurate",
      system_prompt: "Check for missing pages, tampered documents, and required signatures"
    },
    {
      request_id: "123e4567-e89b-1283-a416-426614174001",
      request_name: "Q1 2024 Financial Statements",
      audit_id: "9d960c47-72b1-43c0-ade7-8b1d6576baee",
      status: "OPEN",
      created_at: "2025-03-30T10:42:40.562136Z",
      expired_on: "2024-04-30T23:59:59Z",
      active: true,
      updated_at: "2025-03-30T10:42:40.562136Z",
      auditor_expectation: "Ensure all documents are properly signed and dated",
      system_prompt: "Verify document authenticity and completeness"
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
    updated_at: "0001-01-01T00:00:00Z",
    auditor_expectation: "Please verify all financial statements are complete and accurate",
    system_prompt: "Check for missing pages, tampered documents, and required signatures"
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
  dueDate: requestData.expired_on,
  status: requestData.status as StatusType,
  createdAt: requestData.created_at,
  updatedAt: requestData.updated_at,
  clientId: "123e4567-e89b-12d3-a456-426614174000", // Default client ID
  auditId: requestData.audit_id,
  requiredFiles: [],
  auditor_expectation: requestData.auditor_expectation,
  system_prompt: requestData.system_prompt
});

const mapDocumentResponse = (documentData: any) => ({
  id: documentData.document_id,
  requestId: documentData.request_id,
  name: documentData.document_name,
  awsLocationId: documentData.aws_location_id,
  fileType: documentData.file_type,
  fileSize: documentData.file_size,
  status: documentData.status,
  uploadedAt: documentData.uploaded_at,
  updatedAt: documentData.updated_at
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
  
  getAuditsByClientId: async (clientId: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      const audits = MOCK_RESPONSES.clientAudits.filter(a => a.client_id === clientId);
      return audits.map(mapAuditResponse);
    }
    const response = await fetchApi(`/v1/firm/client/${clientId}`);
    return (response as any[]).map(mapAuditResponse);
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
  
  createDocumentRequest: async (auditId: string, requestData: { 
    name: string, 
    expiry_date: string,
    auditor_expectation: string,
    system_prompt: string 
  }) => {
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
  uploadFiles: async (requestId: string, files: File | File[]) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay(1000);
      return {
        success: true,
        message: 'Files uploaded successfully',
        fileIds: Array.isArray(files) 
          ? files.map((_, index) => `mock-file-id-${index}`)
          : [`mock-file-id-0`]
      };
    }
    
    try {
      // Ensure files is always an array
      const filesArray = Array.isArray(files) ? files : [files];
      
      // Step 1: Get signed URLs
      const filesData = filesArray.map(file => ({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        description: `Uploaded file: ${file.name}`
      }));
      
      const response = await fetchApi<{
        upload_urls: Record<string, string>;
        document_ids: Record<string, string>;
      }>(`/v1/firm/upload/${requestId}`, {
        method: 'POST',
        body: JSON.stringify({ files: filesData }),
      });

      // Step 2: Upload files to signed URLs
      const uploadPromises = filesArray.map(async (file) => {
        const signedUrl = response.upload_urls[file.name];
        if (!signedUrl) {
          throw new Error(`No signed URL found for file: ${file.name}`);
        }

        await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        return {
          fileName: file.name,
          documentId: response.document_ids[file.name],
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      return {
        success: true,
        message: 'Files uploaded successfully',
        documentIds: uploadResults.map(result => result.documentId),
      };
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
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
  updateRequestStatus: async (requestId: string, action: StatusType) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return {
        success: true,
        message: `Status updated to ${action}`,
        requestId
      };
    }
    return fetchApi(`/v1/firm/status/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
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

  // Document APIs
  getDocuments: async (requestId: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return [
        {
          id: 'mock-doc-1',
          name: 'Document 1.pdf',
          size: 1024 * 1024,
          uploadedAt: new Date().toISOString(),
          url: '/files/mock-doc-1.pdf'
        },
        {
          id: 'mock-doc-2',
          name: 'Document 2.pdf',
          size: 2 * 1024 * 1024,
          uploadedAt: new Date().toISOString(),
          url: '/files/mock-doc-2.pdf'
        }
      ];
    }
    const response = await fetchApi<Array<{
      document_id: string;
      document_name: string;
      file_size: number;
      uploaded_at: string;
      url?: string;
    }>>(`/v1/client/${requestId}/documents`);
    return response.map(doc => ({
      id: doc.document_id,
      name: doc.document_name,
      size: doc.file_size,
      uploadedAt: doc.uploaded_at,
      url: doc.url
    }));
  },

  // Request Timeline API
  getRequestTimeline: async (requestId: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return [
        {
          id: "db0620f9-cb3e-47ba-b8a2-5b851e929370",
          request_id: requestId,
          status: "APPROVED",
          comment: "Approved by manager",
          documents: [],
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
        },
        {
          id: "d34973c9-f84d-40f4-a87b-49b525e2fb53",
          request_id: requestId,
          status: "RE_SUBMITTED",
          comment: "Resubmitted with corrected documents",
          documents: [],
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
        },
        {
          id: "e6696dcc-2363-4394-9caa-3e541585005b",
          request_id: requestId,
          status: "PUSH_BACK",
          comment: "Missing important information",
          documents: [],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
          id: "757fbd60-154a-4333-bc3a-dcb37bcc1146",
          request_id: requestId,
          status: "IN_REVIEW",
          comment: "Initial document review",
          documents: [
            {
              document_id: "bf50a657-6472-460a-b110-e4507583b155",
              request_id: requestId,
              document_name: "Invoice_1.png",
              aws_location_id: `requests/${requestId}/documents/bf50a657-6472-460a-b110-e4507583b155/Invoice_1.png`,
              file_type: "image/png",
              file_size: 423899,
              status: "",
              uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
              updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
            },
            {
              document_id: "f893c6e1-acc1-4293-9934-c10ba15d2fb6",
              request_id: requestId,
              document_name: "Statement_1.png",
              aws_location_id: `requests/${requestId}/documents/f893c6e1-acc1-4293-9934-c10ba15d2fb6/Statement_1.png`,
              file_type: "image/png",
              file_size: 2170302,
              status: "",
              uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
              updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
            }
          ],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
        },
        {
          id: "8c871157-5be2-47cf-9841-9b3a8cdfad07",
          request_id: requestId,
          status: "PENDING",
          comment: "Request created",
          documents: [],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
        }
      ];
    }
    return fetchApi(`/v1/common/request-timeline?requestID=${requestId}`);
  },

  // Add new download method
  getDocumentDownloadUrl: async (documentId: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return {
        documentId,
        downloadUrl: 'https://example.com/mock-document.pdf',
        expiresIn: '15 minutes',
        fileName: 'mock-document.pdf',
        fileSize: 1024,
        fileType: 'application/pdf'
      };
    }
    return fetchApi(`/v1/firm/documents/${documentId}/download`);
  },

  // Analysis APIs
  runAnalysis: async (requestId: string, prompt: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return {
        createdAt: "2025-04-01T19:13:45.649184+05:30",
        message: "Analysis started",
        runId: "mock_run_id",
        status: "queued",
        threadId: "mock_thread_id"
      };
    }
    return fetchApi(`/v1/analysis/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },

  getAnalysisStatus: async (requestId: string, threadId: string, runId: string) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return {
        ThreadID: "mock_thread_id",
        RunID: "mock_run_id",
        Response: "Mock analysis response",
        Status: "completed",
        CreatedAt: "2025-04-01T19:13:45+05:30",
        CompletedAt: "2025-04-01T19:13:47+05:30"
      };
    }
    return fetchApi(`/v1/analysis/${requestId}/status?threadId=${threadId}&runId=${runId}`);
  },

  // Add new method for fetching test case results
  getTestCaseResults: async (requestId: string): Promise<TestCaseResult[]> => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return [
        { testCaseName: "Tampered Check", result: "pass", files: "" },
        { testCaseName: "Missing Page Number", result: "fail", files: "document1.pdf" },
        { testCaseName: "Signature Check", result: "pass", files: "" },
        { testCaseName: "Date Check", result: "pass", files: "" },
        { testCaseName: "Required Documents Check", result: "pass", files: "" }
      ];
    }
    return fetchApi<TestCaseResult[]>(`/v1/client/compile-results/${requestId}`);
  },

  // File uploads - using FormData for file upload
  uploadDocument: async (requestId: string, file: File) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay(1000);
      return {
        success: true,
        message: 'File uploaded successfully',
        documentId: `mock-document-id-${Date.now()}`
      };
    }
    
    try {
      // Step 1: Get signed URL
      const fileData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        description: `Uploaded file: ${file.name}`
      };
      
      const response = await fetchApi<{
        upload_url: string;
        document_id: string;
      }>(`/v1/firm/upload/${requestId}`, {
        method: 'POST',
        body: JSON.stringify({ files: [fileData] }),
      });

      // Step 2: Upload file to signed URL
      await fetch(response.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      return {
        success: true,
        message: 'File uploaded successfully',
        documentId: response.document_id,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Create new request
  createRequest: async (data: {
    title: string;
    description?: string;
    dueDate: string;
    requiredFiles: string[];
    clientId: string;
    auditId: string;
    status: StatusType;
  }) => {
    if (USE_MOCK_RESPONSES) {
      await mockDelay();
      return {
        id: 'mock-request-id',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return fetchApi('/v1/firm/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

