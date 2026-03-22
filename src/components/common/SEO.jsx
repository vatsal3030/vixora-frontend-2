import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

export default function SEO({ title, description, keywords, image, url, type = 'website' }) {
  const siteName = 'Vixora';
  const defaultTitle = 'Vixora — Watch, share, and create videos';
  const defaultDescription = 'A next-generation platform to watch, share, and connect with creators across the globe.';
  const defaultImage = `${window.location.origin}/brand_logo2.png`; // Fallback to site logo

  const currentTitle = title ? `${title} - ${siteName}` : defaultTitle;
  const currentDescription = description || defaultDescription;
  const currentImage = image || defaultImage;
  const currentUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{currentTitle}</title>
      <meta name="description" content={currentDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={currentTitle} />
      <meta property="og:description" content={currentDescription} />
      <meta property="og:image" content={currentImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={currentTitle} />
      <meta name="twitter:description" content={currentDescription} />
      <meta name="twitter:image" content={currentImage} />
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
};
