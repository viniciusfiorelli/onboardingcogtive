import { mockProject } from '@/data/mockData';
import { TimelineItem } from '@/components/onboarding/TimelineItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/onboarding/StatusBadge';

export default function NextSteps() {
  const milestones = mockProject.milestones;
  const upcoming = milestones.filter(m => m.status === 'in_progress' || m.status === 'upcoming').slice(0, 3);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Próximos Passos</h1>
        <p className="text-sm text-muted-foreground mt-1">Cronograma simplificado da sua implantação</p>
      </div>

      {/* Próximas ações */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            Próximas ações imediatas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.map(m => (
            <div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">{m.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {new Date(m.plannedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
                <StatusBadge status={m.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Full Timeline */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cronograma Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <TimelineItem key={m.id} milestone={m} isLast={i === milestones.length - 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
