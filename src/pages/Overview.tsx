import { useProjectData } from '@/hooks/useProjectData';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Circle, Clock, Building, Calendar, Package, AlertTriangle, Users, Activity, Zap, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/onboarding/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generatePreparationTemplate } from '@/utils/checklistEngine';

export default function Overview() {
  const { isAdmin, selectedProjectId } = useAdmin();
  const { data: p, isLoading, error } = useProjectData();
  const navigate = useNavigate();

  if (isAdmin && !selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 glow-sm">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-2">Bem-vindo, Administrador</h2>
        <p className="text-muted-foreground text-sm">
          Para visualizar os dados da implantação, por favor selecione um cliente no menu superior direito.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin glow-primary" />
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Erro ao carregar projeto</h2>
        <p className="text-muted-foreground mt-2">{error?.message || "Projeto não encontrado"}</p>
      </div>
    );
  }

  const phases = p.phases;
  
  const norm = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  const isWrapupOrDone = norm(p.currentPhase || '') === norm('Wrap-up') || norm(p.currentPhase || '') === norm('Concluído');
  const isTriagem = norm(p.currentPhase || '') === norm('Triagem');

  let displayPhaseName = p.currentPhase || '';
  if (isWrapupOrDone) displayPhaseName = 'Concluído';
  else if (isTriagem) displayPhaseName = 'Kick-off';

  const visualProgress = isWrapupOrDone ? 100 : p.progress;

  const openIssues = p.pendingIssues.filter(i => i.status !== 'concluida').length;
  
  // Sincronizar com Success Hub: contar apenas itens visíveis, da fase atual e NÃO técnicos
  const technicalRegex = /bug|melhoria|solicitação.*produto|monitoring|interno|id_pipefy|alinhamento.*interno|revisita|atraso|🔴|wrap-up|pendência/i;
  
  let checklistPending = 0;
  
  if (norm(p.currentPhase || '') === norm("Preparação")) {
      const { visibleItems } = generatePreparationTemplate(p, {});
      checklistPending = visibleItems.filter(i => !p.nativeChecklistStates?.[i.id]).length;
  } else {
      checklistPending = p.checklistItems.filter(c => 
        !c.checked && 
        c.clientVisible && 
        !c.adminOnly &&
        norm(c.phaseName) === norm(p.currentPhase || '') &&
        !technicalRegex.test(c.checklistLabel || '') &&
        !technicalRegex.test(c.itemText || '')
      ).length;
  }

  const isValidKickoff = p.kickoffDate && p.kickoffDate.trim() !== '';
  const startDate = isValidKickoff ? new Date(p.kickoffDate) : new Date(p.createdAt);
  const today = new Date();
  const daysInOnboarding = Math.max(0, differenceInDays(today, startDate));

  let nextMilestoneText = '—';
  const nextDbMilestone = p.milestones.find(m => m.status === 'in_progress' || m.status === 'upcoming');

  if (p.nextMilestoneDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const targetDate = new Date(p.nextMilestoneDate);
    targetDate.setHours(0, 0, 0, 0);

    const days = differenceInDays(targetDate, today);
    if (days === 0) nextMilestoneText = 'Hoje';
    else if (days === 1) nextMilestoneText = 'Amanhã';
    else if (days > 1) nextMilestoneText = `Em ${days} dias`;
    else nextMilestoneText = format(new Date(p.nextMilestoneDate), "dd/MM", { locale: ptBR });
  } else if (nextDbMilestone) {
    nextMilestoneText = nextDbMilestone.title;
  } else {
    const nextPhaseObj = p.phases.find(ph => ph.status === 'upcoming');
    nextMilestoneText = nextPhaseObj ? `${nextPhaseObj.name}` : 'Eventos concluídos';
  }

  const isGenericSummary = !p.summary || p.summary.startsWith('Card originado');
  const totalOpen = openIssues + checklistPending;
  const nextEventText = p.nextMilestoneDate 
    ? `, próximo evento: ${format(new Date(p.nextMilestoneDate), "dd/MM", { locale: ptBR })}` 
    : (nextDbMilestone ? `, próximo marco: ${nextDbMilestone.title}` : '');

  let dynamicSummary = "";
  const isAssistida = norm(p.currentPhase || '') === norm('Operação assistida');

  if (isAssistida) {
    dynamicSummary = "O Go-Live foi um sucesso! Agora entramos na fase de acompanhamento próximo. Nossa equipe está monitorando sua operação em tempo real para tirar dúvidas, ajustar processos e garantir que você extraia o máximo valor da nossa tecnologia.";
  } else if (isWrapupOrDone) {
    dynamicSummary = "Jornada de implantação concluída com sucesso! Obrigado pela parceria e confiança na Cogtive.";
  } else if (isGenericSummary) {
    dynamicSummary = `Projeto em fase de ${displayPhaseName || 'Preparação'}${totalOpen > 0 ? ` — ${totalOpen} item${totalOpen > 1 ? 's' : ''} do checklist em aberto` : ' — sem itens pendentes'}${nextEventText}.`;
  } else {
    dynamicSummary = p.summary;
  }

  const displayPhases = phases.filter(ph => {
    const n = norm(ph.name);
    return n !== norm('Triagem') && n !== norm('Wrap-up');
  }).map(ph => {
    let s = ph.status;
    const n = norm(ph.name);
    if (isWrapupOrDone) {
      s = n === norm('Concluído') ? 'current' : 'completed';
    } else if (isTriagem) {
      s = n === norm('Kick-off') ? 'current' : 'upcoming';
    }
    return { ...ph, status: s };
  });

  const basePath = isAdmin ? '/admin' : '/client';

  const metrics = [
    { label: "Próximo Marco", value: nextMilestoneText, icon: Calendar, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { label: "Checklist Pendente", value: openIssues + checklistPending, icon: AlertTriangle, color: "text-orange-400 bg-orange-500/10 border-orange-500/20", link: `${basePath}/pending` },
    { label: "Dias em Implantação", value: `${daysInOnboarding} ${daysInOnboarding === 1 ? 'd' : 'd'}`, icon: Clock, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  ];

  // Adocao e Uso do Sistema
  const contractedPoints = p.contractedPoints || 0;
  const activePoints = p.activePoints || 0;
  const systemUsage = p.systemUsage || 0;
  const coveragePercent = contractedPoints > 0 ? Math.round((activePoints / contractedPoints) * 100) : 0;
  const adoptionIsHealthy = systemUsage >= 80;
  const adoptionAttention = systemUsage >= 50 && systemUsage < 80;

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Visão Global</h1>
        <p className="text-sm text-muted-foreground mt-1">Sua trajetória de Implantação e sucesso com a Cogtive</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Painel Central: Implantação */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <Card className="glass-card shadow-lg overflow-hidden relative min-h-full">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
            <CardContent className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-black tracking-tight drop-shadow-sm">{p.clientName}</h2>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-muted-foreground text-sm flex items-center gap-2 font-medium">
                    <Building className="w-4 h-4" /> {p.plantName} — {p.city}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-56 bg-black/20 p-5 rounded-2xl border border-white/5 shadow-inner">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Progresso</span>
                    <span className="font-black text-primary text-lg">{visualProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${visualProgress}%` }} 
                      transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                      className="h-full bg-primary relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-8 border-t border-white/5 relative">
                <div className="absolute top-8 left-[5%] right-[5%] h-1 bg-black/40 rounded-full z-0" />
                
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${Math.max(0, visualProgress - 10)}%` }} 
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  className="absolute top-8 left-[5%] h-1 bg-primary rounded-full z-0 glow-primary" 
                />

                <div className="relative z-10 flex justify-between">
                  {displayPhases.map((phase, index) => {
                    const isCompleted = phase.status === 'completed';
                    const isCurrent = phase.status === 'current';
                    const isPending = phase.status === 'upcoming';

                    return (
                      <div key={phase.id} className="flex flex-col items-center flex-1 group">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center border-2 mb-3 bg-[#0c0f1a] transition-all duration-300 relative z-20
                          ${isCompleted ? 'border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]' : ''}
                          ${isCurrent ? 'border-primary bg-primary/20 text-primary glow-sm scale-110' : ''}
                          ${isPending ? 'border-white/10 text-muted-foreground/30 bg-black/50' : ''}
                        `}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                           isCurrent ? <PlayCircle className="w-4 h-4 fill-primary" /> : 
                           <span className="text-xs font-bold">{index + 1}</span>}
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-bold text-center uppercase tracking-widest leading-tight hidden md:block max-w-20
                          ${isCurrent ? 'text-foreground' : 'text-muted-foreground/50'}
                        `}>
                          {phase.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* [PAINEL OCULTO] - Adoção e Benchmark removidos para foco no Pipefy */}
        {false && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="lg:col-span-1 border-l lg:border-l-0 lg:border-t-0 border-white/5">
           <Card className="glass-card-hover h-full bg-gradient-to-b from-card to-background relative overflow-hidden">
             
             {/* Dynamic usage glow */}
             <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-40 rounded-full ${adoptionIsHealthy ? 'bg-success' : adoptionAttention ? 'bg-warning' : 'bg-destructive'} -mr-16 -mt-16`} />

             <CardHeader className="pb-4">
               <CardTitle className="text-base font-bold flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Activity className="w-5 h-5 text-primary" /> 
                   Adoção
                 </div>
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                
                <div>
                   <div className="flex justify-between mb-1.5">
                     <span className="text-xs font-semibold uppercase text-muted-foreground tracking-widest">Utilização Real</span>
                     <span className={`text-sm font-black ${adoptionIsHealthy ? 'text-success' : adoptionAttention ? 'text-warning' : 'text-destructive'}`}>{systemUsage}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                     <div className={`h-full ${adoptionIsHealthy ? 'bg-success' : adoptionAttention ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${systemUsage}%` }} />
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                   <div className="flex justify-between mb-1.5">
                     <span className="text-xs font-semibold uppercase text-muted-foreground tracking-widest flex items-center gap-1"><Zap className="w-3 h-3"/> Cobertura</span>
                     <span className="text-sm font-black text-foreground">{coveragePercent}%</span>
                   </div>
                   <p className="text-xs text-muted-foreground mb-2 opacity-80">{activePoints} de {contractedPoints} licenças/pontos</p>
                   <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500" style={{ width: `${coveragePercent}%` }} />
                   </div>
                </div>

                <div className="mt-8 bg-white/5 p-4 rounded-xl border border-white/5">
                   <p className="text-xs leading-snug font-medium text-muted-foreground">
                    O acompanhamento contínuo da utilização é a chave para o ROI desejado. <span className="text-foreground">Sua saúde transacional é atualizada automaticamente em tempo real.</span>
                   </p>
                </div>

             </CardContent>
           </Card>
        </motion.div>
        )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {metrics.map((metric, i) => (
           <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (i * 0.1), duration: 0.4 }}>
             <Card 
               className={`glass-card-hover group cursor-pointer h-full transition-all`}
               onClick={() => metric.link && navigate(metric.link)}
             >
               <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-2xl border ${metric.color} group-hover:scale-105 transition-transform`}>
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{metric.label}</p>
                    <p className={cn(
                      "font-black text-foreground drop-shadow-sm",
                      metric.value.toString().length > 15 ? 'text-lg' : 'text-2xl'
                    )}>
                      {metric.value}
                    </p>
                  </div>
               </CardContent>
             </Card>
           </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
          <Card className="glass-card h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <CardHeader className="pb-3 border-b border-white/5 px-6">
              <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2 opacity-80">
                <Clock className="w-4 h-4 text-primary" />
                Resumo da Implantação
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full blur-sm" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />
                <p className="text-base font-medium text-foreground/90 pl-6 leading-relaxed">
                  "{dynamicSummary}"
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-3 border-b border-white/5 px-6">
              <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2 opacity-80">
                <Package className="w-4 h-4 text-primary" />
                Módulos Contratados
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              <div className="flex flex-wrap gap-2">
                {p.contractedModules.map((mod) => (
                  <Badge key={mod} variant="secondary" className="px-4 py-1.5 rounded-full text-xs font-semibold bg-black/20 border-white/10 hover:bg-black/30 hover:border-white/20 transition-colors cursor-default">
                    {mod}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
