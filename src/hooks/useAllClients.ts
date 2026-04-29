import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';

export function useAllClients() {
  const { isAdmin } = useAdmin();

  return useQuery({
    queryKey: ['allClients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_projects')
        .select('id, client_name, plant_name, client_email, status, progress, current_phase')
        .order('client_name');
        
      if (error) throw error;
      
      // Remove duplicados por ID (segurança contra problemas de sincronização)
      const uniqueClients = Array.from(new Map(data.map(item => [item.id, item])).values());
      
      return uniqueClients;
    },
    enabled: isAdmin, // Só roda a query se for admin
    staleTime: 1000 * 60 * 1, // Cache de 1 minuto
    refetchOnWindowFocus: true, // Rebusca ao voltar para a aba
    refetchOnMount: 'always', // Sempre rebusca ao montar
  });
}
