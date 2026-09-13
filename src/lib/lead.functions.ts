import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

export const leadFormSchema = z.object({
  propertyId: z.string().uuid(),
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  phone: z.string().trim().regex(/^[0-9+() -]{7,25}$/, "Enter a valid phone or WhatsApp number."),
  email: z.string().trim().email("Enter a valid email address.").max(255).or(z.literal("")),
  purpose: z.enum(["Buying for self", "Investment / Buy-to-let", "Shortlet"]),
  timeline: z.enum(["Immediate / under 30 days", "1–3 months", "Just exploring"]),
  budgetRange: z.enum(["₦30m–₦50m", "₦50m–₦100m", "₦100m+"]),
  paymentStructure: z.enum(["Outright cash", "Payment plan / installments", "Mortgage"]),
  viewingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a viewing date.").or(z.literal("")),
  viewingTime: z.enum(["Morning · 9am–12pm", "Afternoon · 12pm–3pm", "Evening · 3pm–6pm", ""]).or(z.literal("")),
  viewingMode: z.enum(["Physical inspection", "Virtual tour"]),
  source: z.string().max(120).optional(),
  referralData: z.record(z.string()).default({}),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

function createPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Lead capture is not configured.");

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadFormSchema.parse(input))
  .handler(async ({ data }) => {
    const client = createPublicClient();
    const leadInsert = {
      property_id: data.propertyId,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email || null,
      purpose: data.purpose,
      timeline: data.timeline,
      budget_range: data.budgetRange,
      payment_structure: data.paymentStructure,
      source: data.source || null,
      referral_data: data.referralData,
    };

    const { data: lead, error } = await client.from("leads").insert(leadInsert).select("id").single();
    if (error || !lead) throw new Error("We could not save your enquiry. Please try again.");

    if (data.viewingDate && data.viewingTime) {
      const { error: viewingError } = await client.from("viewings").insert({
        lead_id: lead.id,
        property_id: data.propertyId,
        preferred_date: data.viewingDate,
        preferred_time: data.viewingTime,
        mode: data.viewingMode,
      });

      if (viewingError) throw new Error("Your enquiry was saved, but the viewing request could not be added.");
    }

    return { leadId: lead.id };
  });