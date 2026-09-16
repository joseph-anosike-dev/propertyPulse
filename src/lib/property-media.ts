import homeImage from "@/assets/lagos-modern-home.jpg";
import type { Json } from "@/integrations/supabase/types";

export function getPropertyImages(media: Json, fallbackAlt: string) {
  if (!Array.isArray(media)) return [{ src: homeImage, alt: fallbackAlt }];

  const images = media.flatMap((candidate) => {
    if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate) || typeof candidate["url"] !== "string") return [];
    const url = candidate["url"];
    const src = url === "/src/assets/lagos-modern-home.jpg" ? homeImage : url;
    return [{ src, alt: typeof candidate["alt"] === "string" ? candidate["alt"] : fallbackAlt }];
  });

  return images.length ? images : [{ src: homeImage, alt: fallbackAlt }];
}