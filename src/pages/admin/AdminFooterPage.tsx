import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Loader2, MapPin, Share2, FileText } from 'lucide-react';
import { useSiteSettings, saveSettings, defaultSettings } from '@/contexts/SiteSettingsContext';

export default function AdminFooterPage() {
  const { settings, refetch } = useSiteSettings();

  const [contact, setContact] = useState(defaultSettings.contact);
  const [social, setSocial] = useState(defaultSettings.social);
  const [footer, setFooter] = useState(defaultSettings.footer);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setContact({ ...defaultSettings.contact, ...settings.contact });
    setSocial({ ...defaultSettings.social, ...settings.social });
    setFooter({ ...defaultSettings.footer, ...settings.footer });
  }, [settings]);

  const handleSave = async (section: 'contact' | 'social' | 'footer', value: any) => {
    setSaving(section);
    try {
      saveSettings(section, value);
      await refetch();
      toast.success('Guardado com sucesso');
    } catch {
      toast.error('Erro ao guardar');
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminLayout title="Rodapé" subtitle="Editar contactos, redes sociais e textos do rodapé">
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="contact">
          <TabsList className="mb-6">
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Contactos
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Redes Sociais
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Textos Rodapé
            </TabsTrigger>
          </TabsList>

          {/* Contactos */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contacto</CardTitle>
                <CardDescription>Morada, telefone e email exibidos no rodapé e página de contactos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Morada</Label>
                  <Textarea
                    value={contact.address}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                    placeholder="Endereço completo..."
                    rows={3}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      placeholder="+244 xxx xxx xxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      placeholder="info@anpg.co.ao"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Horário de Funcionamento</Label>
                  <Input
                    value={contact.hours}
                    onChange={(e) => setContact({ ...contact, hours: e.target.value })}
                    placeholder="Segunda a Sexta, 08:00 - 17:00"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => handleSave('contact', contact)} disabled={saving === 'contact'}>
                    {saving === 'contact' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Contactos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redes Sociais */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>Links exibidos nos ícones sociais do rodapé (deixar em branco para ocultar)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {([
                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
                    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                    { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
                    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                  ] as const).map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input
                        value={social[key]}
                        onChange={(e) => setSocial({ ...social, [key]: e.target.value })}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => handleSave('social', social)} disabled={saving === 'social'}>
                    {saving === 'social' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Redes Sociais
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Textos do Rodapé */}
          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Textos do Rodapé</CardTitle>
                <CardDescription>Copyright e tagline exibidos na barra inferior do rodapé</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Texto de Copyright</Label>
                  <Textarea
                    value={footer.copyright}
                    onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
                    placeholder="© 2026 ANPG..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline / Slogan</Label>
                  <Input
                    value={footer.tagline}
                    onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                    placeholder="Regulando o sector petrolífero..."
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => handleSave('footer', footer)} disabled={saving === 'footer'}>
                    {saving === 'footer' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Textos
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
