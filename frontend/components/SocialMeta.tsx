import Head from "next/head";

interface SocialMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
}

const SocialMeta: React.FC<SocialMetaProps> = ({
  title = "Family Social Site",
  description = "A social platform built by family for family.",
  image = "/web-app-manifest-512x512.png",
  url = "https://family-social.site", // Replace with your actual domain
  type = "website",
  twitterCard = "summary_large_image",
}) => {
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:site_name" content="Family Social Site" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="author" content="Family Social Team" />
      <meta name="publisher" content="Family Social Team" />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#3B82F6" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Head>
  );
};

export default SocialMeta;
