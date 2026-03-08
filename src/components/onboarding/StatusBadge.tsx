import { cn } from '@/lib/utils';
import { PhaseStatus } from '@/types/onboarding';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Project status
  em_preparacao: { label: 'Em preparação', className: 'bg-warning/15 text-warning border-warning/30' },
  em_implantacao: { label: 'Em implantação', className: 'bg-primary/15 text-primary border-primary/30' },
  aguardando_cliente: { label: 'Aguardando cliente', className: 'bg-warning/15 text-warning border-warning/30' },
  em_treinamento: { label: 'Em treinamento', className: 'bg-primary/15 text-primary border-primary/30' },
  operacao_assistida: { label: 'Operação assistida', className: 'bg-primary/15 text-primary border-primary/30' },
  wrap_up: { label: 'Wrap-up', className: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30' },
  concluido: { label: 'Concluído', className: 'bg-success/15 text-success border-success/30' },
  // Pending status
  aberta: { label: 'Aberta', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  em_andamento: { label: 'Em andamento', className: 'bg-primary/15 text-primary border-primary/30' },
  aguardando_retorno: { label: 'Aguardando retorno', className: 'bg-warning/15 text-warning border-warning/30' },
  concluida: { label: 'Concluída', className: 'bg-success/15 text-success border-success/30' },
  // Criticality
  alta: { label: 'Alta', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  media: { label: 'Média', className: 'bg-warning/15 text-warning border-warning/30' },
  baixa: { label: 'Baixa', className: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30' },
  // Training
  agendado: { label: 'Agendado', className: 'bg-primary/15 text-primary border-primary/30' },
  realizado: { label: 'Realizado', className: 'bg-success/15 text-success border-success/30' },
  cancelado: { label: 'Cancelado', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  pendente: { label: 'Pendente', className: 'bg-warning/15 text-warning border-warning/30' },
  // Milestone
  completed: { label: 'Concluído', className: 'bg-success/15 text-success border-success/30' },
  in_progress: { label: 'Em andamento', className: 'bg-primary/15 text-primary border-primary/30' },
  upcoming: { label: 'Previsto', className: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30' },
};

const categoryLabels: Record<string, string> = {
  infraestrutura: 'Infraestrutura',
  rede: 'Rede',
  eletrica: 'Elétrica',
  acessos: 'Acessos',
  cadastro: 'Cadastro',
  disponibilidade: 'Disponibilidade',
  treinamento: 'Treinamento',
  documentacao: 'Documentação',
  validacao: 'Validação',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground border-border' };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const label = categoryLabels[category] || category;
  return (
    <span className={cn('inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground border border-border/50', className)}>
      {label}
    </span>
  );
}
