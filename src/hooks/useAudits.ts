
import { useQuery } from '@tanstack/react-query';
import { Audit } from '@/types';
import { audits as mockAudits } from '@/data/mockClients';
import { apiService } from '@/services/api';

// For now, this uses mock data but could be updated to use the API service
export const useAudits = () => {
  const { 
    data: audits = mockAudits, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      // Eventually replace with API call
      // return apiService.get<Audit[]>('/audits');
      return mockAudits;
    },
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
