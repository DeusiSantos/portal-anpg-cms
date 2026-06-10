import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import logoRed from '@/assets/logo-color.svg';
import heroImage from '@/assets/hero-offshore.jpg';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(8, 'A palavra-passe deve ter no mínimo 8 caracteres').max(128),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As palavras-passe não coincidem',
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const code = searchParams.get('code');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidLink = !!userId && !!code;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = passwordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      await api.post(`auth/reset-password/${userId}/${code}`, {
        newPassword: parsed.data.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/login'), 3000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message;
      if (err?.response?.status === 400) {
        setError('O link de recuperação é inválido ou já expirou. Solicite um novo link.');
      } else {
        setError(msg || 'Erro ao redefinir a palavra-passe. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-4xl text-primary-foreground xl:text-5xl font-bold leading-tight">
              Redefinir
              <br />
              <span className="text-primary">Palavra-passe</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md">
              Defina uma nova palavra-passe segura para aceder ao backoffice da ANPG.
            </p>
          </motion.div>
          <div className="text-xs text-white/30">
            © {new Date().getFullYear()} Agência Nacional de Petróleo, Gás e Biocombustíveis
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center mb-4">
            <img src={logoRed} alt="ANPG Logo" className="h-14" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Nova Palavra-passe</h2>
              <p className="text-sm text-muted-foreground">Defina uma nova password segura</p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                Palavra-passe alterada com sucesso!
              </h3>
              <p className="text-muted-foreground">A redirecionar para o login...</p>
            </div>
          ) : !isValidLink ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  Este link de recuperação é inválido ou expirou. Por favor solicite um novo link
                  na página de login.
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/admin/login')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in-50 duration-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  Nova palavra-passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-10 h-12"
                    autoFocus
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmar palavra-passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repita a palavra-passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    A alterar...
                  </>
                ) : (
                  'Alterar Palavra-passe'
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="text-primary hover:underline"
            >
              ← Voltar ao Login
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
