

## Cogtive Onboarding Portal — Implementation Plan

### Overview

Build a complete navigable prototype of a premium dark-mode SaaS portal for clients to track their software implementation. The portal has 7 screens plus a shared layout with sidebar navigation.

### Design System

Update `index.css` with a Cogtive-branded dark theme:
- **Background**: Deep navy/dark blue (`220 25% 6%`)
- **Cards**: Slightly lighter dark (`220 20% 10%`)
- **Primary**: Cyan/blue (`195 90% 50%`) — the signature Cogtive accent
- **Success**: Green for completed items
- **Warning**: Amber/yellow for pending
- **Destructive**: Red for blocked/delayed
- **Typography**: Clean, light text on dark backgrounds

### Architecture

```text
src/
├── data/
│   └── mockData.ts              # All mock data (single file)
├── types/
│   └── onboarding.ts            # TypeScript interfaces
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         # SidebarProvider + main layout
│   │   └── AppSidebar.tsx        # Sidebar navigation
│   ├── onboarding/
│   │   ├── ProjectCard.tsx       # Main project summary card
│   │   ├── ProgressStepper.tsx   # Phase stepper component
│   │   ├── SummaryCards.tsx      # Quick metric cards
│   │   ├── StatusBadge.tsx       # Reusable status badges
│   │   ├── PendingIssueCard.tsx  # Pending issue card
│   │   ├── TimelineItem.tsx      # Timeline step component
│   │   ├── TrainingCard.tsx      # Training/delivery card
│   │   ├── ContactCard.tsx       # Team contact card
│   │   └── DocumentCard.tsx      # Shared document card
├── pages/
│   ├── Login.tsx                 # Login screen
│   ├── Overview.tsx              # Module 1: Visão Geral
│   ├── PendingIssues.tsx         # Module 2: Pendências
│   ├── NextSteps.tsx             # Module 3: Próximos Passos
│   ├── TrainingDeliveries.tsx    # Module 4: Treinamentos
│   ├── Team.tsx                  # Module 5: Equipe
│   └── Documents.tsx             # Module 6: Documentos
```

### Screens

**1. Login** — Full-screen dark premium login with Cogtive branding, email/password fields, tagline, and welcome text. No actual auth — just navigates to overview on submit.

**2. Visão Geral (Overview)** — The hero screen:
- Project card (client, plant, phase, status, progress %, next milestone date)
- Horizontal stepper showing 6 phases (Kickoff → Encerramento)
- 4 summary metric cards (pending items, scheduled trainings, completed deliveries, next actions)
- "Resumo do momento" — friendly text block explaining current state
- Contracted modules list

**3. Pendências do Cliente** — Header block "O que depende da sua equipe agora" with top pending items. Full list below with status filters (tabs). Each card shows title, description, category, criticality badge, deadline, status, suggested owner.

**4. Próximos Passos** — Split into "Próximas 2 semanas" highlight section + full timeline. Simple vertical timeline with status indicators (done/current/upcoming). Milestone list with dates and owners.

**5. Treinamentos e Entregas** — Tabs separating Trainings and Deliveries. Cards showing name, type, date (planned/actual), status, responsible, notes.

**6. Equipe e Contatos** — Grid of contact cards with name, role, email, phone, area, avatar placeholder.

**7. Documentos** — Simple list/grid of shared documents with name, type, date, description, simulated "view" button.

### Navigation

Use the existing Shadcn Sidebar component with `collapsible="icon"`. Icons + labels for each section. Mobile-responsive with sheet-based sidebar. Cogtive logo at top.

### Mock Data

Single `mockData.ts` file with realistic industrial implementation data:
- Client: "Metalúrgica São Paulo" at "Planta Guarulhos"
- Phase: "Implantação" (step 3 of 6)
- Progress: 45%
- 6-8 pending issues (infrastructure, network, users, training availability)
- 8-10 milestones/next steps
- 5-6 training sessions
- 6-8 delivery items
- 5-6 team contacts
- 4-5 shared documents

### Responsive Design

- Desktop: sidebar + content area
- Mobile: collapsible sidebar, stacked cards, full-width layout
- All components use Tailwind responsive classes

### Key Technical Decisions

- No backend/Supabase — pure frontend prototype with mock data
- No real auth — login is cosmetic, stores a flag in state/localStorage
- React Router for navigation with protected route wrapper
- Existing shadcn/ui components (Card, Badge, Progress, Tabs, Button, etc.)
- Custom CSS variables for the Cogtive dark theme

