import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CalendarDays, Check, MessageCircle, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { trackFunnelEvent } from "@/lib/analytics";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";
import { leadFormSchema, submitLead, type LeadFormValues } from "@/lib/lead.functions";
import { getReferralData } from "@/lib/analytics";
import { useServerFn } from "@tanstack/react-start";

interface LeadQualificationFormProps {
  property: {
    id: string;
    title: string;
    agent_name: string;
    agent_whatsapp: string;
  };
  open: boolean;
  onClose: () => void;
}

const steps = ["Your intent", "Your timing", "Your budget", "Your details"];

export function LeadQualificationForm({ property, open, onClose }: LeadQualificationFormProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [referralData, setReferralData] = useState<Record<string, string>>({});
  const submitLeadFn = useServerFn(submitLead);
  useEffect(() => setReferralData(getReferralData()), []);
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      propertyId: property.id,
      email: "",
      viewingDate: "",
      viewingTime: "",
      viewingMode: "Physical inspection",
      referralData: {},
    },
  });

  const fieldGroups = useMemo(() => [
    ["purpose"],
    ["timeline"],
    ["budgetRange", "paymentStructure"],
    ["fullName", "phone", "email", "viewingDate", "viewingTime", "viewingMode"],
  ], []);

  if (!open) return null;

  const nextStep = async () => {
    const valid = await trigger(fieldGroups[step] as Array<keyof LeadFormValues>);
    if (!valid) return;
    if (step === 0) trackFunnelEvent("qualification_form_started", { property_id: property.id, property_title: property.title });
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);
    try {
       await submitLeadFn({ data: { ...values, propertyId: property.id, source: values.source || referralData["utm_source"], referralData: { ...referralData, ...values.referralData } } });
      trackFunnelEvent("qualification_form_completed", { property_id: property.id, property_title: property.title });
      setCompleted(true);
      const link = generateWhatsAppLink({
        agentName: property.agent_name,
        agentWhatsApp: property.agent_whatsapp,
        propertyTitle: property.title,
        propertyId: property.id,
        fullName: values.fullName,
        purpose: values.purpose,
        timeline: values.timeline,
        budget: values.budgetRange,
        payment: values.paymentStructure,
        phone: values.phone,
      });
      window.setTimeout(() => {
        trackFunnelEvent("whatsapp_redirect_clicked", { property_id: property.id, property_title: property.title });
        window.location.assign(link);
      }, 900);
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not save your enquiry. Please try again.";
      window.alert(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="lead-form-title">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto bg-paper shadow-2xl sm:border sm:border-line">
        <div className="flex items-start justify-between border-b border-line px-5 py-5 sm:px-8">
          <div>
            <p className="eyebrow">Private enquiry</p>
            <h2 id="lead-form-title" className="mt-2 font-display text-3xl font-semibold text-ink">Let’s make this move.</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate">A few quick details help us make your viewing useful.</p>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Close enquiry form" title="Close enquiry form"><X size={19} /></button>
        </div>

        {completed ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-8 py-12 text-center">
            <div className="success-mark"><Check size={24} /></div>
            <h3 className="mt-6 font-display text-2xl font-semibold text-ink">Enquiry received.</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate">WhatsApp is opening with your property details and preferences ready to send.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-6 sm:px-8 sm:py-8">
            <input type="hidden" {...register("propertyId")} />
            <div className="mb-8 flex items-center gap-2">
              {steps.map((label, index) => <div key={label} className={`step-dot ${index <= step ? "step-dot-active" : ""}`}><span>{index + 1}</span><small>{label}</small></div>)}
            </div>

            {step === 0 && <ChoiceStep title="What brings you to this property?" options={["Buying for self", "Investment / Buy-to-let", "Shortlet"]} input={register("purpose")} error={errors.purpose?.message} />}
            {step === 1 && <ChoiceStep title="When would you like to make a move?" options={["Immediate / under 30 days", "1–3 months", "Just exploring"]} input={register("timeline")} error={errors.timeline?.message} />}
            {step === 2 && <div className="space-y-8"><ChoiceStep title="What range are you working with?" options={["₦30m–₦50m", "₦50m–₦100m", "₦100m+"]} input={register("budgetRange")} error={errors.budgetRange?.message} /><ChoiceStep title="How do you plan to pay?" options={["Outright cash", "Payment plan / installments", "Mortgage"]} input={register("paymentStructure")} error={errors.paymentStructure?.message} /></div>}
            {step === 3 && <div><h3 className="form-question">Where should we send the details?</h3><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" error={errors.fullName?.message}><input className="field" placeholder="e.g. Amaka Okafor" {...register("fullName")} /></Field><Field label="Phone / WhatsApp" error={errors.phone?.message}><input className="field" placeholder="e.g. 0803 123 4567" inputMode="tel" {...register("phone")} /></Field><Field label="Email (optional)" error={errors.email?.message}><input className="field" placeholder="you@example.com" inputMode="email" {...register("email")} /></Field></div><div className="mt-8 border-t border-line pt-7"><div className="flex items-center gap-2"><CalendarDays size={17} className="text-coral" /><h3 className="text-sm font-semibold text-ink">Prefer to schedule a viewing?</h3></div><p className="mt-1 text-xs leading-5 text-slate">Optional — choose a date and we’ll confirm the time with you.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Preferred date" error={errors.viewingDate?.message}><input type="date" className="field" min={new Date().toISOString().slice(0, 10)} {...register("viewingDate")} /></Field><Field label="Time window" error={errors.viewingTime?.message}><select className="field" {...register("viewingTime")}><option value="">Choose a time</option><option>Morning · 9am–12pm</option><option>Afternoon · 12pm–3pm</option><option>Evening · 3pm–6pm</option></select></Field></div><div className="mt-4 flex gap-3"><label className="radio-choice"><input type="radio" value="Physical inspection" {...register("viewingMode")} /> Physical</label><label className="radio-choice"><input type="radio" value="Virtual tour" {...register("viewingMode")} /> Virtual</label></div></div></div>}

            <div className="mt-9 flex items-center justify-between gap-3 border-t border-line pt-5"><button type="button" className="text-button" onClick={() => step === 0 ? onClose() : setStep((current) => current - 1)}><ArrowLeft size={16} /> {step === 0 ? "Not now" : "Back"}</button>{step < steps.length - 1 ? <button type="button" className="primary-button" onClick={nextStep}>Continue <ArrowRight size={16} /></button> : <button type="submit" className="primary-button" disabled={isSubmitting}><MessageCircle size={17} /> {isSubmitting ? "Saving…" : "Continue to WhatsApp"}</button>}</div>
          </form>
        )}
      </div>
    </div>
  );
}

function ChoiceStep({ title, options, input, error }: { title: string; options: string[]; input: UseFormRegisterReturn; error?: string | undefined }) {
  return <div><h3 className="form-question">{title}</h3><div className="space-y-3">{options.map((option) => <label key={option} className="choice-card"><input type="radio" value={option} {...input} /><span>{option}</span><span className="choice-check"><Check size={14} /></span></label>)}</div>{error && <p className="field-error">{error}</p>}</div>;
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: ReactNode }) {
  return <label className="block"><span className="field-label">{label}</span>{children}{error && <span className="field-error">{error}</span>}</label>;
}