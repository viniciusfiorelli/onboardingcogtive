import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-archive-secret",
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const archiveSecret = Deno.env.get('ARCHIVE_LOGS_SECRET') ?? Deno.env.get('LOG_ARCHIVE_SECRET') ?? '';

    const authHeader = req.headers.get('Authorization') ?? '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
    const headerSecret = req.headers.get('x-archive-secret') ?? '';
    const isServiceRole = !!bearerToken && bearerToken === supabaseServiceKey;
    const isCronAuthorized = !!archiveSecret && headerSecret === archiveSecret;

    let isAdmin = isServiceRole;
    if (!isAdmin && bearerToken) {
      const supabaseAuth = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      const { data, error: authError } = await supabaseAuth.auth.getUser(bearerToken);
      if (!authError && data?.user?.email?.toLowerCase().endsWith('@cogtive.com')) {
        isAdmin = true;
      }
    }

    if (!isAdmin && !isCronAuthorized) {
      throw new Error('Acesso negado: arquivamento permitido apenas para administradores ou rotina autorizada.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Iniciando processo de arquivamento de logs (> 30 dias)...");

    // 1. Calcular data de corte (30 dias atrás)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffIso = cutoffDate.toISOString();

    // 2. Buscar logs com mais de 30 dias
    const { data: logs, error: fetchError } = await supabase
      .from('activity_logs')
      .select('*')
      .lt('created_at', cutoffIso);

    if (fetchError) throw fetchError;

    if (!logs || logs.length === 0) {
      console.log("Nenhum log antigo encontrado para arquivamento.");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Nenhum log com mais de 30 dias encontrado." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Encontrados ${logs.length} logs para arquivar.`);

    // 3. Preparar o arquivo JSON
    // Nome do arquivo: YYYY-MM-DD_HHMMSS_activity_logs.json
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}_activity_logs.json`;
    const fileContent = JSON.stringify({
      archive_date: now.toISOString(),
      logs_count: logs.length,
      data: logs
    }, null, 2);

    // 4. Upload para o Storage (bucket 'logs-archive')
    const { error: uploadError } = await supabase.storage
      .from('logs-archive')
      .upload(fileName, fileContent, {
        contentType: 'application/json',
        upsert: true
      });

    if (uploadError) {
      console.error("Erro no upload para o Storage:", uploadError);
      throw new Error(`Falha ao subir arquivo para o Storage: ${uploadError.message}`);
    }

    console.log(`Arquivo ${fileName} salvo com sucesso no storage.`);

    // 5. Deletar os logs do banco após sucesso no backup
    // Usamos chunks para evitar problemas com listas gigantes de IDs
    const logIds = logs.map(l => l.id);
    const CHUNK_SIZE = 500;
    let deletedTotal = 0;

    for (let i = 0; i < logIds.length; i += CHUNK_SIZE) {
      const chunk = logIds.slice(i, i + CHUNK_SIZE);
      const { error: deleteError } = await supabase
        .from('activity_logs')
        .delete()
        .in('id', chunk);

      if (deleteError) {
        console.error(`Erro ao deletar chunk de logs (${i} a ${i + CHUNK_SIZE}):`, deleteError);
        // Nota: O arquivo já está no storage, então o dado não foi perdido.
        // Podemos continuar ou parar, mas aqui vamos avisar sobre a falha parcial.
        throw new Error(`Falha parcial ao remover logs do banco: ${deleteError.message}. O arquivo de backup foi criado.`);
      }
      deletedTotal += chunk.length;
    }

    console.log(`${deletedTotal} logs removidos da tabela activity_logs.`);

    // 6. Registrar um log de sistema informando que a limpeza ocorreu
    await supabase.from('activity_logs').insert([{
      action_type: 'SYSTEM_MAINTENANCE',
      description: `Limpeza automática: ${deletedTotal} logs arquivados em ${fileName}.`,
      actor_email: 'Sistema'
    }]);

    return new Response(JSON.stringify({ 
      success: true, 
      archivedCount: deletedTotal,
      fileName 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("Erro no processo de arquivamento:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 // Status 200 para evitar que o cron ache que falhou se for um erro controlado
    });
  }
});
