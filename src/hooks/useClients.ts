
import { useQuery } from '@tanstack/react-query';
import { Client } from '@/types';
import { clients as mockClients } from '@/data/mockClients';
import { apiService } from '@/services/api';

// For now, this uses mock data but could be updated to use the API service
export const useClients = () => {
  const { 
    data: clients = mockClients, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      // Eventually replace with API call
      // return apiService.get<Client[]>('/clients');
      return mockClients;
    },
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
