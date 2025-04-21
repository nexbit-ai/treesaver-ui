import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { DocumentRequest, StatusType } from '@/types';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { documentRequests as mockRequests } from '@/data/mockData';

interface UploadFilesParams {
  requestId: string;
  files: File[];
  onSuccess?: () => void;
}

interface CreateRequestParams {
  title: string;
  description?: string;
  dueDate: string;
  requiredFiles: string[];
  clientId: string;
  auditId: string;
}

interface UpdateStatusParams {
  requestId: string;
  action: StatusType;
  currentStatus: StatusType;
}

export const useDocumentRequests = (auditId?: string) => {
  const queryClient = useQueryClient();

  // Get all requests or requests for a specific audit
  const { 
    data: requests = [] as DocumentRequest[], 
    isLoading, 
    error,
    isFetching
  } = useQuery({
    queryKey: auditId ? ['documentRequests', auditId] : ['documentRequests'],
    queryFn: async () => {
      try {
        if (!auditId) {
          console.warn('No audit ID provided, skipping request fetch');
          return [] as DocumentRequest[];
        }

        console.log('Fetching document requests for auditId:', auditId);
        const result = await apiService.getRequestsByAuditId(auditId);
        console.log('Fetched requests:', result);
        return result as DocumentRequest[];
      } catch (error) {
        console.error('Error fetching document requests:', error);
        return [] as DocumentRequest[];
      }
    },
    // Only enable the query if we have an auditId
    enabled: !!auditId,
    // Prevent too frequent refreshes
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Keep the data in cache
    gcTime: 1000 * 60 * 30, // 30 minutes
    // Ensure we have data before allowing mutations
    retry: 3,
    retryDelay: 1000
  });

  // Get documents for a specific request
  const getDocuments = async (requestId: string) => {
    try {
      return await apiService.getDocuments(requestId);
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  // Get timeline for a specific request
  const getRequestTimeline = async (requestId: string) => {
    try {
      return await apiService.getRequestTimeline(requestId);
    } catch (error) {
      console.error('Error fetching request timeline:', error);
      throw error;
    }
  };

  // Filter requests by status
  const getRequestsByStatus = (status: string) => {
    if (status === 'all') return requests;
    return requests.filter(req => req.status === status);
  };

  // Create new request
  const createRequest = useMutation({
    mutationFn: async (params: CreateRequestParams) => {
      const requestData = {
        ...params,
        status: 'PENDING' as StatusType, // Set initial status to PENDING
      };
      return apiService.createRequest(requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      if (auditId) {
        queryClient.invalidateQueries({ queryKey: ['documentRequests', auditId] });
      }
      toast.success('Request created successfully');
    },
    onError: (error) => {
      console.error('Error creating request:', error);
      toast.error('Error creating request');
    }
  });

  // Keep a ref to always have the latest requests
  const requestsRef = useRef(requests);
  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  // Update request status
  const updateStatus = useMutation({
    mutationFn: async ({ requestId, action, currentStatus }: UpdateStatusParams) => {
      console.log("requests:", requestsRef.current)
     
      // Validate status transitions
      const validTransitions: Record<StatusType, StatusType[]> = {
        'PENDING': ['IN_REVIEW'],
        'IN_REVIEW': ['APPROVED', 'PUSH_BACK'],
        'PUSH_BACK': ['RE_SUBMITTED'],
        'RE_SUBMITTED': ['APPROVED', 'PUSH_BACK'],
        'APPROVED': [] // No transitions from APPROVED
      };
      if (!validTransitions[currentStatus]?.includes(action)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${action}`);
      }
      return apiService.updateRequestStatus(requestId, action);
    },
    onSuccess: (data, variables, context) => {
      console.log('[DEBUG] updateStatus success:', { data, variables, context });
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      if (auditId) {
        queryClient.invalidateQueries({ queryKey: ['documentRequests', auditId] });
      }
      toast.success('Status updated successfully');
    },
    onError: (error, variables, context) => {
      console.error('[DEBUG] updateStatus error:', { error, variables, context });
      toast.error(error instanceof Error ? error.message : 'Error updating status');
    }
  });

  // Upload files and update status
  const uploadFiles = useMutation({
    mutationFn: async ({ requestId, files }: UploadFilesParams) => {
      try {
        // Simply upload the files for the given request ID
        await apiService.uploadFiles(requestId, files);
        return { success: true };
      } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the requests list after upload
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      if (auditId) {
        queryClient.invalidateQueries({ queryKey: ['documentRequests', auditId] });
      }
      toast.success('Files uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading files:', error);
      toast.error(error instanceof Error ? error.message : 'Error uploading files');
    }
  });

  const getTestResults = async (requestId: string) => {
    try {
      return await apiService.getTestCaseResults(requestId);
    } catch (error) {
      console.error('Error fetching test results:', error);
      throw error;
    }
  };

  return {
    requests,
    isLoading,
    error,
    getRequestsByStatus,
    uploadFiles,
    isUploading: uploadFiles.isPending,
    createRequest: createRequest.mutate,
    isCreating: createRequest.isPending,
    updateStatus,
    isUpdating: updateStatus.isPending,
    getTestResults,
    getDocuments,
    getRequestTimeline
  };
};
