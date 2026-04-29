-- 1. Cria ou substitui a função que verifica se o e-mail atual é da Cogtive
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') ILIKE '%@cogtive.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recria as políticas de RLS para conceder acesso em caso de admin ou dono
-- Dropando as políticas antigas para evitar duplicação ou conflito
DROP POLICY IF EXISTS "Clientes veem projetos" ON onboarding_projects;
DROP POLICY IF EXISTS "Clientes veem fases" ON onboarding_phases;
DROP POLICY IF EXISTS "Clientes veem issues" ON onboarding_issues;
DROP POLICY IF EXISTS "Clientes veem milestones" ON onboarding_milestones;
DROP POLICY IF EXISTS "Clientes veem treinamentos" ON onboarding_trainings;
DROP POLICY IF EXISTS "Clientes veem entregas" ON onboarding_deliveries;
DROP POLICY IF EXISTS "Clientes veem contatos" ON onboarding_contacts;
DROP POLICY IF EXISTS "Clientes veem documentos" ON onboarding_documents;

-- Recriando com o bypass do admin
CREATE POLICY "Clientes veem projetos" ON onboarding_projects FOR SELECT USING (is_admin() OR auth.jwt() ->> 'email' = client_email);
CREATE POLICY "Clientes veem fases" ON onboarding_phases FOR SELECT USING (is_admin() OR is_project_owner(project_id));
CREATE POLICY "Clientes veem issues" ON onboarding_issues FOR SELECT USING (is_admin() OR is_project_owner(project_id));
CREATE POLICY "Clientes veem milestones" ON onboarding_milestones FOR SELECT USING (is_admin() OR is_project_owner(project_id));
CREATE POLICY "Clientes veem treinamentos" ON onboarding_trainings FOR SELECT USING (is_admin() OR is_project_owner(project_id));
CREATE POLICY "Clientes veem entregas" ON onboarding_deliveries FOR SELECT USING (is_admin() OR is_project_owner(project_id));
CREATE POLICY "Clientes veem contatos" ON onboarding_contacts FOR SELECT USING (is_admin() OR is_project_owner(project_id));
CREATE POLICY "Clientes veem documentos" ON onboarding_documents FOR SELECT USING (is_admin() OR is_project_owner(project_id));
