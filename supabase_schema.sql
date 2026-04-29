-- SCHEMA DE ONBOARDING - LITE APP

-- Tabela de Projetos (Card Principal do Pipefy)
CREATE TABLE IF NOT EXISTS onboarding_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipefy_card_id TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    plant_name TEXT,
    city TEXT,
    status TEXT CHECK (status IN ('em_preparacao', 'em_implantacao', 'aguardando_cliente', 'em_treinamento', 'operacao_assistida', 'wrap_up', 'concluido')),
    current_phase TEXT,
    progress INTEGER DEFAULT 0,
    next_milestone_date DATE,
    kickoff_date DATE,
    contracted_modules TEXT[],
    summary TEXT,
    client_email TEXT, -- Usado para RLS (controle de acesso do cliente)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Etapas do Projeto (Fases do Pipefy)
CREATE TABLE IF NOT EXISTS onboarding_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    pipefy_phase_id TEXT,
    name TEXT NOT NULL,
    status TEXT CHECK (status IN ('completed', 'current', 'upcoming')),
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pendências (Campos de atrasos ou checklists do Pipefy)
CREATE TABLE IF NOT EXISTS onboarding_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    criticality TEXT CHECK (criticality IN ('alta', 'media', 'baixa')),
    deadline DATE,
    status TEXT CHECK (status IN ('aberta', 'em_andamento', 'aguardando_retorno', 'concluida')),
    suggested_owner TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marcos do Projeto (Milestones)
CREATE TABLE IF NOT EXISTS onboarding_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    responsible TEXT,
    planned_date DATE,
    actual_date DATE,
    status TEXT CHECK (status IN ('completed', 'in_progress', 'upcoming')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treinamentos
CREATE TABLE IF NOT EXISTS onboarding_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('operacional', 'oee', 'modulo_especifico', 'reciclagem', 'alinhamento_lideranca')),
    planned_date DATE,
    actual_date DATE,
    status TEXT CHECK (status IN ('agendado', 'realizado', 'cancelado', 'pendente')),
    responsible TEXT,
    observation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entregas (Deliveries)
CREATE TABLE IF NOT EXISTS onboarding_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    planned_date DATE,
    actual_date DATE,
    status TEXT CHECK (status IN ('concluida', 'em_andamento', 'pendente')),
    responsible TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contatos do Onboarding
CREATE TABLE IF NOT EXISTS onboarding_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    area TEXT,
    is_cogtive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos Compartilhados
CREATE TABLE IF NOT EXISTS onboarding_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('apresentacao', 'checklist', 'guia', 'treinamento', 'documento')),
    date DATE,
    description TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEGURANÇA (RLS)
ALTER TABLE onboarding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;

-- Funções utilitárias para RLS (DRY)
CREATE OR REPLACE FUNCTION is_project_owner(proj_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM onboarding_projects 
    WHERE id = proj_id 
    AND client_email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de RLS
CREATE POLICY "Clientes veem projetos" ON onboarding_projects FOR SELECT USING (auth.jwt() ->> 'email' = client_email);
CREATE POLICY "Clientes veem fases" ON onboarding_phases FOR SELECT USING (is_project_owner(project_id));
CREATE POLICY "Clientes veem issues" ON onboarding_issues FOR SELECT USING (is_project_owner(project_id));
CREATE POLICY "Clientes veem milestones" ON onboarding_milestones FOR SELECT USING (is_project_owner(project_id));
CREATE POLICY "Clientes veem treinamentos" ON onboarding_trainings FOR SELECT USING (is_project_owner(project_id));
CREATE POLICY "Clientes veem entregas" ON onboarding_deliveries FOR SELECT USING (is_project_owner(project_id));
CREATE POLICY "Clientes veem contatos" ON onboarding_contacts FOR SELECT USING (is_project_owner(project_id));
CREATE POLICY "Clientes veem documentos" ON onboarding_documents FOR SELECT USING (is_project_owner(project_id));
