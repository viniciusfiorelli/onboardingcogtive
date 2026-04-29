import { OnboardingProject, ChecklistItem } from '@/types/onboarding';

export function generatePreparationTemplate(p: OnboardingProject, optimisticChecks: Record<string, boolean> = {}) {
  const norm = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
  
  if (norm(p.currentPhase || '') !== norm("Preparação")) {
    return { visibleItems: [], grouped: {} };
  }

  // 1. Extração de Variáveis
  const numPoints = parseInt(p.variables?.['Número de pontos de monitoramento']?.value || '0', 10);
  const numAuto = parseInt(p.variables?.['Equipamentos Automáticos']?.value || '0', 10);
  
  const iotModel = p.variables?.['Modelo de IOT (Automação)']?.value || '';
  const isNovus = iotModel.includes('Novus');
  const isAdvantech = iotModel.includes('Advantech');

  // Variável hipotética para Tipo de Conexão.
  // Caso se chame diferente no Pipefy, você pode alterar o nome da chave aqui:
  const connectionType = p.variables?.['Tipo de Conexão do IoT']?.value || p.variables?.['Meio de Comunicação']?.value || '';
  const isWiFi = connectionType.toLowerCase().includes('wi-fi') || connectionType.toLowerCase().includes('wifi');
  const isCabele = connectionType.toLowerCase().includes('cabo') || connectionType.toLowerCase().includes('ethernet') || connectionType.toLowerCase().includes('lan');

  // 2. Regras Finas de Texto
  // Portas de Rede:
  let networkPortsText = `Liberação de portas na rede:\n- 443 (HTTPS) → tablets enviam dados.`;
  if (isNovus) {
     networkPortsText = `Liberação de portas na rede:\n- 8883 (MQTT/TLS) → IoTs Novus enviam dados\n- 443 (HTTPS) → tablets enviam dados.`;
  } else if (isAdvantech) {
     networkPortsText = `Liberação de portas na rede:\n- 80 (HTTP interno) → IoTs Advantech comunicam\n- 443 (HTTPS) → tablets enviam dados.`;
  }

  // Alerta Físico de Wi-Fi vs Painel:
  let physicaText = `Definir local e instalação dos ${numPoints} tablets (devem ficar próximos ao operador e à tomada) e dos ${numAuto} IOTs.`;
  if (isWiFi) physicaText += ` (⚠️ ATENÇÃO: Modelos Wi-fi devem ficar FORA de painéis elétricos para evitar bloqueio de rede)`;

  // 3. Montagem do Template
  const template = [
     { label: 'PRODUÇÃO', text: `Envio da planilha cadastral preenchida.`, id: 'demo_prod_1', condition: true },
     { label: 'PRODUÇÃO', text: physicaText, id: 'demo_prod_2', condition: true },
     
     { label: 'COMPRAS', text: `${numPoints} Tablets Samsung Galaxy Tab A9+.`, id: 'demo_comp_1', condition: true },
     { label: 'COMPRAS', text: `${numAuto} IoTs Novus (${isWiFi ? 'Wi-Fi' : 'Cabo de Rede'}).`, id: 'demo_comp_2', condition: isNovus },
     { label: 'COMPRAS', text: `${numAuto} IoTs Advantech (${isWiFi ? 'Wi-Fi' : 'Cabo de Rede'}).`, id: 'demo_comp_3', condition: isAdvantech },
     { label: 'COMPRAS', text: `Fontes de alimentação 24V para os IoTs (caso não usem a da máquina).`, id: 'demo_comp_4', condition: true },
     { label: 'COMPRAS', text: `${numPoints} Cases/suportes para os tablets.`, id: 'demo_comp_5', condition: true },
     
     { label: 'TI', text: `Disponibilização de uma Rede Wi-fi 2.4GHZ no local dos ${numPoints} pontos de coleta para acesso via Tablets.`, id: 'demo_ti_1', condition: isWiFi },
     { label: 'TI', text: `Definir IP fixo via DHCP para os ${numAuto} IoTs (reserva por MAC, somente pode ser feito após chegada dos equipamentos).`, id: 'demo_ti_2', condition: true },
     { label: 'TI', text: `Passagem de cabos de rede RJ45 nos pontos de instalação dos ${numAuto} IoTs.`, id: 'demo_ti_3', condition: isCabele || !isWiFi },
     { label: 'TI', text: networkPortsText, id: 'demo_ti_4', condition: true },
     { label: 'TI', text: `Acesso ao domínio ${p.clientName?.split(' ')[0].toLowerCase() || 'cliente'}.cogtive.com.br no local de todos os ${numPoints} pontos de coleta (para verificar a conectividade de wi-fi e a comunicação com o ambiente).`, id: 'demo_ti_5', condition: true },

     { label: 'MANUTENÇÃO', text: `Verificação dos sensores de contagem nos ${numAuto} equipamentos automáticos → confirmar se estão posicionados corretamente e se emitem pulso 24V na passagem do produto (testar com multímetro)`, id: 'demo_manu_1', condition: true },
     { label: 'MANUTENÇÃO', text: `Passagem de cabos de rede RJ45 nos pontos de instalação dos ${numAuto} IoTs.`, id: 'demo_manu_2', condition: isCabele || !isWiFi },
     { label: 'MANUTENÇÃO', text: `Garantir tomadas elétricas (110/220V) próximas aos ${numPoints} pontos para os Tablets.`, id: 'demo_manu_3', condition: true },
     { label: 'MANUTENÇÃO', text: `Instalação das fontes de alimentação 24V para os IoTs.`, id: 'demo_manu_4', condition: true },
     { label: 'MANUTENÇÃO', text: `Verificação de alimentação 24V para IoTs (pode ser a mesma da máquina e/ou que alimenta os sensores).`, id: 'demo_manu_5', condition: true },
     { label: 'MANUTENÇÃO', text: `Instalação dos Cases/Suportes no local dos ${numPoints} tablets.`, id: 'demo_manu_6', condition: true },
  ];

  const visibleItems = template.filter(i => i.condition);

  const grouped = visibleItems.reduce((acc, item) => {
     if (!acc[item.label]) acc[item.label] = [];
     const isChecked = optimisticChecks[item.id] !== undefined ? optimisticChecks[item.id] : (p?.nativeChecklistStates?.[item.id] || false);
     acc[item.label].push({ 
        id: item.id, 
        itemText: item.text, 
        checklistLabel: item.label, 
        checked: isChecked, 
        isDemo: true 
     });
     return acc;
  }, {} as Record<string, any[]>);

  return { visibleItems, grouped };
}
