
// Central file for API communication

import { toast } from "sonner";

// Base API URL that can be configured from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Standardized error type
export type ApiError = {
  message: string;
  status: number;
};

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return handleResponse<T>(response);
  } catch (error) {
    if ((error as ApiError).status) {
      toast.error((error as ApiError).message);
    } else {
      toast.error('Network error. Please check your connection.');
      console.error('API Error:', error);
    }
    throw error;
  }
}

export const apiService = {
  // Client APIs
  getClients: () => {
    return fetchApi('/v1/firm/clients');
  },
  
  getClientById: (clientId: string) => {
    return fetchApi(`/v1/firm/client/${clientId}`);
  },
  
  // Audit APIs
  getAudits: () => {
    return fetchApi('/v1/firm/audits');
  },
  
  getAuditsByClientId: (clientId: string) => {
    return fetchApi(`/v1/firm/client/${clientId}`);
  },
  
  getAuditById: (auditId: string) => {
    return fetchApi(`/v1/firm/audit/${auditId}`);
  },
  
  // Document Request APIs
  getRequestsByAuditId: (auditId: string) => {
    return fetchApi(`/v1/firm/audit/${auditId}/requests`);
  },
  
  createDocumentRequest: (auditId: string, requestData: { name: string, expiry_date: string, description?: string }) => {
    return fetchApi(`/v1/firm/${auditId}/request`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },
  
  // File uploads - using FormData for file upload
  uploadFiles: async (requestId: string, files: File[]) => {
    const formData = new FormData();
    
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
  addComment: (requestId: string, comment: string) => {
    return fetchApi(`/api/v1/request/${requestId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content: comment }),
    });
  },
  
  // Request Status updates
  updateRequestStatus: (requestId: string, status: string) => {
    return fetchApi(`/v1/firm/request/${requestId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  
  // Health check
  healthCheck: () => {
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
