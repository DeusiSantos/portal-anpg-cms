import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Handshake,
  HandHeart,
  Target,
  Users,
  ShieldCheck,
} from "lucide-react";
import type { CMSContentBlock } from "@/hooks/useCMSData";

interface PrincipleItem {
  titleKey: string;
  descKey: string;
}

const defaultPrinciples: PrincipleItem[] = [
  { titleKey: "pages.anpg.institutional.principles.angola.title", descKey: "pages.anpg.institutional.principles.angola.desc" },
  { titleKey: "pages.anpg.institutional.principles.global.title", descKey: "pages.anpg.institutional.principles.global.desc" },
  { titleKey: "pages.anpg.institutional.principles.future.title", descKey: "pages.anpg.institutional.principles.future.desc" },
  { titleKey: "pages.anpg.institutional.principles.mobilize.title", descKey: "pages.anpg.institutional.principles.mobilize.desc" },
  { titleKey: "pages.anpg.institutional.principles.excellence.title", descKey: "pages.anpg.institutional.principles.excellence.desc" },
  { titleKey: "pages.anpg.institutional.principles.responsibility.title", descKey: "pages.anpg.institutional.principles.responsibility.desc" },
];

interface InstitutionalContentProps {
  cmsBlocks?: CMSContentBlock[];
}

function getSection(blocks: CMSContentBlock[] | undefined, key: string) {
  return blocks?.find(b => b.section_key === key)?.content;
}

function SectionIcon({ icon: Icon, delay = 0 }: { icon: typeof Handshake; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
    >
      <Icon className="w-7 h-7 text-primary" />
    </motion.div>
  );
}

function SectionTitle({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.h3
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="text-xl md:text-2xl font-bold text-foreground mb-4"
    >
      {children}
    </motion.h3>
  );
}

function PurposeSection({ cms }: { cms?: Record<string, any> }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/3 p-8 md:p-10 shadow-card"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <SectionIcon icon={Handshake} />
      <SectionTitle>{cms?.title || t("pages.anpg.institutional.purpose.title")}</SectionTitle>
      <p className="text-muted-foreground leading-relaxed text-base">
        {cms?.desc || t("pages.anpg.institutional.purpose.desc")}
      </p>
    </motion.div>
  );
}

function PrinciplesSection({ cms }: { cms?: Record<string, any> }) {
  const { t } = useTranslation();

  // CMS principles come as an array: [{title, desc}, ...]
  const cmsPrinciples = cms?.items as Array<{ title: string; desc: string }> | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 md:p-10 shadow-card"
    >
      <SectionIcon icon={HandHeart} delay={0.1} />
      <SectionTitle delay={0.1}>{cms?.title || t("pages.anpg.institutional.principles.title")}</SectionTitle>
      <p className="text-muted-foreground leading-relaxed mb-6">
        {cms?.subtitle || t("pages.anpg.institutional.principles.subtitle")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cmsPrinciples ? cmsPrinciples.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
            className="space-y-1.5"
          >
            <h4 className="text-sm font-bold text-primary">{p.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
          </motion.div>
        )) : defaultPrinciples.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
            className="space-y-1.5"
          >
            <h4 className="text-sm font-bold text-primary">{t(p.titleKey)}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{t(p.descKey)}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ObjectivesSection({ cms }: { cms?: Record<string, any> }) {
  const { t } = useTranslation();
  const cmsItems = cms?.items as string[] | undefined;
  const objectives = cmsItems || (t("pages.anpg.institutional.objectives.items", { returnObjects: true }) as string[]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-card h-full"
    >
      <SectionIcon icon={Target} delay={0.1} />
      <SectionTitle delay={0.1}>{cms?.title || t("pages.anpg.institutional.objectives.title")}</SectionTitle>
      <ol className="space-y-4">
        {objectives.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
            className="flex gap-3 text-sm text-muted-foreground leading-relaxed"
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span>{item}</span>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}

function SocialResponsibilitySection({ cms }: { cms?: Record<string, any> }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-card h-full"
    >
      <SectionIcon icon={Users} delay={0.2} />
      <SectionTitle delay={0.2}>{cms?.title || t("pages.anpg.institutional.socialResp.title")}</SectionTitle>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {cms?.desc || t("pages.anpg.institutional.socialResp.desc")}
      </p>
    </motion.div>
  );
}

function EnvironmentSection({ cms }: { cms?: Record<string, any> }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-card h-full"
    >
      <SectionIcon icon={ShieldCheck} delay={0.3} />
      <SectionTitle delay={0.3}>{cms?.title || t("pages.anpg.institutional.environment.title")}</SectionTitle>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {cms?.desc || t("pages.anpg.institutional.environment.desc")}
      </p>
    </motion.div>
  );
}

export function InstitutionalContent({ cmsBlocks }: InstitutionalContentProps) {
  const purpose = getSection(cmsBlocks, "purpose");
  const principles = getSection(cmsBlocks, "principles");
  const objectives = getSection(cmsBlocks, "objectives");
  const socialResp = getSection(cmsBlocks, "social-responsibility");
  const environment = getSection(cmsBlocks, "environment");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PurposeSection cms={purpose} />
        <PrinciplesSection cms={principles} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ObjectivesSection cms={objectives} />
        <SocialResponsibilitySection cms={socialResp} />
        <EnvironmentSection cms={environment} />
      </div>
    </div>
  );
}
