import { PhaseTimelineItem } from '@/components/onboarding/PhaseTimelineItem';
import { useProjectData } from '@/hooks/useProjectData';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Target, AlertTriangle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NextSteps() {
  const { isAdmin, selectedProjectId } = useAdmin();
  const { data: p, isLoading, error } = useProjectData();

  if (isAdmin && !selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Bem-vindo, Administrador</h2>
        <p className="text-muted-foreground">
          Para visualizar os próximos passos da implantação, por favor selecione um cliente no menu superior direito.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Erro ao carregar os próximos passos</h2>
        <p className="text-muted-foreground mt-2">{error?.message || "Projeto não encontrado"}</p>
      </div>
    );
  }

  const phases = p.phases || [];
  const completedPhases = phases.filter(ph => ph.status === 'completed');
  
  // Pegamos a fase atual para mostrar as ações mais urgentes
  const currentPhase = phases.find(ph => ph.status === 'current');
  
  // Ações imediatas (Checklists não concluídos da fase atual, ou globais se não houver fase)
  const pendingChecklists = p.checklistItems
    .filter(c => !c.checked && (!currentPhase || c.phaseName === currentPhase.name))
    .slice(0, 4);

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Próximos Passos</h1>
        <p className="text-sm text-muted-foreground mt-1">Cronograma simplificado da sua implantação</p>
      </motion.div>

      {/* Progress summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 bg-success/8 border border-success/15 rounded-full px-4 py-2 text-sm">
          <Target className="w-4 h-4 text-success" />
          <span className="text-foreground font-semibold">{completedPhases.length}</span>
          <span className="text-muted-foreground">fases concluídas</span>
        </div>
        <div className="flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-4 py-2 text-sm">
          <ArrowRight className="w-4 h-4 text-primary" />
          <span className="text-foreground font-semibold">{phases.length - completedPhases.length}</span>
          <span className="text-muted-foreground">fases restantes</span>
        </div>
      </motion.div>

      {/* Próximas ações - baseadas no Checklist do Pipefy */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <Card className="glass-card border-primary/15 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-0.5 gradient-primary" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              Ações Imediatas ({currentPhase?.name || 'Geral'})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingChecklists.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 bg-muted/20 border border-dashed rounded-lg">
                Não há tarefas mapeadas para a fase atual no momento.
              </p>
            ) : (
              pendingChecklists.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
                  className="flex flex-col gap-1 p-3.5 rounded-xl bg-muted/25 border border-border/25 hover:border-primary/15 transition-all"
                >
                  <p className="text-sm font-medium text-foreground">{c.itemText}</p>
                  {c.checklistLabel && (
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">{c.checklistLabel}</span>
                  )}
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cronograma Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {phases.map((ph, i) => {
                const stepChecklists = p.checklistItems.filter(c => c.phaseName === ph.name && (isAdmin ? true : !c.adminOnly));
                
                return (
                  <PhaseTimelineItem 
                    key={ph.id} 
                    phase={ph} 
                    checklistItems={stepChecklists}
                    isLast={i === phases.length - 1} 
                    index={i} 
                    nextMilestoneDate={ph.status === 'current' ? p.nextMilestoneDate : null}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
