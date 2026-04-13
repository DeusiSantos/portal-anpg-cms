import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Settings,
  Image as ImageIcon,
  MapPin,
  Share2,
  FileText,
  Loader2,
  Upload,
} from 'lucide-react';

interface LogoSettings {
  light: string;
  dark: string;
}

interface ContactSettings {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

interface SocialSettings {
  facebook: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  instagram: string;
}

interface FooterSettings {
  copyright: string;
  tagline: string;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('logo');
  const [uploading, setUploading] = useState<'light' | 'dark' | null>(null);

  // Form states
  const [logoData, setLogoData] = useState<LogoSettings>({ light: '', dark: '' });
  const [contactData, setContactData] = useState<ContactSettings>({
    address: '',
    phone: '',
    email: '',
    hours: '',
  });
  const [socialData, setSocialData] = useState<SocialSettings>({
    facebook: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    instagram: '',
  });
  const [footerData, setFooterData] = useState<FooterSettings>({
    copyright: '',
    tagline: '',
  });

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Populate form data when settings load
  useEffect(() => {
    if (settings) {
      settings.forEach((setting) => {
        const value = setting.setting_value as any;
        switch (setting.setting_key) {
          case 'logo':
            setLogoData(value);
            break;
          case 'contact':
            setContactData(value);
            break;
          case 'social':
            setSocialData(value);
            break;
          case 'footer':
            setFooterData(value);
            break;
        }
      });
    }
  }, [settings]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: value, updated_by: user?.id })
        .eq('setting_key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Configurações guardadas com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao guardar: ${error.message}`);
    },
  });

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${type}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('cms-assets')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Erro ao fazer upload do logo');
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('cms-assets')
      .getPublicUrl(filePath);

    const newLogoData = { ...logoData, [type]: publicUrl };
    setLogoData(newLogoData);
    setUploading(null);
    toast.success('Logo carregado com sucesso');
  };

  const handleSave = (key: string, value: any) => {
    updateMutation.mutate({ key, value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout title="Configurações" subtitle="Definições gerais do sistema">

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Logotipos</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Contactos</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Redes Sociais</span>
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Rodapé</span>
            </TabsTrigger>
          </TabsList>

          {/* Logo Settings */}
          <TabsContent value="logo">
            <Card>
              <CardHeader>
                <CardTitle>Logotipos</CardTitle>
                <CardDescription>Configure os logotipos para os modos claro e escuro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Light Mode Logo */}
                  <div className="space-y-4">
                    <Label>Logo Modo Claro</Label>
                    {logoData.light ? (
                      <div className="relative aspect-[3/1] rounded-lg overflow-hidden bg-white border p-4">
                        <img
                          src={logoData.light}
                          alt="Logo Light"
                          className="object-contain w-full h-full"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setLogoData({ ...logoData, light: '' })}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-[3/1] rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors bg-white">
                        {uploading === 'light' ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Carregar logo claro</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e, 'light')}
                          disabled={uploading !== null}
                        />
                      </label>
                    )}
                  </div>

                  {/* Dark Mode Logo */}
                  <div className="space-y-4">
                    <Label>Logo Modo Escuro</Label>
                    {logoData.dark ? (
                      <div className="relative aspect-[3/1] rounded-lg overflow-hidden bg-graphite border p-4">
                        <img
                          src={logoData.dark}
                          alt="Logo Dark"
                          className="object-contain w-full h-full"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setLogoData({ ...logoData, dark: '' })}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-[3/1] rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors bg-graphite">
                        {uploading === 'dark' ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Carregar logo escuro</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e, 'dark')}
                          disabled={uploading !== null}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('logo', logoData)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Logotipos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Settings */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contacto</CardTitle>
                <CardDescription>Configure os dados de contacto exibidos no website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Morada</Label>
                  <Textarea
                    id="address"
                    value={contactData.address}
                    onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                    placeholder="Endereço completo..."
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      placeholder="+244 xxx xxx xxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      placeholder="info@anpg.co.ao"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Horário de Funcionamento</Label>
                  <Input
                    id="hours"
                    value={contactData.hours}
                    onChange={(e) => setContactData({ ...contactData, hours: e.target.value })}
                    placeholder="Segunda a Sexta, 08:00 - 17:00"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('contact', contactData)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Contactos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Settings */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>Configure os links das redes sociais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={socialData.facebook}
                      onChange={(e) => setSocialData({ ...socialData, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={socialData.linkedin}
                      onChange={(e) => setSocialData({ ...socialData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input
                      id="twitter"
                      value={socialData.twitter}
                      onChange={(e) => setSocialData({ ...socialData, twitter: e.target.value })}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={socialData.youtube}
                      onChange={(e) => setSocialData({ ...socialData, youtube: e.target.value })}
                      placeholder="https://youtube.com/@..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={socialData.instagram}
                      onChange={(e) => setSocialData({ ...socialData, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('social', socialData)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Redes Sociais
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Settings */}
          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Textos do Rodapé</CardTitle>
                <CardDescription>Configure os textos exibidos no rodapé do website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="copyright">Texto de Copyright</Label>
                  <Textarea
                    id="copyright"
                    value={footerData.copyright}
                    onChange={(e) => setFooterData({ ...footerData, copyright: e.target.value })}
                    placeholder="© 2026 ANPG..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline / Slogan</Label>
                  <Input
                    id="tagline"
                    value={footerData.tagline}
                    onChange={(e) => setFooterData({ ...footerData, tagline: e.target.value })}
                    placeholder="Regulando o sector petrolífero..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave('footer', footerData)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Rodapé
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </AdminLayout>
  );
}
