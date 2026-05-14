import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
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

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "contactForm.validation.nameMin" })
    .max(100, { message: "contactForm.validation.nameMax" }),
  email: z
    .string()
    .trim()
    .email({ message: "contactForm.validation.emailInvalid" })
    .max(255, { message: "contactForm.validation.emailMax" }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s()-]{8,20}$/.test(val),
      { message: "contactForm.validation.phoneInvalid" }
    ),
  subject: z.string().min(1, { message: "contactForm.validation.subjectRequired" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "contactForm.validation.messageMin" })
    .max(2000, { message: "contactForm.validation.messageMax" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const subjectValue = watch("subject");

  const subjects = [
    { value: "general", labelKey: "contactForm.subjects.general" },
    { value: "investment", labelKey: "contactForm.subjects.investment" },
    { value: "tender", labelKey: "contactForm.subjects.tender" },
    { value: "data", labelKey: "contactForm.subjects.data" },
    { value: "partnership", labelKey: "contactForm.subjects.partnership" },
    { value: "media", labelKey: "contactForm.subjects.media" },
    { value: "other", labelKey: "contactForm.subjects.other" },
  ];

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call when backend is ready)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For now, we'll just show a success message
    // In production, this would send to an API endpoint
    console.info("Contact form submitted successfully");

    setIsSubmitting(false);
    setIsSuccess(true);

    toast({
      title: t("contactForm.successToast.title"),
      description: t("contactForm.successToast.description"),
    });

    // Reset form after delay
    setTimeout(() => {
      reset();
      setIsSuccess(false);
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="bg-secondary/50 rounded-2xl p-8 border border-border">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-status-success" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t("contactForm.success.title")}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {t("contactForm.success.description")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/50 rounded-2xl p-8 border border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">
        {t("contactForm.title")}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            {t("contactForm.fields.name")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder={t("contactForm.placeholders.name")}
            className={cn(
              "bg-background",
              errors.name && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{t(errors.name.message || "")}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            {t("contactForm.fields.email")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder={t("contactForm.placeholders.email")}
            className={cn(
              "bg-background",
              errors.email && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{t(errors.email.message || "")}</p>
          )}
        </div>

        {/* Phone (optional) */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">
            {t("contactForm.fields.phone")}
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder={t("contactForm.placeholders.phone")}
            className={cn(
              "bg-background",
              errors.phone && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{t(errors.phone.message || "")}</p>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-foreground">
            {t("contactForm.fields.subject")} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={subjectValue}
            onValueChange={(value) => setValue("subject", value, { shouldValidate: true })}
            disabled={isSubmitting}
          >
            <SelectTrigger
              className={cn(
                "bg-background",
                errors.subject && "border-destructive focus:ring-destructive"
              )}
            >
              <SelectValue placeholder={t("contactForm.placeholders.subject")} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.value} value={subject.value}>
                  {t(subject.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && (
            <p className="text-xs text-destructive">{t(errors.subject.message || "")}</p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-foreground">
            {t("contactForm.fields.message")} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="message"
            {...register("message")}
            rows={5}
            placeholder={t("contactForm.placeholders.message")}
            className={cn(
              "bg-background resize-none",
              errors.message && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="text-xs text-destructive">{t(errors.message.message || "")}</p>
          )}
          <p className="text-xs text-muted-foreground text-right">
            {watch("message")?.length || 0} / 2000
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("contactForm.submitting")}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {t("contactForm.submit")}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t("contactForm.disclaimer")}
        </p>
      </form>
    </div>
  );
}
