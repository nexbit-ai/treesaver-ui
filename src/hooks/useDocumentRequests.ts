
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentRequest, StatusType } from '@/types';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { documentRequests as mockRequests } from '@/data/mockData';

export const useDocumentRequests = (auditId?: string) => {
  const queryClient = useQueryClient();

  // Get all requests or requests for a specific audit
  const { 
    data: requests = [] as DocumentRequest[], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: auditId ? ['documentRequests', auditId] : ['documentRequests'],
    queryFn: async () => {
      try {
        if (auditId) {
          // Get requests for specific audit
          const result = await apiService.getRequestsByAuditId(auditId);
          return result as DocumentRequest[];
        }
        // In a real environment without auditId, we might need a different endpoint
        // or just return mock data for now
        return mockRequests as unknown as DocumentRequest[];
      } catch (error) {
        console.error('Error fetching document requests:', error);
        // Fallback to mock data if API fails
        return mockRequests as unknown as DocumentRequest[];
      }
    },
    // Prevent too frequent refreshes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter requests by status
  const getRequestsByStatus = (status: string) => {
    if (status === 'all') return requests;
    return requests.filter(req => req.status === status);
  };

  // Upload files mutation
  const uploadFilesMutation = useMutation({
    mutationFn: ({ requestId, files }: { requestId: string, files: File[] }) => {
      return apiService.uploadFiles(requestId, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      if (auditId) {
        queryClient.invalidateQueries({ queryKey: ['documentRequests', auditId] });
      }
      toast.success('Files uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Upload failed: ${(error as Error).message}`);
    }
  });

  // Create document request
  const createRequestMutation = useMutation({
    mutationFn: ({ auditId, data }: { auditId: string, data: { name: string, expiry_date: string, description?: string } }) => {
      return apiService.createDocumentRequest(auditId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      if (auditId) {
        queryClient.invalidateQueries({ queryKey: ['documentRequests', auditId] });
      }
      toast.success('Document request created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create request: ${(error as Error).message}`);
    }
  });

  // Update request status
  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string, status: StatusType }) => {
      return apiService.updateRequestStatus(requestId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      if (auditId) {
        queryClient.invalidateQueries({ queryKey: ['documentRequests', auditId] });
      }
      toast.success('Status updated');
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${(error as Error).message}`);
    }
  });

  return {
    requests,
    isLoading,
    error,
    getRequestsByStatus,
    uploadFiles: uploadFilesMutation.mutate,
    isUploading: uploadFilesMutation.isPending,
    createRequest: createRequestMutation.mutate,
    isCreating: createRequestMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  };
};
