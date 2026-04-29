-- ====================================================================================
-- COGTIVE SUCCESS HUB - GO-LIVE SECURITY SCRIPT
-- ====================================================================================
-- Objetivo: Proteger todas as 9 tabelas do sistema para que clientes enxerguem EXCLUSIVAMENTE 
-- seus próprios projetos, enquanto gestores @cogtive.com enxergam tudo.
-- ====================================================================================

-- 1. Habilitar a barreira física do RLS em todas as tabelas (Fechando as portas)
ALTER TABLE onboarding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checklist_items ENABLE ROW LEVEL SECURITY;


-- 2. Regra Dourada 1: Admin vê TUDO (Qualquer email @cogtive.com passa livremente)
CREATE POLICY "Admins_Bypass_Projects" ON onboarding_projects FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');
CREATE POLICY "Admins_Bypass_Phases" ON onboarding_phases FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');
CREATE POLICY "Admins_Bypass_Issues" ON onboarding_issues FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');
CREATE POLICY "Admins_Bypass_Milestones" ON onboarding_milestones FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');
CREATE POLICY "Admins_Bypass_Trainings" ON onboarding_trainings FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');
CREATE POLICY "Admins_Bypass_Deliveries" ON onboarding_deliveries FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');
CREATE POLICY "Admins_Bypass_Contacts" ON onboarding_contacts FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');
CREATE POLICY "Admins_Bypass_Documents" ON onboarding_documents FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');
CREATE POLICY "Admins_Bypass_Checklists" ON onboarding_checklist_items FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');


-- 3. Regra Dourada 2: Cliente SÓ enxerga o próprio ID de projeto
CREATE POLICY "Clients_Own_Project" ON onboarding_projects FOR SELECT USING (
  lower(client_email) = lower(auth.jwt() ->> 'email')
);

CREATE POLICY "Clients_Own_Phases" ON onboarding_phases FOR SELECT USING (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);

CREATE POLICY "Clients_Own_Issues" ON onboarding_issues FOR SELECT USING (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);

CREATE POLICY "Clients_Own_Milestones" ON onboarding_milestones FOR SELECT USING (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);

CREATE POLICY "Clients_Own_Trainings" ON onboarding_trainings FOR SELECT USING (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);

CREATE POLICY "Clients_Own_Deliveries" ON onboarding_deliveries FOR SELECT USING (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);

CREATE POLICY "Clients_Own_Contacts" ON onboarding_contacts FOR SELECT USING (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);

CREATE POLICY "Clients_Own_Documents" ON onboarding_documents FOR SELECT USING (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);

CREATE POLICY "Clients_Own_Checklists" ON onboarding_checklist_items FOR SELECT USING (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);
