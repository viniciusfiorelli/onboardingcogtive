-- Adicionar coluna field_type para distinguir entre radio, checklist e campos de texto
ALTER TABLE onboarding_checklist_items ADD COLUMN IF NOT EXISTS field_type TEXT DEFAULT 'checklist';
