-- Tabela de itens de checklist (extraídos das fases do Pipefy)
CREATE TABLE IF NOT EXISTS onboarding_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    phase_name TEXT NOT NULL,
    checklist_label TEXT NOT NULL,
    item_text TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE onboarding_checklist_items ENABLE ROW LEVEL SECURITY;

-- Política: clientes veem apenas seus dados
CREATE POLICY "client_checklist_access" ON onboarding_checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM onboarding_projects p
      WHERE p.id = onboarding_checklist_items.project_id
        AND (p.client_email = auth.jwt()->>'email' OR is_admin())
    )
  );
