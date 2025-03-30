
import { useQuery } from '@tanstack/react-query';
import { Client } from '@/types';
import { clients as mockClients } from '@/data/mockClients';
import { apiService } from '@/services/api';

export const useClients = () => {
  const { 
    data: clients = [] as Client[], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        // Call the API to get clients
        const result = await apiService.getClients();
        return result as Client[];
      } catch (error) {
        console.error('Error fetching clients:', error);
        // Fallback to mock data if API fails
        return mockClients;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getClientById = (clientId: string) => {
    return clients.find(client => client.id === clientId);
  };

  return {
    clients,
    isLoading,
    error,
    getClientById
  };
};
