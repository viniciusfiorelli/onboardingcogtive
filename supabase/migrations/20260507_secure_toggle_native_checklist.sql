-- Harden toggle_native_checklist so authenticated users can only update
-- their own project, while Cogtive admins keep the current admin behavior.

CREATE OR REPLACE FUNCTION toggle_native_checklist(
   p_project_id UUID,
   p_item_id TEXT,
   p_is_checked BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
   v_current_state JSONB;
   v_new_state JSONB;
   v_requester_email TEXT;
   v_project_client_email TEXT;
BEGIN
   v_requester_email := lower(auth.jwt() ->> 'email');

   IF v_requester_email IS NULL OR v_requester_email = '' THEN
      RAISE EXCEPTION 'Acesso negado: usuario nao autenticado.';
   END IF;

   IF p_project_id IS NULL OR p_item_id IS NULL OR btrim(p_item_id) = '' THEN
      RAISE EXCEPTION 'Parametros invalidos.';
   END IF;

   SELECT lower(client_email)
   INTO v_project_client_email
   FROM onboarding_projects
   WHERE id = p_project_id;

   IF v_project_client_email IS NULL THEN
      RAISE EXCEPTION 'Projeto nao encontrado.';
   END IF;

   IF v_requester_email NOT LIKE '%@cogtive.com'
      AND v_project_client_email <> v_requester_email THEN
      RAISE EXCEPTION 'Acesso negado: projeto nao pertence ao usuario.';
   END IF;

   SELECT native_checklist_states
   INTO v_current_state
   FROM onboarding_projects
   WHERE id = p_project_id
   FOR UPDATE;

   IF v_current_state IS NULL THEN
      v_current_state := '{}'::jsonb;
   END IF;

   v_new_state := jsonb_set(
      v_current_state,
      array[p_item_id],
      to_jsonb(p_is_checked),
      true
   );

   UPDATE onboarding_projects
   SET native_checklist_states = v_new_state,
       updated_at = NOW()
   WHERE id = p_project_id;

   RETURN v_new_state;
END;
$$;
