import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary">
            <span className="text-2xl font-bold text-primary-foreground">C</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cogtive Onboarding Portal</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Acompanhe sua implantação com clareza, transparência e próximos passos bem definidos.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="glass-card">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Bem-vindo</h2>
              <p className="text-sm text-muted-foreground mt-1">Acesse o portal da sua implantação</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted border-border focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Entrar
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              Este portal é exclusivo para clientes em processo de implantação.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          © 2026 Cogtive · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
