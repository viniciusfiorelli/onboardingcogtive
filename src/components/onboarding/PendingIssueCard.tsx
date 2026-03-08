import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, CategoryBadge } from './StatusBadge';
import { CustomerPendingIssue } from '@/types/onboarding';
import { CalendarClock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingIssueCardProps {
  issue: CustomerPendingIssue;
}

export function PendingIssueCard({ issue }: PendingIssueCardProps) {
  const deadline = new Date(issue.deadline).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  });
  const isOverdue = new Date(issue.deadline) < new Date() && issue.status !== 'concluida';

  return (
    <Card className={cn('glass-card transition-all hover:border-primary/30', isOverdue && 'border-destructive/40')}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground leading-snug">{issue.title}</h3>
          <StatusBadge status={issue.criticality} />
        </div>
        <p className="text-sm text-muted-foreground">{issue.description}</p>
        <div className="flex items-center flex-wrap gap-2">
          <CategoryBadge category={issue.category} />
          <StatusBadge status={issue.status} />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span className={cn('flex items-center gap-1', isOverdue && 'text-destructive')}>
            <CalendarClock className="w-3.5 h-3.5" />
            {isOverdue ? 'Atrasado — ' : 'Prazo: '}{deadline}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {issue.suggestedOwner}
          </span>
        </div>
        {issue.observation && (
          <p className="text-xs text-muted-foreground italic bg-muted/50 rounded p-2">{issue.observation}</p>
        )}
      </CardContent>
    </Card>
  );
}
