import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { TrainingSession } from '@/types/onboarding';
import { CalendarClock, User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const typeLabels: Record<string, string> = {
  operacional: 'Operacional',
  oee: 'OEE',
  modulo_especifico: 'Módulo Específico',
  reciclagem: 'Reciclagem',
  alinhamento_lideranca: 'Liderança',
};

const typeEmoji: Record<string, string> = {
  operacional: '🔧',
  oee: '📊',
  modulo_especifico: '📦',
  reciclagem: '🔄',
  alinhamento_lideranca: '👥',
};

interface TrainingCardProps {
  training: TrainingSession;
  index?: number;
}

export function TrainingCard({ training, index = 0 }: TrainingCardProps) {
  const date = new Date(training.plannedDate).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Card className="glass-card-hover">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                {typeEmoji[training.type] || '📋'}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-foreground leading-snug">{training.name}</h3>
                <span className="text-xs text-muted-foreground">{typeLabels[training.type] || training.type}</span>
              </div>
            </div>
            <StatusBadge status={training.status} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
            <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" />{date}</span>
            <span className="flex items-center gap-1.5 truncate max-w-[50%]"><User className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{training.responsible}</span></span>
          </div>

          {training.observation && (
            <p className="text-xs text-muted-foreground/80 italic bg-muted/30 rounded-lg px-3 py-2 leading-relaxed">
              {training.observation}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
