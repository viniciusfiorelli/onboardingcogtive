import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const IGNORED_CHECKLIST_FIELDS: string[] = [];

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    console.log("Iniciando DIAGNÓSTICO PROFUNDO de sync-pipefy...");
    
    // JWT Security Layer (Impedindo DDoS desautorizado)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Acesso Negado: Token de Autorização Ausente.");

    const token = authHeader.replace('Bearer ', '');
    let user;
    if (token === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
       user = { email: 'admin@service.role' };
    } else {
       const supabaseAuth = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
       const { data, error: authErr } = await supabaseAuth.auth.getUser(token);
       if (authErr || !data?.user) throw new Error("Acesso Negado: Token Inválido ou Expirado.");
       user = data.user;
    }

    // Admin Privileged Connection
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('DB_DIRECT_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const pipefyToken = Deno.env.get('PIPEFY_API_TOKEN');
    const pipeId = Deno.env.get('PIPEFY_PIPE_ID') || "306842929";

    const body = await req.json().catch(() => ({}));
    const { projectId } = body;
    let cardIdsToFetch: string[] = [];

    if (projectId) {
      console.log(`Buscando no banco o pipefy_card_id para o projeto: ${projectId}`);
      const { data: proj } = await supabaseClient
        .from('onboarding_projects')
        .select('pipefy_card_id')
        .eq('id', projectId)
        .maybeSingle();
      if (proj?.pipefy_card_id) {
         cardIdsToFetch = [String(proj.pipefy_card_id)];
         console.log(`Identificado pipefy_card_id: ${proj.pipefy_card_id}`);
      }
    }

    let hasMore = true;
    let afterCursor: string | null = null;
    const cards: any[] = [];
    let page = 0;

    if (cardIdsToFetch.length > 0) {
       console.log(`Buscando cartão individual ${cardIdsToFetch[0]} do Pipefy...`);
       const query = `{ card(id: "${cardIdsToFetch[0]}") { id title current_phase { name } fields { name value field { id label type options } phase_field { phase { name } } } } }`;
       const pipefyRes = await fetch("https://api.pipefy.com/graphql", {
         method: "POST",
         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pipefyToken}` },
         body: JSON.stringify({ query })
       });
       const pipefyData = await pipefyRes.json();
       if (pipefyData.data?.card) {
          cards.push(pipefyData.data.card);
       }
    } else {
    while (hasMore && page < 5) {
      page++;
      console.log(`Buscando cartões do Pipefy... Cursor atual: ${afterCursor} (Página ${page})`);
      const query = `{ allCards(pipeId: "${pipeId}", first: 50${afterCursor ? `, after: "${afterCursor}"` : ''}) { pageInfo { hasNextPage endCursor } edges { node { id title current_phase { name } fields { name value field { id label type options } phase_field { phase { name } } } } } } }`;

      const pipefyRes = await fetch("https://api.pipefy.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pipefyToken}` },
        body: JSON.stringify({ query })
      });

      const pipefyData = await pipefyRes.json();

      // Check for auth/token errors
      if (pipefyData.error === 'invalid_token' || pipefyData.state === 'unauthorized') {
        throw new Error(`Token do Pipefy inválido ou expirado. Verifique o secret PIPEFY_API_TOKEN no Supabase.`);
      }

      if (pipefyData.errors) {
        throw new Error(`Erro na query do Pipefy: ${pipefyData.errors[0]?.message || JSON.stringify(pipefyData.errors)}`);
      }

      if (!pipefyData.data) {
        console.error("Resposta inesperada do Pipefy:", JSON.stringify(pipefyData));
        throw new Error(`Resposta inesperada do Pipefy (sem campo data). Verifique o token PIPEFY_API_TOKEN.`);
      }

      const currentEdges = pipefyData.data?.allCards?.edges || [];
      currentEdges.forEach((e: any) => {
        if (e.node) cards.push(e.node);
      });

      const pageInfo = pipefyData.data?.allCards?.pageInfo;
      hasMore = pageInfo?.hasNextPage || false;
      afterCursor = pageInfo?.endCursor || null;

      if (currentEdges.length === 0) {
        hasMore = false;
      }
    }
    }

    console.log(`Debug: Encontrados ${cards.length} cartões no total.`);

    if (cards.length > 0) {
      console.log(`Exemplo de campos do primeiro cartão (${cards[0].title}):`);
      cards[0].fields.forEach((f: any) => {
        console.log(` - Campo: "${f.name}" | ID: "${f.field?.id}" | Tipo: "${f.field?.type}" | Fase: "${f.phase_field?.phase?.name}"`);
      });
    }

    // Helper para mapear os nomes das fases do Pipefy para o Enum de 'status' do BD
    const mapPhaseToStatus = (phaseName: string): string => {
      const norm = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
      const p = norm(phaseName);
      
      if (p.includes('concluido')) return 'concluido';
      if (p.includes('wrap')) return 'wrap_up';
      if (p.includes('assistida')) return 'operacao_assistida';
      if (p.includes('treinamento')) return 'em_treinamento';
      if (p.includes('implantacao')) return 'em_implantacao';
      if (p.includes('stand') || p.includes('aguardando')) return 'aguardando_cliente';
      if (p.includes('correcao')) return 'em_preparacao';
      
      // Default / Fallback para Kick-off, Triagem, Preparação...
      return 'em_preparacao';
    };

    // Preparar Upsert de Projetos (isso já sabemos que funciona)
    const projectBatch = cards.map((card: any) => {
      const phaseName = card.current_phase?.name || '';
      return {
        pipefy_card_id: String(card.id),
        client_name: (card.fields.find((f: any) => f.name === "Nome do cliente")?.value || card.title || "").trim(),
        current_phase: phaseName,
        status: mapPhaseToStatus(phaseName),
        updated_at: new Date().toISOString()
      };
    });

    const { data: syncedProjects } = await supabaseClient
      .from('onboarding_projects')
      .upsert(projectBatch, { onConflict: 'pipefy_card_id' })
      .select('id, pipefy_card_id');

    const idMap = new Map();
    syncedProjects?.forEach(p => idMap.set(p.pipefy_card_id, p.id));

    // Lógica revisada para aceitar MAIS tipos de campo se estiverem próximos
    const allChecklistRows: any[] = [];
    const projectIds = [];

    for (const card of cards) {
      const projectId = idMap.get(String(card.id));
      if (!projectId) continue;
      projectIds.push(projectId);

      const checklistFields = card.fields.filter((f: any) => {
        if (!f.field) return false;
        if (IGNORED_CHECKLIST_FIELDS.includes(f.field.id)) return false;
        return true;
      });

      console.log(`Cartão "${card.title}": identifiquei ${checklistFields.length} campos de checklist.`);

      for (const cf of checklistFields) {
        const type = cf.field.type?.toLowerCase() || "";
        const label = cf.field.label || cf.name;
        const pipefyFieldId = cf.field.id;
        
        // Auto-hide logic for technical/internal fields
        const technicalPatterns: any[] = [];
        const isTechnical = false;
        const clientVisible = true;

        const row = {
          project_id: projectId,
          phase_name: cf.phase_field?.phase?.name || card.current_phase?.name || 'Geral',
          checklist_label: label,
          pipefy_field_id: pipefyFieldId,
          item_text: '',
          checked: false,
          client_visible: clientVisible,
          field_type: type.includes('text') ? 'text' : type.includes('radio') ? 'radio' : type.includes('attachment') ? 'attachment' : 'checklist'
        };

        if (row.field_type === 'text') {
           const rawText = cf.value || '';
           const lines = String(rawText).split('\n');
           
           let currentHeader = label; 
           let addedItems = false;
           let mergedLines: { text: string; header: string }[] = [];
           let pendingString = "";
           
           for(let i = 0; i < lines.length; i++) {
              let l = lines[i].trim();
              if(!l) continue;
              
              const cleanL = l.replace(/\*+/g, '').trim(); 
              
              if (cleanL.match(/^[A-ZÁÉÍÓÚÂÊÔÕÇ\s\_]+$/) && cleanL.length < 40) {
                 if (pendingString) mergedLines.push({ text: pendingString, header: currentHeader });
                 pendingString = "";
                 currentHeader = cleanL;
                 continue;
              }

              if (l.startsWith('- [') && pendingString) {
                 pendingString += "\n" + l;
              } 
              else if (l.startsWith('⚠️') || l.startsWith('✅') || l.match(/^\[(x| |FEITO|OK)\]/i)) {
                 if (pendingString) mergedLines.push({ text: pendingString, header: currentHeader });
                 pendingString = l;
              }
              else { 
                 if (pendingString) { pendingString += "\n" + l; }
                 else { pendingString = l; }
              }
           }
           if (pendingString) mergedLines.push({ text: pendingString, header: currentHeader });

           mergedLines.forEach(item => {
               if (item.text.length > 3) {
                  // ONLY treat as task if it starts with known markers
                  const isTask = /^(⚠️|✅|\[(x| |FEITO|OK)\]|\-? \[)/i.test(item.text.trim());
                  
                  if (isTask) {
                     const isChecked = /(\[x\]|\[X\]|\[FEITO\]|\[OK\]|✅)/i.test(item.text);
                     let cleanText = item.text.replace(/^[⚠️✅]\s*/, '')
                                              .replace(/^-\s*\[x\]\s*/i, '')
                                              .replace(/^-\s*\[\s\]\s*/, '')
                                              .replace(/^\[FEITO\]\s*/i, '').trim();

                     allChecklistRows.push({
                        ...row,
                        checklist_label: item.header,
                        item_text: cleanText,
                        checked: isChecked
                     });
                     addedItems = true;
                  }
               }
           });

           if (!addedItems && rawText.length > 0) {
               row.item_text = rawText;
              row.checked = /(\[x\]|\[X\]|\[FEITO\]|\[OK\]|✅)/i.test(rawText);
              allChecklistRows.push(row);
           }
        } else if (row.field_type === 'attachment') {
          let urls: string[] = [];
          if (cf.value) {
            try { urls = JSON.parse(cf.value); } catch { urls = [cf.value]; }
          }
          if (Array.isArray(urls)) {
            urls.forEach((url, i) => {
              if (typeof url === 'string') {
                 // Try to guess a filename for visual display
                 let niceName = label;
                 try {
                     const parts = url.split('/');
                     let fn = parts[parts.length - 1];
                     if (fn.includes('?')) fn = fn.split('?')[0];
                     if (fn && fn.length > 5) niceName = decodeURIComponent(fn);
                 } catch {}
                 
                 allChecklistRows.push({ 
                   ...row, 
                   item_text: url, // url becomes the body
                   checked: true,
                   checklist_label: `${label} - ${niceName}` // Keep the field label + filename
                 });
              }
            });
          }
        } else if (cf.field.options && cf.field.options.length > 0) {
          // It's an option-based field (radio, select, dropdown, checklist)
          let selectedValues: string[] = [];
          if (cf.value) {
            try {
              const parsed = JSON.parse(cf.value);
              if (Array.isArray(parsed)) {
                selectedValues = parsed.map(v => String(v));
              } else {
                selectedValues = [String(parsed)];
              }
            } catch {
              selectedValues = [String(cf.value)];
            }
          }
          cf.field.options.forEach((opt: string) => {
            allChecklistRows.push({ 
              ...row, 
              item_text: opt, 
              checked: selectedValues.includes(opt) 
            });
          });
        } else if (row.field_type === 'radio') {
          row.item_text = cf.value || '';
          row.checked = !!cf.value;
          allChecklistRows.push(row);
        } else {
          row.item_text = cf.value || '';
          row.checked = !!cf.value;
          allChecklistRows.push(row);
        }
      }
    }

    console.log(`Total de linhas de checklist preparadas: ${allChecklistRows.length}`);

    if (projectIds.length > 0) {
      const { error: delErr } = await supabaseClient.from('onboarding_checklist_items').delete().in('project_id', projectIds);
      if (delErr) console.error("Erro ao deletar antigos:", delErr);
      
      const { error: insErr } = await supabaseClient.from('onboarding_checklist_items').insert(allChecklistRows);
      if (insErr) {
        console.error("Erro ao inserir novos itens:", insErr);
        throw new Error(`Erro de Inserção: ${insErr.message}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Diagnóstico: Encontrados ${allChecklistRows.length} itens para ${projectIds.length} projetos.` 
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Erro fatal no Diagnóstico:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
