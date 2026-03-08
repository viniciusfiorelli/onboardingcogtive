import { mockProject } from '@/data/mockData';
import { ContactCard } from '@/components/onboarding/ContactCard';

export default function Team() {
  const cogtiveContacts = mockProject.contacts.filter(c => c.isCogtive);
  const clientContacts = mockProject.contacts.filter(c => !c.isCogtive);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipe e Contatos</h1>
        <p className="text-sm text-muted-foreground mt-1">Quem está envolvido na sua implantação</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Equipe Cogtive</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cogtiveContacts.map(c => <ContactCard key={c.id} contact={c} />)}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Equipe do Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientContacts.map(c => <ContactCard key={c.id} contact={c} />)}
        </div>
      </div>
    </div>
  );
}
