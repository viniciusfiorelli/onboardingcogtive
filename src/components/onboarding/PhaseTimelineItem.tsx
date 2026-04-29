import { useState } from 'react';
import { ProjectPhase, ChecklistItem } from '@/types/onboarding';
import { Check, Circle, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PhaseTimelineItemProps {
  phase: ProjectPhase;
  checklistItems: ChecklistItem[];
  isLast: boolean;
  index?: number;
  nextMilestoneDate: string | null;
}

export function PhaseTimelineItem({ phase, checklistItems, isLast, index = 0, nextMilestoneDate }: PhaseTimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(phase.status === 'current');

  const completedCount = checklistItems.filter(c => c.checked).length;
  const totalCount = checklistItems.length;

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
          phase.status === 'completed' && 'bg-success border-success text-success-foreground shadow-md shadow-success/15',
          phase.status === 'current' && 'border-primary bg-primary/15 text-primary ring-4 ring-primary/8',
          phase.status === 'upcoming' && 'border-border/50 bg-muted/60 text-muted-foreground/50'
        )}>
          {phase.status === 'completed' ? <Check className="w-4 h-4" strokeWidth={3} /> :
           phase.status === 'current' ? <Loader2 className="w-4 h-4 animate-spin" /> :
           <Circle className="w-2.5 h-2.5 fill-current" />}
        </div>
        {!isLast && (
          <div className={cn(
            'w-0.5 flex-1 min-h-[1.5rem]',
            phase.status === 'completed' ? 'bg-success/30' : 'bg-border/30'
          )} />
        )}
      </div>

      <div className={cn(
        'pb-6 flex-1 min-w-0 -mt-0.5',
        phase.status === 'upcoming' && 'opacity-50'
      )}>
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              'font-semibold text-sm transition-colors',
              phase.status === 'current' ? 'text-primary' : 'text-foreground group-hover:text-primary/70'
            )}>
              {phase.name}
            </h4>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              phase.status === 'completed' ? 'bg-success/10 text-success' :
              phase.status === 'current' ? 'bg-primary/10 text-primary' :
              'bg-muted text-muted-foreground'
            )}>
              {phase.status === 'completed' ? 'Concluída' : phase.status === 'current' ? 'Em andamento' : 'Pendente'}
            </span>
            {phase.status === 'current' && nextMilestoneDate && (
              <span className="text-[10px] text-blue-500 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">
                Próx. evento: {new Date(nextMilestoneDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <span className="text-xs text-muted-foreground font-medium hidden sm:block">
                {completedCount}/{totalCount}
              </span>
            )}
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isExpanded ? "rotate-180" : ""
            )} />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {checklistItems.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-2 border-l-2 border-border">Nenhum item do checklist mapeado.</p>
              ) : (
                <div className="space-y-2.5">
                  {checklistItems.map(item => (
                    <div key={item.id} className="flex gap-2.5 items-start">
                      <div className="mt-0.5 shrink-0">
                        {item.checked ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm",
                          item.checked ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"
                        )}>
                          {item.itemText}
                        </p>
                        {item.checklistLabel && (
                          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mt-0.5">
                            {item.checklistLabel}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
