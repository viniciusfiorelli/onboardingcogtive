import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Outlet } from 'react-router-dom';
import { AdminProjectSelector } from '@/components/admin/AdminProjectSelector';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { WelcomeTour } from '@/components/WelcomeTour';

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        <WelcomeTour />
        {/* Fundo Premium Global */}
        <div className="fixed inset-0 bg-grid-white/[0.015] bg-[size:50px_50px] pointer-events-none" />
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-20 flex w-full h-screen overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-black/20 backdrop-blur-3xl shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.5)]">
            <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-transparent border-b border-white/5 sticky top-0 z-30">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-white transition-colors p-2" />
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary glow-primary animate-pulse" />
                  <span className="text-sm uppercase tracking-widest font-black text-foreground/80 hidden sm:inline">Success Hub</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <NotificationBell />
                <AdminProjectSelector />
              </div>
            </header>
            <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
