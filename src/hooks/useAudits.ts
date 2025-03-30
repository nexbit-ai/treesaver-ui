
import { useQuery } from '@tanstack/react-query';
import { Audit } from '@/types';
import { audits as mockAudits } from '@/data/mockClients';
import { apiService } from '@/services/api';

export const useAudits = (clientId?: string) => {
  const { 
    data: audits = mockAudits, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: clientId ? ['audits', clientId] : ['audits'],
    queryFn: async () => {
      try {
        if (clientId) {
          // Get audits for specific client
          return await apiService.getAuditsByClientId(clientId);
        }
        // Get all audits
        return await apiService.getAudits();
      } catch (error) {
        console.error('Error fetching audits:', error);
        // Fallback to mock data if API fails
        return mockAudits;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getAuditsByClientId = (clientId: string) => {
    return audits.filter(audit => audit.clientId === clientId);
  };

  const getAuditById = (auditId: string) => {
    return audits.find(audit => audit.id === auditId);
  };

  return {
    audits,
    isLoading,
    error,
    getAuditsByClientId,
    getAuditById
  };
};
