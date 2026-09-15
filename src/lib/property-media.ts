import homeImage from "@/assets/lagos-modern-home.jpg";
import type { Json } from "@/integrations/supabase/types";

type MediaItem = { url: string; alt?: string };

export function getPropertyImage(media: Json): { src: string; alt?: string } {
  if (!Array.isArray(media)) return { src: homeImage };

  const item = media.find((candidate): candidate is { [key: string]: Json | undefined } => (
    typeof candidate === "object" && candidate !== null && !Array.isArray(candidate) && typeof candidate.url === "string"
  ));

  if (!item || typeof item.url !== "string") return { src: homeImage };

  const normalizedUrl = item.url.startsWith("/src/assets/") ? homeImage : item.url;
  const image: MediaItem = { src: normalizedUrl, url: normalizedUrl } as MediaItem;
  if (typeof item.alt === "string") image.alt = item.alt;
  return { src: image.src, ...(image.alt ? { alt: image.alt } : {}) };
}