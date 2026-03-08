import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import PendingIssues from "./pages/PendingIssues";
import NextSteps from "./pages/NextSteps";
import TrainingDeliveries from "./pages/TrainingDeliveries";
import Team from "./pages/Team";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/pending" element={<PendingIssues />} />
            <Route path="/next-steps" element={<NextSteps />} />
            <Route path="/training" element={<TrainingDeliveries />} />
            <Route path="/team" element={<Team />} />
            <Route path="/documents" element={<Documents />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
