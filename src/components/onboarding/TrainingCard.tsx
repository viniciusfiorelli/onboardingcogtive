import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { TrainingSession } from '@/types/onboarding';
import { CalendarClock, User } from 'lucide-react';

const typeLabels: Record<string, string> = {
  operacional: 'Operacional',
  oee: 'OEE',
  modulo_especifico: 'Módulo Específico',
  reciclagem: 'Reciclagem',
  alinhamento_lideranca: 'Alinhamento Liderança',
};

interface TrainingCardProps {
  training: TrainingSession;
}

export function TrainingCard({ training }: TrainingCardProps) {
  const date = new Date(training.plannedDate).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <Card className="glass-card hover:border-primary/30 transition-all">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground">{training.name}</h3>
          <StatusBadge status={training.status} />
        </div>
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground border border-border/50">
          {typeLabels[training.type] || training.type}
        </span>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />{date}</span>
          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{training.responsible}</span>
        </div>
        {training.observation && (
          <p className="text-xs text-muted-foreground italic bg-muted/50 rounded p-2">{training.observation}</p>
        )}
      </CardContent>
    </Card>
  );
}
