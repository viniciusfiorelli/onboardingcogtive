import { mockProject } from '@/data/mockData';
import { DocumentCard } from '@/components/onboarding/DocumentCard';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';

export default function Documents() {
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
        <span className="text-foreground font-semibold">{mockProject.documents.length}</span>
        <span className="text-muted-foreground">documentos disponíveis</span>
      </motion.div>

      <div className="space-y-3">
        {mockProject.documents.map((doc, i) => (
          <DocumentCard key={doc.id} document={doc} index={i} />
        ))}
      </div>
    </div>
  );
}
