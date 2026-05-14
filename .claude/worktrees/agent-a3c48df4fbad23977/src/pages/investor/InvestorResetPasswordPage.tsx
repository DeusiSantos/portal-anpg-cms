import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Loader2, CheckCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As passwords não coincidem",
  path: ["confirmPassword"],
});

export default function InvestorResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) {
        toast.error(error.message);
      } else {
        setSuccess(true);
        toast.success("Password alterada com sucesso!");
        setTimeout(() => navigate("/investor-portal"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      pageKey="investor-reset"
      titleKey="Redefinir Password"
      subtitleKey="Defina uma nova password para a sua conta"
      
      icon={<Briefcase className="w-6 h-6" />}
      breadcrumbs={[{ labelKey: "Portal do Investidor", href: "/investor-portal" }, { labelKey: "Redefinir Password" }]}
    >
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Nova Password</CardTitle>
            <CardDescription>
              Defina uma password segura para a sua conta de investidor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold">Password Alterada!</h3>
                <p className="text-sm text-muted-foreground">A redirecionar para o portal...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">Nova Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirmar Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repita a password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                  Alterar Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
