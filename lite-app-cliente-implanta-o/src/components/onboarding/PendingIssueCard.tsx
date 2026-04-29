import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, CategoryBadge } from './StatusBadge';
import { CustomerPendingIssue } from '@/types/onboarding';
import { CalendarClock, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PendingIssueCardProps {
  issue: CustomerPendingIssue;
  index?: number;
}

export function PendingIssueCard({ issue, index = 0 }: PendingIssueCardProps) {
  const deadline = new Date(issue.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const isOverdue = new Date(issue.deadline) < new Date() && issue.status !== 'concluida';
  const isDone = issue.status === 'concluida';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Card className={cn(
        'glass-card-hover relative overflow-hidden',
        isOverdue && 'border-destructive/30',
        isDone && 'opacity-60'
      )}>
        {/* Criticality accent bar */}
        <div className={cn(
          'absolute top-0 left-0 w-1 h-full rounded-l-lg',
          issue.criticality === 'alta' && 'bg-destructive',
          issue.criticality === 'media' && 'bg-warning',
          issue.criticality === 'baixa' && 'bg-muted-foreground/30'
        )} />

        <CardContent className="p-5 pl-6 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className={cn('font-semibold text-sm leading-snug', isDone ? 'text-muted-foreground line-through' : 'text-foreground')}>
                {issue.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
            </div>
            <StatusBadge status={issue.criticality} />
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            <CategoryBadge category={issue.category} />
            <StatusBadge status={issue.status} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
            <span className={cn('flex items-center gap-1.5 font-medium', isOverdue && 'text-destructive')}>
              {isOverdue && <AlertCircle className="w-3 h-3" />}
              <CalendarClock className="w-3 h-3" />
              {isOverdue ? 'Atrasado' : 'Prazo'}: {deadline}
            </span>
            <span className="flex items-center gap-1.5 truncate max-w-[50%]">
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate">{issue.suggestedOwner}</span>
            </span>
          </div>

          {issue.observation && (
            <p className="text-xs text-muted-foreground/80 italic bg-muted/30 rounded-lg px-3 py-2 leading-relaxed">
              💡 {issue.observation}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
