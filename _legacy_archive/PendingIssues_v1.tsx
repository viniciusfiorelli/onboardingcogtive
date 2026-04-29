import { useState } from 'react';
import { useProjectData } from '@/hooks/useProjectData';
import { useAdmin } from '@/contexts/AdminContext';
import { PendingIssueCard } from '@/components/onboarding/PendingIssueCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Users, ListChecks, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export default function PendingIssues() {
  const [filter, setFilter] = useState('todas');
  const { isAdmin, selectedProjectId } = useAdmin();
  const { data: p, isLoading, error } = useProjectData();
  
  // States for collapsible sections
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(new Set());

  const togglePhase = (phaseName: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseName)) {
      newExpanded.delete(phaseName);
    } else {
      newExpanded.add(phaseName);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleLabel = (labelKey: string) => {
    const newExpanded = new Set(expandedLabels);
    if (newExpanded.has(labelKey)) {
      newExpanded.delete(labelKey);
    } else {
      newExpanded.add(labelKey);
    }
    setExpandedLabels(newExpanded);
  };

  if (isAdmin && !selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Bem-vindo, Administrador</h2>
        <p className="text-muted-foreground">
          Para visualizar o checklist, por favor selecione um cliente no menu superior direito.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Erro ao carregar checklist</h2>
        <p className="text-muted-foreground mt-1">{error?.message || "Checklist não encontrado"}</p>
      </div>
    );
  }

  const issues = p.pendingIssues || [];
  const allChecklistItems = p.checklistItems || [];
  
  // Filtra checklists se o usuário não for admin:
  // 1. Oculta itens adminOnly
  // 2. Oculta fases diferentes da fase atual do projeto
  const baseChecklistItems = allChecklistItems.filter(item => {
    if (isAdmin) return true;
    return !item.adminOnly && item.phaseName === p.currentPhase;
  });

  const filteredIssues = filter === 'todas' ? issues : issues.filter(i => i.status === filter);
  
  const filteredChecklist = baseChecklistItems.filter(item => {
    const itemStatus = item.checked ? 'concluida' : 'aberta';
    if (filter === 'todas') return true;
    if (filter === 'aberta' && itemStatus === 'aberta') return true;
    if (filter === 'concluida' && itemStatus === 'concluida') return true;
    return false;
  });

  const urgent = issues.filter(i => i.criticality === 'alta' && i.status !== 'concluida');
  const doneCount = issues.filter(i => i.status === 'concluida').length + baseChecklistItems.filter(c => c.checked).length;
  const totalInFilter = filteredIssues.length + filteredChecklist.length;

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Checklist do Projeto</h1>
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

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="todas">Todas ({issues.length + baseChecklistItems.length})</TabsTrigger>
          <TabsTrigger value="aberta">
            Abertas ({issues.filter(i => i.status === 'aberta').length + baseChecklistItems.filter(c => !c.checked).length})
          </TabsTrigger>
          <TabsTrigger value="em_andamento">
            Em andamento ({issues.filter(i => i.status === 'em_andamento').length})
          </TabsTrigger>
          <TabsTrigger value="aguardando_retorno">
            Aguardando ({issues.filter(i => i.status === 'aguardando_retorno').length})
          </TabsTrigger>
          <TabsTrigger value="concluida">
            Concluídas ({issues.filter(i => i.status === 'concluida').length + baseChecklistItems.filter(c => c.checked).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Lista de Itens Manuais */}
      {filteredIssues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIssues.map((issue, i) => (
            <PendingIssueCard key={issue.id} issue={issue} index={i} />
          ))}
        </div>
      )}

      {/* Checklist por Fase (do Pipefy) */}
      {filteredChecklist.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="glass-card overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/60 to-transparent" />
            <CardHeader className="pb-3">
               <CardTitle className="text-base flex items-center gap-2">
                 <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                   <ListChecks className="w-4 h-4 text-primary" />
                 </div>
                 Checklist do Projeto
                 <span className="text-xs text-muted-foreground ml-auto font-normal">
                   {filteredChecklist.filter(c => c.checked).length}/{filteredChecklist.length} exibidos concluídos
                 </span>
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(
                filteredChecklist.reduce((acc, item) => {
                  const key = item.phaseName || 'Geral';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(item);
                  return acc;
                }, {} as Record<string, typeof filteredChecklist>)
              ).map(([phaseName, phaseItems]) => {
                const isExpanded = expandedPhases.has(phaseName);
                
                return (
                  <div key={phaseName} className="space-y-4">
                    <button 
                      onClick={() => togglePhase(phaseName)}
                      className="w-full flex items-center gap-2 border-b border-border/50 pb-2 hover:bg-muted/10 transition-colors text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-primary" />
                      )}
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <h4 className="text-base font-bold text-primary uppercase">
                        {phaseName}
                      </h4>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="space-y-4 ml-2 overflow-hidden"
                        >
                          {Object.entries(
                             phaseItems.reduce((subAcc, item) => {
                               const label = item.checklistLabel || 'Checklist';
                               if (!subAcc[label]) subAcc[label] = [];
                               subAcc[label].push(item);
                               return subAcc;
                             }, {} as Record<string, typeof filteredChecklist>)
                          ).map(([label, items]) => {
                            const labelKey = `${phaseName}-${label}`;
                            const isLabelExpanded = expandedLabels.has(labelKey);
                            
                            return (
                              <div key={label} className="space-y-2 bg-muted/10 rounded-xl border border-border/40 overflow-hidden">
                                <button 
                                  onClick={() => toggleLabel(labelKey)}
                                  className="w-full flex items-center gap-2 p-3 hover:bg-muted/20 transition-colors text-left"
                                >
                                  {isLabelExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-foreground/70" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-foreground/70" />
                                  )}
                                  <h5 className="text-sm font-semibold text-foreground/90">{label}</h5>
                                </button>
                                
                                <AnimatePresence>
                                  {isLabelExpanded && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2, ease: "easeInOut" }}
                                      className="space-y-1.5 px-3 pb-3"
                                    >
                                      {items.map(item => (
                                        <div
                                          key={item.id}
                                          className={`flex items-start gap-2.5 text-sm p-2 rounded-lg transition-colors ${
                                            item.checked ? 'bg-success/5' : 'bg-background hover:bg-muted/30 border border-transparent hover:border-border/50'
                                          }`}
                                        >
                                          {item.checked ? (
                                            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                          ) : (
                                            <div className="w-4 h-4 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                                          )}
                                          <span className={item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}>
                                            {item.itemText}
                                          </span>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {totalInFilter === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <p className="text-lg font-semibold text-foreground/70">Tudo em dia!</p>
          <p className="text-muted-foreground mt-1">Não há itens {filter !== 'todas' ? 'neste filtro' : 'para este projeto'}.</p>
        </motion.div>
      )}
    </div>
  );
}
