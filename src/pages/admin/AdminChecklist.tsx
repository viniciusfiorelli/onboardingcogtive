import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { differenceInDays, parseISO, format } from 'date-fns';
import { useProjectData } from '@/hooks/useProjectData';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChecklistItem } from '@/types/onboarding';
import {
  CheckCircle2,
  ClipboardList,
  Lock,
  Circle,
  ToggleLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CircleDashed,
  ArrowRight,
  Sparkle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { generatePreparationTemplate } from '@/utils/checklistEngine';
import { shootConfetti } from '@/utils/confetti';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** Standardized Journey Phases for the Stepper */
const JOURNEY_PHASES = [
  'Kick-off',
  'Preparação',
  'Implantação',
  'Operação assistida',
  'Concluído'
];

/** Regex patterns for technical/internal items that should be hidden from clients */
const TECHNICAL_REGEX = /bug|melhoria|solicitação.*produto|monitoring|interno|id_pipefy|alinhamento.*interno|revisita|atraso|🔴|wrap-up|pendência|orientação para movimentação|csm|resolvido/i;

type FieldGroup = {
  label: string;
  items: ChecklistItem[];
  /** true when all items have the same label AND look like radio options (e.g. Sim/Não) */
  isRadio: boolean;
  isText: boolean;
  adminOnly: boolean;
  clientVisible: boolean;
};

type PhaseTab = {
  phaseName: string;
  items: ChecklistItem[];
  isCurrentPhase: boolean;
  order: number;
};

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const PHASE_ORDER = [
  'Triagem',
  'Kick-off',
  'Preparação',
  'Implantação',
  'Operação assistida',
  'Wrap-up',
  'Concluído',
];

// Options that strongly indicate a radio-style field
const RADIO_OPTION_HINT = ['sim', 'não', 'nao', 'yes', 'no', 'concluído', 'concluido', 'pendente'];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getPhaseOrder(name: string) {
  const idx = PHASE_ORDER.findIndex(p => normalize(p) === normalize(name));
  return idx === -1 ? 99 : idx;
}

/** Detect if a group of items behaves like a radio field */
function detectRadio(items: ChecklistItem[]): boolean {
  // Need at least 2 options, and a sane upper bound
  if (items.length < 2 || items.length > 6) return false;
  // All option texts must match known radio-hint words
  const normed = items.map(i => normalize(i.itemText));
  return normed.every(n => RADIO_OPTION_HINT.includes(n));
}

/** 
 * Group items by their Pipefy field ID (shared across all options of the same field).
 * Falls back to checklistLabel, then itemText.
 * This guarantees "Sim" and "Não" from the same question land in the same group.
 */
function groupByField(items: ChecklistItem[]): FieldGroup[] {
  const map = new Map<string, ChecklistItem[]>();
  for (const item of items) {
    // Unique key generator
    const key = item.pipefyFieldId || 
                (item.checklistLabel ? `label-${item.checklistLabel}` : null) || 
                `item-${item.itemText}`;
    
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  
  const groups: FieldGroup[] = [];
  map.forEach((its) => {
    const label = its[0].checklistLabel || its[0].itemText;
    const isText = its.some(i => i.fieldType === 'text');
    groups.push({
      label,
      items: its,
      isRadio: !isText && detectRadio(its),
      isText,
      adminOnly: its.some(i => i.adminOnly),
      clientVisible: its.some(i => i.clientVisible),
    });
  });
  return groups;
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

/** Visibility Toggle Icon for Admins */
function VisibilityToggle({ visible, onToggle, isLoading }: { visible: boolean, onToggle: () => void, isLoading?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      disabled={isLoading}
      className={`p-1.5 rounded-lg border transition-all ${visible ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-muted-foreground/30 hover:text-muted-foreground'}`}
      title={visible ? "Visível para o cliente" : "Oculto para o cliente"}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
    </button>
  );
}

/** 
 * Phase Stepper (Premium Jornal Component)
 * Renders a linear, non-clickable progress bar with Cogtive styling.
 */
function PhaseStepper({ currentPhase }: { currentPhase: string }) {
  let currentIndex = JOURNEY_PHASES.findIndex(p => normalize(p) === normalize(currentPhase));
  if (currentIndex === -1) {
    if (normalize(currentPhase) === normalize('wrap-up') || normalize(currentPhase) === normalize('concluido')) {
      currentIndex = JOURNEY_PHASES.length - 1;
    }
  }
  
  return (
    <div className="w-full py-8 px-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-between min-w-[600px] max-w-3xl mx-auto relative mt-4">
        {/* Connection Lines Background */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2" />
        
        {JOURNEY_PHASES.map((phase, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <div key={phase} className="flex flex-col items-center gap-3 relative z-10 flex-1">
              {/* Connector Line (Progress) */}
              {idx > 0 && (
                <div className={`absolute top-1/2 -left-1/2 w-full h-[1.5px] -translate-y-1/2 transition-all duration-700
                  ${isDone || isActive ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]' : 'bg-transparent'}
                `} />
              )}

              {/* Node Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border
                ${isDone ? 'bg-primary border-primary text-primary-foreground' : 
                  isActive ? 'bg-primary/20 border-primary text-primary glow-sm animate-pulse' : 
                  'bg-black/60 border-white/10 text-muted-foreground/40'}
              `}>
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : 
                 isActive ? <Circle className="w-4 h-4 fill-primary/40" /> : 
                 <CircleDashed className="w-4 h-4" />}
              </div>

              {/* Label */}
              <div className="flex flex-col items-center text-center">
                <span className={`text-[10px] uppercase font-black tracking-widest transition-colors duration-500
                  ${isActive ? 'text-primary' : isDone ? 'text-white/70' : 'text-muted-foreground/30'}
                `}>
                  {phase}
                </span>
                {isActive && (
                  <motion.span layoutId="active-indicator" className="text-[8px] font-bold text-primary/60 uppercase">Em foco</motion.span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Renders a standard checklist item */
function ChecklistRow({ item, optimisticChecks, loadingItems, onCheck, canEdit, isAdmin, onToggleVisibility, loadingVisibility }: {
  item: ChecklistItem,
  optimisticChecks: Record<string, boolean>,
  loadingItems: Record<string, boolean>,
  onCheck: (id: string, currentStatus: boolean, e: React.MouseEvent) => void,
  canEdit: boolean,
  isAdmin: boolean,
  onToggleVisibility: (id: string, current: boolean) => void,
  loadingVisibility: Record<string, boolean>
}) {
  const isChecked = optimisticChecks[item.id] !== undefined ? optimisticChecks[item.id] : item.checked;
  const isLoading = loadingItems[item.id];

  return (
    <div
      onClick={(e) => canEdit && !isLoading && onCheck(item.id, isChecked, e)}
      className={`px-5 py-4 flex items-start gap-4 transition-colors border-b border-white/5 last:border-0 cursor-pointer group ${isChecked ? 'bg-green-500/5' : 'hover:bg-white/3'} ${!canEdit && 'opacity-60 cursor-default'} ${isAdmin && !item.clientVisible ? 'bg-white/[0.02]' : ''}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isLoading ? (
          <div className="w-7 h-7 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        ) : isChecked ? (
          <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(74,222,128,0.15)]">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg border border-white/15 bg-black/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
            <Circle className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/40" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug transition-all ${isChecked ? 'text-muted-foreground line-through opacity-60' : 'text-foreground/90'}`}>
          {item.itemText}
        </p>

        {item.checklistLabel && item.checklistLabel !== item.itemText && (
          <span className="inline-block mt-1.5 text-[9px] uppercase tracking-wider font-bold text-muted-foreground/50 border border-white/5 bg-white/5 px-2 py-0.5 rounded-sm">
            {item.checklistLabel}
          </span>
        )}
          {item.adminOnly && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-amber-400/70 border border-amber-400/15 bg-amber-500/5 px-2 py-0.5 rounded-sm">
              <Lock className="w-2.5 h-2.5" /> Admin
            </span>
          )}
          {isAdmin && !item.clientVisible && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-muted-foreground/40 border border-white/5 bg-white/5 px-2 py-0.5 rounded-sm">
               Oculto p/ Cliente
            </span>
          )}
        </div>

      <div className="flex items-center gap-3 self-center flex-shrink-0">
        {isAdmin && (
          <VisibilityToggle 
            visible={item.clientVisible} 
            onToggle={() => onToggleVisibility(item.id, item.clientVisible)}
            isLoading={loadingVisibility[item.id]} 
          />
        )}
        {isChecked ? (
          <Badge variant="outline" className="text-[9px] text-green-400 border-green-400/20 bg-green-400/10 font-bold uppercase">Concluído</Badge>
        ) : (
          <Badge variant="outline" className="text-[9px] text-muted-foreground border-white/10 bg-white/5 font-bold uppercase">Pendente</Badge>
        )}
      </div>
    </div>
  );
}

/** Renders an alphanumeric text field */
function TextField({ item, optimisticTexts, loadingItems, onUpdate, canEdit, isAdmin, onToggleVisibility, loadingVisibility }: {
  item: ChecklistItem,
  optimisticTexts: Record<string, string>,
  loadingItems: Record<string, boolean>,
  onUpdate: (id: string, text: string) => void,
  canEdit: boolean,
  isAdmin: boolean,
  onToggleVisibility: (id: string, current: boolean) => void,
  loadingVisibility: Record<string, boolean>
}) {
  const [localText, setLocalText] = useState(optimisticTexts[item.id] ?? item.itemText ?? '');
  const isLoading = loadingItems[item.id];

  useEffect(() => {
    if (optimisticTexts[item.id] !== undefined) {
      setLocalText(optimisticTexts[item.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimisticTexts[item.id]]);

  const handleBlur = () => {
    const currentVal = optimisticTexts[item.id] ?? item.itemText ?? '';
    if (localText !== currentVal && canEdit) {
      onUpdate(item.id, localText);
    }
  };

  return (
    <div className={`px-5 py-5 flex flex-col gap-3 border-b border-primary/10 relative ${getRowThemeClass(isAdmin, item.clientVisible)}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] font-bold uppercase tracking-tighter">Observação</Badge>
          <p className="text-xs font-bold text-foreground/80">{item.checklistLabel}</p>
          {isAdmin && !item.clientVisible && <Badge variant="outline" className="text-[8px] opacity-40">Oculto</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <VisibilityToggle 
              visible={item.clientVisible} 
              onToggle={() => onToggleVisibility(item.id, item.clientVisible)}
              isLoading={loadingVisibility[item.id]} 
            />
          )}
          {isLoading && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
        </div>
      </div>
      <textarea
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={handleBlur}
        disabled={isLoading || !canEdit}
        placeholder={canEdit ? "Adicione uma observação alfanumérica..." : "Conteúdo visualizado pelo time ADM."}
        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none min-h-[100px] shadow-inner"
      />
      <div className="flex justify-end">
        <p className="text-[9px] text-muted-foreground/40 font-medium italic">O portal salva automaticamente as alterações ao sair do campo.</p>
      </div>
    </div>
  );
}

/** Standard row theme helper for Admin/Client views */
function getRowThemeClass(isAdmin: boolean, visible: boolean, isRadio: boolean = false) {
  if (!isAdmin) return isRadio ? 'hover:bg-white/3' : 'bg-primary/5';
  return visible ? (isRadio ? 'hover:bg-white/3' : 'bg-primary/5') : 'bg-white/[0.02] opacity-80';
}

/** Renders a radio-style field: shows all options, highlights the selected one */
function RadioField({ group, optimisticChecks, loadingItems, onCheck, canEdit, isAdmin, onToggleVisibility, loadingVisibility }: {
  group: FieldGroup,
  optimisticChecks: Record<string, boolean>,
  loadingItems: Record<string, boolean>,
  onCheck: (id: string, currentStatus: boolean, e: React.MouseEvent) => void,
  canEdit: boolean,
  isAdmin: boolean,
  onToggleVisibility: (ids: string[], current: boolean) => void,
  loadingVisibility: Record<string, boolean>
}) {
  const selected = group.items.find(item =>
    optimisticChecks[item.id] !== undefined ? optimisticChecks[item.id] : item.checked
  );
  
  const isAnyLoadingVisibility = group.items.some(i => loadingVisibility[i.id]);

  return (
    <div className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors border-b border-white/5 last:border-0 relative ${getRowThemeClass(isAdmin, group.clientVisible, true)}`}>
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selected ? 'bg-primary/15 border border-primary/30' : 'bg-black/40 border border-white/10'}`}>
          <ToggleLeft className={`w-4 h-4 ${selected ? 'text-primary' : 'text-muted-foreground/40'}`} />
        </div>
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground/90 mb-2 leading-snug">{group.label}</p>

        {/* Options row */}
        <div className="flex flex-wrap gap-2">
          {group.items.map(item => {
            const isSelected = optimisticChecks[item.id] !== undefined ? optimisticChecks[item.id] : item.checked;
            const isLoading = loadingItems[item.id];

            return (
              <button
                key={item.id}
                onClick={(e) => canEdit && onCheck(item.id, isSelected, e)}
                disabled={isLoading || !canEdit}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all active:scale-95 disabled:opacity-50
                  ${isSelected
                    ? 'bg-primary/15 border-primary/40 text-primary shadow-[0_0_8px_rgba(var(--primary),0.15)]'
                    : 'bg-white/5 border-white/10 text-muted-foreground/30 hover:border-white/20 hover:text-muted-foreground/60'
                  }`}
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isSelected ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                )}
                {item.itemText}
              </button>
            );
          })}
        </div>
      </div>


      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {isAdmin && (
           <VisibilityToggle 
             visible={group.clientVisible} 
             onToggle={() => onToggleVisibility(group.items.map(i => i.id), group.clientVisible)}
             isLoading={isAnyLoadingVisibility} 
           />
        )}
        {selected ? (
          <Badge variant="outline" className="text-[9px] text-primary border-primary/20 bg-primary/10 font-bold uppercase">{selected.itemText}</Badge>
        ) : (
          <Badge variant="outline" className="text-[9px] text-muted-foreground border-white/10 bg-white/5 font-bold uppercase">Sem resposta</Badge>
        )}
      </div>
    </div>
  );
}


import { useActivityLog } from '@/hooks/useActivityLog';

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function AdminChecklist() {
  const { isAdmin, selectedProjectId } = useAdmin();
  const { data: p, isLoading, error, refetch } = useProjectData();
  const location = useLocation();
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const { logActivity } = useActivityLog();
  
  // Determine if we are on a client route (e.g., /client/checklist)
  const isClientRoute = location.pathname.startsWith('/client');
  
  // Admin can toggle between management and preview mode
  const [isPreviewMode, setIsPreviewMode] = useState(isClientRoute);

  // Sync preview mode with route changes
  useEffect(() => {
    if (isClientRoute) setIsPreviewMode(true);
  }, [isClientRoute]);

  const showClientHub = isPreviewMode || !isAdmin;

  // Optimistic UI state
  const [optimisticChecks, setOptimisticChecks] = useState<Record<string, boolean>>({});
  const [optimisticTexts, setOptimisticTexts] = useState<Record<string, string>>({});
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [loadingVisibility, setLoadingVisibility] = useState<Record<string, boolean>>({});

  // Confirmation Modal State
  const [pendingAction, setPendingAction] = useState<{
    itemId: string;
    newText?: string;
    newStatus?: boolean;
    type: 'text' | 'check';
  } | null>(null);


  // STABLE PROGRESS CALCULATION
  const phaseProgress = useMemo(() => {
    const defaultRes = { checklist: 0, temporal: 0, total: 0 };
    if (!p) return defaultRes;
    
    // 1. Base Checklist Progress
    const currentPhaseName = p.currentPhase || '';
    const norm = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
    
    let checklistProgress = 0;
    
    // Suporte ao Checkout Nativo implementado na Fase de Preparação
    if (norm(currentPhaseName) === norm("Preparação")) {
      const { visibleItems } = generatePreparationTemplate(p, {});
      const totalCount = visibleItems.length;
      const rawChecked = visibleItems.filter(i => p.nativeChecklistStates?.[i.id]).length;
      checklistProgress = totalCount === 0 ? 0 : Math.round((rawChecked / totalCount) * 100);
    } 
    else {
      // Pipefy Fallback
      const activeItems = p.checklistItems?.filter(i => norm(i.phaseName) === norm(currentPhaseName)) || [];
      const clientVisibleItems = activeItems.filter(i => 
        i.clientVisible && 
        !i.adminOnly &&
        !TECHNICAL_REGEX.test(i.checklistLabel || '') &&
        !TECHNICAL_REGEX.test(i.itemText || '')
      );

      const rawChecked = clientVisibleItems.filter(i => i.checked).length;
      const totalCount = clientVisibleItems.length;
      checklistProgress = totalCount === 0 ? 0 : Math.round((rawChecked / totalCount) * 100);
    }

    // 2. Temporal Logic for Operação Assistida
    let temporalProgress = 0;
    let days = 0;
    let startDate: Date | null = null;
    const isAssistida = currentPhaseName.toLowerCase().includes('assistida');
    
    if (isAssistida) {
      const triggerRegex = /pronto.*in[ic].*opera.*assist/i;
      const triggerItem = p.checklistItems?.find(i => triggerRegex.test(i.checklistLabel || '') && i.checked);

      const tryParse = (d: any) => {
        if (!d) return null;
        try {
          // Try parseISO first, then native Date as fallback
          let parsed = typeof d === 'string' ? parseISO(d) : d;
          if (!(parsed instanceof Date) || isNaN(parsed.getTime())) {
            parsed = new Date(d);
          }
          return (parsed instanceof Date && !isNaN(parsed.getTime())) ? parsed : null;
        } catch (e) {
          return null;
        }
      };

      startDate = tryParse(triggerItem?.updatedAt);
      
      if (!startDate) {
        // Ultimate fallback to kickoff or project creation
        // Checking multiple naming variations for safety
        const rawCreated = (p as any).createdAt || (p as any).created_at;
        const rawKickoff = (p as any).kickoffDate || (p as any).kickoff_date;
        
        startDate = tryParse(rawKickoff) || tryParse(rawCreated);
        
        if (!startDate) {
          // Emergency Fallback: Earliest item in the whole project
          const allItems = p.checklistItems || [];
          if (allItems.length > 0) {
            const sorted = [...allItems].sort((a, b) => 
               new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            startDate = tryParse(sorted[0].createdAt);
          }
        }
      }

      const now = new Date();
      const diff = startDate ? differenceInDays(now, startDate) : 0;
      days = Math.max(0, diff);
      
      // Target 40 days for 99%
      temporalProgress = Math.min(99, Math.round((days / 40) * 100));
      
      // Safety: If we are in this phase and it's an old project, ensure it's not 1%
      if (temporalProgress < 5 && days > 5) temporalProgress = 99; 
      if (temporalProgress === 0 && days >= 0) temporalProgress = 1;
    }

    return {
      checklist: checklistProgress,
      temporal: temporalProgress,
      total: Math.max(checklistProgress, temporalProgress)
    };
  }, [p]);

  // Gamification: Tiro de Confeti no Admin!
  const [hasShotConfetti, setHasShotConfetti] = useState(false);
  useEffect(() => {
    if (phaseProgress.total >= 99 && !hasShotConfetti && p?.currentPhase !== 'Concluído') {
       shootConfetti();
       setHasShotConfetti(true);
    } else if (phaseProgress.total < 99) {
       setHasShotConfetti(false);
    }
  }, [phaseProgress.total, hasShotConfetti, p?.currentPhase]);

  const handleToggleVisibility = async (ids: string | string[], current: boolean) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    const newVisible = !current;
    
    idList.forEach(id => setLoadingVisibility(prev => ({ ...prev, [id]: true })));

    try {
      const { error } = await supabase
        .from('onboarding_checklist_items')
        .update({ client_visible: newVisible })
        .in('id', idList);

      if (error) throw error;
      toast.success(newVisible ? 'Item visível para o cliente' : 'Item oculto para o cliente');
      refetch();
    } catch (err: any) {
      toast.error('Erro ao alterar visibilidade');
    } finally {
      idList.forEach(id => setLoadingVisibility(prev => ({ ...prev, [id]: false })));
    }
  };

  const executeTextUpdate = async (itemId: string, newText: string) => {
    setOptimisticTexts(prev => ({ ...prev, [itemId]: newText }));
    setLoadingItems(prev => ({ ...prev, [itemId]: true }));

    toast.success('Observação salva!', {
        description: 'Texto enviado para o Pipefy.',
        duration: 2000
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const { data, error } = await supabase.functions.invoke('update-pipefy-checklist', {
        body: { checklistItemId: itemId, newItemText: newText }
      });
      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error);
    } catch (err: any) {
      toast.error('Erro ao salvar texto', { description: err.message || 'Erro desconhecido' });
    } finally {
      setLoadingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleTextUpdate = (itemId: string, newText: string) => {
    if (isAdmin) {
      executeTextUpdate(itemId, newText);
    } else {
      setPendingAction({ itemId, newText, type: 'text' });
    }
  };

  const executeCheckUpdate = async (itemId: string, currentStatus: boolean, itemText: string) => {
    const newStatus = !currentStatus;
    setOptimisticChecks(prev => ({ ...prev, [itemId]: newStatus }));
    setLoadingItems(prev => ({ ...prev, [itemId]: true }));
    
    const actionDesc = newStatus ? `marcou: "${itemText}"` : `desmarcou: "${itemText}"`;

    if (newStatus) {
      toast.success('Campo atualizado!', {
        description: itemId.startsWith('demo_') ? 'Salvo no banco nativo.' : 'Sincronizando alteração com o Pipefy...',
        duration: 2000
      });
    }

    if (itemId.startsWith('demo_')) {
        try {
           const { error } = await supabase.rpc('toggle_native_checklist', {
               p_project_id: p?.id,
               p_item_id: itemId,
               p_is_checked: newStatus
           });
           if (error) throw error;
           logActivity(p?.id || '', 'CHECKLIST_TOGGLE_ADMIN', `(Admin) ${actionDesc}`);
        } catch (err) {
           setOptimisticChecks(prev => ({ ...prev, [itemId]: currentStatus }));
           toast.error('Erro ao salvar no Hub', { description: 'Falha de conexão com o banco local.' });
           console.error(err);
        } finally {
           setLoadingItems(prev => ({ ...prev, [itemId]: false }));
        }
        return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const { data, error } = await supabase.functions.invoke('update-pipefy-checklist', {
        body: { checklistItemId: itemId, isChecked: newStatus }
      });
      if (error) throw error;
      if (data && data.success === false) throw new Error(data.error);
      logActivity(p?.id || '', 'CHECKLIST_TOGGLE_ADMIN', `(Admin) ${actionDesc}`);
    } catch (err: any) {
      setOptimisticChecks(prev => ({ ...prev, [itemId]: currentStatus }));
      toast.error('Erro de Sincronização', { 
        description: err.message || 'O Pipefy não respondeu à solicitação.' 
      });
    } finally {
      setLoadingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleCheck = (itemId: string, currentStatus: boolean, e?: React.MouseEvent | string) => {
    // Ajeitando polimorfismo para aguentar tanto o clique com evento quanto chamada hardcoded strings
    const itemText = typeof e === 'string' ? e : (p?.checklistItems?.find(i => i.id === itemId)?.itemText || 'Item');
    
    if (e && typeof e !== 'string' && (e as React.MouseEvent).stopPropagation) (e as React.MouseEvent).stopPropagation();

    if (isAdmin) {
      executeCheckUpdate(itemId, currentStatus, itemText);
    } else {
      setPendingAction({ itemId, newStatus: !currentStatus, type: 'check' });
    }
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'text') {
      executeTextUpdate(pendingAction.itemId, pendingAction.newText!);
    } else {
      const targetStatus = pendingAction.newStatus!;
      const currentStatus = !targetStatus;
      const itemText = p?.checklistItems?.find(i => i.id === pendingAction.itemId)?.itemText || 'Item';
      executeCheckUpdate(pendingAction.itemId, currentStatus, itemText);
    }
    setPendingAction(null);
  };

  const phaseTabs = useMemo((): PhaseTab[] => {
    if (!p) return [];
    
    // Filter items based on context
    const allItems = p.checklistItems || [];
    
    // For the UI groups, we'll keep the raw data. 
    // The filtering happens inside the render helpers to allow Admin preview.

    const map = new Map<string, ChecklistItem[]>();
    for (const item of allItems) {
      const key = item.phaseName || 'Sem fase';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    const tabs: PhaseTab[] = [];
    map.forEach((items, phaseName) => {
    tabs.push({ phaseName, items, isCurrentPhase: normalize(phaseName) === normalize(p.currentPhase || ''), order: getPhaseOrder(phaseName) });
    });
    return tabs.sort((a, b) => a.order - b.order);
  }, [p]);
  // Auto-select current phase
  useEffect(() => {
    const current = phaseTabs.find(t => t.isCurrentPhase);
    setSelectedPhase(current?.phaseName ?? phaseTabs[0]?.phaseName ?? null);
  }, [p?.id, phaseTabs]);

  // ── Guards ────────────────────────────────────────────────
  if (isAdmin && !selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 glow-sm">
          <ClipboardList className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-2">Checklist da Fase</h2>
        <p className="text-muted-foreground text-sm">Selecione um cliente no menu superior para visualizar o checklist.</p>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !p) return <div className="text-center py-20 text-destructive font-bold">Erro ao carregar checklists.</div>;

  // ── Render Helpers ────────────────────────────────────────

  /** 
   * THE SUCCESS HUB (Client View)
   * Focused, minimalist, linear journey.
   */
  const renderClientHub = () => {
    if (!p) return null;
    const currentPhaseName = p.currentPhase || '';
    const activeTab = phaseTabs.find(t => normalize(t.phaseName) === normalize(currentPhaseName));
    
    const rawItems = activeTab?.items ?? [];
    let items = rawItems.filter(i => 
      i.clientVisible && 
      !i.adminOnly &&
      !TECHNICAL_REGEX.test(i.checklistLabel || '') &&
      !TECHNICAL_REGEX.test(i.itemText || '')
    );
    let fieldGroups = groupByField(items);

    // [MODO DEMONSTRAÇÃO - OPÇÃO B]
    if (normalize(currentPhaseName) === normalize('Preparação') || normalize(currentPhaseName) === normalize('Preparação em foco')) {
      const { grouped } = generatePreparationTemplate(p, optimisticChecks);
      
      fieldGroups = Object.entries(grouped).map(([label, items]) => ({
         label,
         items: items.map(i => ({
            id: i.id,
            itemText: i.itemText,
            checklistLabel: i.checklistLabel,
            checked: i.checked,
            clientVisible: true,
            adminOnly: false,
            fieldType: 'checklist'
         } as ChecklistItem)),
         isRadio: false,
         isText: false,
         adminOnly: false,
         clientVisible: true
      }));
    }

    const isAssistida = /assistida|operacao.*assist|assitida/i.test(currentPhaseName);
    
    let displayPhaseName = currentPhaseName;
    if (normalize(currentPhaseName) === normalize('wrap-up')) {
      displayPhaseName = 'Concluído';
    }

    const progressPct = normalize(displayPhaseName) === normalize('concluido') ? 100 : phaseProgress.total;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Journey Stepper */}
        <div className="bg-black/20 rounded-[2rem] border border-white/5 p-2 mb-8 shadow-2xl overflow-hidden">
          <PhaseStepper currentPhase={displayPhaseName} />
        </div>

        {/* Welcome Header */}
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-4xl font-black text-white tracking-tight">
            {normalize(displayPhaseName) === 'concluido' ? 'Jornada ' : 'Missão: '}
            <span className="text-primary">
              {normalize(displayPhaseName) === 'concluido' ? 'Concluída' : displayPhaseName}
            </span>
          </h2>
          <p className="text-muted-foreground font-medium italic">
            {normalize(displayPhaseName) === 'concluido' 
              ? 'Obrigado pela parceria! Sua trajetória de implantação foi um sucesso.'
              : 'Complete os itens abaixo para avançarmos na sua implantação.'}
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid gap-8">
          {fieldGroups.length === 0 ? (
            <Card className="glass-card p-12 text-center border-dashed border-primary/20">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Sparkle className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Excelente Trabalho!</h3>
              <p className="text-muted-foreground text-sm">Você concluiu todos os itens desta fase. Aguarde o próximo passo do nosso time.</p>
            </Card>
          ) : (
            fieldGroups.map((group, idx) => (
              <motion.div 
                key={group.label} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl transition-all hover:border-primary/20"
              >
                <div className="p-8 space-y-6">
                  {/* Mission Label */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <ArrowRight className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-white/90 tracking-tight">{group.label}</h3>
                    </div>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] uppercase tracking-widest px-3 py-1 opacity-40">
                      Pilar Operacional
                    </Badge>
                  </div>

                  {/* Items Container */}
                  <div className="bg-black/20 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                    {group.isRadio ? (
                      <RadioField group={group} optimisticChecks={optimisticChecks} loadingItems={loadingItems} onCheck={handleCheck} canEdit={true} isAdmin={false} onToggleVisibility={() => {}} loadingVisibility={{}} />
                    ) : group.isText ? (
                      <TextField item={group.items[0]} optimisticTexts={optimisticTexts} loadingItems={loadingItems} onUpdate={handleTextUpdate} canEdit={true} isAdmin={false} onToggleVisibility={() => {}} loadingVisibility={{}} />
                    ) : (
                      group.items.map(item => (
                        <ChecklistRow key={item.id} item={item} optimisticChecks={optimisticChecks} loadingItems={loadingItems} onCheck={handleCheck} canEdit={true} isAdmin={false} onToggleVisibility={() => {}} loadingVisibility={{}} />
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Global Progress */}
        <div className="max-w-md mx-auto pt-12 pb-6">
           <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[9px] uppercase font-black text-primary tracking-[0.25em]">Progresso da Fase</span>
              <span className="text-sm font-black text-white">{progressPct}%</span>
           </div>
           <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <motion.div 
                className="h-full bg-primary glow-sm rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
           </div>
        </div>
      </div>
    );
  };

  /**
   * THE MANAGEMENT VIEW (Admin View)
   */
  const renderAdminView = () => {
    const activeTab = phaseTabs.find(t => normalize(t.phaseName) === normalize(selectedPhase || ''));
    const items = activeTab?.items ?? [];
    const fieldGroups = groupByField(items);

    const rawChecked = items.filter(i => i.checked).length;
    const totalCount = items.length;
    
    // Use the unified progress calculation if this is the current phase (counts temporal logic)
    const isCurrent = normalize(selectedPhase || '') === normalize(p.currentPhase || '');
    const progressPct = isCurrent ? phaseProgress.total : (totalCount === 0 ? 0 : Math.round((rawChecked / totalCount) * 100));

    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <ClipboardList className="w-7 h-7 text-primary" />
             </div>
             <div>
               <h1 className="text-3xl font-extrabold text-white tracking-tight">Checklist de Implantação</h1>
               <p className="text-muted-foreground text-xs font-medium">Gestão integrada Pipefy</p>
             </div>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <p className="text-xs text-amber-200/80 font-medium italic">Visão Admin: Controle total de visibilidade e edição habilitados.</p>
        </div>

        {phaseTabs.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {phaseTabs.map(tab => (
              <button
                key={tab.phaseName}
                onClick={() => setSelectedPhase(tab.phaseName)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all
                  ${normalize(tab.phaseName) === normalize(selectedPhase || '') ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white'}
                `}
              >
                {tab.phaseName}
              </button>
            ))}
          </div>
        )}

        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{selectedPhase}</span>
              <Badge className="bg-primary/20 text-primary border-primary/30 font-bold">{progressPct}%</Badge>
            </div>
            <div className="divide-y divide-white/5">
              {fieldGroups.map((group, idx) => {
                const isHidden = !group.clientVisible;
                return (
                  <div key={group.label + idx} className={isHidden ? 'opacity-40 grayscale-[0.5] bg-black/40' : ''}>
                    {group.isRadio ? (
                      <RadioField group={group} optimisticChecks={optimisticChecks} loadingItems={loadingItems} onCheck={handleCheck} canEdit={true} isAdmin={true} onToggleVisibility={handleToggleVisibility} loadingVisibility={loadingVisibility} />
                    ) : group.isText ? (
                      <TextField item={group.items[0]} optimisticTexts={optimisticTexts} loadingItems={loadingItems} onUpdate={handleTextUpdate} canEdit={true} isAdmin={true} onToggleVisibility={handleToggleVisibility} loadingVisibility={loadingVisibility} />
                    ) : (
                      group.items.map(item => (
                        <ChecklistRow key={item.id} item={item} optimisticChecks={optimisticChecks} loadingItems={loadingItems} onCheck={handleCheck} canEdit={true} isAdmin={true} onToggleVisibility={handleToggleVisibility} loadingVisibility={loadingVisibility} />
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto pb-10">
      {/* Role Toggle for Admins */}
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <div className="bg-black/40 border border-white/5 p-1 rounded-2xl flex items-center gap-1 shadow-2xl">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isPreviewMode ? 'bg-primary text-black glow-sm' : 'text-muted-foreground hover:text-white'}`}
            >
              Gestão ADM
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPreviewMode ? 'bg-primary text-black glow-sm' : 'text-muted-foreground hover:text-white'}`}
            >
              Preview Cliente (Hub)
            </button>
          </div>
        </div>
      )}

      {showClientHub ? renderClientHub() : renderAdminView()}

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent className="glass-card border-primary/20 bg-black/90 backdrop-blur-2xl rounded-3xl p-8">
          <AlertDialogHeader>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
               <AlertCircle className="w-7 h-7 text-primary" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-white tracking-tight">Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed">
              Você está prestes a atualizar um item do checklist de implantação. Esta alteração será enviada diretamente para o time ADM.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-12 transition-all">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className="rounded-xl bg-primary text-black font-black hover:bg-primary/90 h-12 px-8 glow-sm transition-all">Confirmar Alteração</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
