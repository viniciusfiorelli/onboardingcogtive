import { ProjectPhase } from '@/types/onboarding';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressStepperProps {
  phases: ProjectPhase[];
}

export function ProgressStepper({ phases }: ProgressStepperProps) {
  const sorted = [...phases].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-start justify-between w-full relative">
        {/* Connecting line behind */}
        <div className="absolute top-5 left-[5%] right-[5%] h-[2px] bg-border/60 z-0" />
        <div
          className="absolute top-5 left-[5%] h-[2px] z-[1] gradient-primary transition-all duration-700"
          style={{
            width: `${((sorted.filter(p => p.status === 'completed').length) / (sorted.length - 1)) * 90}%`,
          }}
        />

        {sorted.map((phase, i) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex flex-col items-center relative z-10"
            style={{ width: `${100 / sorted.length}%` }}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300',
                phase.status === 'completed' && 'bg-success border-success text-success-foreground shadow-lg shadow-success/20',
                phase.status === 'current' && 'border-primary bg-primary/15 text-primary glow-sm ring-4 ring-primary/10',
                phase.status === 'upcoming' && 'border-border/60 bg-muted/80 text-muted-foreground'
              )}
            >
              {phase.status === 'completed' ? <Check className="w-4 h-4" strokeWidth={3} /> : phase.order}
            </div>
            <span className={cn(
              'mt-3 text-xs font-medium text-center leading-tight px-1',
              phase.status === 'current' ? 'text-primary font-semibold' :
              phase.status === 'completed' ? 'text-foreground/80' : 'text-muted-foreground/70'
            )}>
              {phase.name}
            </span>
            {phase.status === 'current' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold gradient-primary text-primary-foreground"
              >
                Atual
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-1">
        {sorted.map((phase, i) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="flex items-center gap-3"
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0',
                  phase.status === 'completed' && 'bg-success border-success text-success-foreground',
                  phase.status === 'current' && 'border-primary bg-primary/15 text-primary ring-2 ring-primary/10',
                  phase.status === 'upcoming' && 'border-border/60 bg-muted/80 text-muted-foreground'
                )}
              >
                {phase.status === 'completed' ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : phase.order}
              </div>
              {i < sorted.length - 1 && (
                <div className={cn(
                  'w-0.5 h-5',
                  phase.status === 'completed' ? 'bg-success/50' : 'bg-border/40'
                )} />
              )}
            </div>
            <div className="flex items-center gap-2 pb-4">
              <span className={cn(
                'text-sm font-medium',
                phase.status === 'current' ? 'text-primary font-semibold' :
                phase.status === 'completed' ? 'text-foreground/80' : 'text-muted-foreground/60'
              )}>
                {phase.name}
              </span>
              {phase.status === 'current' && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold gradient-primary text-primary-foreground">
                  Atual
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
