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
    queryKey: ['audits', clientId],
    queryFn: async () => {
      try {
        // Only fetch client audits if clientId is provided
        if (clientId) {
          const result = await apiService.getAuditsByClientId(clientId);
          return result as Audit[];
        }
        // Otherwise, fetch all audits (or use an empty array if not needed by default)
        return [] as Audit[];
      } catch (error) {
        console.error('Error fetching audits:', error);
        // Fallback to mock data if API fails
        return clientId 
          ? mockAudits.filter(audit => audit.clientId === clientId)
          : mockAudits;
      }
    },
    // Don't run the query when no clientId is provided
    enabled: clientId !== undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // This function works with the local cache of audits from the query above
  const getAuditsByClientId = (clientId: string) => {
    // Filter audits by client ID from the cached data
    const filteredAudits = audits.filter(audit => audit.clientId === clientId);
    
    // If no audits found in cache, fall back to mock audits
    if (filteredAudits.length === 0) {
      return mockAudits.filter(audit => audit.clientId === clientId);
    }
    
    return filteredAudits;
  };

  const getAuditById = (auditId: string) => {
    return audits.find(audit => audit.id === auditId) || 
           mockAudits.find(audit => audit.id === auditId);
  };

  return {
    audits: clientId ? audits : [], // Return empty array when no clientId is provided
    isLoading,
    error,
    getAuditsByClientId,
    getAuditById
  };
};
