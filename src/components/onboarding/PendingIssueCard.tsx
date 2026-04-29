import { Card, CardContent } from '@/components/ui/card';
import { CustomerPendingIssue } from '@/types/onboarding';
import { CalendarClock, AlertCircle, Clock, CheckCircle2, Hourglass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

interface PendingIssueCardProps {
  issue: CustomerPendingIssue;
  index?: number;
}

export function PendingIssueCard({ issue, index = 0 }: PendingIssueCardProps) {
  const deadlineDate = parseISO(issue.deadline);
  const deadlineStr = format(deadlineDate, "dd 'de' MMM", { locale: ptBR });
  
  const isOverdue = deadlineDate < new Date() && issue.status !== 'concluida';
  const isDone = issue.status === 'concluida';

  const statusConfig = {
    aberta: { label: 'Aberta', color: 'bg-destructive/15 text-destructive border-destructive/30', icon: AlertCircle },
    em_andamento: { label: 'Em Andamento', color: 'bg-primary/20 text-primary border-primary/30', icon: Clock },
    aguardando_retorno: { label: 'Aguardando', color: 'bg-warning/15 text-warning border-warning/30', icon: Hourglass },
    concluida: { label: 'Concluída', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle2 },
  };

  const currentStatus = statusConfig[issue.status];
  const StatusIcon = currentStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Card className={cn(
        'glass-card-hover relative overflow-hidden h-full',
        isOverdue && 'border-destructive/30',
        isDone && 'opacity-60 grayscale-[0.5]'
      )}>
        {/* Accent bar for urgent issues */}
        <div className={cn(
          'absolute top-0 left-0 w-1.5 h-full rounded-l-lg',
          issue.status === 'aberta' ? 'bg-destructive' : 'bg-primary/30'
        )} />

        <CardContent className="p-5 pl-7 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className={cn('font-semibold text-sm leading-snug', isDone ? 'text-muted-foreground line-through' : 'text-foreground')}>
                {issue.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{issue.description}</p>
            </div>
            
            <div className={cn(
              "flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-lg border",
              currentStatus.color
            )}>
              <StatusIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border/40">
            <span className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-muted/50', 
              isOverdue && 'text-destructive bg-destructive/10'
            )}>
              {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
              {!isOverdue && <CalendarClock className="w-3.5 h-3.5" />}
              {isOverdue ? 'Atrasado' : 'Prazo'}: {deadlineStr}
            </span>
            
            <span className={cn(
               "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
               currentStatus.color
            )}>
              {currentStatus.label}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
