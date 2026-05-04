import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Clock, ShieldAlert, Bot, Building, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogs() {
  const { isAdmin } = useAdmin();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    
    // Carrega últimos 500 logs para ter uma boa amostragem por cliente
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, onboarding_projects(id, client_name)')
        .order('created_at', { ascending: false })
        .limit(500);
        
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
    if (!selectedProjectId) return logs;
    return logs.filter(log => log.onboarding_projects?.id === selectedProjectId);
  }, [logs, selectedProjectId]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Você não tem permissão para acessar os logs do sistema.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 mt-6 lg:mt-0">
      
      {/* HEADER */}
      <div className="mb-8 p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4">
         <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
           <Activity className="w-6 h-6 text-primary" />
         </div>
         <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Timeline de Operações</h1>
            <p className="text-sm text-muted-foreground">Rastro de auditoria e sincronização do Pipefy por cliente.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SIDEBAR: Lista de Clientes */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input 
               placeholder="Filtrar clientes..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 bg-black/40 border-white/5 focus-visible:ring-primary/30"
             />
          </div>

          <Card className="glass-card shadow-xl overflow-hidden border-white/5 flex flex-col h-[600px]">
            <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filtro de Projeto</span>
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              <button
                onClick={() => setSelectedProjectId(null)}
                className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between transition-colors ${!selectedProjectId ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${!selectedProjectId ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-bold ${!selectedProjectId ? 'text-primary' : 'text-white'}`}>Visão Global</span>
                </div>
                <span className="text-[10px] text-muted-foreground bg-black/30 px-2 py-0.5 rounded-full">{logs.length}</span>
              </button>

              {isLoading ? (
                <div className="flex justify-center p-6"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : projects.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs">Nenhum cliente encontrado.</div>
              ) : (
                projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between transition-colors group ${selectedProjectId === p.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="flex flex-col overflow-hidden pr-2">
                      <span className={`text-sm font-bold truncate transition-colors ${selectedProjectId === p.id ? 'text-white' : 'text-muted-foreground group-hover:text-white'}`}>{p.name}</span>
                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {format(p.lastActivity, "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <span className={`text-[10px] flex-shrink-0 px-2 py-0.5 rounded-full ${selectedProjectId === p.id ? 'bg-primary/20 text-primary' : 'bg-black/30 text-muted-foreground'}`}>
                      {p.logCount}
                    </span>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* FEED DE LOGS */}
        <div className="lg:col-span-2">
          <Card className="glass-card shadow-xl overflow-hidden border-white/5 h-[600px] flex flex-col">
            <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                {selectedProjectId 
                  ? `Timeline: ${projects.find(p => p.id === selectedProjectId)?.name}`
                  : 'Timeline Global'}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-24 text-muted-foreground flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p>Nenhuma atividade registrada para esta visualização.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {filteredLogs.map((log, i) => {
                      const isPipefy = log.actor_email === 'Automacao_Pipefy';
                      
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: i * 0.01 }}
                          key={log.id} 
                          className={`p-5 flex gap-4 transition-colors ${isPipefy ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-white/5'}`}
                        >
                           <div className="mt-1 flex-shrink-0">
                             {isPipefy ? (
                               <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                 <Bot className="w-4 h-4" />
                               </div>
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
                                 <ShieldAlert className="w-4 h-4" />
                               </div>
                             )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                {!selectedProjectId && (
                                  <p className="text-[11px] font-bold text-primary tracking-widest uppercase truncate max-w-[200px] md:max-w-none">
                                     {log.onboarding_projects?.client_name || 'Sistema Global'}
                                  </p>
                                )}
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 whitespace-nowrap ml-auto">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(log.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              <p className={`text-sm font-semibold leading-snug ${isPipefy ? 'text-blue-100' : 'text-white/90'}`}>
                                {log.description}
                              </p>
                              <p className="text-[11px] text-muted-foreground/60 mt-1.5 flex items-center gap-1">
                                Origem: <span className={isPipefy ? 'text-blue-400 font-bold' : 'text-white/60'}>
                                  {isPipefy ? 'Sincronização Pipefy' : log.actor_email}
                                </span>
                              </p>
                           </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
