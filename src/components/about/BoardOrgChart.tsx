import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, ArrowRight, Shield, Briefcase } from "lucide-react";

import paulinoPhoto from "@/assets/board/paulino-jeronimo.jpg";
import arturPhoto from "@/assets/board/artur-custodio.jpg";
import anaPhoto from "@/assets/board/ana-miala.jpg";
import nicolaPhoto from "@/assets/board/nicola-mvuayi.jpg";
import alcidesPhoto from "@/assets/board/alcides-andrade.jpg";

const photoMap: Record<string, string> = {
  "paulino-jeronimo": paulinoPhoto,
  "artur-custodio": arturPhoto,
  "ana-miala": anaPhoto,
  "nicola-mvuayi": nicolaPhoto,
  "alcides-andrade": alcidesPhoto,
};

export interface BoardMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  photoUrl?: string;
  pelouro?: string;
  isPCA?: boolean;
  email?: string;
  phone?: string;
  biography?: string;
  institutionalMessage?: string;
}

export interface SupervisionItem {
  name: string;
}

export interface BoardData {
  title?: string;
  members: BoardMember[];
  supervision?: {
    title?: string;
    items: SupervisionItem[];
  };
}

function MemberCard({
  member,
  index,
  isPCA = false,
}: {
  member: BoardMember;
  index: number;
  isPCA?: boolean;
}) {
  const navigate = useNavigate();
  const photo = member.photoUrl || photoMap[member.slug] || "";

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
              {photo && (
                <img
                  src={photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              )}
              {isPCA && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md z-10">
                  <Crown className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-foreground leading-tight ${isPCA ? "text-xl" : "text-lg"}`}>
                {member.name}
              </h3>
              <p className={`mt-1 text-muted-foreground ${isPCA ? "text-sm" : "text-xs"}`}>
                {member.role}
              </p>
            </div>
          </div>

          {member.pelouro && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3 h-3 text-primary/60" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Pelouro
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-secondary/80 text-muted-foreground">
                  {member.pelouro}
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

export function BoardOrgChart({ boardData }: { boardData: BoardData }) {
  const members = boardData?.members || [];
  const supervisionItems = boardData?.supervision?.items || [];

  if (!members.length) return null;

  const pca = members.find(m => m.isPCA) || members[0];
  const others = members.filter(m => m.id !== pca.id);

  return (
    <div className="space-y-0">
      <div className="flex flex-col items-center">
        <MemberCard member={pca} index={0} isPCA />
      </div>

      <VLine height="2.5rem" delay={0.25} gradient />

      {supervisionItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {supervisionItems.map((body) => (
            <div key={body.name} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/60 border border-border/50">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{body.name}</span>
            </div>
          ))}
        </motion.div>
      )}

      {others.length > 0 && (
        <>
          <VLine height="2.5rem" delay={0.5} />
          <TreeConnector columnCount={others.length} />
          <MobileConnector />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {others.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
