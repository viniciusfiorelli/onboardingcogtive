import { useState, useMemo } from 'react';
import { useAllClients } from '@/hooks/useAllClients';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building, ChevronRight, CheckCircle2, Circle, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const PHASE_FILTERS = [
  'Triagem',
  'Kick-off',
  'Preparação',
  'Implantação',
  'Operação assistida',
  'Wrap-up',
  'Concluído',
] as const;

function normalizePhase(phase: string): string {
  return phase
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default function ClientList() {
  const { data: clients, isLoading, error } = useAllClients();
  const { setSelectedProjectId } = useAdmin();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhases, setSelectedPhases] = useState<Set<string>>(new Set());

  const togglePhase = (phase: string) => {
    setSelectedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phase)) {
        next.delete(phase);
      } else {
        next.add(phase);
      }
      return next;
    });
  };

  const clearFilters = () => setSelectedPhases(new Set());

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter(client => {
      const matchesSearch =
        client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.client_email.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (selectedPhases.size === 0) return true;

      const clientPhaseNorm = normalizePhase(client.current_phase || '');
      return Array.from(selectedPhases).some(
        filterPhase => normalizePhase(filterPhase) === clientPhaseNorm
      );
    });
  }, [clients, searchQuery, selectedPhases]);

  // Contadores por fase
  const phaseCounts = useMemo(() => {
    if (!clients) return {};
    const counts: Record<string, number> = {};
    for (const phase of PHASE_FILTERS) {
      const norm = normalizePhase(phase);
      counts[phase] = clients.filter(c => normalizePhase(c.current_phase || '') === norm).length;
    }
    return counts;
  }, [clients]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !clients) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-bold text-destructive">Erro ao carregar clientes</h2>
      </div>
    );
  }

  const handleSelectClient = (projectId: string) => {
    setSelectedProjectId(projectId);
    navigate('/admin/project');
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Building className="w-8 h-8 text-primary" />
            Seus Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Selecione um cliente para acessar o painel completo dele</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9 glass-card border-primary/20 bg-background/50 focus-visible:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>
      </div>

      {/* Filtros por fase */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap items-center gap-2"
      >
        <Filter className="w-4 h-4 text-muted-foreground mr-1" />
        <button
          onClick={clearFilters}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200
            ${selectedPhases.size === 0
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-background/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
        >
          Todos ({clients.length})
        </button>
        {PHASE_FILTERS.map(phase => {
          const count = phaseCounts[phase] || 0;
          const isActive = selectedPhases.has(phase);
          return (
            <button
              key={phase}
              onClick={() => togglePhase(phase)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200
                ${isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }
                ${count === 0 ? 'opacity-50' : ''}
              `}
            >
              {phase} ({count})
            </button>
          );
        })}
      </motion.div>

      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl border-dashed bg-muted/30">
          <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground">
            {selectedPhases.size > 0
              ? 'Nenhum cliente nessa fase. Tente limpar os filtros.'
              : 'Tente buscar com outras palavras.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredClients.map((client, i) => {
            const isCompleted = client.status === 'concluido';
          
          return (
            <motion.div key={client.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}>
              <Card 
                className={`glass-card hover:shadow-md transition-all cursor-pointer relative overflow-hidden group 
                  ${isCompleted ? 'opacity-70 grayscale hover:grayscale-0' : 'hover:border-primary/50 hover:scale-[1.02]'}
                `}
                onClick={() => handleSelectClient(client.id)}
              >
                {/* Accent Line */}
                <div className={`absolute top-0 left-0 w-1 h-full ${isCompleted ? 'bg-muted-foreground' : 'bg-primary'} transition-colors`} />
                
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex flex-col pl-3">
                    <span className="font-bold text-base md:text-lg text-foreground truncate max-w-[200px]" title={client.client_name}>
                      {client.client_name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={client.client_email}>
                      {client.client_email}
                    </span>
                    {client.current_phase && (
                      <span className="text-[10px] bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded mt-1.5 w-max">
                        {client.current_phase}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Circle className="w-5 h-5 text-primary fill-primary/20" />
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}
