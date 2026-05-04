import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin, checkIsAdmin } from '@/contexts/AdminContext';
import { 
  OnboardingProject, 
  ProjectPhase, 
  PhaseStatus,
  CustomerPendingIssue, 
  PendingCategory,
  PendingCriticality,
  PendingStatus,
  Milestone, 
  MilestoneStatus,
  TrainingSession, 
  TrainingType,
  TrainingStatus,
  DeliveryItem, 
  DeliveryStatus,
  ProjectContact, 
  SharedDocument, 
  ChecklistItem 
} from '@/types/onboarding';

export function useProjectData() {
  const { session } = useAuth();
  const { isAdmin, selectedProjectId } = useAdmin();
  const userEmail = session?.user?.email;

  // Lógica de alvo estrita:
  // 1. Admin selecionou um projeto? Usa o ID.
  // 2. Admin não selecionou nada? target será nulo.
  // 3. Não é admin? Usa o e-mail do próprio usuário logado.
  const targetId = isAdmin ? selectedProjectId : null;
  const targetEmail = !isAdmin ? userEmail : null;
  
  // Se for admin, mas não tem targetId, isDataReady é falso (força tela de seleção no front)
  const isDataReady = isAdmin ? !!targetId : !!targetEmail;


  const query = useQuery({
    queryKey: ['projectData', targetId, targetEmail],
    enabled: isDataReady,
    staleTime: 1000 * 60 * 1, // Cache de 1 minuto para manter dados mais frescos
    refetchOnWindowFocus: true, // Re-sincroniza ao voltar para a aba
    refetchOnMount: 'always', // Sempre rebusca ao montar o componente
    queryFn: async () => {
      if (!isDataReady) throw new Error('Aguardando seleção de projeto.');



      // 2. Busca o projeto principal
      // 2. Busca o projeto principal
      
      let queryBuilder = supabase
        .from('onboarding_projects')
        .select(`
          *,
          onboarding_phases (*),
          onboarding_issues (*),
          onboarding_milestones (*),
          onboarding_trainings (*),
          onboarding_deliveries (*),
          onboarding_contacts (*),
          onboarding_documents (*),
          onboarding_client_uploads (*),
          onboarding_checklist_items (*)
        `);
      
      if (targetId) {
        queryBuilder = queryBuilder.eq('id', targetId);
      } else {
        queryBuilder = queryBuilder.eq('client_email', targetEmail);
      }

      const { data: results, error: projectError } = await queryBuilder;

      if (projectError) {
        console.error('useProjectData - Erro na query:', projectError);
        throw projectError;
      }

      if (!results || results.length === 0) {
        throw new Error(`Não encontramos nenhum projeto vinculado ao alvo: ${targetId || targetEmail}`);
      }

      const projectData = results[0];

      // Processamento das fases
      const standardPhases = [
        'Triagem',
        'Kick-off',
        'Preparação',
        'Implantação',
        'Operação assistida',
        'Wrap-up',
        'Concluído'
      ];

      const rawPhases = projectData.onboarding_phases || [];
      const normalize = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
      const normPhase = normalize(projectData.current_phase || '');
      const currentPhaseIdx = standardPhases.findIndex(p => normalize(p) === normPhase);

      const calculatePhaseStatus = (idx: number): PhaseStatus => {
        let phaseStatus: PhaseStatus = 'upcoming';
        if (idx < currentPhaseIdx) phaseStatus = 'completed';
        else if (idx === currentPhaseIdx) phaseStatus = 'current';
        else if (currentPhaseIdx === -1 && idx === 0) phaseStatus = 'current';
        return phaseStatus;
      };

      const formattedPhases: ProjectPhase[] = rawPhases.length > 0
        ? rawPhases.map((p: any) => {
            const stdIdx = standardPhases.findIndex(sp => normalize(sp) === normalize(p.name));
            return {
              id: p.id,
              name: p.name,
              status: stdIdx !== -1 ? calculatePhaseStatus(stdIdx) : p.status as PhaseStatus,
              order: p.order
            };
          }).sort((a: any, b: any) => a.order - b.order)
        : (() => {
            return standardPhases.map((name, idx) => ({
              id: String(idx + 1),
              name,
              status: calculatePhaseStatus(idx),
              order: idx + 1
            }));
          })();

      // Cálculo dinâmico de progresso se o banco retornar 0 ou undefined
      let progressValue = projectData.progress;
      if (!progressValue || progressValue === 0) {
        const completedCount = formattedPhases.filter(p => p.status === 'completed').length;
        const currentIndex = formattedPhases.findIndex(p => p.status === 'current');
        const countForProgress = currentIndex !== -1 ? currentIndex + 1 : completedCount;
        progressValue = Math.round((countForProgress / formattedPhases.length) * 100);
        if (progressValue === 0 && completedCount === 0 && currentIndex === -1) progressValue = 5;
      }

      const formattedProject: OnboardingProject = {
        id: projectData.id,
        clientName: projectData.client_name,
        plantName: projectData.plant_name || '',
        city: projectData.city || '',
        status: projectData.status || 'em_preparacao',
        currentPhase: projectData.current_phase || '',
        progress: progressValue,
        nextMilestoneDate: projectData.next_milestone_date,
        contractedModules: projectData.contracted_modules || [],
        summary: projectData.summary || '',
        phases: formattedPhases,
            
        pendingIssues: (projectData.onboarding_issues || []).map((i: any) => ({
          ...i,
          suggestedOwner: i.suggested_owner,
          criticality: i.criticality as PendingCriticality,
          status: i.status as PendingStatus,
          category: i.category as PendingCategory
        })) as CustomerPendingIssue[],
        
        milestones: (projectData.onboarding_milestones || []).map((m: any) => ({
          ...m,
          plannedDate: m.planned_date,
          actualDate: m.actual_date,
          status: m.status as MilestoneStatus
        })) as Milestone[],

        trainings: (projectData.onboarding_trainings || []).map((t: any) => ({
          ...t,
          plannedDate: t.planned_date,
          actualDate: t.actual_date,
          type: t.type as TrainingType,
          status: t.status as TrainingStatus
        })) as TrainingSession[],

        deliveries: (projectData.onboarding_deliveries || []).map((d: any) => ({
          ...d,
          plannedDate: d.planned_date,
          actualDate: d.actual_date,
          status: d.status as DeliveryStatus
        })) as DeliveryItem[],

        contacts: (projectData.onboarding_contacts || []).map((c: any) => ({
          ...c,
          isCogtive: c.is_cogtive
        })) as ProjectContact[],

        documents: [
          ...(projectData.onboarding_documents || []).map((doc: any) => ({
            ...doc,
            fileUrl: doc.file_url
          })),
          ...(projectData.onboarding_checklist_items || [])
            .filter((cl: any) => {
              if (!cl.client_visible || !cl.item_text) return false;
              const isUrl = /^https?:\/\/[^\s]+$/.test(cl.item_text.trim());
              return cl.field_type === 'attachment' || (cl.field_type === 'text' && isUrl);
            })
            .map((cl: any) => {
              const isSpreadsheet = cl.item_text?.includes('spreadsheets') || cl.item_text?.includes('excel') || cl.item_text?.includes('.xlsx');
              const isPresentation = cl.item_text?.includes('presentation') || cl.checklist_label?.toLowerCase().includes('apresentação');
              let autoType = 'documento';
              if (isSpreadsheet) autoType = 'guia'; // or something related
              if (isPresentation) autoType = 'apresentacao';

              return {
                id: cl.id,
                projectId: cl.project_id,
                name: cl.checklist_label || 'Link / Anexo',
                type: autoType,
                date: cl.updated_at || cl.created_at,
                description: `Compartilhado na Fase: ${cl.phase_name}`,
                fileUrl: cl.item_text.trim(),
                createdAt: cl.created_at
              };
            })
        ] as SharedDocument[],
        
        clientUploads: (projectData.onboarding_client_uploads || []).map((u: any) => ({
          id: u.id,
          projectId: u.project_id,
          name: u.name,
          description: u.description,
          fileUrl: u.file_url,
          status: u.status,
          rejectionReason: u.rejection_reason,
          createdAt: u.created_at
        })),

        checklistItems: (projectData.onboarding_checklist_items || [])
          .filter((cl: any) => {
             const isUrl = /^https?:\/\/[^\s]+$/.test((cl.item_text || '').trim());
             return cl.field_type !== 'attachment' && !(cl.field_type === 'text' && isUrl);
          })
          .map((cl: any) => ({
          id: cl.id,
          projectId: cl.project_id,
          phaseName: cl.phase_name,
          checklistLabel: cl.checklist_label,
          itemText: cl.item_text,
          checked: cl.checked,
          adminOnly: cl.admin_only || false,
          clientVisible: cl.client_visible ?? true,
          pipefyFieldId: cl.pipefy_field_id || null,
          fieldType: cl.field_type || 'checklist',
          createdAt: cl.created_at,
          updatedAt: cl.updated_at,
        })) as ChecklistItem[],
        createdAt: projectData.created_at,
        kickoffDate: projectData.kickoff_date,
        contractedPoints: projectData.contracted_points,
        activePoints: projectData.active_points,
        systemUsage: projectData.system_usage,
        nativeChecklistStates: projectData.native_checklist_states || {},
      };

      return formattedProject;
    },
  });

  return {
    ...query,
    isLoading: query.isLoading || (query.fetchStatus === 'idle' && !isDataReady)
  };
}
