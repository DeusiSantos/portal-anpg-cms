import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface MegaMenuItem {
  nameKey?: string;
  label?: string;
  descriptionKey?: string;
  description?: string;
  href: string;
  icon: LucideIcon;
}

interface MegaMenuProps {
  items: MegaMenuItem[];
  columns?: 1 | 2 | 3;
  onItemClick?: () => void;
}

export const MegaMenu = forwardRef<HTMLDivElement, MegaMenuProps>(
  function MegaMenu({ items, columns = 2, onItemClick }, ref) {
    const { t } = useTranslation();

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-background rounded-2xl shadow-elevated border border-border overflow-hidden",
          columns === 3 ? "w-[600px]" : columns === 1 ? "w-[320px]" : "w-[480px]"
        )}
      >
        <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-t-2xl" />
        
        <div className={cn(
          "grid gap-1 p-3",
          columns === 3 ? "grid-cols-3" : columns === 1 ? "grid-cols-1" : "grid-cols-2"
        )}>
          {items.map((item, index) => {
            const Icon = item.icon;
            const label = item.label || (item.nameKey ? t(item.nameKey) : "");
            const description = item.description || (item.descriptionKey ? t(item.descriptionKey) : "");
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onItemClick}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-secondary transition-all duration-200 hover:shadow-sm"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 group-hover:shadow-md transition-all duration-200"
                >
                  <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {label}
                  </h4>
                  {description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    );
  }
);
