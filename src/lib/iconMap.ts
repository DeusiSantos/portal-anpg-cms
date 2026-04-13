import {
  Building2, History, Heart, Phone, FileCheck, Gift, Archive,
  Layers, Image, Database, Map, Calendar, Users, BarChart3,
  Scale, Shield, Globe2, Leaf, TrendingUp, HelpCircle, Landmark,
  Briefcase, Fuel, Anchor, Package, FileText, Compass, LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Building2, History, Heart, Phone, FileCheck, Gift, Archive,
  Layers, Image, Database, Map, Calendar, Users, BarChart3,
  Scale, Shield, Globe2, Leaf, TrendingUp, HelpCircle, Landmark,
  Briefcase, Fuel, Anchor, Package, FileText, Compass,
};

export function getIcon(name: string | null): LucideIcon | undefined {
  if (!name) return undefined;
  return iconMap[name];
}
