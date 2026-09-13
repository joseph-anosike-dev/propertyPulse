CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.property_status AS ENUM ('available', 'under_offer', 'sold');
CREATE TYPE public.lead_pipeline_status AS ENUM ('new', 'qualified', 'viewing_scheduled', 'completed', 'offer_made', 'closed');

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 20 AND 5000),
  price_ngn BIGINT NOT NULL CHECK (price_ngn > 0),
  state TEXT NOT NULL CHECK (char_length(state) BETWEEN 2 AND 80),
  city TEXT NOT NULL CHECK (char_length(city) BETWEEN 2 AND 80),
  neighborhood TEXT NOT NULL CHECK (char_length(neighborhood) BETWEEN 2 AND 120),
  bedrooms SMALLINT NOT NULL CHECK (bedrooms BETWEEN 0 AND 50),
  bathrooms SMALLINT NOT NULL CHECK (bathrooms BETWEEN 0 AND 50),
  area_sqm NUMERIC(10, 2) NOT NULL CHECK (area_sqm > 0),
  parking SMALLINT NOT NULL DEFAULT 0 CHECK (parking BETWEEN 0 AND 50),
  title_document TEXT NOT NULL CHECK (char_length(title_document) BETWEEN 2 AND 120),
  status public.property_status NOT NULL DEFAULT 'available',
  media JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(media) = 'array'),
  highlights TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  agent_name TEXT NOT NULL DEFAULT 'Olori Properties',
  agent_whatsapp TEXT NOT NULL CHECK (agent_whatsapp ~ '^[0-9]{10,15}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published properties" ON public.properties FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  phone TEXT NOT NULL CHECK (phone ~ '^[0-9+() -]{7,25}$'),
  email TEXT CHECK (email IS NULL OR (char_length(email) <= 255 AND email ~* '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')),
  purpose TEXT NOT NULL CHECK (purpose IN ('Buying for self', 'Investment / Buy-to-let', 'Shortlet')),
  timeline TEXT NOT NULL CHECK (timeline IN ('Immediate / under 30 days', '1–3 months', 'Just exploring')),
  budget_range TEXT NOT NULL CHECK (budget_range IN ('₦30m–₦50m', '₦50m–₦100m', '₦100m+')),
  payment_structure TEXT NOT NULL CHECK (payment_structure IN ('Outright cash', 'Payment plan / installments', 'Mortgage')),
  pipeline_status public.lead_pipeline_status NOT NULL DEFAULT 'new',
  whatsapp_status TEXT NOT NULL DEFAULT 'pending' CHECK (whatsapp_status IN ('pending', 'clicked', 'sent')),
  source TEXT CHECK (source IS NULL OR char_length(source) <= 120),
  referral_data JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(referral_data) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete leads" ON public.leads FOR DELETE TO authenticated USING (true);

CREATE TABLE public.viewings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
  preferred_date DATE NOT NULL CHECK (preferred_date >= CURRENT_DATE),
  preferred_time TEXT NOT NULL CHECK (preferred_time IN ('Morning · 9am–12pm', 'Afternoon · 12pm–3pm', 'Evening · 3pm–6pm')),
  mode TEXT NOT NULL DEFAULT 'Physical inspection' CHECK (mode IN ('Physical inspection', 'Virtual tour')),
  status public.lead_pipeline_status NOT NULL DEFAULT 'viewing_scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.viewings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.viewings TO authenticated;
GRANT ALL ON public.viewings TO service_role;
ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request a viewing" ON public.viewings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view viewing requests" ON public.viewings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update viewing requests" ON public.viewings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete viewing requests" ON public.viewings FOR DELETE TO authenticated USING (true);

CREATE INDEX properties_published_created_idx ON public.properties (is_published, created_at DESC);
CREATE INDEX properties_slug_idx ON public.properties (slug);
CREATE INDEX leads_property_created_idx ON public.leads (property_id, created_at DESC);
CREATE INDEX viewings_property_date_idx ON public.viewings (property_id, preferred_date);

INSERT INTO public.properties (slug, title, description, price_ngn, state, city, neighborhood, bedrooms, bathrooms, area_sqm, parking, title_document, status, media, highlights, is_published, agent_name, agent_whatsapp)
VALUES
  ('the-ivy-residence-lekki', 'The Ivy Residence', 'A quietly confident four-bedroom family home with generous proportions, soft daylight and a private garden made for Lagos evenings.', 150000000, 'Lagos', 'Lekki', 'Pinnock Beach Estate', 4, 5, 420.00, 3, 'Governor''s Consent', 'available', '[{"url":"/src/assets/lagos-modern-home.jpg","alt":"The Ivy Residence exterior"}]'::jsonb, ARRAY['Private garden and covered terrace', '24-hour estate security', 'Minutes from major schools and retail'], true, 'Olori Properties', '2348012345678'),
  ('harbour-view-penthouse-victoria-island', 'Harbour View Penthouse', 'An elevated three-bedroom penthouse for buyers who want an easy city rhythm, considered interiors and a view that opens up at golden hour.', 285000000, 'Lagos', 'Lagos Island', 'Victoria Island', 3, 4, 268.00, 2, 'C of O', 'available', '[{"url":"/src/assets/lagos-modern-home.jpg","alt":"Harbour View Penthouse exterior"}]'::jsonb, ARRAY['Panoramic city and water views', 'Residents'' gym and concierge', 'Fully fitted contemporary kitchen'], true, 'Olori Properties', '2348012345678');

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.viewings;