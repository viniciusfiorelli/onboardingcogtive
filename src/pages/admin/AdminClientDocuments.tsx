import { useProjectData } from '@/hooks/useProjectData';
import { useAdmin } from '@/contexts/AdminContext';
import { motion } from 'framer-motion';
import { FileText, Check, X, ExternalLink, MessageCircle, AlertCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminClientDocuments() {
  const { isAdmin, selectedProjectId } = useAdmin();
  const { data: p, isLoading, refetch } = useProjectData();

  const handleStatusChange = async (uploadId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const { error } = await supabase
        .from('onboarding_client_uploads')
        .update({ status, rejection_reason: reason })
        .eq('id', uploadId);

      if (error) throw error;
      
      toast.success(status === 'approved' ? 'Documento aprovado!' : 'Documento reprovado.');
      refetch();
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Acesso Negado</h2>
        <p className="text-muted-foreground">Esta página é restrita a administradores.</p>
      </div>
    );
  }

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <Users className="w-16 h-16 text-primary/20 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Selecione um Cliente</h2>
        <p className="text-muted-foreground">Escolha um projeto no menu superior para revisar os documentos enviados.</p>
      </div>
    );
  }

  if (isLoading) return null;

  const uploads = p?.clientUploads || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revisão de Documentos</h1>
        <p className="text-muted-foreground">Analise os arquivos enviados pelo cliente {p?.clientName}</p>
      </div>

      <div className="grid gap-4">
        {uploads.length > 0 ? (
          uploads.map((upload) => (
            <Card key={upload.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{upload.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enviado em {format(new Date(upload.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {upload.status === 'pending' && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                            <Clock className="w-3 h-3" /> Pendente
                          </Badge>
                        )}
                        {upload.status === 'approved' && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                            <Check className="w-3 h-3" /> Aprovado
                          </Badge>
                        )}
                        {upload.status === 'rejected' && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                            <X className="w-3 h-3" /> Reprovado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" asChild size="sm">
                      <a href={upload.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Arquivo
                      </a>
                    </Button>

                    {upload.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleStatusChange(upload.id, 'approved')}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt('Motivo da reprovação:');
                            if (reason) handleStatusChange(upload.id, 'rejected', reason);
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reprovar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {upload.rejectionReason && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3 text-sm text-destructive flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 mt-0.5" />
                      <p><strong>Motivo da Reprovação:</strong> {upload.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-2xl">
            <p className="text-muted-foreground">Nenhum documento enviado por este cliente ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
