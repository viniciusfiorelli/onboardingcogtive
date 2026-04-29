import { DocumentCard } from '@/components/onboarding/DocumentCard';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { useProjectData } from '@/hooks/useProjectData';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, FileDown, AlertTriangle, Users } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin, selectedProjectId } = useAdmin();
  const { data: p, isLoading, error } = useProjectData();

  if (isAdmin && !selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Bem-vindo, Administrador</h2>
        <p className="text-muted-foreground">
          Para visualizar os documentos, por favor selecione um cliente no menu superior direito.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Erro ao carregar documentos</h2>
        <p className="text-muted-foreground mt-2">{error?.message || "Projeto não encontrado"}</p>
      </div>
    );
  }

  const documents = p.documents;
  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Documentos e Materiais</h1>
        <p className="text-sm text-muted-foreground mt-1">Materiais compartilhados durante a implantação</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-4 py-2 text-sm w-fit"
      >
        <FolderOpen className="w-4 h-4 text-primary" />
        <span className="text-foreground font-semibold">{documents.length}</span>
        <span className="text-muted-foreground">documentos disponíveis</span>
      </motion.div>

      <div className="space-y-3">
        {documents.map((doc, i) => (
          <DocumentCard key={doc.id} document={doc} index={i} />
        ))}
      </div>
    </div>
  );
}
