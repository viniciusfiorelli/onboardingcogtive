import { differenceInDays } from 'date-fns';

export interface HealthScoreProject {
  id: string;
  client_name: string;
  status: string;
  current_phase: string;
  kickoff_date: string | null;
  created_at: string;
  progress: number;
  contracted_modules: string[];
  issues: { status: string; criticality: string; category: string }[];
  checklists: { checked: boolean; phase_name: string; admin_only: boolean }[];
  contracted_points?: number;
  active_points?: number;
  system_usage?: number;
}

export interface PhaseHealth {
  phaseName: string;
  score: number; // 0-100
  criticalFactors: string[];
  weightIssues: number;
  weightChecklist: number;
  weightVelocity: number;
  weightInfo: number;
}

export interface AdoptionHealth {
  score: number | null; // 0-100 ou null se não houver dados
  coveragePercentage: number;
  usagePercentage: number;
}

export interface EngagementHealth {
  score: number | null;
}

export interface OverallHealth {
  score: number;
  level: 'healthy' | 'attention' | 'at_risk';
  color: string;
  
  // Detalhamento Antigo mantido para compatibilidade Parcial
  currentPhaseHealth: PhaseHealth;
  velocityScore: number;
  totalDays: number;
  expectedDays: number;

  // Novos Eixos
  onboardingScore: number;
  adoption: AdoptionHealth;
  engagement: EngagementHealth;
}

const PHASE_DURATIONS: Record<string, number> = {
  'Triagem': 5,
  'Kick-off': 7,
  'Preparação': 30,
  'Implantação': 45,
  'Operação assistida': 30,
  'Wrap-up': 10,
  'Concluído': 0
};

const PHASE_WEIGHTS: Record<string, { issues: number, checklist: number, velocity: number, info: number }> = {
  'Triagem': { issues: 0, checklist: 0, velocity: 0.7, info: 0.3 },
  'Kick-off': { issues: 0, checklist: 0.5, velocity: 0.5, info: 0 },
  'Preparação': { issues: 0.6, checklist: 0.4, velocity: 0, info: 0 },
  'Implantação': { issues: 0.4, checklist: 0.4, velocity: 0.2, info: 0 },
  'Operação assistida': { issues: 0.5, checklist: 0.3, velocity: 0.2, info: 0 },
  'Wrap-up': { issues: 0.5, checklist: 0.5, velocity: 0, info: 0 },
  'Concluído': { issues: 0, checklist: 0, velocity: 0, info: 1 },
};

function getCumulativeExpectedDays(phaseName: string): number {
  let total = 0;
  for (const [phase, days] of Object.entries(PHASE_DURATIONS)) {
    total += days;
    if (phase === phaseName) break;
  }
  return total;
}

function calculateIssuesScore(issues: HealthScoreProject['issues'], phaseName: string): number {
  if (issues.length === 0) return 100;
  
  const openIssues = issues.filter(i => i.status !== 'concluida');
  if (openIssues.length === 0) return 100;

  let penalty = 0;
  openIssues.forEach(i => {
    if (i.criticality === 'alta') penalty += 30;
    else if (i.criticality === 'media') penalty += 15;
    else penalty += 5;

    if (i.category === 'infraestrutura' && (phaseName === 'Preparação' || phaseName === 'Operação assistida')) {
      penalty += 10; 
    }
  });

  return Math.max(0, 100 - penalty);
}

function calculateChecklistScore(checklists: HealthScoreProject['checklists'], phaseName: string): number {
  const phaseItems = checklists.filter(c => c.phase_name === phaseName && !c.admin_only);
  if (phaseItems.length === 0) return 100; 
  
  const checked = phaseItems.filter(c => c.checked).length;
  return Math.round((checked / phaseItems.length) * 100);
}

// ENGINE 1: ONBOARDING
function calculateOnboardingEngine(project: HealthScoreProject) {
  const currentPhase = project.current_phase || 'Triagem';
  const isCompleted = currentPhase === 'Concluído' || project.status === 'concluido';
  
  if (isCompleted) {
    return {
      score: 100,
      totalDays: 0,
      expectedDays: 0,
      velocityScore: 100,
      currentPhaseHealth: {
        phaseName: currentPhase,
        score: 100,
        criticalFactors: [],
        weightIssues: 0, weightChecklist: 0, weightVelocity: 0, weightInfo: 0
      }
    };
  }

  const startDate = project.kickoff_date ? new Date(project.kickoff_date) : new Date(project.created_at);
  const totalDays = Math.max(0, differenceInDays(new Date(), startDate));
  const expectedDays = getCumulativeExpectedDays(currentPhase);
  const hasInfraIssue = project.issues.some(i => i.status !== 'concluida' && i.category === 'infraestrutura');

  let daysLate = Math.max(0, totalDays - expectedDays);
  if (currentPhase === 'Operação assistida' && hasInfraIssue) {
    daysLate = Math.floor(daysLate * 0.2); 
  }
  const velocityScore = Math.max(0, 100 - (daysLate * 3));

  const weights = PHASE_WEIGHTS[currentPhase] || PHASE_WEIGHTS['Triagem'];
  const issuesScore = calculateIssuesScore(project.issues, currentPhase);
  const checklistScore = calculateChecklistScore(project.checklists, currentPhase);
  
  let infoScore = 100;
  if (currentPhase === 'Triagem') {
    if (!project.contracted_modules || project.contracted_modules.length === 0) infoScore -= 50;
  }

  const phaseScore = Math.round(
    (issuesScore * weights.issues) +
    (checklistScore * weights.checklist) +
    (velocityScore * weights.velocity) +
    (infoScore * weights.info)
  );

  const criticalFactors: string[] = [];
  if (issuesScore < 60) criticalFactors.push(`${project.issues.filter(i => i.status !== 'concluida' && i.criticality === 'alta').length} issues críticas`);
  if (velocityScore < 60) criticalFactors.push(`Atrasado em aprox. ${daysLate} dias`);
  if (checklistScore < 50 && weights.checklist > 0) criticalFactors.push("Checklist atrasado");
  if (currentPhase === 'Operação assistida' && hasInfraIssue) criticalFactors.push("Bloqueio de Infraestrutura");

  const progressRatio = project.progress; 
  const onboardingOverallScore = Math.round((velocityScore * 0.4) + (progressRatio * 0.2) + (phaseScore * 0.4));

  return {
    score: onboardingOverallScore,
    totalDays,
    expectedDays,
    velocityScore,
    currentPhaseHealth: {
      phaseName: currentPhase,
      score: phaseScore,
      criticalFactors,
      weightIssues: weights.issues,
      weightChecklist: weights.checklist,
      weightVelocity: weights.velocity,
      weightInfo: weights.info
    }
  };
}

// ENGINE 2: ADOPTION
function calculateAdoptionEngine(project: HealthScoreProject): AdoptionHealth {
  // Se não houver dados preenchidos
  if (project.contracted_points === undefined || project.system_usage === undefined) {
    return { score: null, coveragePercentage: 0, usagePercentage: 0 };
  }
  
  // Previne NAN
  if (project.contracted_points === 0 && project.active_points === 0 && project.system_usage === 0) {
     return { score: null, coveragePercentage: 0, usagePercentage: 0 };
  }

  const contracted = Number(project.contracted_points) || 0;
  const active = Number(project.active_points) || 0;
  const usage = Number(project.system_usage) || 0;

  const coveragePercentage = contracted > 0 ? Math.round((active / contracted) * 100) : 0;
  
  // Média simples: 50% cobertura, 50% utilização
  const score = Math.round((coveragePercentage + usage) / 2);

  return {
    score: Math.min(100, Math.max(0, score)),
    coveragePercentage,
    usagePercentage: usage
  };
}

// ENGINE C: ENGAGEMENT (Placeholder)
function calculateEngagementEngine(project: HealthScoreProject): EngagementHealth {
  // No futuro, conectaremos reuniões. Por enquanto, não influi no peso.
  return { score: null };
}

// FINAL COMPILATION
export function calculateHealthScore(project: HealthScoreProject): OverallHealth {
  
  const onboarding = calculateOnboardingEngine(project);
  const adoption = calculateAdoptionEngine(project);
  const engagement = calculateEngagementEngine(project);

  // Dynamic Weights System
  // Pesos originais preteridos: Onboarding (35), Adoption (45), Engagement (20)
  const baseWeights = {
    onboarding: 40,
    adoption: 60,
    engagement: 0 // desligado por enquanto
  };

  let totalAvailableWeight = baseWeights.onboarding; // Onboarding sempre existe
  let weightedScoreSum = onboarding.score * baseWeights.onboarding;

  if (adoption.score !== null) {
    totalAvailableWeight += baseWeights.adoption;
    weightedScoreSum += adoption.score * baseWeights.adoption;
  }

  if (engagement.score !== null) {
    totalAvailableWeight += baseWeights.engagement;
    weightedScoreSum += engagement.score * baseWeights.engagement;
  }

  // Se o projeto está apenas "Concluído", a adoção deve valer muito mais que o onboarding,
  // poderíamos inverter. Mas por hora, a média ponderada fará:
  const finalScore = Math.round(weightedScoreSum / totalAvailableWeight);

  let level: 'healthy' | 'attention' | 'at_risk' = 'healthy';
  let color = 'bg-success';

  if (finalScore < 50) {
    level = 'at_risk';
    color = 'bg-destructive';
  } else if (finalScore < 80) {
    level = 'attention';
    color = 'bg-warning';
  }

  return {
    score: finalScore,
    level,
    color,
    
    // Parâmetros Antigos (Compatibilidade View Atual)
    currentPhaseHealth: onboarding.currentPhaseHealth,
    velocityScore: onboarding.velocityScore,
    totalDays: onboarding.totalDays,
    expectedDays: onboarding.expectedDays,

    // Parâmetros Novos Multidimensionais
    onboardingScore: onboarding.score,
    adoption,
    engagement
  };
}
