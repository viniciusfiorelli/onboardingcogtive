import { useState, useMemo, useEffect } from 'react';
import { useProjectData } from '@/hooks/useProjectData';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, PlayCircle, Loader2, Target, Check, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useActivityLog } from '@/hooks/useActivityLog';
import { generatePreparationTemplate } from '@/utils/checklistEngine';
import { shootConfetti } from '@/utils/confetti';

export default function PendingIssues() {
  const { isAdmin, selectedProjectId } = useAdmin();
  const { data: p, isLoading, error } = useProjectData();
  const { logActivity } = useActivityLog();
  
  // Estado otimista para os checkboxes e trava de double-click
  const [optimisticChecks, setOptimisticChecks] = useState<Record<string, boolean>>({});
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  const handleCheck = async (itemId: string, currentStatus: boolean, itemText: string) => {
    if (loadingItems[itemId]) return; // Evita Race Conditions (Double Clicks rápidos)
    setLoadingItems(prev => ({ ...prev, [itemId]: true }));

    // 1. Toca Feedback Visual imediato
    setOptimisticChecks(prev => ({ ...prev, [itemId]: !currentStatus }));
    
    const newStatus = !currentStatus;
    const actionDesc = newStatus ? `marcou como concluído: "${itemText}"` : `desmarcou: "${itemText}"`;
    
    // Haptic/audio mini feedback
    if (!currentStatus) {
      toast.success('Fantástico!', { description: 'Item validado e sincronizado com Sucesso!', duration: 2500 });
    }

    // Prevenção da Demo: Itens dinâmicos criados no Frontend agora salvam direto no DB!
    if (itemId.startsWith('demo_')) {
        try {
           const { error } = await supabase.rpc('toggle_native_checklist', {
               p_project_id: p?.id,
               p_item_id: itemId,
               p_is_checked: newStatus
           });
           if (error) throw error;
           logActivity(p?.id || '', 'CHECKLIST_TOGGLE', actionDesc);
        } catch (err) {
           setOptimisticChecks(prev => ({ ...prev, [itemId]: currentStatus }));
           toast.error('Erro ao salvar no Hub', { description: 'Falha de conexão com o banco local.' });
           console.error(err);
        } finally {
           setLoadingItems(prev => ({ ...prev, [itemId]: false }));
        }
        return;
    }

    try {
      const { error } = await supabase.functions.invoke('update-pipefy-checklist', {
        body: { checklistItemId: itemId, isChecked: newStatus }
      });
      
      if (error) throw error;
      logActivity(p?.id || '', 'CHECKLIST_TOGGLE', actionDesc);
    } catch (err: any) {
      // Reverte a UI em caso de falha real
      setOptimisticChecks(prev => ({ ...prev, [itemId]: currentStatus }));
      toast.error('Erro de Sincronização', { description: 'O Pipefy recusou a atualização. Tente novamente.' });
      console.error(err);
    } finally {
      setLoadingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  if (isAdmin && !selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6"><AlertTriangle className="w-8 h-8 text-primary" /></div>
        <h2 className="text-2xl font-bold mb-2">Administrador</h2>
        <p className="text-muted-foreground">Selecione uma conta no topo para ver as tarefas dos clientes.</p>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;
  if (error || !p) return <div className="text-center py-20 text-destructive font-bold">Erro de conexão visual.</div>;

  const allChecklists = p.checklistItems || [];

  const norm = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  const isPreparacao = norm(p.currentPhase || '') === norm('Preparação') || norm(p.currentPhase || '') === norm('Preparação em foco');
  
  let groupedChecklists: Record<string, any[]> = {};
  let totalItems = 0;
  let completedItems = 0;
  let hasItems = false;

  if (isPreparacao) {
      // 1. Extrair Variáveis Reais do Kick-off
      const getKickoffVal = (label: string) => allChecklists.find(i => i.phaseName === 'Kick-off' && normalize(i.checklistLabel || '').includes(normalize(label)) && i.checked)?.itemText || '';
      const { visibleItems, grouped } = generatePreparationTemplate(p, optimisticChecks);
      groupedChecklists = grouped;
      
      totalItems = visibleItems.length;
      completedItems = visibleItems.filter(i => {
         const state = optimisticChecks[i.id] !== undefined ? optimisticChecks[i.id] : (p?.nativeChecklistStates?.[i.id] || false);
         return state;
      }).length;
      hasItems = visibleItems.length > 0;
  } else {
      // Lógica Comum (Outras Fases leem do Pipefy)
      const currentPhaseChecklists = allChecklists.filter(item => {
        if (isAdmin) return item.phaseName === p.currentPhase;
        return !item.adminOnly && item.phaseName === p.currentPhase;
      });

      groupedChecklists = currentPhaseChecklists.reduce((acc, item) => {
          const category = item.checklistLabel || 'Informações Gerais';
          if (!acc[category]) acc[category] = [];
          acc[category].push({ ...item, isDemo: false });
          return acc;
      }, {} as Record<string, any[]>);

      hasItems = currentPhaseChecklists.length > 0;
      totalItems = currentPhaseChecklists.length;
      completedItems = currentPhaseChecklists.filter(i => 
         optimisticChecks[i.id] !== undefined ? optimisticChecks[i.id] : i.checked
      ).length;
  }

  const progressRatio = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

  // Gamification: Efeito de Celebração de Fase Concluída
  const [hasShotConfetti, setHasShotConfetti] = useState(false);
  useEffect(() => {
    if (progressRatio === 100 && totalItems > 0 && !hasShotConfetti && p?.currentPhase !== 'Concluído') {
       shootConfetti();
       setHasShotConfetti(true);
    } else if (progressRatio < 100) {
       setHasShotConfetti(false);
    }
  }, [progressRatio, totalItems, hasShotConfetti, p?.currentPhase]);

  // Texto customizado dependendo da fase (Ex: Operação Assistida)
  const isAssistida = p.currentPhase?.toLowerCase() === 'operação assistida' || p.currentPhase?.toLowerCase() === 'operacao assistida';
  const pageTitle = isAssistida ? "Sucesso & Operação" : "O que falta fazer?";
  const phaseDescription = isAssistida 
    ? "O Go-Live foi um sucesso! Agora entramos na fase de acompanhamento próximo. Nossa equipe está monitorando sua operação em tempo real para tirar dúvidas, ajustar processos e garantir que você extraia o máximo valor da nossa tecnologia."
    : `Mergulhe na fase de ${p.currentPhase || "Preparação"}. Selecione e conclua as tarefas que a sua equipe já realizou na vida real.`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      
      {/* Header Focado */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 mt-6">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
          {isAssistida ? (
            <span className="text-foreground/90">{phaseDescription}</span>
          ) : (
            <>Mergulhe na fase de <strong className="text-primary">{p.currentPhase || "Preparação"}</strong>. Selecione e conclua as tarefas que a sua equipe já realizou na vida real.</>
          )}
        </p>
      </motion.div>

      {/* Cartão Central (Checklist Engine) */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card overflow-hidden shadow-2xl border-white/10 relative">
          
          {/* Header da Fase com Barra de Progresso Liquid */}
          <div className="bg-black/40 border-b border-white/5 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
            
            {/* Progress Liquid fill nas costas */}
            <motion.div 
               className="absolute top-0 left-0 bottom-0 bg-primary/10 z-0 border-r border-primary/30 shadow-[4px_0_20px_rgba(var(--primary),0.3)]"
               initial={{ width: 0 }}
               animate={{ width: `${progressRatio}%` }}
               transition={{ duration: 0.5, ease: 'easeOut' }}
            />

             <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-black mb-1">Missão Atual</h2>
                  <div className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    {p.currentPhase || "Fase Inicial"}
                    {progressRatio === 100 && <CheckCircle2 className="w-5 h-5 text-success inline animate-bounce" />}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-3xl font-black text-white tracking-tighter">
                     {completedItems} <span className="text-muted-foreground text-lg">/ {totalItems}</span>
                   </div>
                   <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Atividades Prontas</div>
                </div>
             </div>
          </div>

          <CardContent className="p-0 bg-black/20">
            {!hasItems ? (
              <div className="text-center py-24 px-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-30" />
                 <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="relative z-10"
                 >
                   <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                     <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">
                     {isAssistida ? "Tudo rodando perfeitamente!" : "Fase concluída ou sem pendências"}
                   </h3>
                   <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                     {isAssistida 
                       ? "Sua operação está fluindo e não existem checklists pendentes. Nossa equipe continua acompanhando tudo nos bastidores." 
                       : "Não encontramos tarefas táticas pendentes para este momento da sua jornada."}
                   </p>
                 </motion.div>
              </div>
            ) : (
              <div className="p-4 md:p-6 space-y-8 bg-black/20">
                 {Object.entries(groupedChecklists).map(([category, items], catIdx) => (
                    <motion.div 
                       key={category} 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: catIdx * 0.1 }}
                    >
                       <h3 className="text-sm font-black uppercase tracking-widest text-primary/80 mb-3 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-primary/60" />
                         {category}
                       </h3>
                       <div className="divide-y divide-white/5 bg-black/40 border border-white/5 rounded-xl overflow-hidden shadow-inner">
                         <AnimatePresence>
                           {items.map((item, i) => {
                             const isChecked = optimisticChecks[item.id] !== undefined ? optimisticChecks[item.id] : item.checked;
                             return (
                               <motion.div 
                                  key={item.id}
                                  layout
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className={`
                                    group relative p-4 flex items-start md:items-center gap-4 transition-all duration-300 cursor-pointer
                                    ${isChecked ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}
                                  `}
                                  onClick={() => handleCheck(item.id, isChecked, item.itemText)}
                               >
                                 <div className={`
                                    relative w-6 h-6 md:w-8 md:h-8 rounded-[8px] flex-shrink-0 flex items-center justify-center transition-all duration-500 overflow-hidden mt-0.5 md:mt-0
                                    border-2 shadow-lg
                                    ${isChecked ? 'bg-primary border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110' : 'border-white/20 bg-black/40 group-hover:border-primary/50 group-hover:bg-white/5 group-hover:scale-105'}
                                 `}>
                                   <AnimatePresence>
                                     {isChecked && (
                                       <motion.div 
                                         initial={{ scale: 0, opacity: 0 }} 
                                         animate={{ scale: 1, opacity: 1 }}
                                         exit={{ scale: 0, opacity: 0 }}
                                         className="absolute inset-0 flex items-center justify-center"
                                       >
                                         <Check className="w-4 h-4 md:w-5 md:h-5 text-black stroke-[3px]" />
                                       </motion.div>
                                     )}
                                   </AnimatePresence>
                                 </div>
                                 <div className="flex-1 min-w-0 pr-4">
                                   <p className={`
                                     text-sm md:text-base font-semibold transition-all duration-300 leading-snug
                                     ${isChecked ? 'text-muted-foreground line-through opacity-60' : 'text-white group-hover:text-primary'}
                                   `}>
                                     {item.itemText}
                                   </p>
                                 </div>
                                 <div className={`
                                   opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0
                                   ${isChecked ? 'hidden' : 'block'}
                                 `}>
                                    <div className="w-8 h-8 rounded-full bg-white/5 items-center justify-center hidden md:flex">
                                       <ChevronRight className="w-4 h-4 text-primary" />
                                    </div>
                                 </div>
                               </motion.div>
                             );
                           })}
                         </AnimatePresence>
                       </div>
                    </motion.div>
                 ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
