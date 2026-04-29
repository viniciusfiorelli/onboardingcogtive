import { Card, CardContent } from '@/components/ui/card';
import { SharedDocument } from '@/types/onboarding';
import { FileText, Presentation, ClipboardList, BookOpen, File, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const typeConfig: Record<string, { label: string; icon: React.ReactNode; emoji: string }> = {
  apresentacao: { label: 'Apresentação', icon: <Presentation className="w-5 h-5" />, emoji: '📊' },
  checklist: { label: 'Checklist', icon: <ClipboardList className="w-5 h-5" />, emoji: '✅' },
  guia: { label: 'Guia', icon: <BookOpen className="w-5 h-5" />, emoji: '📖' },
  treinamento: { label: 'Treinamento', icon: <FileText className="w-5 h-5" />, emoji: '🎓' },
  documento: { label: 'Documento', icon: <File className="w-5 h-5" />, emoji: '📄' },
};

interface DocumentCardProps {
  document: SharedDocument;
  index?: number;
}

export function DocumentCard({ document, index = 0 }: DocumentCardProps) {
  const config = typeConfig[document.type] || typeConfig.documento;
  const date = new Date(document.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Card className="glass-card-hover">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg">
              {config.emoji}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-semibold text-sm text-foreground">{document.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-muted/50 px-2 py-0.5 rounded-full">{config.label}</span>
                <span>{date}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">{document.description}</p>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 text-primary hover:text-primary hover:bg-primary/10 gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Abrir
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
