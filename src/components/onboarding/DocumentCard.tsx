import { Card, CardContent } from '@/components/ui/card';
import { SharedDocument } from '@/types/onboarding';
import { FileText, Presentation, ClipboardList, BookOpen, File, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  apresentacao: { label: 'Apresentação', icon: <Presentation className="w-4 h-4" /> },
  checklist: { label: 'Checklist', icon: <ClipboardList className="w-4 h-4" /> },
  guia: { label: 'Guia', icon: <BookOpen className="w-4 h-4" /> },
  treinamento: { label: 'Treinamento', icon: <FileText className="w-4 h-4" /> },
  documento: { label: 'Documento', icon: <File className="w-4 h-4" /> },
};

interface DocumentCardProps {
  document: SharedDocument;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const config = typeConfig[document.type] || typeConfig.documento;
  const date = new Date(document.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Card className="glass-card hover:border-primary/30 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-sm text-foreground">{document.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{config.label}</span>
              <span>•</span>
              <span>{date}</span>
            </div>
            <p className="text-sm text-muted-foreground">{document.description}</p>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 text-primary hover:text-primary hover:bg-primary/10">
            <Eye className="w-4 h-4 mr-1" /> Ver
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
