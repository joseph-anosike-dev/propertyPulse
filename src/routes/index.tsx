import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BedDouble, MapPin, MoveUpRight, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import homeImage from "@/assets/lagos-modern-home.jpg";
import { listPublishedProperties } from "@/lib/properties.functions";
import { getPropertyImages } from "@/lib/property-media";

export const Route = createFileRoute("/")({
  loader: () => listPublishedProperties(),
  head: () => ({ meta: [
    { title: "Olori Properties | Distinctive Nigerian homes" },
    { name: "description", content: "Browse distinctive homes in Lagos and across Nigeria, then plan your next move with a property adviser." },
    { property: "og:title", content: "Olori Properties | Distinctive Nigerian homes" },
    { property: "og:description", content: "Browse distinctive homes in Lagos and across Nigeria, then plan your next move with a property adviser." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:url", content: "/" },
  ], links: [{ rel: "canonical", href: "/" }] }),
  component: Index,
});

const formatNaira = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

function Index() {
  const properties = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All locations");
  const filteredProperties = useMemo(() => properties.filter((property) => {
    const matchesQuery = `${property.title} ${property.neighborhood} ${property.city}`.toLowerCase().includes(query.toLowerCase());
    const matchesLocation = location === "All locations" || property.city === location;
    return matchesQuery && matchesLocation;
  }), [location, properties, query]);

  return <div className="page-shell">
    <section className="home-hero shell">
      <div className="hero-copy">
        <p className="eyebrow">Property, with perspective</p>
        <h1>Find a place that feels <em>like yours.</em></h1>
         <p className="hero-intro">Distinctive homes, carefully considered locations, and an adviser who listens before they recommend.</p>
        <div className="search-panel">
          <div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a home or neighbourhood" aria-label="Search homes" /></div>
          <select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Filter by location"><option>All locations</option><option>Lekki</option><option>Lagos Island</option></select>
          <button type="button" className="search-button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>Explore <ArrowRight size={17} /></button>
        </div>
        <div className="hero-notes"><span><ShieldCheck size={16} /> Verified listings</span><span><Sparkles size={16} /> Personal guidance</span></div>
      </div>
      <div className="hero-visual"><img src={homeImage} width={1600} height={1008} alt="Modern tropical home in Lagos" /><div className="hero-visual-caption"><span>01 / Signature collection</span><strong>The Ivy Residence</strong><small>Pinnock Beach Estate · Lagos</small></div></div>
    </section>

    <section id="collection" className="collection-section shell">
      <div className="section-heading"><div><p className="eyebrow">The collection</p><h2>Homes with a point of view.</h2></div><p className="section-intro">From first homes to long-term investments, every address is selected for how it lives — not just how it looks.</p></div>
      {filteredProperties.length ? <div className="property-grid">{filteredProperties.map((property, index) => <PropertyCard key={property.id} property={property} featured={index === 0} />)}</div> : <div className="empty-state"><p className="eyebrow">No exact match</p><p>Try a different neighbourhood or clear your search.</p><button type="button" className="text-button" onClick={() => { setQuery(""); setLocation("All locations"); }}>Clear filters <ArrowRight size={15} /></button></div>}
    </section>

    <section id="approach" className="approach-band"><div className="shell grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-start"><div><p className="eyebrow">The Olori way</p><h2>A calmer route to a better decision.</h2></div><div className="approach-grid"><div><span className="number">01</span><h3>We curate</h3><p>Less scrolling, more signal. A small collection of properties with a clear point of difference.</p></div><div><span className="number">02</span><h3>We qualify</h3><p>Tell us what matters, and we’ll shape the shortlist around your timeline and ambitions.</p></div><div><span className="number">03</span><h3>We stay close</h3><p>From first viewing to final signature, you’ll have a thoughtful human on the other side.</p></div></div></div></section>
    <section className="closing-band shell"><div><p className="eyebrow">Ready when you are</p><h2>Let’s find your next address.</h2></div><Link to="/" className="primary-button">Start exploring <MoveUpRight size={16} /></Link></section>
  </div>;
}

function PropertyCard({ property, featured }: { property: (typeof Route.useLoaderData extends () => infer T ? T : never)[number]; featured: boolean }) {
  const image = getPropertyImages(property.media, `${property.title} exterior`)[0];
  return <Link to="/properties/$slug" params={{ slug: property.slug }} className={`property-card ${featured ? "property-card-featured" : ""}`}>
    <div className="property-image"><img src={image.src} width={1600} height={1008} loading="lazy" alt={image.alt} /><span className="status-tag">{property.status === "under_offer" ? "Under offer" : property.status}</span><span className="card-arrow"><MoveUpRight size={17} /></span></div>
    <div className="property-card-body"><div className="flex items-start justify-between gap-4"><div><p className="property-location"><MapPin size={14} /> {property.neighborhood}, {property.city}</p><h3>{property.title}</h3></div><strong className="property-price">{formatNaira(property.price_ngn)}</strong></div><div className="property-specs"><span><BedDouble size={15} /> {property.bedrooms} beds</span><span>{property.bathrooms} baths</span><span>{property.area_sqm} m²</span></div></div>
  </Link>;
}
