import { mockProject } from '@/data/mockData';
import { ProjectCard } from '@/components/onboarding/ProjectCard';
import { ProgressStepper } from '@/components/onboarding/ProgressStepper';
import { SummaryCards } from '@/components/onboarding/SummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, Layers } from 'lucide-react';

export default function Overview() {
  const p = mockProject;
  const pendingCount = p.pendingIssues.filter(i => i.status !== 'concluida').length;
  const trainingCount = p.trainings.filter(t => t.status === 'agendado').length;
  const deliveredCount = p.deliveries.filter(d => d.status === 'concluida').length;
  const nextActionsCount = p.milestones.filter(m => m.status === 'upcoming' || m.status === 'in_progress').length;

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe o progresso da sua implantação em tempo real</p>
      </motion.div>

      <ProjectCard project={p} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Fases da Implantação</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <ProgressStepper phases={p.phases} />
          </CardContent>
        </Card>
      </motion.div>

      <SummaryCards
        pendingCount={pendingCount}
        trainingCount={trainingCount}
        deliveredCount={deliveredCount}
        nextActionsCount={nextActionsCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Resumo */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
          <Card className="glass-card border-primary/15 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Resumo do Momento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.summary}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Módulos */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Módulos Contratados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {p.contractedModules.map(m => (
                  <Badge key={m} variant="secondary" className="bg-primary/8 text-primary border border-primary/15 font-medium text-xs px-3 py-1">
                    {m}
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
