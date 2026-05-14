# Integração Headless WordPress

Este documento descreve a arquitectura e uso da integração headless com WordPress para o site da ANPG.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend React (Lovable)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Hooks   │  │Components│  │  Pages   │  │   Static Data    │ │
│  │useWP*   │──▶│  WP*     │──▶│ Hybrid   │──▶│  (Fallback)      │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│        │                                                         │
│        ▼                                                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    WordPress Client                          │ │
│  │  • REST API fetch   • Caching   • Type mapping              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                WordPress (anpg.co.ao)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ REST API │  │  Posts   │  │  Pages   │  │      Media       │ │
│  │/wp-json/ │  │ Notícias │  │Instituci.│  │    Imagens       │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Estrutura de Ficheiros

```
src/
├── lib/wordpress/
│   ├── types.ts      # Tipos TypeScript para WP REST API
│   ├── config.ts     # Configuração (URL, endpoints, mapeamentos)
│   ├── client.ts     # Cliente HTTP com cache e mappers
│   └── index.ts      # Exportações centralizadas
│
├── hooks/
│   └── useWordPress.ts   # React Query hooks para WP
│
├── components/wordpress/
│   ├── WPContent.tsx     # Renderização de HTML do WP
│   ├── WPNewsCard.tsx    # Card de notícias
│   ├── WPPageContent.tsx # Loader de páginas
│   └── index.ts          # Exportações
│
└── data/
    └── newsData.ts       # Dados estáticos (fallback)
```

## Uso Básico

### 1. Listar Notícias do WordPress

```tsx
import { useWPPosts } from '@/hooks/useWordPress';
import { WPNewsCard, WPNewsCardSkeleton } from '@/components/wordpress';

function NewsList() {
  const { data, isLoading, error } = useWPPosts({ per_page: 10 });
  
  if (isLoading) {
    return <WPNewsCardSkeleton />;
  }
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {data?.items.map((news, index) => (
        <WPNewsCard key={news.id} news={news} index={index} />
      ))}
    </div>
  );
}
```

### 2. Carregar Página Institucional

```tsx
import { WPPageContent } from '@/components/wordpress';

function AboutPage() {
  return (
    <WPPageContent
      slug="quem-somos"
      fallback={<StaticAboutContent />}
    />
  );
}
```

### 3. Modo Híbrido (WordPress + Fallback)

```tsx
import { useHybridNews } from '@/hooks/useWordPress';
import { newsItems } from '@/data/newsData';

function NewsSection() {
  const { items, isFromWordPress, isLoading } = useHybridNews(
    newsItems, // Dados estáticos como fallback
    { per_page: 8 },
    true // Preferir WordPress
  );
  
  // 'items' contém dados do WP se disponível, senão estáticos
}
```

## Configuração WordPress

### Plugins Recomendados

1. **Obrigatórios:**
   - Nenhum (REST API é nativa no WordPress 4.7+)

2. **Opcionais:**
   - **ACF** (Advanced Custom Fields) - para campos personalizados
   - **Yoast SEO** - expõe metadados SEO via API
   - **WP REST API Menus** - para menus de navegação

### Configurar CORS no WordPress

Adicionar ao `functions.php` do tema:

```php
// Permitir CORS para o frontend React
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed_origins = [
            'https://anpg.lovable.app',
            'http://localhost:5173',
            'http://localhost:8080',
        ];
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
            header('Access-Control-Allow-Methods: GET, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type');
        }
        
        return $value;
    });
}, 15);
```

### Estrutura de Categorias Recomendada

| Slug WP          | Categoria Interna | Descrição               |
|------------------|-------------------|-------------------------|
| `comunicados`    | `press`           | Comunicados de imprensa |
| `licitacoes`     | `tender`          | Licitações e concursos  |
| `destaques`      | `highlight`       | Notícias em destaque    |
| `producao`       | `production`      | Dados de produção       |
| `institucional`  | `institutional`   | Conteúdo institucional  |

## Páginas WordPress

### Slugs Mapeados

| Chave            | Slug WordPress         | Página React               |
|------------------|------------------------|----------------------------|
| `about`          | `quem-somos`           | /about                     |
| `history`        | `nossa-historia-2`     | /about/history             |
| `mission`        | `missao-visao-valores` | /about/anpg                |
| `contact`        | `contactos`            | /contacts                  |

## Cache

O cliente WordPress implementa cache em memória:

- **Posts/Notícias:** 5 minutos
- **Páginas:** 10 minutos
- **Categorias/Tags:** 30 minutos
- **Pesquisas:** 2 minutos

Para limpar cache:

```tsx
import { clearCache, clearCacheByPattern } from '@/lib/wordpress';

// Limpar todo o cache
clearCache();

// Limpar apenas posts
clearCacheByPattern('posts');
```

## Migração Gradual

A arquitectura suporta migração gradual:

1. **Fase 1:** Apenas notícias via WordPress
2. **Fase 2:** Páginas institucionais
3. **Fase 3:** Menus e navegação
4. **Fase 4:** Todo o conteúdo

Cada fase mantém fallback para dados estáticos.

## Resolução de Problemas

### Erro CORS

Se aparecer erro de CORS:
1. Verificar configuração no WordPress (ver acima)
2. Confirmar que a origem está na whitelist
3. Testar com extensão CORS desactivada (debug)

### Conteúdo não aparece

1. Verificar se o post/página está publicado
2. Confirmar slug correcto
3. Verificar console para erros de API

### Performance lenta

1. Aumentar TTL do cache
2. Reduzir `per_page` nas queries
3. Usar `_fields` para limitar campos retornados

## Próximos Passos

1. [ ] Configurar CORS no WordPress (anpg.co.ao)
2. [ ] Testar endpoints REST API
3. [ ] Activar hooks nos componentes de notícias
4. [ ] Migrar NewsSection para modo híbrido
5. [ ] Configurar ACF para campos customizados (opcional)
