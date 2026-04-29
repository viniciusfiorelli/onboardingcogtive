-- -----------------------------------------------------
-- MIGRATION: ADICIONANDO SUPORTE AO ID DO PIPEFY FIELD
-- -----------------------------------------------------

-- 1. Adiciona a coluna que guardará o ID original do campo no Pipefy (necessário para a Mutação de retorno)
ALTER TABLE public.onboarding_checklist_items ADD COLUMN IF NOT EXISTS pipefy_field_id TEXT;

-- Observação: Após rodar este comando, por favor acesse a página de Admin e clique em "Sincronizar Pipefy" (ou invoque a edge function)
-- Isso fará com que o supabase preencha esta nova coluna com os IDs corretos.
