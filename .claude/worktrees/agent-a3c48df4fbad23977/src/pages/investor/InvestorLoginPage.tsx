import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Briefcase, LogIn, UserPlus, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Nome obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  companyName: z.string().trim().min(2, "Empresa obrigatória").max(200),
  country: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  sector: z.string().trim().max(100).optional(),
  message: z.string().trim().max(1000).optional(),
});

export default function InvestorLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regCountry, setRegCountry] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSector, setRegSector] = useState("");
  const [regMessage, setRegMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoginLoading(true);
    try {
      const { error } = await signIn(parsed.data.email, parsed.data.password);
      if (error) {
        toast.error("Credenciais inválidas. Verifique o email e password.");
      } else {
        navigate("/investor-portal");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      fullName: regFullName,
      email: regEmail,
      companyName: regCompany,
      country: regCountry || undefined,
      phone: regPhone || undefined,
      sector: regSector || undefined,
      message: regMessage || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setRegisterLoading(true);
    try {
      const { error } = await supabase.from("investor_registrations").insert({
        full_name: parsed.data.fullName,
        email: parsed.data.email,
        company_name: parsed.data.companyName,
        country: parsed.data.country || null,
        phone: parsed.data.phone || null,
        sector: parsed.data.sector || null,
        message: parsed.data.message || null,
      });
      if (error) {
        if (error.code === '23505') {
          toast.error("Este email já foi registado. Aguarde aprovação ou faça login.");
        } else {
          toast.error("Erro ao submeter registo. Tente novamente.");
        }
      } else {
        setRegistered(true);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const breadcrumbs = [
    { labelKey: "nav.investorPortal", href: "/investor-portal" },
    { labelKey: "Acesso" },
  ];

  return (
    <PageLayout
      pageKey="investor-login"
      titleKey="Portal do Investidor"
      subtitleKey="Acesso restrito para investidores registados"
      
      icon={<Briefcase className="w-6 h-6" />}
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Portal do Investidor</CardTitle>
            <CardDescription>
              Aceda ao portal ou registe-se para solicitar acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Registar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="investidor@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                    Entrar
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Acesso Demo</span></div>
                  </div>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 rounded-lg border p-3 text-left text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setLoginEmail("investor@anpg.co.ao");
                      setLoginPassword("Investor2024!");
                    }}
                  >
                    <Briefcase className="w-8 h-8 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">Investidor Demo</p>
                      <p className="text-muted-foreground text-xs truncate">investor@anpg.co.ao</p>
                    </div>
                    <Badge variant="outline" className="ml-auto shrink-0">Demo</Badge>
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                {registered ? (
                  <div className="text-center py-8 space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h3 className="text-xl font-semibold">Registo Submetido!</h3>
                    <p className="text-muted-foreground">
                      O seu pedido de acesso foi recebido e será analisado pela equipa da ANPG.
                      Receberá os dados de acesso por email após aprovação.
                    </p>
                    <Badge variant="secondary">Pendente de Aprovação</Badge>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reg-name">Nome Completo *</Label>
                        <Input id="reg-name" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} required maxLength={100} />
                      </div>
                      <div>
                        <Label htmlFor="reg-email">Email *</Label>
                        <Input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required maxLength={255} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reg-company">Empresa *</Label>
                        <Input id="reg-company" value={regCompany} onChange={(e) => setRegCompany(e.target.value)} required maxLength={200} />
                      </div>
                      <div>
                        <Label htmlFor="reg-country">País</Label>
                        <Input id="reg-country" value={regCountry} onChange={(e) => setRegCountry(e.target.value)} maxLength={100} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reg-phone">Telefone</Label>
                        <Input id="reg-phone" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} maxLength={30} />
                      </div>
                      <div>
                        <Label htmlFor="reg-sector">Sector</Label>
                        <Input id="reg-sector" value={regSector} onChange={(e) => setRegSector(e.target.value)} maxLength={100} placeholder="Ex: Oil & Gas" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reg-message">Mensagem (opcional)</Label>
                      <Textarea id="reg-message" value={regMessage} onChange={(e) => setRegMessage(e.target.value)} maxLength={1000} rows={3} placeholder="Descreva o seu interesse de investimento..." />
                    </div>
                    <Button type="submit" className="w-full" disabled={registerLoading}>
                      {registerLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      Submeter Pedido de Acesso
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Após submissão, o seu pedido será analisado. Receberá os dados de acesso por email.
                    </p>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
