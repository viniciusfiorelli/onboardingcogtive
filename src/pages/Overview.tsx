import { mockProject } from '@/data/mockData';
import { ProjectCard } from '@/components/onboarding/ProjectCard';
import { ProgressStepper } from '@/components/onboarding/ProgressStepper';
import { SummaryCards } from '@/components/onboarding/SummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Overview() {
  const p = mockProject;
  const pendingCount = p.pendingIssues.filter(i => i.status !== 'concluida').length;
  const trainingCount = p.trainings.filter(t => t.status === 'agendado').length;
  const deliveredCount = p.deliveries.filter(d => d.status === 'concluida').length;
  const nextActionsCount = p.milestones.filter(m => m.status === 'upcoming' || m.status === 'in_progress').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe o progresso da sua implantação</p>
      </div>

      <ProjectCard project={p} />

      {/* Stepper */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Fases da Implantação</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressStepper phases={p.phases} />
        </CardContent>
      </Card>

      <SummaryCards
        pendingCount={pendingCount}
        trainingCount={trainingCount}
        deliveredCount={deliveredCount}
        nextActionsCount={nextActionsCount}
      />

      {/* Resumo */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumo do Momento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{p.summary}</p>
        </CardContent>
      </Card>

      {/* Módulos */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Módulos Contratados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {p.contractedModules.map(m => (
              <Badge key={m} variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                {m}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
