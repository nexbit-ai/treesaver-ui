
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentRequest, StatusType } from '@/types';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { documentRequests as mockRequests } from '@/data/mockData';

export const useDocumentRequests = () => {
  const queryClient = useQueryClient();

  // Get all requests
  const { 
    data: requests = mockRequests as DocumentRequest[], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['documentRequests'],
    queryFn: async () => {
      // In a real app, this would be:
      // return apiService.get<DocumentRequest[]>('/document-requests');
      return mockRequests as DocumentRequest[];
    },
  });

  // Filter requests by status
  const getRequestsByStatus = (status: string) => {
    if (status === 'all') return requests;
    return requests.filter(req => req.status === status);
  };

  // Mark request as seen (for clients)
  const markAsSeenMutation = useMutation({
    mutationFn: (requestId: string) => {
      return apiService.put(`/document-requests/${requestId}/status`, { status: 'seen' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
    }
  });

  // Upload files mutation
  const uploadFilesMutation = useMutation({
    mutationFn: ({ requestId, files }: { requestId: string, files: File[] }) => {
      return apiService.uploadFiles(requestId, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      toast.success('Files uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Upload failed: ${(error as Error).message}`);
    }
  });

  // Update request status
  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string, status: StatusType }) => {
      return apiService.put(`/document-requests/${requestId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      toast.success('Status updated');
    }
  });

  return {
    requests,
    isLoading,
    error,
    getRequestsByStatus,
    markAsSeen: markAsSeenMutation.mutate,
    uploadFiles: uploadFilesMutation.mutate,
    isUploading: uploadFilesMutation.isPending,
    updateStatus: updateStatusMutation.mutate
  };
};
