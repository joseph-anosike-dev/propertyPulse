import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, BedDouble, CalendarDays, Check, FileCheck2, MapPin, Maximize2, MessageCircle, ParkingSquare } from "lucide-react";
import { useEffect, useState } from "react";

import { LeadQualificationForm } from "@/components/LeadQualificationForm";
import { trackFunnelEvent } from "@/lib/analytics";
import { getPublishedProperty } from "@/lib/properties.functions";
import { getPropertyImages } from "@/lib/property-media";

export const Route = createFileRoute("/properties/$slug")({
  loader: ({ params }) => getPublishedProperty({ data: { slug: params.slug } }),
  head: ({ loaderData }) => ({ meta: [
    { title: loaderData ? `${loaderData.title} | Olori Properties` : "Property | Olori Properties" },
    { name: "description", content: loaderData?.description ?? "Explore a distinctive property from Olori Properties." },
    { property: "og:title", content: loaderData?.title ?? "Property | Olori Properties" },
    { property: "og:description", content: loaderData?.description ?? "Explore a distinctive property from Olori Properties." },
    { property: "og:type", content: "product" },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:url", content: loaderData ? `/properties/${loaderData.slug}` : "/properties" },
  ], links: [{ rel: "canonical", href: loaderData ? `/properties/${loaderData.slug}` : "/properties" }] }),
  notFoundComponent: () => <div className="empty-state shell"><p className="eyebrow">Property unavailable</p><h1>This address has moved on.</h1><Link to="/" className="primary-button">View collection <ArrowUpRight size={16} /></Link></div>,
  component: PropertyDetail,
});

const formatNaira = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

function PropertyDetail() {
  const property = Route.useLoaderData();
  const [formOpen, setFormOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const images = getPropertyImages(property?.media ?? [], `${property?.title ?? "Property"} exterior`);
  useEffect(() => { trackFunnelEvent("property_view", { property_id: property?.id, property_title: property?.title, price_ngn: property?.price_ngn }); }, [property]);
  if (!property) return null;

  const schema = { "@context": "https://schema.org", "@type": "SingleFamilyResidence", name: property.title, description: property.description, url: typeof window === "undefined" ? undefined : window.location.href, image: typeof window === "undefined" ? undefined : `${window.location.origin}${images[0].src}`, address: { "@type": "PostalAddress", addressLocality: property.city, addressRegion: property.state, addressCountry: "NG" }, numberOfBedrooms: property.bedrooms, floorSize: { "@type": "QuantitativeValue", value: property.area_sqm, unitCode: "MTK" }, offers: { "@type": "Offer", price: property.price_ngn, priceCurrency: "NGN", availability: property.status === "available" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability" } };
    return <div className="property-detail page-shell"><div className="shell"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to collection</Link><div className="detail-grid"><div className="detail-media"><img src={images[0].src} width={1600} height={1008} alt={images[0].alt} /><button type="button" className="media-expand" aria-label="Expand property image" title="Expand property image" onClick={() => setImageOpen(true)}><Maximize2 size={17} /></button><div className="media-count">01 / {String(images.length).padStart(2, "0")}</div></div><div className="detail-copy"><div className="flex items-center gap-3"><span className="status-tag status-tag-plain">{property.status === "under_offer" ? "Under offer" : property.status}</span><span className="property-ref">Ref. {property.id.slice(0, 8).toUpperCase()}</span></div><h1>{property.title}</h1><p className="detail-location"><MapPin size={16} /> {property.neighborhood}, {property.city}, {property.state}</p><div className="detail-price">{formatNaira(property.price_ngn)}</div><p className="detail-description">{property.description}</p><div className="detail-actions"><button type="button" className="primary-button" onClick={() => setFormOpen(true)}><MessageCircle size={17} /> Enquire about this home</button><button type="button" className="secondary-button" onClick={() => setFormOpen(true)}><CalendarDays size={17} /> Schedule a viewing</button></div><div className="quick-specs"><Spec icon={<BedDouble size={18} />} label="Bedrooms" value={`${property.bedrooms}`} /><Spec icon={<Check size={18} />} label="Bathrooms" value={`${property.bathrooms}`} /><Spec icon={<Maximize2 size={18} />} label="Internal area" value={`${property.area_sqm} m²`} /><Spec icon={<ParkingSquare size={18} />} label="Parking" value={`${property.parking} cars`} /></div></div></div></div><section className="detail-lower"><div className="shell grid gap-12 md:grid-cols-[1.1fr_0.9fr]"><div><p className="eyebrow">The details</p><h2>Made for the way life moves.</h2><p className="detail-long-copy">{property.description} Located in {property.neighborhood}, this address brings everyday ease together with a sense of privacy that’s increasingly rare.</p><div className="highlight-list">{property.highlights.map((highlight) => <div key={highlight}><Check size={16} /> {highlight}</div>)}</div></div><div className="detail-facts"><Fact icon={<FileCheck2 size={18} />} label="Title document" value={property.title_document} /><Fact icon={<MapPin size={18} />} label="Micro-location" value={`${property.neighborhood}, ${property.city}`} /><Fact icon={<ParkingSquare size={18} />} label="Viewing" value="Physical or virtual tour" /></div></div></section><script type="application/ld+json">{JSON.stringify(schema)}</script><div className="mobile-cta"><button type="button" className="primary-button" onClick={() => setFormOpen(true)}><MessageCircle size={17} /> Enquire via WhatsApp</button></div><LeadQualificationForm property={property} open={formOpen} onClose={() => setFormOpen(false)} /><div className="image-lightbox" hidden={!imageOpen} role="dialog" aria-modal="true" aria-label={`${property.title} image viewer`}><button type="button" className="icon-button" aria-label="Close image viewer" title="Close image viewer" onClick={() => setImageOpen(false)}><X size={18} /></button><img src={images[0].src} width={1600} height={1008} alt={`${images[0].alt} enlarged`} /></div></div>;
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div><span className="spec-icon">{icon}</span><small>{label}</small><strong>{value}</strong></div>; }
function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="fact-row"><span className="spec-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>; }