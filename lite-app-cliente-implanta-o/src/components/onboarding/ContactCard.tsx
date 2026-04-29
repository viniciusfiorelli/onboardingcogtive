import { Card, CardContent } from '@/components/ui/card';
import { ProjectContact } from '@/types/onboarding';
import { Mail, Phone, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ContactCardProps {
  contact: ProjectContact;
  index?: number;
}

export function ContactCard({ contact, index = 0 }: ContactCardProps) {
  const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Card className="glass-card-hover">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className={cn(
                'text-sm font-bold',
                contact.isCogtive
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm text-foreground">{contact.name}</h3>
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border',
                  contact.isCogtive ? 'bg-primary/10 text-primary border-primary/25' : 'bg-muted text-muted-foreground border-border/50'
                )}>
                  {contact.isCogtive ? 'Cogtive' : 'Cliente'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{contact.role}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                <Building2 className="w-3 h-3" />{contact.area}
              </div>
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors truncate">
                  <Mail className="w-3 h-3 shrink-0" /><span className="truncate">{contact.email}</span>
                </a>
                <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" />{contact.phone}</span>
              </div>
              {contact.observation && (
                <p className="text-[11px] text-muted-foreground/60 italic">{contact.observation}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
