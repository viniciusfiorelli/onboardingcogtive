import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useActivityLog() {
  const { session } = useAuth();
  const userEmail = session?.user?.email || 'Sistema';

  const logActivity = async (projectId: string, actionType: string, description: string) => {
    if (!projectId) return;
    
    try {
      await supabase.from('activity_logs').insert([
        {
          project_id: projectId,
          actor_email: userEmail,
          action_type: actionType,
          description: description,
          is_read: false
        }
      ]);
    } catch (err) {
      console.error('Falha não-crítica ao registrar Log de Atividade', err);
    }
  };

  return { logActivity };
}
