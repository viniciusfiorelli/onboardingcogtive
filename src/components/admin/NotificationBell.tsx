import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { Bell, Check, Trash2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationBell() {
  const { isAdmin } = useAdmin();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from('activity_logs')
      .select('*, onboarding_projects(client_name)')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (data) {
      setNotifications(data);
      setUnreadCount(data.length);
    }
  };

  useEffect(() => {
    fetchNotifs();
    
    // Interval polling simples para atualizar a cada minuto
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    const ids = notifications.map(n => n.id);
    await supabase.from('activity_logs').update({ is_read: true }).in('id', ids);
    setNotifications([]);
    setUnreadCount(0);
  };

  if (!isAdmin) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-white/10 rounded-xl w-10 h-10 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full border border-background shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0 mr-4 mt-2 border-white/10 bg-black/80 backdrop-blur-3xl shadow-2xl rounded-2xl overflow-hidden" align="end">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
           <div>
             <h4 className="font-black text-white text-sm uppercase tracking-wider">Notificações</h4>
             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{unreadCount} não lidas</p>
           </div>
           {unreadCount > 0 && (
             <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-[11px] text-primary hover:bg-primary/10 hover:text-primary font-bold">
               <Check className="w-3 h-3 mr-1" /> Marcar lidas
             </Button>
           )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
                <Bell className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">Tudo zerado por aqui.</p>
             </div>
          ) : (
             <div className="flex flex-col divide-y divide-white/5">
                {notifications.map(notif => (
                   <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors flex gap-3">
                      <div className="mt-0.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <ShieldAlert className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                               {notif.onboarding_projects?.client_name || 'Sistema'}
                            </span>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">
                               {format(new Date(notif.created_at), "HH:mm", { locale: ptBR })}
                            </span>
                         </div>
                         <p className="text-sm font-medium text-white/90 leading-snug mt-1">
                            {notif.description}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
