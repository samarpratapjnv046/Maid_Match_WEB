import { Helmet } from 'react-helmet-async';

/**
 * SEO – drop-in head tag manager for every public page.
 * Uses react-helmet-async so tags are injected per route without touching
 * the visible UI at all.
 */
export default function SEO({
  title,
  description,
  canonical,
  ogImage = 'https://www.maidsaathi.in/og-homepage.jpg',
  ogType = 'website',
  noindex = false,
  schema = null,
}) {
  const fullTitle = title.includes('MaidSaathi') ? title : `${title} | MaidSaathi`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical || 'https://www.maidsaathi.in'} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="MaidSaathi" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
        </script>
      )}
    </Helmet>
  );
}
