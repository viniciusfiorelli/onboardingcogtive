import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden p-4">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
      <div className="absolute bottom-1/3 -left-32 w-96 h-96 rounded-full bg-destructive/3 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/50 border border-border/50 mb-6"
        >
          <SearchX className="w-10 h-10 text-muted-foreground/50" />
        </motion.div>

        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg font-medium text-foreground/80 mb-2">Página não encontrada</p>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          A página <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">{location.pathname}</code> não existe ou foi movida.
        </p>

        <Button asChild className="gradient-primary text-primary-foreground hover:opacity-90 gap-2">
          <Link to="/">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
