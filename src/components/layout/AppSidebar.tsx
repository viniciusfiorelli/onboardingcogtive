import {
  LayoutDashboard,
  AlertTriangle,
  ListChecks,
  GraduationCap,
  Building,
  FileText,
  LogOut,
  ClipboardList,
  Activity,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const adminItems = [
  { title: 'Visão Geral', url: '/admin', icon: LayoutDashboard },
  { title: 'Base de Clientes', url: '/admin/clients', icon: Building },
  { title: 'Visão do Cliente', url: '/admin/project', icon: LayoutDashboard },
  { title: 'Checklist', url: '/admin/checklist', icon: ClipboardList },
  { title: 'Academia & Treinos', url: '/admin/training', icon: GraduationCap },
  { title: 'Cofre de Documentos', url: '/admin/documents', icon: FileText },
  { title: 'Aprovação de Documentos', url: '/admin/review-documents', icon: ListChecks },
  { title: 'Logs de Atividade', url: '/admin/logs', icon: Activity },
];

const clientItems = [
  { title: 'Visão Geral', url: '/client', icon: LayoutDashboard },
  { title: 'Checklist', url: '/client/checklist', icon: ClipboardList },
  { title: 'Treinamentos', url: '/client/training', icon: GraduationCap },
  { title: 'Documentos', url: '/client/documents', icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isAdmin = session?.user?.email?.endsWith('@cogtive.com');
  const items = isAdmin ? adminItems : clientItems;

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
      <SidebarContent className="bg-background/80 backdrop-blur-3xl pt-2">
        <SidebarGroup>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-6 mb-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 shadow-xl flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                  <span className="text-xl font-black text-white relative z-10">C.</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-0.5">
                    {isAdmin ? "Admin | Success Hub" : "Portal do Cliente"}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium truncate w-36 opacity-80">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          <SidebarGroupLabel className="px-5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 mb-3">
            {collapsed ? '·' : 'Módulos Operacionais'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-3">
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={index === 0} // Força URL exata para o root
                      className={({ isActive }) => `
                        relative group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-primary/10 text-primary glow-sm font-bold' 
                          : 'text-muted-foreground hover:bg-white/5 hover:text-white font-medium'
                        }
                      `}
                    >
                      {({ isActive }) => (
                         <>
                           {isActive && !collapsed && (
                             <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
                           )}
                           <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-white'}`} />
                           {!collapsed && <span className="tracking-wide text-sm">{item.title}</span>}
                         </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="bg-background/80 backdrop-blur-3xl pb-6 px-4">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={`rounded-xl transition-all h-12 w-full flex items-center justify-center gap-3 group
            ${collapsed ? 'hover:bg-destructive/10' : 'bg-white/5 hover:bg-destructive/10 hover:border-destructive/30 border border-transparent'}
          `}
          onClick={handleLogout}
          title="Encerrar Sessão"
        >
          <LogOut className={`w-5 h-5 transition-colors ${collapsed ? 'text-muted-foreground group-hover:text-destructive' : 'text-muted-foreground group-hover:text-destructive'}`} />
          {!collapsed && <span className="font-bold text-sm text-muted-foreground group-hover:text-destructive transition-colors">Encerrar Sessão</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
