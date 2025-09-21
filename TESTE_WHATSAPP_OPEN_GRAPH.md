# Teste de Meta Tags Open Graph para WhatsApp

## Implementações Realizadas

### 1. Conversão para Server-Side Rendering (SSR)
- ✅ Converteu a página de notícia de Client Components para Server Components
- ✅ Implementou função `generateMetadata` dinâmica
- ✅ Meta tags são agora geradas no servidor, não no cliente

### 2. Meta Tags Open Graph Implementadas
- ✅ `og:type` = "article"
- ✅ `og:title` = Título do artigo
- ✅ `og:description` = Excerpt/subtitle do artigo
- ✅ `og:url` = URL canônica do artigo
- ✅ `og:image` = Imagem destacada ou fallback para og-image.svg (1200x630)
- ✅ `og:image:width` = 1200
- ✅ `og:image:height` = 630
- ✅ `og:site_name` = "Radar Noroeste PR"
- ✅ `og:locale` = "pt_BR"

### 3. Twitter Cards
- ✅ `twitter:card` = "summary_large_image"
- ✅ `twitter:title` = Título do artigo
- ✅ `twitter:description` = Descrição do artigo
- ✅ `twitter:image` = Imagem do artigo

### 4. Article-Specific Meta Tags
- ✅ `article:author` = Nome do autor
- ✅ `article:published_time` = Data de publicação
- ✅ `article:modified_time` = Data de modificação
- ✅ `article:section` = Categoria do artigo
- ✅ `article:tag` = Keywords/tags do artigo

### 5. JSON-LD Structured Data
- ✅ Schema.org NewsArticle implementado
- ✅ Dados estruturados para melhor SEO

## Como Testar

### 1. Ferramentas Online

#### Facebook Sharing Debugger (Melhor opção para WhatsApp)
1. Acesse: https://developers.facebook.com/tools/debug/
2. Insira a URL de um artigo: `https://seudominio.com/noticia/slug-do-artigo`
3. Clique em "Debug"
4. Verifique se todas as meta tags aparecem corretamente
5. Confirme que a imagem é exibida no preview

#### Open Graph Check
1. Acesse: https://opengraphcheck.com/
2. Insira a URL do artigo
3. Verifique o preview gerado

### 2. Teste no WhatsApp

#### WhatsApp Web
1. Abra o WhatsApp Web
2. Cole o link de um artigo em qualquer conversa
3. O preview deve aparecer automaticamente com:
   - Título do artigo
   - Descrição/excerpt
   - Imagem destacada (ou imagem padrão se não houver)
   - Nome do site

#### WhatsApp Mobile
1. Compartilhe o link em qualquer conversa
2. O preview deve carregar automaticamente

### 3. Teste de Performance

#### Validação de Meta Tags
```bash
# Usar curl para verificar meta tags no servidor
curl -s "https://seudominio.com/noticia/slug-do-artigo" | grep -i "og:"
curl -s "https://seudominio.com/noticia/slug-do-artigo" | grep -i "twitter:"
curl -s "https://seudominio.com/noticia/slug-do-artigo" | grep -i "article:"
```

## Pontos de Atenção

### 1. URLs Absolutos
- ✅ Todas as URLs nas meta tags são absolutas
- ✅ Imagens usam URLs completos (não relativos)

### 2. Fallbacks
- ✅ Artigos sem imagem usam og-image.svg (1200x630)
- ✅ Artigos sem descrição usam fallback baseado no título

### 3. Dimensões de Imagem
- ✅ Imagem padrão já está nas dimensões corretas (1200x630)
- ✅ Meta tags incluem width/height para otimização

### 4. Cache do WhatsApp
- ⚠️ O WhatsApp pode cachear previews por até 7 dias
- ⚠️ Se não aparecer imediatamente, aguarde ou use ferramentas para "limpar" o cache

## Solução de Problemas

### Preview não aparece
1. Verifique se o site está acessível publicamente
2. Confirme que não há bloqueio de bots no servidor
3. Use o Facebook Debugger para "scrape again"
4. Aguarde alguns minutos para propagação

### Imagem padrão aparece ao invés da imagem do artigo
1. **Verifique os logs do servidor**: Os logs irão mostrar se `featured_image` existe
2. **Use Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Cole a URL do artigo
   - Clique em "Debug" 
   - Clique em "Scrape Again" para forçar atualização
3. **Verifique dados do artigo**: Confirme se o campo `featured_image` está preenchido
4. **Teste a URL da imagem**: Abra `featured_image` diretamente no navegador
5. **Aguarde propagação**: Cache pode levar até 24h para atualizar

### Imagem não carrega
1. Verifique se a URL da imagem é absoluta
2. Confirme se a imagem está acessível publicamente
3. Verifique as dimensões (ideal: 1200x630)
4. Confirme que não há bloqueio CORS

### Títulos/descrições incorretos
1. Verifique se `generateMetadata` está funcionando
2. Confirme se os dados do artigo estão corretos
3. Use as ferramentas de debug para ver os valores reais

## Estrutura de Arquivos Modificados

```
src/
├── app/
│   └── noticia/
│       └── [slug]/
│           ├── page.tsx (SSR + generateMetadata)
│           └── ArticleClient.tsx (componente cliente)
├── lib/
│   └── seo.ts (otimizado para Open Graph)
public/
└── og-image.svg (imagem padrão otimizada 1200x630)
```

## Próximos Passos Recomendados

1. ✅ Teste em produção com URLs reais
2. ✅ Monitore métricas de compartilhamento
3. ⚠️ Considere criar imagens dinâmicas por categoria
4. ⚠️ Implemente analytics para rastrear compartilhamentos
5. ⚠️ Otimize performance do SSR se necessário

---

**Status: Implementação Completa** ✅

Todas as meta tags necessárias foram implementadas usando Server-Side Rendering para garantir que o WhatsApp e outras plataformas sociais consigam ler as informações corretamente no momento do compartilhamento.
