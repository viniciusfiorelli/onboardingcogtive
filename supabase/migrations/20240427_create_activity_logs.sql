-- ====================================================================================
-- MIGRATION: ACTIVITY LOGS & NOTIFICATION BELL
-- ====================================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES onboarding_projects(id) ON DELETE CASCADE,
    actor_email VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para performance em busca de não lidos e ordenação
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_is_read ON activity_logs(is_read);

-- RLS (Row Level Security) para a tabela de logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins_Bypass_Logs" ON activity_logs 
FOR ALL USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com');

CREATE POLICY "Clients_Insert_Logs" ON activity_logs 
FOR INSERT WITH CHECK (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);

CREATE POLICY "Clients_View_Logs" ON activity_logs 
FOR SELECT USING (
  project_id IN (SELECT id FROM onboarding_projects WHERE lower(client_email) = lower(auth.jwt() ->> 'email'))
);
