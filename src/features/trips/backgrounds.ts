import type { CSSProperties } from "react";

const DEFAULT_UNSPLASH_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

function normalizeImageUrl(imageUrl?: string | null) {
  const trimmed = imageUrl?.trim();
  return trimmed ? trimmed : DEFAULT_UNSPLASH_IMAGE;
}

export function buildBackgroundStyle(imageUrl?: string | null): CSSProperties {
  return {
    minHeight: "100vh",
    color: "#fff",
    backgroundImage: [
      "linear-gradient(180deg, rgba(8, 15, 28, 0.52) 0%, rgba(8, 15, 28, 0.78) 45%, rgba(8, 15, 28, 0.92) 100%)",
      "linear-gradient(120deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.38) 40%, rgba(15, 23, 42, 0.84) 100%)",
      `url("${normalizeImageUrl(imageUrl)}")`,
    ].join(", "),
    backgroundPosition: "center center, center center, center center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  };
}

export function getDefaultTripsImageUrl() {
  return DEFAULT_UNSPLASH_IMAGE;
}
