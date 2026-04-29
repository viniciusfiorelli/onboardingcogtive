import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { checkIsAdmin } from "@/contexts/AdminContext";

export const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-b-2 border-primary animate-spin" />
      </div>
    );
  }

  // Se não estiver logado, manda pro login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, renderiza as rotas filhas
  return <Outlet />;
};

export const AdminRoute = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-b-2 border-primary animate-spin" />
      </div>
    );
  }

  // Se não estiver logado, manda pro login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se é Cogtive
  if (!checkIsAdmin(session.user.email)) {
    return <Navigate to="/client" replace />;
  }

  // Se for admin, renderiza rotas filhas
  return <Outlet />;
};

export const ClientRoute = () => {
    const { session, isLoading } = useAuth();
  
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-b-2 border-primary animate-spin" />
        </div>
      );
    }
  
    // Se não estiver logado, manda pro login
    if (!session) {
      return <Navigate to="/login" replace />;
    }
  
    // Verifica se NÃO é Cogtive
    if (checkIsAdmin(session.user.email)) {
      return <Navigate to="/admin" replace />;
    }
  
    // Redireciona para rota filha
    return <Outlet />;
};
