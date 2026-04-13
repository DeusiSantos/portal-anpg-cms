import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Lock, User, ChevronRight } from 'lucide-react';
import { ForgotPasswordDialog } from '@/components/admin/ForgotPasswordDialog';
import { motion } from 'framer-motion';
import logoRed from '@/assets/logo-color.svg';
import heroImage from '@/assets/hero-offshore.jpg';

const quickAccessUsers = [
  { email: 'admin@anpg.co.ao', password: 'Admin2024!', name: 'Administrador ANPG', role: 'Admin' },
];

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Por favor preencha todos os campos.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor insira um email válido.');
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Email ou palavra-passe incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Por favor confirme o seu email antes de entrar.');
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    navigate('/admin');
  };

  const handleQuickAccess = (user: typeof quickAccessUsers[0]) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroImage}
          alt="Angola offshore"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-graphite/90 via-graphite/70 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <img src={logoRed} alt="ANPG" className="h-12 brightness-0 invert" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              Sistema de Gestão
              <br />
              <span className="text-primary">Backoffice</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md">
              Plataforma centralizada para gestão de conteúdo, dados operacionais e comunicação institucional da ANPG.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                Sistema operacional
              </div>
              <div>v2.0 · 2025</div>
            </div>
          </motion.div>
          <div className="text-xs text-white/30">
            © {new Date().getFullYear()} Agência Nacional de Petróleo, Gás e Biocombustíveis
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <img src={logoRed} alt="ANPG Logo" className="h-14" />
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Ver Website ↗</a>
          </div>

          {/* Desktop website link */}
          <div className="hidden lg:flex justify-end">
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Ver Website ↗</a>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Backoffice ANPG</h2>
                <p className="text-sm text-muted-foreground">Acesso ao painel de administração</p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email institucional</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@anpg.co.ao"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  A entrar...
                </>
              ) : (
                <>
                  Entrar no Sistema
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="flex justify-end">
              <ForgotPasswordDialog />
            </div>
          </form>

          {/* Quick Access */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Acesso Rápido</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              {quickAccessUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => handleQuickAccess(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground pt-4">
            Acesso restrito a utilizadores autorizados.
            <br />
            Contacte o administrador de TI para obter acesso.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
