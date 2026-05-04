import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useActivityLog() {
  const { session } = useAuth();
  const userEmail = session?.user?.email || 'Sistema';

  const logActivity = async (projectId: string, actionType: string, description: string) => {
    if (!projectId) return;
    
    try {
      const { error } = await supabase.from('activity_logs').insert([
        {
          project_id: projectId,
          actor_email: userEmail,
          action_type: actionType,
          description: description,
          is_read: false
        }
      ]);
      if (error) {
         console.error('ERRO GRAVE AO INSERIR LOG:', error);
      } else {
         console.log('Log de atividade registrado com sucesso!');
      }
    } catch (err) {
      console.error('Falha não-crítica ao registrar Log de Atividade', err);
    }
  };

  return { logActivity };
}
