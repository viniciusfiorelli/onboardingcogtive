-- Fix RLS for activity_logs to ensure Admins can insert and select
DROP POLICY IF EXISTS "Admins_Bypass_Logs" ON activity_logs;
DROP POLICY IF EXISTS "Clients_Insert_Logs" ON activity_logs;
DROP POLICY IF EXISTS "Clients_View_Logs" ON activity_logs;

-- Policy for Admins (Cogtive)
CREATE POLICY "Admins_All_Logs" ON activity_logs 
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' LIKE '%@cogtive.com')
WITH CHECK (auth.jwt() ->> 'email' LIKE '%@cogtive.com');

-- Policy for Clients (Insert their own logs)
CREATE POLICY "Clients_Insert_Own_Logs" ON activity_logs 
FOR INSERT TO authenticated
WITH CHECK (
  project_id IN (
    SELECT id FROM onboarding_projects 
    WHERE lower(client_email) = lower(auth.jwt() ->> 'email')
  )
);

-- Policy for Clients (View their own logs)
CREATE POLICY "Clients_View_Own_Logs" ON activity_logs 
FOR SELECT TO authenticated
USING (
  project_id IN (
    SELECT id FROM onboarding_projects 
    WHERE lower(client_email) = lower(auth.jwt() ->> 'email')
  )
);
