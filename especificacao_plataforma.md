# Success Hub Cogtive - Plataforma de Implantação

## 1. Visão Geral (Overview)
O **Success Hub** (Portal do Cliente / Lite App) é uma plataforma web desenvolvida para a **Cogtive** com o intuito de dar transparência total, engajamento e fluidez para os clientes durante a jornada de Implantação (Onboarding) da ferramenta. 

A plataforma atua como uma **ponte visual** entre a gestão interna (realizada no Pipefy pela equipe de Operações) e a visualização do cliente na ponta.

---

## 2. Arquitetura e Stack Tecnológico
O sistema utiliza um stack moderno focado em alta performance e design responsivo:
- **Frontend:** React (Vite) com TypeScript.
- **Estilização e Animações:** Tailwind CSS estendido com micro-animações (Framer Motion) e iconografia vetorial (Lucide React), focando na estética sofisticada (dark glassmorphism).
- **Backend as a Service (BaaS):** Supabase (PostgreSQL para Banco de Dados, Auth para roteamento, e Edge Functions em Deno para integrações).
- **Integração Principal:** API GraphQl do **Pipefy**.

---

## 3. Gestão de Perfis de Usuário (Roles)

### 3.1. Visão Administrativa (Equipe Cogtive)
* **Acesso:** Painel de gestão ativado para administradores ou gerentes de conta.
* **Componentes Principais:** Dropdown "Seletor de Clientes" contruído no Header (`AdminProjectSelector.tsx`), que permite assumir a visão de qualquer implantação existente.
* **Poderes:** 
  * Auditar detalhadamente o progresso da implantação.
  * Botão de "Toggle de Visibilidade Cliente": permite esconder ou expor *checklist items* que venham do Pipefy de modo manual/pontual.
  * Disparar comandos para a tabela e conferir notas técnicas otimistas.

### 3.2. Visão do Cliente (Success Hub)
* **Acesso:** Portal focado restrito às informações que dizem respeito à jornada da planta do cliente.
* **Restrições Automáticas (Smart Filters):** O hub do cliente não renderiza nenhuma informação técnica sensível originada no Pipefy. Padrões como `bug`, `melhorias` e lógicas como `adminOnly`, bem como as fases estritamente operacionais da equipe da Cogtive (`Triagem` e `Wrap-up`), são automaticamente interceptadas, higienizadas e realocadas para uma melhor experiência do usuário (UX).

---

## 4. Jornada de Valor do Cliente (Pipeline)
A Régua de Implantação (Stepper visual) focada para o cliente possui 5 passos estritamente amarrados à entrega de valor de negócio:
1. **Kick-off**
2. **Preparação**
3. **Implantação**
4. **Operação assistida**
5. **Concluído**
*(O que ocorre nos bastidores como `Triagem` mapeia visualmente nas origens; o que recai em fechamentos internos como `Wrap-up` é mapeado na UX como Missão 100% Concluída para alívio emocional do cliente.)*

---

## 5. Módulo e Funcionalidades Core

### 5.1. Dashboard (Visão Global)
Painel principal (`Overview.tsx`) que resume o estado operacional.
- **Painel de Progresso:** Um anel concêntrico interativo e barra linear simulando uma "mission completion" (%), derivado tanto do número de checklists completos de fato quanto de variáveis de avanço temporal (como na operação assistida cronometrada).
- **Sumário Dinâmico:** Texto-chave gerado dinamicamente dependendo da fase (Ex: mensagens humanas de "parabéns" quando o projeto atinge estágio de sucesso ou notas informacionais base).

### 5.2. Módulo de Checklists (Ação Direta)
Checklists inteligentes (`AdminChecklist.tsx`) gerados do Pipefy.
- **Renderização Multiformato:** O sistema processa e adapta cada campo originado na Pipefy DB como respostas exclusivas (`radio`), anotações ricas com interface de salvamento otimista (`text`), ou `checklist` puro de multiplas opções. 
- **Filtro Técnico Resiliente (`TECHNICAL_REGEX`|`isDocumentUrl`):** Garante a triagem em massa via RegEx de chaves internas operacionais.

### 5.3. Hub de Documentos e Materiais (Cofre / Vault)
Módulo inteligente (`Documents.tsx`) de gestão de anexos centralizados, visando fácil acesso e consulta ao acervo da implantação.
- **Engenharia de Interceptação de Links e Arquivos:** Toda URL ou arquivo bruto (excel, planilhas google, apressentações do docs, anexos amazon S3) identificada cruzando o Pipefy é magicamente "sequestrada" de virar um texto feio no Checklist, sendo processada, renomeada descritivamente e formatada para exibição em *Document Cards* premium no Cofre, ganhando selos visuais contextualizados (*Guia*, *Apresentação*, *Documento*).

---

## 6. Fluxo de Integração e DB (Pipefy ➔ Supabase)
A Sinergia do projeto roda invisivelmente em uma Edge Function em Deno Hospedada no **Supabase (`sync-pipefy`)**.
1. Execução aciona a requisição GraphQl listando cards do Pipefy.
2. Faz o "Upsert" contínuo dos metadados de projetos na tabela PostgreSQL `onboarding_projects`.
3. Escaneia campos de interação do card pipefy e injeta tarefas na sub-tabela `onboarding_checklist_items`, discriminando inteligentemente nativos (tipo `attachment`, `radio`, `checklist`).
4. Reatividade Front-end (`useProjectData.ts` via React Query) consolida esses dados brutos do Pipefy e do banco local para as interfaces finais, categorizando lógicas visuais velozes.
