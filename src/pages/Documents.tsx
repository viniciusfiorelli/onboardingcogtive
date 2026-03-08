import { mockProject } from '@/data/mockData';
import { DocumentCard } from '@/components/onboarding/DocumentCard';

export default function Documents() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documentos e Materiais</h1>
        <p className="text-sm text-muted-foreground mt-1">Materiais compartilhados durante a implantação</p>
      </div>

      <div className="space-y-4">
        {mockProject.documents.map(doc => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}
