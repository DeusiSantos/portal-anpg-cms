import { useState } from 'react';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor insira um email válido.');
      return;
    }

    setLoading(true);
    try {
      await api.post('auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message;
      setError(msg || 'Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEmail('');
      setSent(false);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="text-sm text-primary hover:underline">
          Esqueceu a palavra-passe?
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recuperar Palavra-passe</DialogTitle>
          <DialogDescription>
            Insira o seu email institucional para receber um link de recuperação.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Email Enviado!</h3>
            <p className="text-sm text-muted-foreground">
              Se o email estiver registado, receberá um link para redefinir a sua palavra-passe.
              Verifique também a pasta de spam.
            </p>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email institucional</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="seu.email@anpg.co.ao"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  : <Mail className="h-4 w-4 mr-2" />}
                Enviar Link
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
