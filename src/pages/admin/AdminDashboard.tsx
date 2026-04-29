import { useState, useMemo } from 'react';
import { useAdminDashboard, DashboardProject } from '@/hooks/useAdminDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, AlertTriangle, Building, Clock, ArrowUpDown, ChevronRight, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp, UserCheck, Zap, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { data: projects, isLoading, error } = useAdminDashboard();
  const { setSelectedProjectId } = useAdmin();
  const navigate = useNavigate();
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof DashboardProject | 'health', direction: 'asc' | 'desc' } | null>({ key: 'health', direction: 'asc' });
  const [isAlertsOpen, setIsAlertsOpen] = useState(true);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(true);

  const activeProjects = useMemo(() => projects?.filter(p => p.status !== 'concluido' && p.current_phase !== 'Concluído') || [], [projects]);
  const completedProjects = useMemo(() => projects?.filter(p => p.status === 'concluido' || p.current_phase === 'Concluído') || [], [projects]);
  
  const atRisk = useMemo(() => activeProjects.filter(p => p.health.level === 'at_risk'), [activeProjects]);
  const attention = useMemo(() => activeProjects.filter(p => p.health.level === 'attention'), [activeProjects]);
  
  const avgHealth = useMemo(() => activeProjects.length ? Math.round(activeProjects.reduce((acc, p) => acc + p.health.score, 0) / activeProjects.length) : 0, [activeProjects]);
  const avgDays = useMemo(() => activeProjects.length ? Math.round(activeProjects.reduce((acc, p) => acc + p.health.totalDays, 0) / activeProjects.length) : 0, [activeProjects]);

  const handleRowClick = (id: string) => {
    setSelectedProjectId(id);
    navigate('/admin/project');
  };

  const copyExecutiveReport = (e: React.MouseEvent, p: DashboardProject) => {
    e.stopPropagation();
    
    const openIssues = p.issues.filter(i => i.status !== 'concluida');
    const criticalIssues = openIssues.filter(i => i.criticality === 'alta').length;
    
    const report = `📊 **Relatório Executivo: ${p.client_name}**
*Gerado em: ${new Date().toLocaleDateString('pt-BR')}*

**Status Geral do Projeto:**
- 📌 **Fase Atual:** ${p.current_phase || 'Iniciando'}
- 🎯 **Progresso da Implantação:** ${p.progress}%
- 🏥 **Health Score:** ${p.health.score}/100 (${p.health.level === 'healthy' ? '🟢 Saudável' : p.health.level === 'attention' ? '🟡 Atenção' : '🔴 Risco'})

**Métricas Detalhadas:**
- 🚀 **Onboarding Executado:** ${p.health.onboardingScore}/100
- ⚡ **Adoção do Sistema:** ${p.health.adoption.score !== null ? `${p.health.adoption.score}%` : 'Sem dados'}
- ⚠️ **Pendências Ativas:** ${openIssues.length} tarefa(s)
${criticalIssues > 0 ? `- 🚨 **ITENS CRÍTICOS:** ${criticalIssues} bloqueio(s) relatado(s).` : ''}

*Este é um resumo gerado automaticamente pelo Success Hub da Cogtive.*`;

    navigator.clipboard.writeText(report);
    toast.success('Relatório copiado!', { description: 'O resumo executivo está na sua área de transferência pronta para colar.' });
  };

  const sortedProjects = useMemo(() => {
    if (!sortConfig) return activeProjects;
    return [...activeProjects].sort((a, b) => {
      if (sortConfig.key === 'health') {
        return sortConfig.direction === 'asc' ? a.health.score - b.health.score : b.health.score - a.health.score;
      }
      if (sortConfig.key === 'client_name' || sortConfig.key === 'current_phase') {
        const valA = String(a[sortConfig.key]).toLowerCase();
        const valB = String(b[sortConfig.key]).toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      return 0;
    });
  }, [activeProjects, sortConfig]);

  const handleSort = (key: keyof DashboardProject | 'health') => {
    setSortConfig(current => 
      current?.key === key 
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const scatterData = useMemo(() => {
    return activeProjects.map(p => ({
      name: p.client_name,
      x: Number(p.progress) || 0, 
      y: Number(p.health.adoption.score !== null ? p.health.adoption.score : p.health.onboardingScore) || 0,
      z: Number(p.health.score) || 0,
      level: p.health.level,
      id: p.id
    }));
  }, [activeProjects]);

  if (isLoading) return <div className="flex justify-center items-center py-40"><div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin glow-primary" /></div>;
  if (error) return <div className="text-destructive text-center py-20 font-bold">Erro ao carregar os dados de inteligência. Tente atualizar a página.</div>;
  if (!projects) return null;

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          Centro de Inteligência <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">V2.0</Badge>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Visão multidimensional do portfólio de implantações ({projects.length} ativas).</p>
      </motion.div>

      {/* KPIs Gerais (Premium Glass) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="glass-card-hover group cursor-pointer overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Portfólio</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-foreground drop-shadow-sm">{activeProjects.length}</p>
                <span className="text-xs font-medium text-success/80">ativos</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Building className="w-6 h-6 text-foreground/70" />
            </div>
          </CardContent>
        </Card>
        
        {/* [RECURSO OCULTO] - Healthscore KPIs pendentes de aprovação da diretoria */}
        {false && (
          <Card className="glass-card-hover group cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Health Integrado</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-black drop-shadow-sm ${avgHealth >= 80 ? 'text-success' : avgHealth >= 50 ? 'text-warning' : 'text-destructive'}`}>
                    {avgHealth}
                  </p>
                  <span className="text-xs font-medium text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 group-hover:-rotate-3 transition-transform ${avgHealth >= 80 ? 'bg-success/10 border-success/20 text-success glow-sm' : avgHealth >= 50 ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-destructive/20 border-destructive/30 text-destructive'}`}>
                <Activity className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        )}

        {false && (
          <Card className="glass-card-hover group cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Em Risco Grave</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-foreground drop-shadow-sm">{atRisk.length}</p>
                  <span className="text-xs font-medium text-destructive">clientes</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </CardContent>
          </Card>
        )}

        {false && (
          <Card className="glass-card-hover group cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Ritmo Promédio</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-foreground drop-shadow-sm">{avgDays}</p>
                  <span className="text-xs font-medium text-muted-foreground">dias total</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:-rotate-12 transition-transform">
                <Clock className="w-6 h-6 text-foreground/70" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {false && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matriz de Risco (Gráfico) */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-2 flex">
          <Card className="glass-card w-full h-[600px] flex flex-col">
            <CardHeader className="pb-2 border-b border-white/5 px-6 shrink-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Matriz de Saúde (Implantação x Adoção)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-4 bg-gradient-to-br from-transparent to-black/20">
              <div className="w-full h-[320px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis type="number" dataKey="x" name="Implantação" unit="%" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} domain={[0, 100]} />
                    <YAxis type="number" dataKey="y" name="Score Adoção" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} domain={[0, 100]} />
                    <ZAxis type="number" dataKey="z" range={[60, 400]} name="Score Global" />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--primary))' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="glass-card p-4 rounded-xl border border-white/10 shadow-2xl z-50">
                              <p className="font-bold text-foreground mb-2 text-base">{data.name}</p>
                              <p className="text-xs text-muted-foreground mb-1">Implantação: <span className="text-foreground font-semibold">{data.x}% concluído</span></p>
                              <p className="text-xs text-muted-foreground mb-1">Score de Adoção: <span className="text-foreground font-semibold">{data.y} (Uso)</span></p>
                              <div className="mt-3 text-[10px] uppercase tracking-wider font-bold">
                                Nota Consolidada: <span className={`px-2 py-0.5 rounded ml-1 ${data.level === 'healthy' ? 'bg-success text-success-foreground' : data.level === 'attention' ? 'bg-warning text-warning-foreground' : 'bg-destructive text-destructive-foreground'}`}>{data.z}/100</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Projetos" data={scatterData} onClick={(e) => handleRowClick(e.id)} style={{ cursor: 'pointer' }}>
                      {scatterData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.level === 'healthy' ? '#22c55e' : entry.level === 'attention' ? '#eab308' : '#ef4444'} 
                          className="hover:opacity-80 transition-opacity drop-shadow-md cursor-pointer"
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 text-xs text-muted-foreground bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner mt-auto shrink-0">
                <div className="flex items-center gap-2 font-black uppercase tracking-widest text-primary text-[11px]">
                  <Info className="w-4 h-4"/> Entendendo o Motor de Health Score
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                     <span className="text-foreground font-bold flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" /> Risco Crítico (≤ 50)</span>
                     <p className="text-xs opacity-70 leading-relaxed font-medium">Baixo engajamento ou cronograma da implantação atrasado.</p>
                  </div>
                  <div className="space-y-1.5">
                     <span className="text-foreground font-bold flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#eab308] shadow-[0_0_8px_#eab308]" /> Atenção (51 a 74)</span>
                     <p className="text-xs opacity-70 leading-relaxed font-medium">Implantação em ritmo médio ou uso abaixo do contrato.</p>
                  </div>
                  <div className="space-y-1.5">
                     <span className="text-foreground font-bold flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" /> Saudável (≥ 75)</span>
                     <p className="text-xs opacity-70 leading-relaxed font-medium">Cronograma fluindo e alta adoção pela operação.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resumo Crítico */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex">
          <Card className="glass-card w-full h-[600px] overflow-hidden flex flex-col">
            <CardHeader className="pb-3 border-b border-white/5 bg-destructive/10">
              <CardTitle className="text-lg font-bold flex items-center justify-between text-destructive">
                <span className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Radar de Atenção</span>
                <Badge variant="destructive" className="font-bold">{atRisk.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
               {atRisk.length === 0 ? (
                 <div className="flex flex-col flex-1 items-center justify-center p-8 text-center h-full opacity-50">
                   <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-4"><CheckCircle2 className="w-6 h-6 text-success" /></div>
                   <p className="text-sm font-semibold">Nenhum cliente em risco grave detectado pelo Benchmark.</p>
                 </div>
               ) : (
                 <div className="divide-y divide-white/5">
                   {atRisk.map(p => (
                     <div key={p.id} onClick={() => handleRowClick(p.id)} className="p-4 hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between group">
                       <div>
                         <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{p.client_name}</h4>
                         <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Badge variant="outline" className="text-[9px] border-white/10 uppercase bg-black/20">{p.current_phase}</Badge></div>
                       </div>
                       <div className="text-right">
                         <div className="text-lg font-black text-destructive leading-none">{p.health.score}</div>
                         <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">Score</div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      )}

      {/* Tabela de Portfólio (Renovada) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setIsPortfolioOpen(!isPortfolioOpen)}>
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary"><Building className="w-4 h-4"/></div>
                Portfólio Global ({activeProjects.length})
              </div>
              <Button variant="ghost" size="icon" className="-mr-2 rounded-full h-8 w-8 hover:bg-white/10">
                {isPortfolioOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {isPortfolioOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-black/20 border-b border-white/5">
                        <TableRow className="hover:bg-transparent">
                          {false && (
                            <TableHead className="w-[100px] cursor-pointer hover:text-foreground" onClick={() => handleSort('health')}>
                              <div className="flex items-center gap-1 uppercase text-[10px] tracking-wider font-bold">Health {sortConfig?.key === 'health' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                            </TableHead>
                          )}
                          <TableHead className="min-w-[200px] cursor-pointer hover:text-foreground" onClick={() => handleSort('client_name')}>
                            <div className="flex items-center gap-1 uppercase text-[10px] tracking-wider font-bold">Cliente {sortConfig?.key === 'client_name' && <ArrowUpDown className="w-3 h-3 text-primary" />}</div>
                          </TableHead>
                          {false && (
                            <TableHead className="min-w-[150px] uppercase text-[10px] tracking-wider font-bold">Composição (Dimensões)</TableHead>
                          )}
                          <TableHead className="text-right uppercase text-[10px] tracking-wider font-bold">Progresso</TableHead>
                          <TableHead className="text-right uppercase text-[10px] tracking-wider font-bold">Issues</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedProjects.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-medium">Nenhum projeto ativo.</TableCell>
                          </TableRow>
                        ) : (
                          sortedProjects.map((p, i) => {
                            const openIssues = p.issues.filter(i => i.status !== 'concluida');
                            const criticalIssues = openIssues.filter(i => i.criticality === 'alta');
                            const isHealthy = p.health.level === 'healthy';
                            const isAttention = p.health.level === 'attention';
                            
                            return (
                              <TableRow key={p.id} className={`hover:bg-white/5 transition-all group ${i !== sortedProjects.length - 1 ? 'border-b border-white/5' : 'border-0'}`}>
                                {false && (
                                  <TableCell className="cursor-pointer py-4" onClick={() => handleRowClick(p.id)}>
                                    <div className="flex flex-col">
                                      <Tooltip>
                                        <TooltipTrigger className="cursor-help mx-auto">
                                          <div className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-inner backdrop-blur-md border ${isHealthy ? 'border-success/30 bg-success/15 text-success glow-sm' : isAttention ? 'border-warning/30 bg-warning/15 text-warning' : 'border-destructive/30 bg-destructive/15 text-destructive'} group-hover:scale-105 transition-transform`}>
                                            <span className="text-lg font-black">{p.health.score}</span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="w-72 p-0 bg-card border border-white/10 shadow-2xl rounded-xl overflow-hidden">
                                          <div className="bg-primary/10 p-3 border-b border-white/5"><h4 className="font-bold text-sm text-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-primary"/> Consolidado: {p.health.score} / 100</h4></div>
                                          <div className="p-3 space-y-2 text-xs text-muted-foreground whitespace-pre-wrap">
                                            <div className="flex justify-between items-center"><span className="font-medium text-foreground flex items-center gap-1"><Clock className="w-3 h-3 text-primary"/> Onboarding:</span> <span className="font-bold">{p.health.onboardingScore}%</span></div>
                                            <div className="flex justify-between items-center"><span className="font-medium text-foreground flex items-center gap-1"><Zap className="w-3 h-3 text-secondary-foreground"/> Adoption:</span> <span className="font-bold">{p.health.adoption.score !== null ? `${p.health.adoption.score}%` : 'Sem dados'}</span></div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </TableCell>
                                )}
                                <TableCell className="cursor-pointer" onClick={() => handleRowClick(p.id)}>
                                  <div className="font-extrabold text-foreground truncate text-base group-hover:text-primary transition-colors">{p.client_name}</div>
                                  <div className="flex gap-2 mt-1.5 opacity-80">
                                     <Badge variant="outline" className="text-[9px] bg-black/20 border-white/10 uppercase font-semibold">{p.current_phase || 'Sem fase'}</Badge>
                                  </div>
                                </TableCell>
                                {false && (
                                  <TableCell className="cursor-pointer" onClick={() => handleRowClick(p.id)}>
                                    <div className="flex gap-1.5 items-center">
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className={`w-2 h-8 rounded-full ${p.health.onboardingScore >= 80 ? 'bg-success' : p.health.onboardingScore >= 50 ? 'bg-warning' : 'bg-destructive'}`} />
                                        </TooltipTrigger>
                                        <TooltipContent>Onboarding: {p.health.onboardingScore}</TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className={`w-2 h-8 rounded-full ${p.health.adoption.score === null ? 'bg-white/10' : p.health.adoption.score >= 80 ? 'bg-success' : p.health.adoption.score >= 50 ? 'bg-warning' : 'bg-destructive'}`} />
                                        </TooltipTrigger>
                                        <TooltipContent>Adoção: {p.health.adoption.score !== null ? p.health.adoption.score : 'S/D'}</TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </TableCell>
                                )}
                                <TableCell className="text-right cursor-pointer" onClick={() => handleRowClick(p.id)}>
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-foreground">{p.progress}%</span>
                                      <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                                      </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground opacity-60 uppercase font-semibold tracking-wider">Implantação</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right cursor-pointer" onClick={() => handleRowClick(p.id)}>
                                  {openIssues.length > 0 ? (
                                    <div className="flex flex-col items-end gap-1 mb-1">
                                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${criticalIssues.length > 0 ? 'bg-destructive/20 text-destructive font-bold' : 'bg-white/5 border border-white/5 text-muted-foreground font-semibold'}`}>{openIssues.length} pendentes</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-success flex items-center justify-end gap-1 font-bold"><CheckCircle2 className="w-3.5 h-3.5"/> Limpo</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1 relative">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={(e) => copyExecutiveReport(e, p)} className="hover:bg-primary/20 hover:text-primary transition-all rounded-xl h-8 w-8 text-muted-foreground cursor-pointer z-10">
                                          <Copy className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black border-white/10 text-white font-bold">Copiar Resumo Executivo</TooltipContent>
                                    </Tooltip>
                                    
                                    <Button variant="ghost" size="icon" onClick={() => handleRowClick(p.id)} className="group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-xl h-8 w-8 cursor-pointer z-10">
                                      <ChevronRight className="w-4 h-4" />
                                    </Button>
                                    
                                    {/* Invisible overlay for full-row click except buttons */}
                                    <div className="absolute inset-0 cursor-pointer z-0" onClick={() => handleRowClick(p.id)} />
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
