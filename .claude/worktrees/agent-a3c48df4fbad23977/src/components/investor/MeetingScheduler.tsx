import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { CalendarIcon, Clock, User, Building2, Mail, FileText, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type SchedulerStep = "date" | "time" | "details" | "confirmation";

interface MeetingFormData {
  date: Date | undefined;
  time: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

const meetingTopics = [
  { value: "block-interest", labelKey: "meetingScheduler.topics.blockInterest" },
  { value: "data-access", labelKey: "meetingScheduler.topics.dataAccess" },
  { value: "partnership", labelKey: "meetingScheduler.topics.partnership" },
  { value: "tender-info", labelKey: "meetingScheduler.topics.tenderInfo" },
  { value: "general", labelKey: "meetingScheduler.topics.general" },
];

export function MeetingScheduler() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<SchedulerStep>("date");
  const [formData, setFormData] = useState<MeetingFormData>({
    date: undefined,
    time: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  });

  const dateLocale = i18n.language === "pt" ? pt : enUS;

  const updateFormData = (field: keyof MeetingFormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    updateFormData("date", date);
    if (date) {
      setStep("time");
    }
  };

  const handleTimeSelect = (time: string) => {
    updateFormData("time", time);
    setStep("details");
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.company || !formData.email || !formData.topic) {
      toast.error(t("meetingScheduler.validation.required"));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t("meetingScheduler.validation.invalidEmail"));
      return;
    }

    setStep("confirmation");
    toast.success(t("meetingScheduler.successToast"));
  };

  const handleReset = () => {
    setFormData({
      date: undefined,
      time: "",
      name: "",
      company: "",
      email: "",
      phone: "",
      topic: "",
      message: "",
    });
    setStep("date");
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const steps = [
    { id: "date", labelKey: "meetingScheduler.steps.date", icon: CalendarIcon },
    { id: "time", labelKey: "meetingScheduler.steps.time", icon: Clock },
    { id: "details", labelKey: "meetingScheduler.steps.details", icon: FileText },
    { id: "confirmation", labelKey: "meetingScheduler.steps.confirmation", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          {t("meetingScheduler.title")}
        </CardTitle>
        <CardDescription>
          {t("meetingScheduler.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary/10 text-primary",
                      !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground/50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-medium hidden sm:block",
                    isActive && "text-primary",
                    isCompleted && "text-primary",
                    !isActive && !isCompleted && "text-muted-foreground/50"
                  )}>
                    {t(s.labelKey)}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-12 md:w-24 h-0.5 mx-2",
                    index < currentStepIndex ? "bg-primary" : "bg-muted-foreground/20"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Date Selection */}
          {step === "date" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("meetingScheduler.selectDate")}</h3>
              <p className="text-sm text-muted-foreground">{t("meetingScheduler.selectDateDesc")}</p>
              
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={handleDateSelect}
                  locale={dateLocale}
                  disabled={(date) => isWeekend(date) || isPastDate(date)}
                  className="rounded-xl border shadow-sm pointer-events-auto"
                />
              </div>
            </div>
          )}

          {/* Time Selection */}
          {step === "time" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{t("meetingScheduler.selectTime")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.date && format(formData.date, "EEEE, d MMMM yyyy", { locale: dateLocale })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep("date")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("meetingScheduler.changeDate")}
                </Button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={formData.time === time ? "default" : "outline"}
                    className="h-12"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                {t("meetingScheduler.timezone")}
              </p>
            </div>
          )}

          {/* Details Form */}
          {step === "details" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{t("meetingScheduler.yourDetails")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.date && format(formData.date, "d MMM yyyy", { locale: dateLocale })} {t("meetingScheduler.at")} {formData.time}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep("time")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("meetingScheduler.changeTime")}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t("meetingScheduler.form.name")} *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder={t("meetingScheduler.form.namePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {t("meetingScheduler.form.company")} *
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => updateFormData("company", e.target.value)}
                    placeholder={t("meetingScheduler.form.companyPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t("meetingScheduler.form.email")} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder={t("meetingScheduler.form.emailPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t("meetingScheduler.form.phone")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder={t("meetingScheduler.form.phonePlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t("meetingScheduler.form.topic")} *
                </Label>
                <Select value={formData.topic} onValueChange={(value) => updateFormData("topic", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("meetingScheduler.form.topicPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingTopics.map((topic) => (
                      <SelectItem key={topic.value} value={topic.value}>
                        {t(topic.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  {t("meetingScheduler.form.message")}
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => updateFormData("message", e.target.value)}
                  placeholder={t("meetingScheduler.form.messagePlaceholder")}
                  rows={4}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" size="lg">
                {t("meetingScheduler.submit")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Confirmation */}
          {step === "confirmation" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 rounded-full bg-status-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-status-success" />
              </div>
              
              <div>
                <h3 className="font-semibold text-2xl mb-2">{t("meetingScheduler.confirmation.title")}</h3>
                <p className="text-muted-foreground">{t("meetingScheduler.confirmation.subtitle")}</p>
              </div>

              <Card className="bg-muted/50 text-left max-w-md mx-auto">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span>{formData.date && format(formData.date, "EEEE, d MMMM yyyy", { locale: dateLocale })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{formData.time} (WAT)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <span>{formData.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span>{formData.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <Badge variant="secondary">
                      {t(meetingTopics.find(topic => topic.value === formData.topic)?.labelKey || "")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-muted-foreground">
                {t("meetingScheduler.confirmation.emailNote")}
              </p>

              <Button variant="outline" onClick={handleReset}>
                {t("meetingScheduler.confirmation.scheduleAnother")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
