import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Crown, ArrowRight, Shield, Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
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
  displayOrder: number;
  photoUrl: string | null;
  photoPath: string | null;
  email: string | null;
  phone: string | null;
  officeLocation: string | null;
  contents: MemberContent[];
  isActive: boolean;
}

interface GroupsResponse {
  items: CouncilGroup[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

interface MembersResponse {
  items: CouncilMember[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

// Fallback photos from local assets
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

// Função para obter nome do grupo em português
const getGroupNamePt = (group: CouncilGroup): string => {
  const ptContent = group.contents?.find(c => c.lang === 1);
  return ptContent?.name || 'Sem nome';
};

// Função para obter conteúdo do membro em português
const getMemberContentPt = (member: CouncilMember): MemberContent | undefined => {
  return member.contents?.find(c => c.lang === 1);
};

// Função para obter conteúdo do membro em inglês
const getMemberContentEn = (member: CouncilMember): MemberContent | undefined => {
  return member.contents?.find(c => c.lang === 2);
};

function MemberCard({
  member,
  index,
  isPCA = false,
  groupName = "",
}: {
  member: CouncilMember;
  index: number;
  isPCA?: boolean;
  groupName?: string;
}) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const ptContent = getMemberContentPt(member);
  const photo = member.photoUrl ? getFullImageUrl(member.photoUrl) : photoFallbacks[member.slug] || "";

  const title = ptContent?.title || "";
  const pelouro = ptContent?.pelouro || "";

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: isPCA ? 0 : 0.15 + index * 0.1 }}
      onClick={() => navigate(`/about/board/${member.id}`)}
      className={`group relative text-left w-full cursor-pointer ${isPCA ? "max-w-sm mx-auto" : ""}`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
          isPCA
            ? "bg-gradient-to-br from-primary/10 via-card to-primary/5 border-primary/30 shadow-elevated hover:shadow-modal hover:-translate-y-2"
            : "bg-card border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 hover:border-primary/20"
        }`}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>

        <div className={`p-6 ${isPCA ? "p-8" : ""}`}>
          <div className="flex items-start gap-4">
            <div className={`relative flex-shrink-0 rounded-full overflow-hidden ${
              isPCA
                ? "w-20 h-20 ring-3 ring-primary/30 shadow-lg"
                : "w-16 h-16 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-300"
            }`}>
              <img 
                src={photo} 
                alt={member.fullName} 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = photoFallbacks[member.slug] || ""; }}
              />
              {isPCA && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md z-10">
                  <Crown className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-foreground leading-tight ${isPCA ? "text-xl" : "text-lg"}`}>
                {member.fullName}
              </h3>
              <p className={`mt-1 text-muted-foreground ${isPCA ? "text-sm" : "text-xs"}`}>
                {title}
              </p>
            </div>
          </div>

          {/* Pelouro */}
          {pelouro && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3 h-3 text-primary/60" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {isEn ? "Portfolio" : "Pelouro"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-secondary/80 text-muted-foreground">
                  {pelouro}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Ver perfil</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function VLine({ height, delay = 0, gradient = false }: { height: string; delay?: number; gradient?: boolean }) {
  return (
    <motion.div
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`w-px origin-top mx-auto ${gradient ? "bg-gradient-to-b from-primary/40 to-border/60" : "bg-border/60"}`}
      style={{ height }}
    />
  );
}

function TreeConnector({ columnCount }: { columnCount: number }) {
  return (
    <div className="relative hidden lg:block">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="h-px bg-border/60 mx-auto"
        style={{
          width: `calc(100% - ${100 / columnCount}%)`,
          marginLeft: `${100 / (columnCount * 2)}%`,
          marginRight: `${100 / (columnCount * 2)}%`,
        }}
      />
      <div className="flex justify-between" style={{
        paddingLeft: `${100 / (columnCount * 2)}%`,
        paddingRight: `${100 / (columnCount * 2)}%`,
      }}>
        {Array.from({ length: columnCount }).map((_, i) => (
          <motion.div key={i} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.7 + i * 0.08 }} className="w-px h-6 bg-border/60 origin-top" />
        ))}
      </div>
    </div>
  );
}

function MobileConnector() {
  return (
    <div className="lg:hidden flex justify-center">
      <VLine height="2rem" delay={0.6} />
    </div>
  );
}

const supervisionBodies = [
  { name: "Conselho Fiscal", nameEn: "Fiscal Council" },
  { name: "Conselho Técnico", nameEn: "Technical Council" },
];

export function BoardOrgChart() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  // Buscar grupos
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['council-groups-public'],
    queryFn: async () => {
      const response = await api.get<GroupsResponse>('/administrative-council/groups', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data.items.filter(g => g.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Buscar membros
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['council-members-public'],
    queryFn: async () => {
      const response = await api.get<MembersResponse>('/administrative-council/members', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data.items.filter(m => m.isActive);
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = groupsLoading || membersLoading;
  const groups = groupsData || [];
  const members = membersData || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-80 mx-auto rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) return null;

  // Encontrar o grupo "Conselho de Administração" ou similar para PCA
  const boardGroup = groups.find(g => {
    const name = getGroupNamePt(g).toLowerCase();
    return name.includes('administração') || name.includes('board') || name.includes('conselho');
  });

  // PCA é o primeiro membro do grupo do conselho com menor displayOrder
  const boardMembers = boardGroup 
    ? members.filter(m => m.councilMemberGroupId === boardGroup.id).sort((a, b) => a.displayOrder - b.displayOrder)
    : members;
  
  const pca = boardMembers[0] || members[0];
  const admins = boardMembers.slice(1);
  
  // Outros membros de outros grupos vão para a linha inferior
  const otherGroups = groups.filter(g => g.id !== boardGroup?.id);
  const otherMembers = otherGroups.flatMap(g => 
    members.filter(m => m.councilMemberGroupId === g.id).sort((a, b) => a.displayOrder - b.displayOrder)
  );
  
  // Combinar admins com outros membros
  const allOtherMembers = [...admins, ...otherMembers];

  return (
    <div className="space-y-0">
      <div className="flex flex-col items-center">
        <MemberCard member={pca} index={0} isPCA groupName={boardGroup ? getGroupNamePt(boardGroup) : ""} />
      </div>

      <VLine height="2.5rem" delay={0.25} gradient />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        {supervisionBodies.map((body) => (
          <div key={body.name} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/60 border border-border/50">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{isEn ? body.nameEn : body.name}</span>
          </div>
        ))}
      </motion.div>

      {allOtherMembers.length > 0 && (
        <>
          <VLine height="2.5rem" delay={0.5} />
          <TreeConnector columnCount={allOtherMembers.length} />
          <MobileConnector />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {allOtherMembers.map((member, index) => {
              const memberGroup = groups.find(g => g.id === member.councilMemberGroupId);
              return (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  index={index} 
                  groupName={memberGroup ? getGroupNamePt(memberGroup) : ""}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}