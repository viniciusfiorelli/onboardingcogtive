import { Milestone } from '@/types/onboarding';
import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
  milestone: Milestone;
  isLast: boolean;
}

export function TimelineItem({ milestone, isLast }: TimelineItemProps) {
  const date = new Date(milestone.plannedDate).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  });

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2',
          milestone.status === 'completed' && 'bg-success border-success text-success-foreground',
          milestone.status === 'in_progress' && 'border-primary bg-primary/20 text-primary',
          milestone.status === 'upcoming' && 'border-border bg-muted text-muted-foreground'
        )}>
          {milestone.status === 'completed' ? <Check className="w-4 h-4" /> :
           milestone.status === 'in_progress' ? <Clock className="w-4 h-4" /> :
           <Circle className="w-3 h-3" />}
        </div>
        {!isLast && (
          <div className={cn(
            'w-0.5 flex-1 min-h-[2rem]',
            milestone.status === 'completed' ? 'bg-success/50' : 'bg-border'
          )} />
        )}
      </div>
      <div className="pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={cn(
            'font-semibold text-sm',
            milestone.status === 'completed' ? 'text-foreground' :
            milestone.status === 'in_progress' ? 'text-primary' : 'text-muted-foreground'
          )}>
            {milestone.title}
          </h4>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
        <p className="text-xs text-muted-foreground mt-1">Responsável: {milestone.responsible}</p>
      </div>
    </div>
  );
}
