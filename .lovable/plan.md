

## Plano: Garantir gestão CMS completa e fluxo WordPress-like no backoffice

### Diagnóstico actual

O projecto já tem uma cobertura CMS muito ampla:
- **17 módulos admin** funcionais (Notícias, Homepage, Banners, Menu, FAQ, Board, Media, etc.)
- **~40 páginas** a consumir dados do CMS via `useContentBlocks`, `usePageBanner`, `useSiteSettings`
- Editor rico (TipTap) com upload de imagens, formatação e links
- Sistema bilingue PT/EN em toda a base de dados
- RBAC com 5 roles e audit logs

### Lacunas identificadas

1. **Página "Páginas CMS" (`/admin/pages`) é genérica e subutilizada** — gere apenas a tabela `cms_pages` (páginas livres), mas não dá acesso aos `content_blocks` de cada página real do site. O utilizador não sabe onde editar o conteúdo de `/regulation` ou `/sustainability`.

2. **Falta um "Mapa do Site" no backoffice** — Não existe uma vista que mostre TODAS as páginas do site e dê acesso directo à edição do respectivo conteúdo (content blocks + banner + SEO). No WordPress isto é o menu "Páginas".

3. **Blocos de Conteúdo (`/admin/content-blocks`) é demasiado técnico** — Mostra JSON cru (`page_key`, `section_key`, `content: {}`). Utilizadores não-técnicos não conseguem editar conteúdo de páginas aqui. No WordPress, cada página tem o seu editor visual.

4. **Falta preview/pré-visualização** — Não há forma de ver como ficará uma página antes de publicar alterações.

5. **Dashboard não mostra acções recentes** — Falta um feed de actividade recente (últimas edições, artigos publicados).

6. **Falta barra lateral de navegação** — O backoffice usa um dashboard de cards, mas para fluxo WordPress-like falta uma sidebar fixa com todos os módulos acessíveis em 1 clique.

### Implementação proposta

#### Fase 1 — Sidebar de navegação tipo WordPress
- Criar componente `AdminSidebar` com navegação fixa à esquerda
- Agrupar módulos por categoria: Conteúdo, Operações, Investidores, Sistema
- Aplicar a todas as páginas admin via um `AdminLayout` wrapper
- Manter o dashboard como página inicial mas com acesso rápido via sidebar

#### Fase 2 — "Páginas do Site" (Mapa completo editável)
- Criar nova página `/admin/site-pages` com listagem de TODAS as páginas do site
- Cada entrada mostra: nome, URL, se tem banner, n.º de content blocks, última edição
- Ao clicar, abre um editor dedicado para essa página com:
  - Tab "Banner" → editar imagem, título e subtítulo (via `page_banners`)
  - Tab "Conteúdo" → formulários estruturados por `section_key` (título, descrição, items) em vez de JSON cru
  - Tab "SEO" → meta description
- Mapa de `page_key` → secções esperadas (ex: `regulation` → `intro`, `areas`, `cta`)

#### Fase 3 — Editor visual de content blocks por página
- Transformar a edição de content blocks de JSON cru para formulários amigáveis
- Para cada tipo de secção (`intro`, `features`, `highlights`, etc.), renderizar campos específicos:
  - `intro` → título + descrição (textarea)
  - `features/items` → lista de cards com título + descrição + ícone
  - `highlights` → lista com título + valor
- Botão "Adicionar secção" com templates pré-definidos

#### Fase 4 — Feed de actividade no dashboard
- Consultar `audit_logs` para mostrar as 10 últimas acções no dashboard
- Formato: "João editou Notícia X há 2 horas", "Maria actualizou Banner da página Regulação"

#### Fase 5 — Preview inline
- Adicionar botão "Pré-visualizar" no editor de páginas que abre a página pública num iframe ou nova aba com os dados actuais

### Detalhe técnico

**Ficheiros a criar:**
- `src/components/admin/AdminLayout.tsx` — layout com sidebar + header + main content
- `src/components/admin/AdminSidebar.tsx` — navegação lateral colapsável
- `src/pages/admin/AdminSitePagesPage.tsx` — mapa de páginas do site
- `src/pages/admin/AdminPageEditorPage.tsx` — editor visual por página (banner + content blocks + SEO)
- `src/components/admin/ContentBlockEditor.tsx` — editor visual de content blocks (substitui JSON)

**Ficheiros a modificar:**
- `src/App.tsx` — adicionar rotas `/admin/site-pages` e `/admin/site-pages/:pageKey`
- `src/pages/admin/AdminDashboard.tsx` — integrar sidebar, adicionar feed de actividade recente
- Todas as ~17 páginas admin existentes — envolver com `AdminLayout`

**Base de dados:** Sem alterações de schema necessárias. Os dados já estão todos nas tabelas existentes.

**Mapa de páginas pré-configurado** (constante no código):
```text
page_key          | Label                  | URL              | Secções esperadas
------------------|------------------------|------------------|-------------------
about             | Sobre Nós              | /about           | intro, mission, values
regulation        | Regulação              | /regulation      | intro, areas
oversight         | Fiscalização           | /regulation/...  | intro, areas
licensing         | Licenciamento          | /regulation/...  | intro, process
production        | Produção               | /production      | intro, stats
sustainability    | Sustentabilidade       | /sustainability  | intro, pillars
... (todas as ~40 páginas)
```

### Prioridade sugerida
Fases 1 e 2 são as mais impactantes para a experiência WordPress-like. Fases 3-5 podem ser iterativas.

