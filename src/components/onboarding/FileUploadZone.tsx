import React, { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FileUploadZoneProps {
  projectId: string;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploadZone({ projectId, onSuccess }: FileUploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande!', {
        description: 'O limite é de 50MB. Por favor, envie arquivos maiores pelo WhatsApp do grupo de implantação.',
        duration: 8000,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !projectId) return;

    try {
      setUploading(true);
      setProgress(10);

      // 1. Upload para o Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`;
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('client-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;
      setProgress(60);

      // 2. Pegar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('client-documents')
        .getPublicUrl(fileName);

      // 3. Registrar no Banco de Dados
      const { error: dbError } = await supabase
        .from('onboarding_client_uploads')
        .insert({
          project_id: projectId,
          name: file.name,
          file_url: publicUrl,
          status: 'pending'
        });

      if (dbError) throw dbError;

      setProgress(100);
      toast.success('Arquivo enviado com sucesso!', {
        description: 'Nossa equipe irá revisar o documento em breve.',
      });
      
      setFile(null);
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar arquivo', {
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 bg-primary/5">
      {!file ? (
        <div 
          className="flex flex-col items-center justify-center cursor-pointer space-y-3"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Clique para enviar ou arraste o arquivo</p>
            <p className="text-xs text-muted-foreground mt-1">Limite de 50MB (PDF, Excel, Imagens)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div className="max-w-[200px] md:max-w-md">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              disabled={uploading}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {uploading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Enviando...
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleUpload} className="flex-1">
                Enviar para Aprovação
              </Button>
              <Button variant="outline" onClick={() => setFile(null)}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <MessageCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-800 leading-relaxed">
          <strong>Arquivos muito pesados?</strong> Se o seu Excel ou PDF ultrapassar 50MB, por favor encaminhe diretamente no grupo de WhatsApp da implantação para não sobrecarregar o portal.
        </p>
      </div>
    </div>
  );
}
