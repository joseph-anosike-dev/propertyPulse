export interface WhatsAppLeadPayload {
  agentName: string;
  agentWhatsApp: string;
  propertyTitle: string;
  propertyId: string;
  fullName: string;
  purpose: string;
  timeline: string;
  budget: string;
  payment: string;
  phone: string;
}

export function generateWhatsAppLink(payload: WhatsAppLeadPayload) {
  const message = [
    `Hello ${payload.agentName}, I'm interested in *${payload.propertyTitle}* (Ref: ${payload.propertyId.slice(0, 8).toUpperCase()}).`,
    "",
    `👤 *Name:* ${payload.fullName}`,
    `🎯 *Purpose:* ${payload.purpose}`,
    `⏱ *Timeline:* ${payload.timeline}`,
    `💰 *Budget:* ${payload.budget}`,
    `💳 *Payment:* ${payload.payment}`,
    `📱 *Phone:* ${payload.phone}`,
    "",
    "Please contact me regarding a viewing.",
  ].join("\n");

  return `https://wa.me/${payload.agentWhatsApp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}