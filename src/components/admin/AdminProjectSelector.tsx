import { useAdmin } from '@/contexts/AdminContext';
import { useAllClients } from '@/hooks/useAllClients';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function AdminProjectSelector() {
  const { isAdmin, selectedProjectId, setSelectedProjectId } = useAdmin();
  const { data: clients, isLoading, error } = useAllClients();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      console.log('Iniciando sincronização via botão Pipefy Sync...');
      const { data, error } = await supabase.functions.invoke('sync-pipefy', {
        body: { projectId: selectedProjectId }
      });
      
      console.log('Resposta da Função Sync:', { data, error });
      
      if (error) {
        console.error('Erro retornado pelo Supabase:', error);
        throw error;
      }

      // The edge function returns { success, message/error } in the body
      if (data && data.success === false) {
        console.error('Erro retornado pela função sync:', data.error);
        throw new Error(data.error || 'Erro desconhecido na sincronização');
      }
      
      console.log('Sincronização concluída:', data?.message);
      
      // Invalidate queries to refresh the data automatically across all dashboards
      await queryClient.invalidateQueries({ queryKey: ['allClients'] });
      await queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      if (selectedProjectId) {
         await queryClient.invalidateQueries({ queryKey: ['projectData'] });
      }
    } catch (e: any) {
      console.error('Erro durante a sincronização manual:', e);
      alert('Erro na sincronização: ' + (e.message || 'Erro desconhecido'));
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground hidden md:inline">
        Visualizando como:
      </span>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Carregando clientes...</span>
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Erro ao carregar clientes</div>
      ) : (
        <Select 
          value={selectedProjectId || 'all'} 
          onValueChange={(val) => setSelectedProjectId(val === 'all' ? null : val)}
        >
          <SelectTrigger className="w-[200px] md:w-[280px]">
            <SelectValue placeholder="Selecione um Cliente" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="all">
               <div className="flex flex-col">
                 <span className="font-bold text-primary">Visão Geral</span>
                 <span className="text-[10px] text-muted-foreground">Sincronização da base completa</span>
               </div>
             </SelectItem>
             
             {clients?.map((client) => {
               const isCompleted = client.status === 'concluido';
               return (
                <SelectItem key={client.id} value={client.id}>
                  <div className={`flex flex-col ${isCompleted ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium truncate ${isCompleted ? 'text-muted-foreground line-through decoration-muted-foreground/50' : ''}`}>
                        {client.client_name}{client.plant_name ? ` - ${client.plant_name}` : ''}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border">
                          Concluído
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{client.client_email}</span>
                  </div>
                </SelectItem>
               );
             })}
          </SelectContent>
        </Select>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSync} 
        disabled={isSyncing || isLoading}
        className={`hidden md:flex bg-background shadow-sm hover:border-primary/40 transition-colors text-xs ml-2 ${!selectedProjectId ? 'border-primary/40 ring-1 ring-primary/20' : ''}`}
      >
        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Sincronizando...' : selectedProjectId ? 'Pipefy Sync' : 'Sync Base Completa'}
      </Button>
    </div>
  );
}
