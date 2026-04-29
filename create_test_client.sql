DO $$
DECLARE
  new_proj_id UUID;
  old_proj_id UUID;
BEGIN
  -- 1. Pega o projeto "Fitoway" (ou qualquer primeiro projeto se ele não existir)
  SELECT id INTO old_proj_id FROM onboarding_projects 
  ORDER BY (client_name ILIKE '%Fitoway%') DESC 
  LIMIT 1;

  IF old_proj_id IS NOT NULL THEN
    -- 2. Limpa o teste antigo caso você rode o script duas vezes
    DELETE FROM onboarding_projects WHERE client_email = 'teste@teste.com.br';

    -- 3. Duplica as informações do projeto
    INSERT INTO onboarding_projects (
      pipefy_card_id, client_name, plant_name, city, 
      status, current_phase, progress, summary, contracted_modules, client_email,
      next_milestone_date
    )
    SELECT 
      'mock-test-' || gen_random_uuid(), 'Teste', plant_name, city, 
      status, current_phase, progress, summary, contracted_modules, 'teste@teste.com.br',
      next_milestone_date
    FROM onboarding_projects WHERE id = old_proj_id
    RETURNING id INTO new_proj_id;

    -- 4. Duplica as Fases
    INSERT INTO onboarding_phases (project_id, pipefy_phase_id, name, status, "order")
    SELECT new_proj_id, pipefy_phase_id, name, status, "order"
    FROM onboarding_phases WHERE project_id = old_proj_id;

    -- 5. Duplica as Pendências
    INSERT INTO onboarding_issues (project_id, title, status, deadline, criticality, suggested_owner)
    SELECT new_proj_id, title, status, deadline, criticality, suggested_owner
    FROM onboarding_issues WHERE project_id = old_proj_id;

    -- 6. Duplica o Cronograma
    INSERT INTO onboarding_milestones (project_id, title, description, status, planned_date, actual_date)
    SELECT new_proj_id, title, description, status, planned_date, actual_date
    FROM onboarding_milestones WHERE project_id = old_proj_id;
  END IF;
END $$;
