-- 1. Adicionar as novas colunas de controle de Utilização (Adoção) na tabela de projetos
ALTER TABLE onboarding_projects
ADD COLUMN IF NOT EXISTS contracted_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_points numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS system_usage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_usage_sync_at timestamp with time zone;

-- 2. Criar a tabela de Histórico do Health Score (Benchmark Trends)
CREATE TABLE IF NOT EXISTS health_score_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    client_name text NOT NULL,
    recorded_at timestamp with time zone DEFAULT now(),
    overall_score integer NOT NULL,
    onboarding_score integer NOT NULL,
    adoption_score integer NOT NULL,
    engagement_score integer NOT NULL,
    health_level text NOT NULL, -- 'healthy', 'attention', 'at_risk'
    notes text
);

-- Habilitar RLS no Histórico
ALTER TABLE health_score_history ENABLE ROW LEVEL SECURITY;

-- Política de RLS para Admin (assumindo que o Admin tem acesso total assim como nas outras)
CREATE POLICY "Enable read access for all authenticated users" ON health_score_history AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON health_score_history FOR INSERT TO authenticated WITH CHECK (true);
