-- Restrict client reads to checklist items that are meant for the client UI.
-- Admin policies remain unchanged.
DROP POLICY IF EXISTS "Clients_Own_Checklists" ON onboarding_checklist_items;

CREATE POLICY "Clients_Own_Checklists" ON onboarding_checklist_items
FOR SELECT USING (
  client_visible = true
  AND COALESCE(admin_only, false) = false
  AND project_id IN (
    SELECT id
    FROM onboarding_projects
    WHERE lower(client_email) = lower(auth.jwt() ->> 'email')
  )
);
