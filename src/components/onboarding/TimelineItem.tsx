import { Milestone } from '@/types/onboarding';
import { Check, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TimelineItemProps {
  milestone: Milestone;
  isLast: boolean;
  index?: number;
}

export function TimelineItem({ milestone, isLast, index = 0 }: TimelineItemProps) {
  const date = new Date(milestone.plannedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const actualDate = milestone.actualDate
    ? new Date(milestone.actualDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all',
          milestone.status === 'completed' && 'bg-success border-success text-success-foreground shadow-md shadow-success/15',
          milestone.status === 'in_progress' && 'border-primary bg-primary/15 text-primary ring-4 ring-primary/8',
          milestone.status === 'upcoming' && 'border-border/50 bg-muted/60 text-muted-foreground/50'
        )}>
          {milestone.status === 'completed' ? <Check className="w-4 h-4" strokeWidth={3} /> :
           milestone.status === 'in_progress' ? <Loader2 className="w-4 h-4 animate-spin" /> :
           <Circle className="w-2.5 h-2.5 fill-current" />}
        </div>
        {!isLast && (
          <div className={cn(
            'w-0.5 flex-1 min-h-[1.5rem]',
            milestone.status === 'completed' ? 'bg-success/30' : 'bg-border/30'
          )} />
        )}
      </div>

      <div className={cn(
        'pb-6 flex-1 min-w-0 -mt-0.5',
        milestone.status === 'upcoming' && 'opacity-50'
      )}>
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={cn(
            'font-semibold text-sm',
            milestone.status === 'current' ? 'text-primary' : 'text-foreground'
          )}>
            {milestone.title}
          </h4>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            milestone.status === 'completed' ? 'bg-success/10 text-success' :
            milestone.status === 'in_progress' ? 'bg-primary/10 text-primary' :
            'bg-muted text-muted-foreground'
          )}>
            {date}
          </span>
          {actualDate && actualDate !== date && (
            <span className="text-[10px] text-success">✓ {actualDate}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{milestone.description}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">{milestone.responsible}</p>
      </div>
    </motion.div>
  );
}
