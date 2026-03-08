import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { DeliveryItem } from '@/types/onboarding';
import { CalendarClock, User, CheckCircle2 } from 'lucide-react';

interface DeliveryCardProps {
  delivery: DeliveryItem;
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  const planned = new Date(delivery.plannedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const actual = delivery.actualDate ? new Date(delivery.actualDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : null;

  return (
    <Card className="glass-card hover:border-primary/30 transition-all">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground">{delivery.name}</h3>
          <StatusBadge status={delivery.status} />
        </div>
        <p className="text-sm text-muted-foreground">{delivery.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />Previsto: {planned}</span>
          {actual && <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-3.5 h-3.5" />Realizado: {actual}</span>}
          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{delivery.responsible}</span>
        </div>
      </CardContent>
    </Card>
  );
}
