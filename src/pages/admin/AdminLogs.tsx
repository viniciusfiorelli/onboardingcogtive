import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Clock, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogs() {
  const { isAdmin } = useAdmin();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    
    // Carrega últimos 100 logs ordenados pelo mais recente
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, onboarding_projects(client_name)')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (!error && data) {
        setLogs(data);
      }
      setIsLoading(false);
    };

    fetchLogs();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Você não tem permissão para acessar os logs do sistema.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 mt-6 lg:mt-0">
      
      {/* HEADER */}
      <div className="mb-8 p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4">
         <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
           <Activity className="w-6 h-6 text-primary" />
         </div>
         <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Timeline de Operações</h1>
            <p className="text-sm text-muted-foreground">Rastro de auditoria e ações realizadas em todos os Hubs.</p>
         </div>
      </div>

      {/* FEED DE LOGS */}
      <Card className="glass-card shadow-xl overflow-hidden border-white/5">
        <div className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">Nenhuma atividade recente encontrada.</div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.02 }}
                    key={log.id} 
                    className="p-5 flex gap-4 hover:bg-white/5 transition-colors"
                  >
                     <div className="mt-1 flex-shrink-0">
                       <ShieldAlert className="w-4 h-4 text-primary/60" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[11px] font-bold text-primary tracking-widest uppercase truncate max-w-[200px] md:max-w-none">
                             {log.onboarding_projects?.client_name || 'Sistema Global'}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {format(new Date(log.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-white/90 leading-snug">
                          {log.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                          Operador: <span className="text-white/60">{log.actor_email}</span>
                        </p>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
