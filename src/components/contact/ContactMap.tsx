import { useTranslation } from "react-i18next";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactMapProps {
  address: string;
  className?: string;
}

export function ContactMap({ address, className }: ContactMapProps) {
  const { t } = useTranslation();
  
  // Encode address for Google Maps
  const encodedAddress = encodeURIComponent(address);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const embedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <div className={className}>
      <div className="rounded-xl overflow-hidden border border-border h-72 relative group">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={t("pages.contacts.mapTitle")}
          className="grayscale hover:grayscale-0 transition-all duration-500"
        />
        
        {/* Overlay with action button */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="sm"
            className="shadow-lg"
            asChild
          >
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t("pages.contacts.openInMaps")}
            </a>
          </Button>
        </div>

        {/* Location pin indicator */}
        <div className="absolute top-4 left-4">
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
            <MapPin className="w-3.5 h-3.5" />
            {t("pages.contacts.headquarters")}
          </div>
        </div>
      </div>
    </div>
  );
}
