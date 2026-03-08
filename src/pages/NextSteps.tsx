import { mockProject } from '@/data/mockData';
import { TimelineItem } from '@/components/onboarding/TimelineItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, ArrowRight, Target } from 'lucide-react';
import { StatusBadge } from '@/components/onboarding/StatusBadge';
import { motion } from 'framer-motion';

export default function NextSteps() {
  const milestones = mockProject.milestones;
  const upcoming = milestones.filter(m => m.status === 'in_progress' || m.status === 'upcoming').slice(0, 3);
  const completed = milestones.filter(m => m.status === 'completed');

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Próximos Passos</h1>
        <p className="text-sm text-muted-foreground mt-1">Cronograma simplificado da sua implantação</p>
      </motion.div>

      {/* Progress summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 bg-success/8 border border-success/15 rounded-full px-4 py-2 text-sm">
          <Target className="w-4 h-4 text-success" />
          <span className="text-foreground font-semibold">{completed.length}</span>
          <span className="text-muted-foreground">marcos concluídos</span>
        </div>
        <div className="flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-4 py-2 text-sm">
          <ArrowRight className="w-4 h-4 text-primary" />
          <span className="text-foreground font-semibold">{milestones.length - completed.length}</span>
          <span className="text-muted-foreground">marcos restantes</span>
        </div>
      </motion.div>

      {/* Próximas ações */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        <Card className="glass-card border-primary/15 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-0.5 gradient-primary" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              Próximas ações imediatas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/25 border border-border/25 hover:border-primary/15 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{m.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{m.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-full">
                    <CalendarClock className="w-3 h-3" />
                    {new Date(m.plannedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                  <StatusBadge status={m.status} />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cronograma Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {milestones.map((m, i) => (
                <TimelineItem key={m.id} milestone={m} isLast={i === milestones.length - 1} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
