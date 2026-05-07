-- ====================================================================================
-- MIGRATION: LOG ARCHIVE INFRASTRUCTURE
-- ====================================================================================

-- 1. Criar o bucket para armazenamento a frio de logs
INSERT INTO storage.buckets (id, name, public)
VALUES ('logs-archive', 'logs-archive', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de RLS para o bucket logs-archive
-- Apenas administradores da Cogtive podem acessar esses arquivos

-- Garantir que a tabela storage.objects tem RLS (geralmente já tem por padrão no Supabase)
-- Mas definimos a política específica para nosso bucket

DROP POLICY IF EXISTS "Admins have full access to log archives" ON storage.objects;

CREATE POLICY "Admins have full access to log archives"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'logs-archive' AND 
  (
    (auth.jwt() ->> 'email' LIKE '%@cogtive.com') OR 
    (EXISTS (SELECT 1 FROM onboarding_contacts WHERE email = auth.jwt() ->> 'email' AND is_cogtive = true))
  )
)
WITH CHECK (
  bucket_id = 'logs-archive' AND 
  (
    (auth.jwt() ->> 'email' LIKE '%@cogtive.com') OR 
    (EXISTS (SELECT 1 FROM onboarding_contacts WHERE email = auth.jwt() ->> 'email' AND is_cogtive = true))
  )
);
