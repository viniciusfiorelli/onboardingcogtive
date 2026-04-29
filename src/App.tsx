import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AdminRoute, ClientRoute, ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminProvider, checkIsAdmin } from "@/contexts/AdminContext";

import Login from "./pages/Login";
import Overview from "./pages/Overview";
import PendingIssues from "./pages/PendingIssues";
import NextSteps from "./pages/NextSteps";
import TrainingDeliveries from "./pages/TrainingDeliveries";
import Team from "./pages/Team";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";
import ClientList from "./pages/admin/ClientList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminChecklist from "./pages/admin/AdminChecklist";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminClientDocuments from "./pages/admin/AdminClientDocuments";

const queryClient = new QueryClient();

// The Overview page will act as a generic initial route and redirect based on role
const RoleBasedRedirect = () => {
  const { session } = useAuth();
  const isAdmin = session?.user?.email?.endsWith('@cogtive.com');
  return <Navigate to={isAdmin ? "/admin" : "/client"} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rota Pública de Login */}
              <Route path="/login" element={<Login />} />
              
              {/* Rota de Distribuição - Verifica o Auth */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<RoleBasedRedirect />} />
              </Route>

              {/* Rotas de Admin (Apenas @cogtive.com) */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AppLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="project" element={<Overview />} />
                  <Route path="pending" element={<PendingIssues />} />
                  <Route path="next-steps" element={<NextSteps />} />
                  <Route path="training" element={<TrainingDeliveries />} />
                  <Route path="checklist" element={<AdminChecklist />} />
                  <Route path="clients" element={<ClientList />} />
                  <Route path="team" element={<Team />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="review-documents" element={<AdminClientDocuments />} />
                  <Route path="logs" element={<AdminLogs />} />
                </Route>
              </Route>

              {/* Rotas de Clientes (Qualquer outro domínio) */}
              <Route element={<ClientRoute />}>
                <Route path="/client" element={<AppLayout />}>
                  <Route index element={<Overview />} />
                  <Route path="pending" element={<PendingIssues />} />
                  <Route path="next-steps" element={<NextSteps />} />
                  <Route path="training" element={<TrainingDeliveries />} />
                  <Route path="checklist" element={<AdminChecklist />} />
                  <Route path="documents" element={<Documents />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
