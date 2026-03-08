import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from './StatusBadge';
import { OnboardingProject } from '@/types/onboarding';
import { Building2, MapPin, CalendarClock } from 'lucide-react';

interface ProjectCardProps {
  project: OnboardingProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const nextDate = new Date(project.nextMilestoneDate).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <Card className="glass-card glow-primary">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{project.clientName}</h2>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                {project.plantName}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {project.city}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4" />
                Próxima etapa: {nextDate}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 min-w-[140px]">
            <span className="text-3xl font-bold text-primary">{project.progress}%</span>
            <span className="text-xs text-muted-foreground">Progresso geral</span>
            <Progress value={project.progress} className="h-2 w-full mt-1 bg-muted [&>div]:gradient-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
