
-- Tabela para gerenciar uploads enviados pelo cliente
CREATE TABLE IF NOT EXISTS onboarding_client_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Nome original do arquivo
    description TEXT, -- Descrição opcional
    file_url TEXT NOT NULL, -- URL no Supabase Storage
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT, -- Motivo se for reprovado
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE onboarding_client_uploads ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
-- 1. Clientes veem apenas seus próprios uploads
CREATE POLICY "Clientes veem seus uploads" ON onboarding_client_uploads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM onboarding_projects 
            WHERE id = project_id 
            AND client_email = auth.jwt() ->> 'email'
        )
    );

-- 2. Clientes podem subir arquivos para seus projetos
CREATE POLICY "Clientes podem inserir uploads" ON onboarding_client_uploads
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM onboarding_projects 
            WHERE id = project_id 
            AND client_email = auth.jwt() ->> 'email'
        )
    );

-- 3. Admins podem fazer tudo
CREATE POLICY "Admins podem gerenciar uploads" ON onboarding_client_uploads
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN (
            SELECT email FROM onboarding_contacts WHERE is_cogtive = true
        )
    );
