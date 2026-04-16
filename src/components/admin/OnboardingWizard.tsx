import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  Compass,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Newspaper,
  MapPin,
  Users,
  Settings,
  Globe,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

const TOUR_MODULES = [
  {
    icon: Globe,
    title: 'Mapa do Site',
    desc: 'Gerir banners, conteúdos e SEO de qualquer página a partir de uma vista unificada.',
    color: 'bg-primary',
  },
  {
    icon: Newspaper,
    title: 'Notícias',
    desc: 'Criar, editar e publicar artigos em português e inglês com editor rich text.',
    color: 'bg-blue-500',
  },
  {
    icon: MapPin,
    title: 'Blocos Petrolíferos',
    desc: 'Gerir dados técnicos dos blocos, consórcio, coordenadas e estado.',
    color: 'bg-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Produção',
    desc: 'Registar estatísticas de produção de petróleo e gás por bloco e período.',
    color: 'bg-green-500',
  },
  {
    icon: Users,
    title: 'Investidores',
    desc: 'Aprovar registos, gerir documentos e acompanhar expressões de interesse.',
    color: 'bg-purple-500',
  },
  {
    icon: Settings,
    title: 'Configurações',
    desc: 'Definir parâmetros do site, gerir utilizadores e consultar logs de auditoria.',
    color: 'bg-slate-500',
  },
];

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const { userAllData } = useAuth();
  const [step, setStep] = useState(0);
  const totalSteps = 2; // Welcome, Tour

  const handleFinish = () => {
    toast.success('Bem-vindo ao Backoffice! 🎉');
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleFinish(); }}>
      <DialogContent className="sm:max-w-lg">
        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl">
                Bem-vindo, {userAllData?.fullName?.split(' ')[0] ?? 'utilizador'}!
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Este assistente vai ajudá-lo a conhecer os módulos disponíveis no backoffice da ANPG.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Compass className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Tour dos Módulos</p>
                  <p className="text-xs text-muted-foreground">Conheça as funcionalidades disponíveis</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Email: </span>
                {userAllData?.email ?? '—'}
              </div>
            </div>

            <Button className="w-full mt-4" onClick={() => setStep(1)}>
              Começar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {/* Step 1: Tour */}
        {step === 1 && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Compass className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle>Os seus Módulos</DialogTitle>
              <DialogDescription>
                Explore as principais áreas do backoffice através da barra lateral.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
              {TOUR_MODULES.map((mod) => (
                <div
                  key={mod.title}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg ${mod.color} flex items-center justify-center shrink-0`}>
                    <mod.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{mod.title}</p>
                    <p className="text-xs text-muted-foreground">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <Button className="flex-1" onClick={handleFinish}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluir
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}