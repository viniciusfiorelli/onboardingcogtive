import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Clock, ShieldAlert, Bot, Search, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogs() {
  const { isAdmin } = useAdmin();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    if (!isAdmin) return;
    
    // Carrega últimos 1000 logs para garantir uma boa base analítica
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, onboarding_projects(id, client_name)')
        .order('created_at', { ascending: false })
        .limit(1000);
        
      console.log('DEBUG: Logs fetched:', data);
      if (error) console.error('DEBUG: Error fetching logs:', error);
        
      if (!error && data) {
        setLogs(data);
      }
      setIsLoading(false);
    };

    fetchLogs();
  }, [isAdmin]);

  const projects = useMemo(() => {
    const map = new Map<string, { id: string, name: string, logCount: number, lastActivity: Date }>();
    
    logs.forEach(log => {
      if (!log.onboarding_projects) return;
      
      const pId = log.onboarding_projects.id;
      if (!map.has(pId)) {
        map.set(pId, {
          id: pId,
          name: log.onboarding_projects.client_name,
          logCount: 0,
          lastActivity: new Date(log.created_at)
        });
      }
      
      const p = map.get(pId)!;
      p.logCount++;
      const logDate = new Date(log.created_at);
      if (logDate > p.lastActivity) {
        p.lastActivity = logDate;
      }
    });

    return Array.from(map.values())
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }, [logs, searchTerm]);

  const filteredLogs = useMemo(() => {
    if (!selectedProjectId) return [];
    return logs.filter(log => log.onboarding_projects?.id === selectedProjectId);
  }, [logs, selectedProjectId]);

  const handleSelectClient = (id: string) => {
    setSelectedProjectId(id);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedProjectId(null);
    setViewMode('list');
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Você não tem permissão para acessar os logs do sistema.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 mt-6 lg:mt-0">
      
      {/* HEADER */}
      <div className="mb-8 p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
             <Activity className="w-6 h-6 text-primary" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Registro de Auditoria</h1>
              <p className="text-sm text-muted-foreground">Monitoramento em tempo real de modificações por cliente.</p>
           </div>
         </div>
         
         {viewMode === 'list' && (
           <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 focus-visible:ring-primary/30"
              />
           </div>
         )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-24"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <AnimatePresence mode="wait">
          
          {/* VISÃO DE LISTA DE CLIENTES */}
          {viewMode === 'list' && (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {projects.length === 0 ? (
                <div className="col-span-full py-20 text-center text-muted-foreground bg-black/20 rounded-2xl border border-white/5">
                   <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
                   Nenhuma atividade encontrada para os filtros atuais.
                </div>
              ) : (
                projects.map(p => (
                  <Card 
                    key={p.id} 
                    onClick={() => handleSelectClient(p.id)}
                    className="glass-card-hover cursor-pointer border border-white/5 overflow-hidden group"
                  >
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-muted-foreground">
                          <Hash className="w-3 h-3" /> {p.logCount} registros
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">{p.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-auto pt-4 border-t border-white/5">
                        <Clock className="w-3.5 h-3.5" /> 
                        Última: {format(p.lastActivity, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </Card>
                ))
              )}
            </motion.div>
          )}

          {/* VISÃO DE DETALHE DA TIMELINE */}
          {viewMode === 'detail' && (
            <motion.div 
              key="detail-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Button 
                variant="ghost" 
                onClick={handleBackToList}
                className="hover:bg-white/5 text-muted-foreground hover:text-white -ml-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar para Base de Clientes
              </Button>
              
              <Card className="glass-card border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-black/40 flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Histórico de {projects.find(p => p.id === selectedProjectId)?.name}
                  </h2>
                </div>
                
                <div className="p-0">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-3">
                      <Clock className="w-8 h-8 text-muted-foreground/30" />
                      <p>O histórico deste cliente está limpo.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {filteredLogs.map((log, i) => {
                        const isPipefy = log.actor_email === 'Automacao_Pipefy';
                        
                        return (
                          <div key={log.id} className={`p-6 flex gap-4 transition-colors ${isPipefy ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-white/5'}`}>
                            <div className="mt-1 flex-shrink-0">
                               {isPipefy ? (
                                 <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                   <Bot className="w-5 h-5" />
                                 </div>
                               ) : (
                                 <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground shadow-inner">
                                   <ShieldAlert className="w-4 h-4" />
                                 </div>
                               )}
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="text-sm font-semibold text-white leading-snug">
                                    {log.description}
                                  </p>
                                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5 whitespace-nowrap bg-black/30 px-2.5 py-1 rounded-md ml-4">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    {format(new Date(log.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Responsável:</span>
                                  <span className={`text-[11px] font-bold ${isPipefy ? 'text-blue-400' : 'text-primary'}`}>
                                    {isPipefy ? 'Automação Externa' : log.actor_email}
                                  </span>
                                </div>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
          
        </AnimatePresence>
      )}
    </div>
  );
}
