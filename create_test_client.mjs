import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
const envFile = fs.readFileSync(envPath, 'utf8');

let supabaseUrl = '';
let supabaseServiceKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseServiceKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cloneClient() {
  try {
    // 1. Limpar projetos de teste anteriores
    await supabase.from('onboarding_projects').delete().eq('client_email', 'teste@teste.com.br');

    // 2. Encontrar o projeto Fitoway
    const { data: fitowayProject, error: fetchError } = await supabase
      .from('onboarding_projects')
      .select('*')
      .ilike('client_name', '%fitoway%')
      .single();

    if (fetchError) throw fetchError;
    console.log('✔ Projeto Fitoway encontrado:', fitowayProject.id);

    const oldProjectId = fitowayProject.id;
    const newProjectId = crypto.randomUUID();

    // 2. Preparar os dados do novo projeto Teste
    const num_pipe_id = 999999999;
    const newProjectData = {
      ...fitowayProject,
      id: newProjectId,
      client_name: 'Projeto Teste',
      client_email: 'teste@teste.com.br',
      pipefy_card_id: num_pipe_id.toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('onboarding_projects')
      .insert(newProjectData);

    if (insertError) throw insertError;
    console.log('✔ Novo projeto Teste criado:', newProjectId);

    // 3. Função auxiliar para clonar tabelas relacionadas
    async function cloneRelated(tableName) {
      const { data: records, error: relFetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('project_id', oldProjectId);

      if (relFetchError) {
        console.error('Erro buscando ' + tableName, relFetchError);
        return;
      }

      if (records && records.length > 0) {
        const newRecords = records.map(record => {
           const { id, pipefy_card_id, ...rest } = record;
           return { 
               ...rest, 
               project_id: newProjectId
           };
        });
        const { error: relInsertError } = await supabase.from(tableName).insert(newRecords);
        if (relInsertError) console.error('Erro inserindo ' + tableName, relInsertError);
        else console.log('✔ ' + records.length + ' registros clonados na tabela ' + tableName);
      } else {
        console.log('  Nenhum registro encontrado em ' + tableName);
      }
    }

    // 4. Clonar todas as tabelas filhas
    const tables = [
      'onboarding_phases',
      'onboarding_issues',
      'onboarding_milestones',
      'onboarding_trainings',
      'onboarding_deliveries',
      'onboarding_contacts',
      'onboarding_documents',
      'onboarding_checklist_items'
    ];

    for (const table of tables) {
      await cloneRelated(table);
    }
    
    console.log('\n✅ Cópia concluída com sucesso! Agora você pode logar como teste@teste.com.br');

  } catch (err) {
    console.error('Erro geral:', err);
  }
}

cloneClient();
