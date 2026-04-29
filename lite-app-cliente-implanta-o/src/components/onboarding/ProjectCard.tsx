import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from './StatusBadge';
import { OnboardingProject } from '@/types/onboarding';
import { Building2, MapPin, CalendarClock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: OnboardingProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const nextDate = new Date(project.nextMilestoneDate).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="glass-card glow-primary overflow-hidden relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Activity className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{project.clientName}</h2>
                    <p className="text-xs text-muted-foreground">Projeto de Implantação</p>
                  </div>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <InfoChip icon={<Building2 className="w-3.5 h-3.5" />} text={project.plantName} />
                <InfoChip icon={<MapPin className="w-3.5 h-3.5" />} text={project.city} />
                <InfoChip icon={<CalendarClock className="w-3.5 h-3.5" />} text={`Próxima etapa: ${nextDate}`} />
              </div>
            </div>

            {/* Progress ring */}
            <div className="flex items-center gap-5 lg:flex-col lg:items-end">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="5" opacity="0.4" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="url(#progressGrad)" strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - project.progress / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(190 85% 52%)" />
                      <stop offset="100%" stopColor="hsl(210 75% 50%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{project.progress}%</span>
                </div>
              </div>
              <div className="lg:text-right">
                <p className="text-xs text-muted-foreground">Progresso geral</p>
                <p className="text-sm font-medium text-foreground mt-0.5">Fase: {project.currentPhase}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/40 rounded-full px-3 py-1">
      {icon}
      <span>{text}</span>
    </span>
  );
}
