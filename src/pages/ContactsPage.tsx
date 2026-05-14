import { Phone, Mail, MapPin, Clock, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactMap } from "@/components/contact/ContactMap";
import { usePageData } from "@/hooks/pages/usePageData";

export default function ContactsPage() {
  const { data: pageData, isLoading } = usePageData("contacts");

  const address = pageData?.address || "";
  const phone = pageData?.phone || "";
  const email = pageData?.email || "";
  const hours = pageData?.hours || pageData?.info?.hours?.content || "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageLayout
      pageKey="contacts"
      title={pageData?.title || "Contactos"}
      subtitle={pageData?.subtitle || "Fale Connosco"}
      description={pageData?.description || ""}
      icon={<Phone className="w-8 h-8 text-primary" />}
      breadcrumbs={[{ label: pageData?.title || "Contactos" }]}
    >
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {pageData?.infoTitle || "Informações de Contacto"}
            </h2>
            <p className="text-muted-foreground">
              {pageData?.infoDescription || ""}
            </p>
          </div>

          <div className="space-y-6">
            {/* Address */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {pageData?.info?.address?.title || "Localização"}
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {address}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {pageData?.info?.phone?.title || "Telefone"}
                </h3>
                <p className="text-muted-foreground">{phone}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {pageData?.info?.email?.title || "Email"}
                </h3>
                <p className="text-muted-foreground">{email}</p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {pageData?.info?.hours?.title || "Horário"}
                </h3>
                <p className="text-muted-foreground">
                  {hours}
                </p>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <ContactMap address={address} />
        </div>

        {/* Contact Form */}
        <ContactForm />
      </div>
    </PageLayout>
  );
}
