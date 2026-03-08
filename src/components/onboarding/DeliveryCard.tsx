import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { DeliveryItem } from '@/types/onboarding';
import { CalendarClock, User, CheckCircle2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DeliveryCardProps {
  delivery: DeliveryItem;
  index?: number;
}

export function DeliveryCard({ delivery, index = 0 }: DeliveryCardProps) {
  const planned = new Date(delivery.plannedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const actual = delivery.actualDate ? new Date(delivery.actualDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : null;
  const isDone = delivery.status === 'concluida';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Card className={cn('glass-card-hover', isDone && 'border-success/15')}>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                isDone ? 'bg-success/10' : 'bg-muted/60'
              )}>
                {isDone ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Package className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="min-w-0">
                <h3 className={cn('font-semibold text-sm leading-snug', isDone ? 'text-foreground/70' : 'text-foreground')}>
                  {delivery.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{delivery.description}</p>
              </div>
            </div>
            <StatusBadge status={delivery.status} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
            <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" />Previsto: {planned}</span>
            {actual && <span className="flex items-center gap-1.5 text-success"><CheckCircle2 className="w-3 h-3" />{actual}</span>}
            <span className="flex items-center gap-1.5 truncate"><User className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{delivery.responsible}</span></span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
