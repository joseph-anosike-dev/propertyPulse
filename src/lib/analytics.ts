export type FunnelEventName =
  | "property_view"
  | "qualification_form_started"
  | "qualification_form_completed"
  | "whatsapp_redirect_clicked";

export function trackFunnelEvent(name: FunnelEventName, properties: Record<string, string | number | undefined>) {
  if (typeof window === "undefined") return;
  const cleanedProperties = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
  window.dispatchEvent(new CustomEvent("real-estate-funnel", { detail: { name, properties: cleanedProperties } }));
}

export function getReferralData() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref"].flatMap((key) => {
    const value = params.get(key);
    return value ? [[key, value]] : [];
  }));
}