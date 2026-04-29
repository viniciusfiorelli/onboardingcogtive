export type ChecklistConfigMap = Record<string, { adminOnly: boolean }>;

// Mapeamento dos IDs dos campos do Pipefy para suas configurações de visibilidade
export const checklistVisibilityConfig: ChecklistConfigMap = {
  // === Triagem ===
  "orienta_o_de_movimenta_o_do_card": { adminOnly: true }, // Interno
  "crit_rio_para_avan_o_de_fase": { adminOnly: true },     // Interno Triagem

  // === Stand-by ===
  "orienta_o_de_movimenta_o_do_card_descri_o_sugerida": { adminOnly: true }, // Interno Stand-by
  
  // === Kick-off ===
  "checklist_de_p_s_kickoff": { adminOnly: true }, // Admin
  "indique_o_hardware_definido_para_coleta_de_dados": { adminOnly: true }, // Hardware - Admin
  "tipo_de_rede_disponibilizada_pela_ti": { adminOnly: false }, // Público
  "j_existe_sensoriza_o_nas_m_quinas_que_ser_o_monitoradas_em_modo_autom_tico": { adminOnly: false }, // Público
  "cliente_precisar_adquirir_fonte_24v_para_alimenta_o_dos_iots": { adminOnly: false }, // Público
  
  // === Preparação ===
  "ti": { adminOnly: false }, // Público
  "manuten_o_el_trica": { adminOnly: false }, // Público
  "equipamentos": { adminOnly: false }, // Público
  "checklist_de_log_stica": { adminOnly: true }, // Admin
  "ajustes_no_ambiente_ap_s_carga_de_dados": { adminOnly: true }, // Admin
  "orienta_o_de_movimenta_o_do_card_1": { adminOnly: true }, // Interno

  // === Implantação ===
  // Equipamentos
  "equipamentos_estavam_dispon_veis": { adminOnly: false }, // Público
  "iots_estavam_dispon_veis": { adminOnly: false }, // Público
  "cases_suportes_estavam_dispon_veis": { adminOnly: false }, // Público
  // Infra Rede
  "rede_wi_fi_estava_funcional_em_todos_os_pontos": { adminOnly: false }, // Público
  "libera_es_realizadas_portas_fixa_o_de_ip_autoriza_o_em_firewall": { adminOnly: false }, // Público
  // Infra Elétrica
  "tomadas_para_tablets_estavam_instaladas": { adminOnly: false }, // Público
  "sensoriza_o_estava_adequada_em_todos_os_pontos_autom_ticos": { adminOnly: false }, // Público
  "fontes_24v_para_iots_estavam_devidamente_instaladas": { adminOnly: false }, // Público
  
  // Treinamentos
  "treinamentos_operacionais_adicionaiss": { adminOnly: true }, // Admin
  "treinamentos_operacionais_integralmente_realizados": { adminOnly: true }, // Admin
  "copy_of_treinamentos_operacionais_integralmente_realizados": { adminOnly: true }, // Treinamento OEE - Admin
  
  // Validação final de infra (Equipamentos finais instalados)
  "tablets_foram_instalados": { adminOnly: true }, // Admin
  "iots_foram_instalados": { adminOnly: true }, // Admin
  "cases_suportes_foram_instalados": { adminOnly: true }, // Admin
  "tomadas_para_tablets_foram_instaladas": { adminOnly: true }, // Admin
  "sensoriza_o_foi_adequada_instalada_em_todos_os_pontos_autom_ticos": { adminOnly: true }, // Admin
  "poss_vel_iniciar_a_opera_o_assistida": { adminOnly: true }, // Admin
  "orienta_o_de_movimenta_o_do_card_2": { adminOnly: true }, // Interno

  // === Operação Assistida ===
  "foi_necess_ria_revisita": { adminOnly: true }, // Admin
  "copy_of_foi_necess_ria_revisita": { adminOnly: true }, // Retreinamento - Admin
  "foram_identificados_bugs_durante_a_implanta_o": { adminOnly: true }, // Admin
  "foram_identificadas_melhorias_ou_solicita_es_de_produto": { adminOnly: true }, // Admin
  "orienta_o_para_movimenta_o_do_card": { adminOnly: true }, // Interno

  // === Wrap-up ===
  "checklist_p_s_wrap_up": { adminOnly: true }, // Admin
};

// IDs de campos que DEVEM SER IGNORADOS E NÃO SALVOS (São instruções internas de usoPipefy)
export const IGNORED_CHECKLIST_FIELDS = [
  "orienta_o_de_movimenta_o_do_card", 
  "orienta_o_de_movimenta_o_do_card_descri_o_sugerida", 
  "orienta_o_de_movimenta_o_do_card_1", 
  "orienta_o_de_movimenta_o_do_card_2",
  "orienta_o_para_movimenta_o_do_card",
  "crit_rio_para_avan_o_de_fase"
];
