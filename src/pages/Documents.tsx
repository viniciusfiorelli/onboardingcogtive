import { DocumentCard } from '@/components/onboarding/DocumentCard';
import { FileUploadZone } from '@/components/onboarding/FileUploadZone';
import { ClientUploadCard } from '@/components/onboarding/ClientUploadCard';
import { motion } from 'framer-motion';
import { FolderOpen, Upload, FileText, Download, FileDown, AlertTriangle, Users, History } from 'lucide-react';
import { useProjectData } from '@/hooks/useProjectData';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Documents() {
  const [activeTab, setActiveTab] = useState('shared');
  const { isAdmin, selectedProjectId } = useAdmin();
  const { data: p, isLoading, error, refetch } = useProjectData();

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

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Documentos e Materiais</h1>
        <p className="text-sm text-muted-foreground mt-1">Central de arquivos compartilhados e envios do cliente</p>
      </motion.div>

      <Tabs defaultValue={isAdmin ? "shared" : "uploads"} className="w-full">
        <TabsList className={`grid w-full mb-8 ${isAdmin ? "grid-cols-2" : "grid-cols-1"}`}>
          {isAdmin && (
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Documentos do Pipefy (Admin)
            </TabsTrigger>
          )}
          <TabsTrigger value="uploads" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {isAdmin ? "Envios do Cliente" : "Meus Envios / Uploads"}
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="shared" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-4 py-2 text-sm w-fit"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-foreground font-semibold">{p.documents.length}</span>
              <span className="text-muted-foreground">arquivos sincronizados do Pipefy</span>
            </motion.div>

            <div className="space-y-3">
              {p.documents.length > 0 ? (
                p.documents.map((doc, i) => (
                  <DocumentCard key={doc.id} document={doc} index={i} />
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground">Nenhum documento sincronizado do Pipefy.</p>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        <TabsContent value="uploads" className="space-y-8">
          {!isAdmin && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Enviar Novo Documento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Suba aqui planilhas, cadastros ou qualquer arquivo solicitado pela consultoria.
                </p>
              </div>
              <FileUploadZone projectId={p.id} onSuccess={refetch} />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Histórico de Envios
            </h3>
            <div className="space-y-3">
              {p.clientUploads.length > 0 ? (
                p.clientUploads.map((upload, i) => (
                  <ClientUploadCard key={upload.id} upload={upload} index={i} />
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
                  <p className="text-muted-foreground">Você ainda não enviou nenhum arquivo.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
