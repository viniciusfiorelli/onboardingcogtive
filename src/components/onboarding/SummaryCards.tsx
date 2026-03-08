import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, GraduationCap, CheckCircle2, ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  accent: 'primary' | 'warning' | 'success' | 'muted';
  delay?: number;
}

function SummaryCard({ title, value, description, icon: Icon, accent, delay = 0 }: SummaryCardProps) {
  const styles = {
    primary: { border: 'border-primary/20', iconBg: 'bg-primary/10', iconText: 'text-primary', valueBg: 'text-primary' },
    warning: { border: 'border-warning/20', iconBg: 'bg-warning/10', iconText: 'text-warning', valueBg: 'text-warning' },
    success: { border: 'border-success/20', iconBg: 'bg-success/10', iconText: 'text-success', valueBg: 'text-success' },
    muted: { border: 'border-border/40', iconBg: 'bg-muted', iconText: 'text-muted-foreground', valueBg: 'text-foreground' },
  };
  const s = styles[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className={cn('glass-card-hover', s.border)}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn('p-2.5 rounded-xl shrink-0', s.iconBg)}>
              <Icon className={cn('w-5 h-5', s.iconText)} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className={cn('text-3xl font-bold', s.valueBg)}>{value}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <SummaryCard title="Pendências" value={pendingCount} description="dependem da sua equipe" icon={AlertTriangle} accent="warning" delay={0.05} />
      <SummaryCard title="Treinamentos" value={trainingCount} description="sessões agendadas" icon={GraduationCap} accent="primary" delay={0.1} />
      <SummaryCard title="Entregas" value={deliveredCount} description="etapas concluídas" icon={CheckCircle2} accent="success" delay={0.15} />
      <SummaryCard title="Próximas" value={nextActionsCount} description="ações previstas" icon={ArrowRight} accent="muted" delay={0.2} />
    </div>
  );
}
