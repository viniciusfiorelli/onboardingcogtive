import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const checkIsAdmin = (email: string | null | undefined) => 
  !!email && email.toLowerCase().endsWith('@cogtive.com');

interface AdminContextType {
  isAdmin: boolean;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userEmail = session?.user?.email;

  // Verifica se o usuário logado é da Cogtive
  const isAdmin = checkIsAdmin(userEmail);

  // Inicializa o estado a partir do localStorage para manter entre F5
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return localStorage.getItem('success_hub_admin_selected_project');
  });

  // Persiste a mudança no localStorage
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('success_hub_admin_selected_project', selectedProjectId);
      console.log('AdminContext: Projeto selecionado salvo no storage:', selectedProjectId);
    } else {
      localStorage.removeItem('success_hub_admin_selected_project');
    }
  }, [selectedProjectId]);

  // Se o usuário não for admin, ele nunca tem um "cliente selecionado" explícito (usa o próprio)
  useEffect(() => {
    if (!isAdmin) {
      setSelectedProjectId(null);
      localStorage.removeItem('success_hub_admin_selected_project');
    }
  }, [isAdmin]);

  return (
    <AdminContext.Provider value={{ isAdmin, selectedProjectId, setSelectedProjectId }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }
  return context;
}
