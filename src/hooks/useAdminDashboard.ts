import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { calculateHealthScore, HealthScoreProject, OverallHealth } from '@/lib/healthScore';

export interface DashboardProject extends HealthScoreProject {
  health: OverallHealth;
}

export function useAdminDashboard() {
  const { isAdmin } = useAdmin();

  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_projects')
        .select(`
          id,
          client_name,
          status,
          current_phase,
          kickoff_date,
          created_at,
          progress,
          contracted_modules,
          contracted_points,
          active_points,
          system_usage,
          onboarding_issues ( status, criticality, category ),
          onboarding_checklist_items ( checked, phase_name, admin_only )
        `)
        .order('client_name');
        
      if (error) throw error;
      
      const uniqueClients = Array.from(new Map(data.map(item => [item.id, item])).values());
      
      const mappedProjects: DashboardProject[] = uniqueClients.map(project => {
        const hProject: HealthScoreProject = {
          id: project.id,
          client_name: project.client_name,
          status: project.status,
          current_phase: project.current_phase,
          kickoff_date: project.kickoff_date,
          created_at: project.created_at,
          progress: project.progress,
          contracted_modules: project.contracted_modules || [],
          issues: project.onboarding_issues || [],
          checklists: project.onboarding_checklist_items || [],
          contracted_points: project.contracted_points,
          active_points: project.active_points,
          system_usage: project.system_usage
        };
        
        return {
          ...hProject,
          health: calculateHealthScore(hProject)
        };
      });

      return mappedProjects;
    },
    enabled: isAdmin,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
}
