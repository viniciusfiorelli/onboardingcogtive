import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Rocket, Target, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { shootConfetti } from '@/utils/confetti';

const SEEN_KEY = '@cogtive_tour_seen_v1';

export function WelcomeTour() {
  const { isAdmin } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Apenas mostrar se for a visão do Cliente pela primeira vez
    if (!isAdmin) {
      const hasSeen = localStorage.getItem(SEEN_KEY);
      if (!hasSeen) {
        // Pequeno delay para a página carregar bonita atrás
        setTimeout(() => setIsOpen(true), 1500);
      }
    }
  }, [isAdmin]);

  const closeTour = () => {
    setIsOpen(false);
    localStorage.setItem(SEEN_KEY, 'true');
    shootConfetti(); // Celebra que o cliente fez o Onboarding dele!
  };

  const steps = [
    {
      icon: <Rocket className="w-12 h-12 text-primary" />,
      title: "Bem-vindo ao Success Hub!",
      desc: "Nós transacionamos dados, mas entregamos impacto. Este é o seu portal exclusivo para acompanhar a evolução da sua fábrica em tempo real.",
    },
    {
       icon: <Target className="w-12 h-12 text-success" />,
       title: "Transparência Absoluta",
       desc: "A barra de progresso no topo refletirá exatamente o nosso cronograma técnico. O que estiver pendente estará em 'Ações Pendentes'. Faça sua parte por lá!",
    },
    {
       icon: <ShieldCheck className="w-12 h-12 text-warning" />,
       title: "Seguro. Rápido. Inteligente.",
       desc: "Toda sua visão está atrelada à Engine de Checklists Inteligente da Cogtive. Dependendo do seu HW ou SW, as telas montam as missões pra você automaticamente.",
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
          {/* Backdrop Blur pesado escondendo o sistema */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all"
            onClick={closeTour}
          />
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 30 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 20 }}
             transition={{ type: "spring", damping: 25, stiffness: 300 }}
             className="relative z-10 w-full max-w-md bg-black/40 border border-white/10 p-8 rounded-[2rem] shadow-2xl glass-card text-center"
          >
             <AnimatePresence mode="wait">
               <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
               >
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
                    {steps[step].icon}
                 </div>
                 <h2 className="text-2xl font-black text-white italic tracking-tighter mb-4">{steps[step].title}</h2>
                 <p className="text-muted-foreground font-medium leading-relaxed mb-8">
                    {steps[step].desc}
                 </p>
               </motion.div>
             </AnimatePresence>

             <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                   {steps.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === step ? 'w-6 bg-primary' : 'bg-white/20'}`} />
                   ))}
                </div>
                
                {step < steps.length - 1 ? (
                   <Button onClick={() => setStep(step + 1)} className="bg-primary text-black font-black hover:bg-primary/90 glow-sm rounded-xl">
                      Próximo <ChevronRight className="w-4 h-4 ml-1" />
                   </Button>
                ) : (
                   <Button onClick={closeTour} className="bg-success text-success-foreground font-black hover:bg-success/90 glow-sm rounded-xl">
                      Começar <Check className="w-4 h-4 ml-1" />
                   </Button>
                )}
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
