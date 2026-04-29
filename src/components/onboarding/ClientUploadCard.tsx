import { ClientUpload } from '@/types/onboarding';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, AlertCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientUploadCardProps {
  upload: ClientUpload;
  index: number;
}

export function ClientUploadCard({ upload, index }: ClientUploadCardProps) {
  const statusConfig = {
    pending: {
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: <Clock className="w-3 h-3" />,
      label: 'Aguardando Aprovação'
    },
    approved: {
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Aprovado'
    },
    rejected: {
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: <AlertCircle className="w-3 h-3" />,
      label: 'Reprovado'
    }
  };

  const config = statusConfig[upload.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative bg-card hover:bg-accent/5 border border-border rounded-xl p-4 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground leading-none mb-2">{upload.name}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                Enviado em {format(new Date(upload.createdAt), "dd 'de' MMMM", { locale: ptBR })}
              </span>
              <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0 h-5 gap-1 ${config.color}`}>
                {config.icon}
                {config.label}
              </Badge>
            </div>
            
            {upload.rejectionReason && upload.status === 'rejected' && (
              <div className="mt-3 p-2 bg-destructive/5 border border-destructive/10 rounded text-xs text-destructive flex items-start gap-2">
                <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                <p><strong>Motivo da reprovação:</strong> {upload.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        <a
          href={upload.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-primary"
          title="Ver arquivo"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </motion.div>
  );
}
