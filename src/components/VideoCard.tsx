// components/media/VideoCard.tsx
import { Youtube, Film, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormattedVideo } from "@/hooks/useApiVideos";

interface VideoCardProps {
  video: FormattedVideo;
  onClick?: (video: FormattedVideo) => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  // Função para obter o embed URL correto
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(video.embedUrl);
  const duration = video.durationSeconds > 0 
    ? `${Math.floor(video.durationSeconds / 60)}:${String(video.durationSeconds % 60).padStart(2, '0')}`
    : null;

  const handleClick = () => {
    if (onClick) {
      onClick(video);
    } else {
      window.open(embedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col"
    >
      <div className="aspect-video overflow-hidden relative bg-black/5">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-video.jpg';
          }}
        />
        {/* Overlay com ícone de play */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-primary/90 backdrop-blur rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform">
            <Youtube className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Badge de duração */}
        {duration && (
          <Badge className="absolute bottom-3 right-3 bg-black/70 text-white border-none flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </Badge>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {video.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {video.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Film className="w-3 h-3" />
            {video.providerType === 1 ? 'YouTube' : 'Vimeo'}
          </span>
          <span className="text-xs text-muted-foreground">
            {video.formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}