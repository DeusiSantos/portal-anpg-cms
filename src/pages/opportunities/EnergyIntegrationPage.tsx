import { useState } from "react";
import { Fuel, Leaf, Zap, Globe2, TrendingUp, Briefcase, Users, BarChart3, Send, Loader2, CheckCircle2, Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useContentBlocks } from "@/hooks/useCMSData";

function SectionDivider({ label, icon: Icon }: { label?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border/60" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-background px-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

const areaIcons = [Fuel, Zap, Leaf, Globe2];
const statIcons = [Briefcase, TrendingUp, Users, BarChart3];

export default function EnergyIntegrationPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: blocks } = useContentBlocks("energy-integration");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", organization: "", interest: "", message: "" });

  const getSection = (key: string) => blocks?.find(b => b.section_key === key)?.content;

  const introContent = getSection("intro");
  const areasContent = getSection("areas");
  const statsContent = getSection("stats");
  const timelineContent = getSection("timeline");
  const contactContent = getSection("contact");

  // Default data from i18n
  const defaultAreas = [
    { icon: Fuel, titleKey: "pages.energyIntegration.areas.biofuels.title", descKey: "pages.energyIntegration.areas.biofuels.desc" },
    { icon: Zap, titleKey: "pages.energyIntegration.areas.transition.title", descKey: "pages.energyIntegration.areas.transition.desc" },
    { icon: Leaf, titleKey: "pages.energyIntegration.areas.sustainability.title", descKey: "pages.energyIntegration.areas.sustainability.desc" },
    { icon: Globe2, titleKey: "pages.energyIntegration.areas.partnerships.title", descKey: "pages.energyIntegration.areas.partnerships.desc" },
  ];

  const cmsAreas = areasContent?.items as Array<{ title: string; desc: string }> | undefined;
  const cmsStats = statsContent?.items as Array<{ value: string; label: string }> | undefined;
  const cmsTimeline = timelineContent?.items as Array<{ year: string; title: string; desc: string }> | undefined;

  const defaultStatKeys = ["projects", "investment", "jobs", "reduction"];
  const defaultTimeline = t("pages.energyIntegration.timeline", { returnObjects: true }) as Array<{ year: string; title: string; desc: string }>;

  const interestOptions = [
    { value: "biofuels", labelKey: "pages.energyIntegration.interestOptions.biofuels" },
    { value: "transition", labelKey: "pages.energyIntegration.interestOptions.transition" },
    { value: "sustainability", labelKey: "pages.energyIntegration.interestOptions.sustainability" },
    { value: "partnerships", labelKey: "pages.energyIntegration.interestOptions.partnerships" },
    { value: "other", labelKey: "pages.energyIntegration.interestOptions.other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    toast({
      title: t("pages.energyIntegration.contactFields.successTitle"),
      description: t("pages.energyIntegration.contactFields.successDesc"),
    });
    setTimeout(() => {
      setFormData({ name: "", email: "", organization: "", interest: "", message: "" });
      setIsSuccess(false);
    }, 3000);
  };

  const timeline = cmsTimeline || (Array.isArray(defaultTimeline) ? defaultTimeline : []);

  return (
    <PageLayout
      pageKey="energy-integration"
      title={t("pages.energyIntegration.title")}
      subtitle={t("pages.energyIntegration.subtitle")}
      
      breadcrumbs={[
        { label: t("nav.opportunities"), href: "/opportunities" },
        { label: t("nav.submenu.energyIntegration") },
      ]}
    >
      {/* Intro */}
      <SectionTransition>
        <section className="mb-16">
          <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
            {introContent?.text || t("pages.energyIntegration.intro")}
          </p>
        </section>
      </SectionTransition>

      {/* Focus Areas */}
      <SectionTransition delay={0.1}>
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">
            {areasContent?.title || t("pages.energyIntegration.areasTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cmsAreas ? cmsAreas.map((area, i) => {
              const Icon = areaIcons[i % areaIcons.length];
              return (
                <div key={i} className="group p-6 rounded-2xl border border-border bg-card hover:shadow-card transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
                    <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{area.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{area.desc}</p>
                </div>
              );
            }) : defaultAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.titleKey} className="group p-6 rounded-2xl border border-border bg-card hover:shadow-card transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
                    <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t(area.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(area.descKey)}</p>
                </div>
              );
            })}
          </div>
        </section>
      </SectionTransition>

      {/* Divider */}
      <SectionTransition delay={0.15}>
        <SectionDivider label={statsContent?.title || t("pages.energyIntegration.statsTitle")} icon={BarChart3} />
      </SectionTransition>

      {/* Statistics */}
      <SectionTransition delay={0.2}>
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cmsStats ? cmsStats.map((stat, i) => {
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={i} className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            }) : defaultStatKeys.map((key, i) => {
              const Icon = statIcons[i];
              return (
                <div key={key} className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {t(`pages.energyIntegration.stats.${key}.value`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(`pages.energyIntegration.stats.${key}.label`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </SectionTransition>

      {/* Divider */}
      <SectionTransition delay={0.25}>
        <SectionDivider label={timelineContent?.title || t("pages.energyIntegration.timelineTitle")} icon={Landmark} />
      </SectionTransition>

      {/* Timeline */}
      <SectionTransition delay={0.3}>
        <section className="mb-16">
          <div className="relative ml-4 md:ml-0">
            <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />
            <div className="space-y-8 md:space-y-0">
              {timeline.map((item, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={item.year} className="relative md:grid md:grid-cols-2 md:gap-12 md:py-6">
                    <div className="absolute left-5 md:left-1/2 top-6 md:top-8 -translate-x-1/2 z-10">
                      <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg ring-4 ring-background">
                        {item.year.slice(-2)}
                      </div>
                    </div>
                    <div className={cn(
                      "ml-16 md:ml-0",
                      isLeft ? "md:col-start-1 md:text-right md:pr-8" : "md:col-start-2 md:pl-8"
                    )}>
                      <div className="group p-5 rounded-2xl border border-border bg-card hover:shadow-card hover:border-primary/20 transition-all duration-300">
                        <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
                          {item.year}
                        </span>
                        <h4 className="text-lg font-bold text-foreground mb-1.5">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    {isLeft && <div className="hidden md:block md:col-start-2" />}
                    {!isLeft && <div className="hidden md:block md:col-start-1 md:row-start-1" />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Divider */}
      <SectionTransition delay={0.35}>
        <SectionDivider label={contactContent?.title || t("pages.energyIntegration.contactTitle")} icon={Send} />
      </SectionTransition>

      {/* Contact Form */}
      <SectionTransition delay={0.4}>
        <section className="max-w-2xl mx-auto">
          <p className="text-muted-foreground mb-8 text-center">
            {contactContent?.intro || t("pages.energyIntegration.contactIntro")}
          </p>

          {isSuccess ? (
            <div className="bg-secondary/50 rounded-2xl p-8 border border-border">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-status-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t("pages.energyIntegration.contactFields.successTitle")}</h3>
                <p className="text-muted-foreground max-w-sm">{t("pages.energyIntegration.contactFields.successDesc")}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-secondary/50 rounded-2xl p-8 border border-border space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="ei-name">{t("pages.energyIntegration.contactFields.name")} <span className="text-destructive">*</span></Label>
                  <Input id="ei-name" required value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="bg-background" disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ei-email">{t("pages.energyIntegration.contactFields.email")} <span className="text-destructive">*</span></Label>
                  <Input id="ei-email" type="email" required value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} className="bg-background" disabled={isSubmitting} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="ei-org">{t("pages.energyIntegration.contactFields.organization")}</Label>
                  <Input id="ei-org" value={formData.organization} onChange={(e) => setFormData((p) => ({ ...p, organization: e.target.value }))} className="bg-background" disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.energyIntegration.contactFields.interest")} <span className="text-destructive">*</span></Label>
                  <Select value={formData.interest} onValueChange={(v) => setFormData((p) => ({ ...p, interest: v }))} disabled={isSubmitting} required>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {interestOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{t(o.labelKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ei-msg">{t("pages.energyIntegration.contactFields.message")} <span className="text-destructive">*</span></Label>
                <Textarea id="ei-msg" rows={5} required value={formData.message} onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))} className="bg-background resize-none" disabled={isSubmitting} />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("pages.energyIntegration.contactFields.submitting")}</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" />{t("pages.energyIntegration.contactFields.submit")}</>
                )}
              </Button>
            </form>
          )}
        </section>
      </SectionTransition>
    </PageLayout>
  );
}
