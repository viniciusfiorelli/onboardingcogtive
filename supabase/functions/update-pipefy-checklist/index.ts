import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Acesso Negado: Token de Autorização Ausente.");

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser(token);
    if (authErr || !user) throw new Error("Acesso Negado: Token Inválido ou Expirado.");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('DB_DIRECT_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { checklistItemId, isChecked, newItemText } = body;
    
    // 1. Busca o item de checklist
    const { data: item, error: itemErr } = await supabaseAdmin
      .from('onboarding_checklist_items')
      .select('*')
      .eq('id', checklistItemId)
      .maybeSingle();

    if (itemErr || !item) throw new Error("Item de checklist não encontrado.");

    // 2. Busca o projeto vinculado para pegar o cardId do Pipefy
    const { data: project, error: projErr } = await supabaseAdmin
      .from('onboarding_projects')
      .select('pipefy_card_id, client_email')
      .eq('id', item.project_id)
      .maybeSingle();

    if (projErr || !project) throw new Error("Projeto vinculado não encontrado.");
    const cardId = project.pipefy_card_id;
    const fieldId = item.pipefy_field_id;
    const fieldType = item.field_type;

    if (!cardId || !fieldId) throw new Error("Item não está corretamente vinculado ao Pipefy (IDs faltando).");

    // IDOR Security Check (Prevenir que cliente A edite projeto de cliente B)
    const requesterEmail = user.email || '';
    const isAdmin = requesterEmail.toLowerCase().endsWith('@cogtive.com');
    if (!isAdmin && project.client_email?.toLowerCase() !== requesterEmail.toLowerCase()) {
       throw new Error("Acesso Negado: Você não tem permissão para modificar checklists de outro projeto.");
    }

    // 3. Atualização local (BD Supabase)
    // Se newItemText vier undefined, significa que é um checkbox do nosso parseador de texto novo!
    if (!isAdmin && (!item.client_visible || item.admin_only || fieldType === 'attachment')) {
       throw new Error("Acesso Negado: Este item não pode ser modificado pelo cliente.");
    }

    const updatePayload = (fieldType === 'text' && newItemText !== undefined)
      ? { item_text: newItemText, checked: !!newItemText } 
      : { checked: isChecked };

    const { error: updErr } = await supabaseAdmin
      .from('onboarding_checklist_items')
      .update(updatePayload)
      .eq('id', checklistItemId);
    
    if (updErr) throw new Error(`Erro ao atualizar banco local: ${updErr.message}`);

    // 4. Sincronização com Pipefy
    const pipefyToken = Deno.env.get('PIPEFY_API_TOKEN');
    if (!pipefyToken) throw new Error("PIPEFY_API_TOKEN não configurado.");

    let newValue: any;
    if (fieldType === 'text') {
      if (newItemText !== undefined) {
         newValue = newItemText; // Texto cru tradicional
      } else {
         // RECONSTRUÇÃO DO TEXTO EXCLUSIVO (Markdown Style com [FEITO])
         const { data: siblings } = await supabaseAdmin
           .from('onboarding_checklist_items')
           .select('item_text, checked, checklist_label')
           .eq('project_id', item.project_id)
           .eq('pipefy_field_id', fieldId);

         const grouped: Record<string, any[]> = {};
         (siblings || []).forEach(s => {
             const lbl = s.checklist_label || "Detalhes";
             if (!grouped[lbl]) grouped[lbl] = [];
             grouped[lbl].push(s);
         });

         let lines: string[] = [];
         Object.entries(grouped).forEach(([header, items]) => {
             // O header só deve ser impresso se ele não for o próprio nome do campo (se for idêntico não precisa, mas mal n faz)
             lines.push(header);
             items.forEach(it => {
                 let prefix = it.checked ? "✅ [FEITO] " : "⚠️ ";
                 // Limpa icones antigos do item_text puro pra nao duplicar
                 let cleanItemText = it.item_text.replace(/^[⚠️\-*✅]\s*/, '').replace(/^\[FEITO\]\s*/i, '').trim();
                 lines.push(`${prefix}${cleanItemText}`);
             });
             lines.push(""); // linha em branco entre divisões
         });
         
         newValue = lines.join("\n").trim();
      }
    } else {
      // Para itens de rádio/checklist múltiplos originais do Pipefy
      const { data: siblings } = await supabaseAdmin
        .from('onboarding_checklist_items')
        .select('item_text, checked')
        .eq('project_id', item.project_id)
        .eq('pipefy_field_id', fieldId);

      const activeSiblings = (siblings || []).filter(s => s.checked);
      if (fieldType === 'radio' || activeSiblings.length <= 1) {
        newValue = activeSiblings.length > 0 ? activeSiblings[0].item_text : "";
      } else {
        newValue = activeSiblings.map(s => s.item_text);
      }
    }

    const mutation = `
      mutation UpdateCardField($input: UpdateCardFieldInput!) {
        updateCardField(input: $input) {
          clientMutationId
          success
        }
      }
    `;

    const pipefyRes = await fetch("https://api.pipefy.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pipefyToken}` },
      body: JSON.stringify({ 
        query: mutation,
        variables: {
          input: {
            card_id: cardId,
            field_id: fieldId,
            new_value: newValue
          }
        }
      })
    });

    const pipefyData = await pipefyRes.json();
    if (pipefyData.errors) {
       throw new Error(`Pipefy Error: ${pipefyData.errors[0]?.message || 'Erro desconhecido'}`);
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 // Usamos 200 para evitar o erro genérico do cliente Supabase e mostrar a mensagem real
    });
  }
});
