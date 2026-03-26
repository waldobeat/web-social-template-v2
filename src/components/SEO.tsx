import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({
  title = 'Sheddit - La Comunidad Digital de Chicas',
  description = 'Únete a Sheddit, el espacio seguro y vibrante donde hablamos de nuestras pasiones, retos y belleza. Publica, comparte y conecta con chicas de todo el mundo. ✨',
  image = 'https://www.sheddit.blog/og-image.png',
  url = 'https://www.sheddit.blog',
  type = 'website'
}: SEOProps) => {
  const fullTitle = title.includes('Sheddit') ? title : `${title} | Sheddit`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="comunidad mujer, social network chicas, belleza, moda, consejos, sheddit, red social femenina" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Schema.org for Google - JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'profile' ? "ProfilePage" : "WebSite",
          "name": "Sheddit",
          "url": url,
          "description": description,
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://sheddit.web.app/explore?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};
