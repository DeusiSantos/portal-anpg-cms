import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  FileText, 
  Download, 
  Search,
  FileCheck,
  Scale,
  BookOpen,
  Landmark,
  Globe2,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaggerContainer } from "@/components/layout/StaggerContainer";
import { useInvestorDocuments, type CMSInvestorDocument } from "@/hooks/useCMSData";

const categories = [
  { key: "all", label: "Todos", icon: FileText },
  { key: "legislation", label: "Legislação", icon: Scale },
  { key: "contracts", label: "Contratos", icon: FileCheck },
  { key: "brochures", label: "Brochuras", icon: BookOpen },
  { key: "technical", label: "Técnico", icon: Landmark },
  { key: "general", label: "Geral", icon: Globe2 },
];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryIcon(category: string) {
  return categories.find(c => c.key === category)?.icon || FileText;
}

function getFileExtension(url: string): string {
  const ext = url.split('.').pop()?.toUpperCase().split('?')[0];
  return ext || "FILE";
}

function getTypeColor(type: string) {
  switch (type) {
    case "PDF": return "bg-destructive/10 text-destructive";
    case "DOC": case "DOCX": return "bg-status-info/10 text-status-info-foreground";
    case "XLS": case "XLSX": return "bg-status-success/10 text-status-success-foreground";
    default: return "bg-muted text-muted-foreground";
  }
}

export function DocumentCenter() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: documents = [], isLoading } = useInvestorDocuments();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryCount = (key: string) =>
    key === "all" ? documents.length : documents.filter(d => d.category === key).length;

  return (
    <div className="space-y-6">
      {/* Search and Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("investorPortal.searchDocuments")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger
                      key={cat.key}
                      value={cat.key}
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{cat.label}</span>
                      <Badge variant="secondary" className="text-xs h-5 px-1.5">
                        {getCategoryCount(cat.key)}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Documents Grid */}
      {!isLoading && filteredDocuments.length > 0 && (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => {
            const CategoryIcon = getCategoryIcon(doc.category || "general");
            const fileType = getFileExtension(doc.file_url);
            
            return (
              <Card key={doc.id} className="group hover:border-primary/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CategoryIcon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {doc.document_name}
                        </h4>
                        <Badge className={`${getTypeColor(fileType)} text-xs flex-shrink-0`}>
                          {fileType}
                        </Badge>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatFileSize(doc.file_size_bytes)}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString('pt-AO', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 px-3" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" />
                            {t("investorPortal.download")}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </StaggerContainer>
      )}

      {!isLoading && filteredDocuments.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t("investorPortal.noDocuments")}
            </h3>
            <p className="text-muted-foreground">
              {t("investorPortal.adjustSearch")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">
                {t("investorPortal.needMore")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("investorPortal.requestAccess")}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("investorPortal.dataRoom")}
              </Button>
              <Button variant="default">
                {t("investorPortal.contactUs")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
