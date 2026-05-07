import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const triggerLoginSync = (email: string) => {
  if (!email.toLowerCase().endsWith('@cogtive.com')) return;
  supabase.functions.invoke('sync-pipefy').catch(console.error);
};

export default function Login() {
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      navigate('/overview', { replace: true });
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { toast.error('Falha de Segurança', { description: error.message }); return; }
        
        toast.success('Acesso Autorizado', { description: 'Iniciando portal seguro...' });
        triggerLoginSync(email);
        
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) { toast.error('Erro na Assinatura', { description: error.message }); return; }
        
        toast.success('Credenciais emitidas', { description: 'Sincronizando perfil seguro...' });
        triggerLoginSync(email);
        setIsLoginMode(true);
      }
    } catch (err: any) {
      toast.error('Erro Sistêmico', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration Premium Vercel/Linear Style */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-gradient-to-t from-background via-transparent to-transparent z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Logo & Branding Minimalista */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
              <div className="relative w-16 h-16 rounded-2xl bg-black border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent" />
                <span className="text-3xl font-black text-white relative z-10 tracking-tighter">C<span className="text-primary">.</span></span>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Success Hub</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium max-w-[280px] mx-auto">
              Ambiente restrito e monitorado de Implantação Cogtive.
            </p>
          </motion.div>
        </div>

        {/* Login Card Linear-like */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isLoginMode ? 'login' : 'signup'}
            initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-black/40 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden rounded-3xl relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardContent className="p-8 space-y-8 mt-2">
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="E-mail Corporativo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 bg-white/5 border-white/5 focus:border-primary/50 focus:bg-white/10 h-12 rounded-xl transition-all font-medium text-white placeholder:text-muted-foreground/50 ring-offset-0 focus-visible:ring-0"
                        required
                      />
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isLoginMode ? "Senha de Acesso" : "Crie uma Senha Forte"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-12 bg-white/5 border-white/5 focus:border-primary/50 focus:bg-white/10 h-12 rounded-xl transition-all font-medium text-white placeholder:text-muted-foreground/50 ring-offset-0 focus-visible:ring-0"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors p-2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 h-12 rounded-xl text-sm font-bold tracking-wide relative overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                       {isLoading ? (
                         <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                       ) : (
                         <>
                          {isLoginMode ? 'Autenticar Sessão' : 'Solicitar Credenciais'}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </>
                       )}
                    </span>
                    <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
                  </Button>
                </form>

                <div className="flex flex-col items-center gap-4 border-t border-white/5 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-xs text-muted-foreground hover:text-white transition-colors font-medium"
                  >
                    {isLoginMode ? 'Acesso Revogado? Criar nova solicitação' : 'Já possui Active Directory? Faça Login'}
                  </button>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-3 h-3" /> End-to-End Encrypted
                  </p>
                </div>
                
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
