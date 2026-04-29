import { useProjectData } from '@/hooks/useProjectData';
import { useAdmin } from '@/contexts/AdminContext';
import { ContactCard } from '@/components/onboarding/ContactCard';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, Loader2 } from 'lucide-react';

export default function Team() {
  const { isAdmin, selectedProjectId } = useAdmin();
  const { data: project, isLoading, error } = useProjectData();

  if (isAdmin && !selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Bem-vindo, Administrador</h2>
        <p className="text-muted-foreground">
          Para visualizar os contatos da equipe, por favor selecione um cliente no menu superior direito.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Erro ao carregar dados</h2>
        <p className="text-muted-foreground mt-2">{error?.message || "Projeto não encontrado"}</p>
      </div>
    );
  }

  const cogtiveContacts = project.contacts.filter(c => c.isCogtive);
  const clientContacts = project.contacts.filter(c => !c.isCogtive);

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Equipe e Contatos</h1>
        <p className="text-sm text-muted-foreground mt-1">Quem está envolvido na sua implantação</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Equipe Cogtive</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cogtiveContacts.map((c, i) => <ContactCard key={c.id} contact={c} index={i} />)}
        </div>
      </motion.div>

      <div className="border-t border-border/30" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
            <Users className="w-4 h-4 text-secondary-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Sua Equipe</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientContacts.map((c, i) => <ContactCard key={c.id} contact={c} index={i} />)}
        </div>
      </motion.div>
    </div>
  );
}
