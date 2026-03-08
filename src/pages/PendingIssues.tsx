import { useState } from 'react';
import { mockProject } from '@/data/mockData';
import { PendingIssueCard } from '@/components/onboarding/PendingIssueCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function PendingIssues() {
  const [filter, setFilter] = useState('todas');
  const issues = mockProject.pendingIssues;

  const filtered = filter === 'todas' ? issues : issues.filter(i => i.status === filter);
  const urgent = issues.filter(i => i.criticality === 'alta' && i.status !== 'concluida');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pendências</h1>
        <p className="text-sm text-muted-foreground mt-1">O que depende da sua equipe para avançarmos</p>
      </div>

      {/* Urgent block */}
      {urgent.length > 0 && (
        <Card className="glass-card border-warning/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <AlertTriangle className="w-4 h-4" />
              O que depende da sua equipe agora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {urgent.map(issue => (
              <div key={issue.id} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                <span className="text-foreground font-medium">{issue.title}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(issue.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="todas" onValueChange={setFilter}>
        <TabsList className="bg-muted">
          <TabsTrigger value="todas">Todas ({issues.length})</TabsTrigger>
          <TabsTrigger value="aberta">Abertas</TabsTrigger>
          <TabsTrigger value="em_andamento">Em andamento</TabsTrigger>
          <TabsTrigger value="aguardando_retorno">Aguardando</TabsTrigger>
          <TabsTrigger value="concluida">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(issue => (
              <PendingIssueCard key={issue.id} issue={issue} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma pendência neste filtro</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
