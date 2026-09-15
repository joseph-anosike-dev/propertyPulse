# Property Pulse

# Real Estate Lead Engine - Technical Architecture & Build Brief

## Context & Objective

You are a senior full-stack web developer and system architect. You are building the complete core technical infrastructure for a high-converting Real Estate Lead Engine built specifically for the Nigerian real estate market.

The target system needs to look high-end, load extremely fast on mobile networks, automatically qualify property inquiries, and pass pre-qualified leads directly into an agent's WhatsApp with full lead context attached.

---

## 1. Core Stack & Architecture Requirements

- **Frontend:** Next.js (App Router, Server Components), React, Tailwind CSS, TypeScript.

- **Form Management & Validation:** React Hook Form + Zod validation.

- **Database / Backend:** Supabase (PostgreSQL, Row Level Security, Realtime).

- **SEO & Metadata:** Dynamic Open Graph images, Schema.org (`RealEstateAgent`, `SingleFamilyResidence`, `Offer`), XML Sitemap, Canonical URLs.

- **Analytics:** PostHog or Google Analytics 4 + Meta Pixel setup via event hooks.

- **Integrations:** WhatsApp Business API (or deep-linked `https://wa.me/` dynamic URL generation with encoded payloads).

---

## 2. Core Functional Modules to Implement

### CORE 01: Mobile-First Property Growth Site Structure

- Build responsive UI with strict mobile-first design.

- Sticky, non-intrusive CTA bar at the bottom of mobile screens ("Schedule Viewing", "Inquire via WhatsApp").

- Fast navigation bar, hero section with quick property search/filter, and high-conversion landing page structure.

### CORE 04: Dynamic Property Catalogue & Listing Engine

- Dynamic listing page structure (`/properties/[slug]`).

- Schema fields per property:

  - Title, Price (formatted in ₦ NGN), Location (State, L态/City, Area/Neighborhood).

  - Specs: Bedrooms, Bathrooms, Sqm, Parking, Title Document Type (e.g., C of O, Governor's Consent, Gazette).

  - Status Tag: `Available`, `Under Offer`, `Sold`.

  - Media Gallery (optimized WebP image rendering with carousel/lightbox support).

  - Micro-location context & neighborhood highlights.

### CORE 05 & 06: Lead Qualification & WhatsApp Conversion Pipeline

- Create a multi-step modal/drawer lead qualification form (`LeadQualificationForm.tsx`).

- **Qualification Steps:**

  1. Intent/Purpose: (Buying for Self, Investment/Buy-to-Let, Shortlet).

  2. Timeline: (Immediate / < 30 days, 1–3 months, Just Exploring).

  3. Budget Range (in ₦): (e.g., ₦30m–₦50m, ₦50m–₦100m, ₦100m+).

  4. Payment Structure: (Outright Cash, Payment Plan / Installments, Mortgage).

  5. Prospect Contact Info: Full Name, Phone / WhatsApp Number, Email.

- **WhatsApp Dynamic Routing Logic:**

  - Upon submitting the form, write the record to Supabase (`leads` table).

  - Instantly construct a pre-filled, URI-encoded WhatsApp text string directed to the agent's number.

  - *Payload Structure:*

    > "Hello [Agent Name], I'm interested in *[Property Title]* (Ref: [ID]).

    > 👤 **Name:** [Prospect Name]

    > 🎯 **Purpose:** [Investment/Personal]

    > ⏱ **Timeline:** [Timeline]

    > 💰 **Budget:** [Budget]

    > 💳 **Payment:** [Outright/Installment]

    > 📱 **Phone:** [Phone Number]

    > Please contact me regarding a viewing."

  - Auto-redirect user to `https://wa.me/[AgentWhatsAppNumber]?text=[EncodedPayload]`.

### CORE 07: Viewing & Follow-Up Stage Management

- Database table: `viewings` linked to `leads` and `properties`.

- Allow prospects to pick preferred date and time slot for physical/virtual inspection.

- Trigger confirmation state and save viewing request pipeline status (`New`, `Qualified`, `Viewing Scheduled`, `Completed`, `Offer Made`, `Closed`).

### CORE 08: Analytics & Lead Attribution Layer

- Event listeners for key funnel actions:

  - `property_view`

  - `qualification_form_started`

  - `qualification_form_completed`

  - `whatsapp_redirect_clicked`

- Send event metadata (Property ID, Price, Source, Referral UTMs) to analytics providers.

---

## 3. Database Schema (Supabase / Postgres SQL Script)

Please write the complete SQL migration file creating:

1. `properties` table (with all specs, media JSON arrays, status, location details).

2. `leads` table (storing budget, timeline, purpose, payment choice, WhatsApp status).

3. `viewings` table (linking lead, property, date, status).

4. Row Level Security policies for public reads on published properties and secure lead ingestion.

---

## 4. Immediate Code Output Required

Please build out the project structure and provide code for:

1. The **Supabase Schema SQL Script**.

2. The **Lead Qualification Form Component** (`LeadQualificationForm.tsx`) using React Hook Form + Zod.

3. The **WhatsApp URL Generator Utility Function** (`generateWhatsAppLink.ts`).

4. The **Property Listing Dynamic Route Page** (`app/properties/[slug]/page.tsx`) showcasing the listing, metadata setup, and integrated lead form modal.

Ensure all monetary values use `₦` (Naira) formatting with proper locale string separators (e.g., `₦150,000,000`). Make the UI clean, modern, high-converting, and fast.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9304bd8a-e022-49a4-87d4-f75c40b2061a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
