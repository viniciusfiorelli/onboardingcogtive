import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('cogtive_auth', 'true');
    navigate('/overview');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full bg-primary/2 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Logo & Branding */}
        <div className="text-center space-y-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center justify-center w-18 h-18 rounded-2xl gradient-primary glow-primary p-4"
          >
            <span className="text-3xl font-bold text-primary-foreground">C</span>
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cogtive Onboarding Portal</h1>
            <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed max-w-xs mx-auto">
              Acompanhe sua implantação com clareza, transparência e próximos passos bem definidos.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="glass-card glow-sm">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Bem-vindo</h2>
              <p className="text-sm text-muted-foreground mt-1">Acesse o portal da sua implantação</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-sm">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50 border-border/50 focus:border-primary h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground text-sm">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/50 border-border/50 focus:border-primary pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-all h-11 gap-2"
              >
                Entrar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground/70">
              Portal exclusivo para clientes em processo de implantação.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground/50">
          © 2026 Cogtive · Todos os direitos reservados
        </p>
      </motion.div>
    </div>
  );
}
