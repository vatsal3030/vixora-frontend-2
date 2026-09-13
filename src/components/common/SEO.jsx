import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  video = null,
  schema = null,
  publishedTime = null,
  modifiedTime = null
}) {
  const siteName = 'Vixora';
  const defaultTitle = 'Vixora — Next-Gen Video Streaming & Native Creator AI';
  const defaultDescription = 'Experience next-generation 4K 60fps video streaming with native Gemini AI intelligence. Instant video summaries, real-time copilot chat, and creator community tools.';
  const defaultKeywords = 'Vixora, Vixora AI, video streaming, AI video summary, Gemini AI, 4K video player, HLS streaming, YouTube alternative, creator platform, video transcript AI, video chapters, online video community, creator studio';
  const defaultImage = `${window.location.origin}/brand_logo2.png`;

  const currentTitle = title ? `${title} • ${siteName}` : defaultTitle;
  const currentDescription = description || defaultDescription;
  const currentKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const currentImage = image || defaultImage;
  const currentUrl = url || window.location.href;

  // Helper to format ISO 8601 duration (e.g., 255 seconds -> PT4M15S)
  const formatDurationISO = (seconds) => {
    if (!seconds || seconds <= 0) return 'PT0S';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    let iso = 'PT';
    if (h > 0) iso += `${h}H`;
    if (m > 0) iso += `${m}M`;
    if (s > 0 || (h === 0 && m === 0)) iso += `${s}S`;
    return iso;
  };

  // Build JSON-LD Structured Data
  let jsonLd = schema;
  if (!jsonLd && video) {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: video.title || currentTitle,
      description: video.description || currentDescription,
      thumbnailUrl: [currentImage],
      uploadDate: video.createdAt || new Date().toISOString(),
      duration: formatDurationISO(video.duration),
      contentUrl: currentUrl,
      embedUrl: currentUrl,
      author: {
        '@type': 'Person',
        name: video.owner?.fullName || video.owner?.username || 'Vixora Creator'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Vixora',
        logo: {
          '@type': 'ImageObject',
          url: defaultImage
        }
      },
      interactionStatistic: [
        {
          '@type': 'InteractionCounter',
          interactionType: { '@type': 'https://schema.org/WatchAction' },
          userInteractionCount: video.viewsCount || video.views || 0
        }
      ]
    };
  }

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{currentTitle}</title>
      <meta name="title" content={currentTitle} />
      <meta name="description" content={currentDescription} />
      <meta name="keywords" content={currentKeywords} />
      <link rel="canonical" href={currentUrl} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={currentTitle} />
      <meta property="og:description" content={currentDescription} />
      <meta property="og:image" content={currentImage} />
      <meta property="og:image:alt" content={currentTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Article / Video specific dates */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={currentTitle} />
      <meta name="twitter:description" content={currentDescription} />
      <meta name="twitter:image" content={currentImage} />
      <meta name="twitter:image:alt" content={currentTitle} />

      {/* Dynamic JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  video: PropTypes.object,
  schema: PropTypes.object,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
};
