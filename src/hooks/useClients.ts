
import { useQuery } from '@tanstack/react-query';
import { Client } from '@/types';
import { clients as mockClients } from '@/data/mockClients';
import { apiService } from '@/services/api';

export const useClients = () => {
  const { 
    data: clients = mockClients, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        // Call the API to get clients
        return await apiService.getClients();
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
