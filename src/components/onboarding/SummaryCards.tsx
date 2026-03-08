import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  accent?: 'primary' | 'warning' | 'success' | 'default';
}

function SummaryCard({ title, value, description, icon, accent = 'default' }: SummaryCardProps) {
  const accentStyles = {
    primary: 'border-primary/30',
    warning: 'border-warning/30',
    success: 'border-success/30',
    default: 'border-border/50',
  };

  return (
    <Card className={cn('glass-card', accentStyles[accent])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={cn(
            'p-2 rounded-lg',
            accent === 'primary' && 'bg-primary/10 text-primary',
            accent === 'warning' && 'bg-warning/10 text-warning',
            accent === 'success' && 'bg-success/10 text-success',
            accent === 'default' && 'bg-muted text-muted-foreground'
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryCardsProps {
  pendingCount: number;
  trainingCount: number;
  deliveredCount: number;
  nextActionsCount: number;
}

export function SummaryCards({ pendingCount, trainingCount, deliveredCount, nextActionsCount }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Pendências"
        value={pendingCount}
        description="itens que dependem da sua equipe"
        icon={<AlertTriangle className="w-5 h-5" />}
        accent="warning"
      />
      <SummaryCard
        title="Treinamentos"
        value={trainingCount}
        description="sessões agendadas"
        icon={<GraduationCap className="w-5 h-5" />}
        accent="primary"
      />
      <SummaryCard
        title="Entregas"
        value={deliveredCount}
        description="etapas concluídas"
        icon={<CheckCircle2 className="w-5 h-5" />}
        accent="success"
      />
      <SummaryCard
        title="Próximas ações"
        value={nextActionsCount}
        description="previstas para as próximas semanas"
        icon={<ArrowRight className="w-5 h-5" />}
        accent="default"
      />
    </div>
  );
}
