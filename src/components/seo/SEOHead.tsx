import { Helmet } from 'react-helmet-async'

export const SITE_URL = 'https://dimensionlab3d.com.br'
export const SITE_NAME = 'Dimension.Lab3D'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

interface SEOHeadProps {
  /** Título da página — sufixo "| Dimension.Lab3D" adicionado automaticamente */
  title: string
  /** Descrição (até 155 caracteres) */
  description: string
  /** Caminho canônico, ex: "/portfolio" */
  canonical?: string
  /** Tipo do Open Graph (padrão: "website") */
  ogType?: 'website' | 'article'
  /** URL absoluta ou caminho para imagem OG (1200×630 ideal) */
  ogImage?: string
  /** Bloqueia indexação (páginas privadas) */
  noindex?: boolean
  /** Dados estruturados JSON-LD — um objeto ou array de objetos */
  jsonLd?: object | object[]
}

export function SEOHead({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined

  const schemas = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {noindex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow" />
      }

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}