import { useState } from 'react';
import { mockProject } from '@/data/mockData';
import { PendingIssueCard } from '@/components/onboarding/PendingIssueCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function PendingIssues() {
  const [filter, setFilter] = useState('todas');
  const issues = mockProject.pendingIssues;

  const filtered = filter === 'todas' ? issues : issues.filter(i => i.status === filter);
  const urgent = issues.filter(i => i.criticality === 'alta' && i.status !== 'concluida');
  const doneCount = issues.filter(i => i.status === 'concluida').length;

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pendências</h1>
        <p className="text-sm text-muted-foreground mt-1">O que depende da sua equipe para avançarmos na implantação</p>
      </motion.div>

      {/* Summary strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 bg-warning/8 border border-warning/15 rounded-full px-4 py-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className="text-foreground font-semibold">{urgent.length}</span>
          <span className="text-muted-foreground">urgentes</span>
        </div>
        <div className="flex items-center gap-2 bg-success/8 border border-success/15 rounded-full px-4 py-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-foreground font-semibold">{doneCount}</span>
          <span className="text-muted-foreground">concluídas</span>
        </div>
      </motion.div>

      {/* Urgent block */}
      {urgent.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <Card className="glass-card border-warning/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-warning/60 to-transparent" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-warning/15 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                O que depende da sua equipe agora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {urgent.map(issue => (
                <div key={issue.id} className="flex items-center gap-3 text-sm p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-warning shrink-0 animate-pulse" />
                  <span className="text-foreground font-medium flex-1">{issue.title}</span>
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                    {new Date(issue.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="todas" onValueChange={setFilter}>
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="todas">Todas ({issues.length})</TabsTrigger>
          <TabsTrigger value="aberta">Abertas</TabsTrigger>
          <TabsTrigger value="em_andamento">Em andamento</TabsTrigger>
          <TabsTrigger value="aguardando_retorno">Aguardando</TabsTrigger>
          <TabsTrigger value="concluida">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((issue, i) => (
              <PendingIssueCard key={issue.id} issue={issue} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="font-medium text-foreground/70">Nenhuma pendência neste filtro</p>
              <p className="text-sm text-muted-foreground mt-1">Todos os itens foram resolvidos!</p>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
