ALTER TABLE onboarding_checklist_items ADD COLUMN IF NOT EXISTS admin_only BOOLEAN DEFAULT false;
