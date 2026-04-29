-- Migration: Add JSONB column to onboarding_projects to handle native dynamic checklists decoupled from Pipefy

ALTER TABLE onboarding_projects
ADD COLUMN IF NOT EXISTS native_checklist_states JSONB DEFAULT '{}'::jsonb;

-- Criar a Stored Procedure para garantir consistência em ambientes de concorrência
CREATE OR REPLACE FUNCTION toggle_native_checklist(
   p_project_id UUID,
   p_item_id TEXT,
   p_is_checked BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
   v_current_state JSONB;
   v_new_state JSONB;
BEGIN
   -- Recupera a row lockada para leitura
   SELECT native_checklist_states INTO v_current_state 
   FROM onboarding_projects 
   WHERE id = p_project_id
   FOR UPDATE;

   IF v_current_state IS NULL THEN
      v_current_state := '{}'::jsonb;
   END IF;

   -- Altera ou cria a chave (itemId) jogando bool via jsonb_set
   v_new_state := jsonb_set(
      v_current_state,
      array[p_item_id],
      to_jsonb(p_is_checked),
      true
   );

   -- Update local
   UPDATE onboarding_projects
   SET native_checklist_states = v_new_state,
       updated_at = NOW()
   WHERE id = p_project_id;

   RETURN v_new_state;
END;
$$;
