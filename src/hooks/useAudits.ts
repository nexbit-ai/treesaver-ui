
import { useQuery } from '@tanstack/react-query';
import { Audit } from '@/types';
import { audits as mockAudits } from '@/data/mockClients';
import { apiService } from '@/services/api';

export const useAudits = (clientId?: string) => {
  const { 
    data: audits = [] as Audit[], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: clientId ? ['audits', clientId] : ['audits'],
    queryFn: async () => {
      try {
        if (clientId) {
          // Get audits for specific client
          const result = await apiService.getAuditsByClientId(clientId);
          return result as Audit[];
        }
        // Get all audits
        const result = await apiService.getAudits();
        return result as Audit[];
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
