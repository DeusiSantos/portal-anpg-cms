import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown, Quote, User, Briefcase, Building, Mail, Phone, MapPin } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import api, { getFullImageUrl } from "@/service/api";

// Tipos da API
interface GroupContent {
  lang: number;
  name: string;
}

interface CouncilGroup {
  id: string;
  displayOrder: number;
  contents: GroupContent[];
  isActive: boolean;
  createdAt: string;
}

interface MemberContent {
  lang: number;
  title: string;
  pelouro: string;
  biography: string;
  institutionalMessage: string;
}

interface CouncilMember {
  id: string;
  fullName: string;
  slug: string;
  councilMemberGroupId: string;
  group?: CouncilGroup;
  displayOrder: number;
  photoUrl: string | null;
  photoPath: string | null;
  email: string | null;
  phone: string | null;
  officeLocation: string | null;
  contents: MemberContent[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// Fallback photos
import paulinoPhoto from "@/assets/board/paulino-jeronimo.jpg";
import arturPhoto from "@/assets/board/artur-custodio.jpg";
import anaPhoto from "@/assets/board/ana-miala.jpg";
import nicolaPhoto from "@/assets/board/nicola-mvuayi.jpg";
import alcidesPhoto from "@/assets/board/alcides-andrade.jpg";

const photoFallbacks: Record<string, string> = {
  "paulino-jeronimo": paulinoPhoto,
  "artur-custodio": arturPhoto,
  "ana-miala": anaPhoto,
  "nicola-mvuayi": nicolaPhoto,
  "alcides-andrade": alcidesPhoto,
};

// Função para obter conteúdo do membro em português
const getMemberContent = (member: CouncilMember, lang: number): MemberContent | undefined => {
  return member.contents?.find(c => c.lang === lang);
};

// Função para obter nome do grupo em português
const getGroupName = (group: CouncilGroup | undefined, lang: number): string => {
  if (!group) return '';
  const content = group.contents?.find(c => c.lang === lang);
  return content?.name || '';
};

function BiographySection({ member, isEn }: { member: CouncilMember; isEn: boolean }) {
  const content = getMemberContent(member, isEn ? 2 : 1);
  const biography = content?.biography || '';

  return (
    <SectionTransition delay={0.1}>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {isEn ? "Biography" : "Biografia"}
            </h2>
          </div>
          <div className="px-6 pb-6">
            {biography ? (
              <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                {biography}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                {isEn ? "No biography available." : "Nenhuma biografia disponível."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </SectionTransition>
  );
}

function MessageSection({ member, isEn }: { member: CouncilMember; isEn: boolean }) {
  const content = getMemberContent(member, isEn ? 2 : 1);
  const message = content?.institutionalMessage || '';

  if (!message) return null;
  
  return (
    <SectionTransition delay={0.15}>
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Quote className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {isEn ? "Message" : "Mensagem"}
            </h2>
          </div>
          <div className="px-6 pb-6">
            <blockquote className="relative pl-5 border-l-4 border-primary/30">
              <p className="text-muted-foreground leading-relaxed text-base italic whitespace-pre-line">
                "{message}"
              </p>
              <footer className="mt-4 text-sm font-semibold text-foreground">— {member.fullName}</footer>
            </blockquote>
          </div>
        </CardContent>
      </Card>
    </SectionTransition>
  );
}

function ContactSection({ member, isEn }: { member: CouncilMember; isEn: boolean }) {
  const { email, phone, officeLocation } = member;
  
  if (!email && !phone && !officeLocation) return null;
  
  return (
    <SectionTransition delay={0.2}>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {isEn ? "Contact Information" : "Informações de Contacto"}
            </h2>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary/70" />
                <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {email}
                </a>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary/70" />
                <span className="text-muted-foreground">{phone}</span>
              </div>
            )}
            {officeLocation && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary/70" />
                <span className="text-muted-foreground">{officeLocation}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </SectionTransition>
  );
}

function PelouroSection({ member, isEn }: { member: CouncilMember; isEn: boolean }) {
  const content = getMemberContent(member, isEn ? 2 : 1);
  const pelouro = content?.pelouro || '';
  const title = content?.title || '';

  if (!pelouro && !title) return null;

  return (
    <SectionTransition delay={0.25}>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {isEn ? "Position & Portfolio" : "Cargo & Pelouro"}
            </h2>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {title && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {isEn ? "Title" : "Título"}
                </span>
                <p className="text-foreground font-medium mt-1">{title}</p>
              </div>
            )}
            {pelouro && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {isEn ? "Portfolio" : "Pelouro"}
                </span>
                <p className="text-muted-foreground mt-1">{pelouro}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </SectionTransition>
  );
}

export default function BoardMemberPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  // Buscar membro pelo ID
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['council-member', id],
    queryFn: async () => {
      if (!id) throw new Error('Member ID is required');
      const response = await api.get<CouncilMember>(`/administrative-council/members/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const content = member ? getMemberContent(member, isEn ? 2 : 1) : null;
  const title = content?.title || '';
  const groupName = member ? getGroupName(member.group, isEn ? 2 : 1) : '';
  
  // Verificar se é PCA (Presidente do Conselho de Administração)
  const isPCA = title.toLowerCase().includes('presidente') || groupName.toLowerCase().includes('presidente');
  
  const photoUrl = member?.photoUrl ? getFullImageUrl(member.photoUrl) : null;
  const fallbackPhoto = photoFallbacks[member?.slug || ''] || '';
  const photo = photoUrl || fallbackPhoto;

  // Iniciais para fallback do avatar
  const initials = member?.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '';

  if (isLoading) {
    return (
      <PageLayout 
        title="..." 
        pageKey="board-member" 
        breadcrumbs={[
          { labelKey: "nav.aboutUs", href: "/about" },
          { labelKey: "nav.submenu.anpg", href: "/about/anpg" },
          { label: "..." },
        ]}
      >
        <div className="space-y-6">
          <Skeleton className="h-12 w-32" />
          <div className="flex items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !member) {
    return (
      <PageLayout
        title={isEn ? "Member Not Found" : "Membro Não Encontrado"}
        pageKey="board-member"
        breadcrumbs={[
          { labelKey: "nav.aboutUs", href: "/about" },
          { labelKey: "nav.submenu.anpg", href: "/about/anpg" },
          { label: isEn ? "Board Member" : "Membro" },
        ]}
      >
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-6">
            {isEn 
              ? "The requested board member was not found." 
              : "O membro do conselho solicitado não foi encontrado."}
          </p>
          <Button onClick={() => navigate("/about/anpg")} variant="default">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEn ? "Back to ANPG" : "Voltar à ANPG"}
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={member.fullName}
      subtitle={title}
      pageKey="board-member"
      breadcrumbs={[
        { labelKey: "nav.aboutUs", href: "/about" },
        { labelKey: "nav.submenu.anpg", href: "/about/anpg" },
        { label: member.fullName },
      ]}
    >
      {/* Back Button */}
      <SectionTransition>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/about/anpg")} 
          className="mb-8 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isEn ? "Back to Board" : "Voltar ao Conselho"}
        </Button>
      </SectionTransition>

      {/* Member Header */}
      <SectionTransition>
        <div className="flex items-start gap-6 mb-12 flex-wrap">
          <div className={`relative flex-shrink-0 rounded-full overflow-hidden ${
            isPCA 
              ? "w-24 h-24 md:w-28 md:h-28 ring-4 ring-primary/30 shadow-lg" 
              : "w-20 h-20 md:w-24 md:h-24 ring-3 ring-border/50"
          }`}>
            {photo ? (
              <img 
                src={photo} 
                alt={member.fullName} 
                className="w-full h-full object-cover"
                onError={(e) => { 
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center bg-primary/10';
                    fallback.innerHTML = `<span class="text-2xl font-bold text-primary">${initials}</span>`;
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <span className="text-2xl font-bold text-primary">{initials}</span>
              </div>
            )}
            {isPCA && (
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md border-2 border-background z-10">
                <Crown className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{member.fullName}</h1>
            <p className="text-lg text-muted-foreground mt-1">{title}</p>
            {groupName && (
              <Badge variant="outline" className="mt-3">
                {groupName}
              </Badge>
            )}
          </div>
        </div>
      </SectionTransition>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <BiographySection member={member} isEn={isEn} />
        <div className="space-y-6">
          <MessageSection member={member} isEn={isEn} />
          <ContactSection member={member} isEn={isEn} />
        </div>
      </div>

      {/* Pelouro Section - Full Width */}
      <PelouroSection member={member} isEn={isEn} />
    </PageLayout>
  );
}