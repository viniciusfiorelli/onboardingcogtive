import { Card, CardContent } from '@/components/ui/card';
import { ProjectContact } from '@/types/onboarding';
import { Mail, Phone, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ContactCardProps {
  contact: ProjectContact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card className="glass-card hover:border-primary/30 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={cn(
              'text-sm font-semibold',
              contact.isCogtive ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground">{contact.name}</h3>
              <span className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border',
                contact.isCogtive ? 'bg-primary/10 text-primary border-primary/30' : 'bg-secondary text-secondary-foreground border-border/50'
              )}>
                {contact.isCogtive ? 'Cogtive' : 'Cliente'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{contact.role}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3" />{contact.area}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</span>
            </div>
            {contact.observation && (
              <p className="text-xs text-muted-foreground italic mt-1">{contact.observation}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
