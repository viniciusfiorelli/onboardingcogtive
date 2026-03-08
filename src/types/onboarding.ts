export type ProjectStatus =
  | 'em_preparacao'
  | 'em_implantacao'
  | 'aguardando_cliente'
  | 'em_treinamento'
  | 'operacao_assistida'
  | 'wrap_up'
  | 'concluido';

export type PhaseStatus = 'completed' | 'current' | 'upcoming';

export interface ProjectPhase {
  id: string;
  name: string;
  status: PhaseStatus;
  order: number;
}

export type PendingCategory =
  | 'infraestrutura'
  | 'rede'
  | 'eletrica'
  | 'acessos'
  | 'cadastro'
  | 'disponibilidade'
  | 'treinamento'
  | 'documentacao'
  | 'validacao';

export type PendingCriticality = 'alta' | 'media' | 'baixa';
export type PendingStatus = 'aberta' | 'em_andamento' | 'aguardando_retorno' | 'concluida';

export interface CustomerPendingIssue {
  id: string;
  title: string;
  description: string;
  category: PendingCategory;
  criticality: PendingCriticality;
  deadline: string;
  status: PendingStatus;
  suggestedOwner: string;
  observation?: string;
}

export type MilestoneStatus = 'completed' | 'in_progress' | 'upcoming';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  responsible: string;
  plannedDate: string;
  actualDate?: string;
  status: MilestoneStatus;
}

export type TrainingType = 'operacional' | 'oee' | 'modulo_especifico' | 'reciclagem' | 'alinhamento_lideranca';
export type TrainingStatus = 'agendado' | 'realizado' | 'cancelado' | 'pendente';

export interface TrainingSession {
  id: string;
  name: string;
  type: TrainingType;
  plannedDate: string;
  actualDate?: string;
  status: TrainingStatus;
  responsible: string;
  observation?: string;
}

export type DeliveryStatus = 'concluida' | 'em_andamento' | 'pendente';

export interface DeliveryItem {
  id: string;
  name: string;
  description: string;
  plannedDate: string;
  actualDate?: string;
  status: DeliveryStatus;
  responsible: string;
}

export interface ProjectContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  area: string;
  observation?: string;
  isCogtive: boolean;
}

export type DocumentType = 'apresentacao' | 'checklist' | 'guia' | 'treinamento' | 'documento';

export interface SharedDocument {
  id: string;
  name: string;
  type: DocumentType;
  date: string;
  description: string;
}

export interface OnboardingProject {
  id: string;
  clientName: string;
  plantName: string;
  city: string;
  status: ProjectStatus;
  currentPhase: string;
  progress: number;
  nextMilestoneDate: string;
  contractedModules: string[];
  summary: string;
  phases: ProjectPhase[];
  pendingIssues: CustomerPendingIssue[];
  milestones: Milestone[];
  trainings: TrainingSession[];
  deliveries: DeliveryItem[];
  contacts: ProjectContact[];
  documents: SharedDocument[];
}
