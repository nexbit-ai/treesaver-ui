
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentRequest } from '@/types';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

export const useDocumentRequests = () => {
  const queryClient = useQueryClient();

  // Get all requests
  const { 
    data: requests = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['documentRequests'],
    queryFn: () => apiService.get<DocumentRequest[]>('/document-requests'),
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
      toast.success('Files uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Upload failed: ${(error as Error).message}`);
    }
  });

  // Update request status
  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string, status: string }) => {
      return apiService.put(`/document-requests/${requestId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQuests({ queryKey: ['documentRequests'] });
      toast.success('Status updated');
    }
  });

  return {
    requests,
    isLoading,
    error,
    getRequestsByStatus,
    uploadFiles: uploadFilesMutation.mutate,
    isUploading: uploadFilesMutation.isPending,
    updateStatus: updateStatusMutation.mutate
  };
};
