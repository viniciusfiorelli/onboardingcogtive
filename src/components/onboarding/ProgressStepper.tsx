import { ProjectPhase } from '@/types/onboarding';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStepperProps {
  phases: ProjectPhase[];
}

export function ProgressStepper({ phases }: ProgressStepperProps) {
  const sorted = [...phases].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between w-full">
        {sorted.map((phase, i) => (
          <div key={phase.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                  phase.status === 'completed' && 'bg-success border-success text-success-foreground',
                  phase.status === 'current' && 'border-primary bg-primary/20 text-primary glow-primary',
                  phase.status === 'upcoming' && 'border-border bg-muted text-muted-foreground'
                )}
              >
                {phase.status === 'completed' ? <Check className="w-4 h-4" /> : phase.order}
              </div>
              <span className={cn(
                'mt-2 text-xs font-medium text-center whitespace-nowrap',
                phase.status === 'current' ? 'text-primary' : phase.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {phase.name}
              </span>
            </div>
            {i < sorted.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-2 mt-[-1.25rem]',
                phase.status === 'completed' ? 'bg-success' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {sorted.map((phase) => (
          <div key={phase.id} className="flex items-center gap-3">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 shrink-0',
                phase.status === 'completed' && 'bg-success border-success text-success-foreground',
                phase.status === 'current' && 'border-primary bg-primary/20 text-primary',
                phase.status === 'upcoming' && 'border-border bg-muted text-muted-foreground'
              )}
            >
              {phase.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : phase.order}
            </div>
            <span className={cn(
              'text-sm font-medium',
              phase.status === 'current' ? 'text-primary' : phase.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {phase.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
