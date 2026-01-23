type WhatsAppTemplateLanguageCode = string;

export type AdminNewListingWhatsAppPayload = {
  id: string;
  title: string;
  user: { name: string; email: string };
  category: string;
  price: number;
};

export async function notifyAdminNewListingWhatsApp(listing: AdminNewListingWhatsAppPayload): Promise<{
  sent: boolean;
  skipped?: boolean;
  status?: number;
  response?: unknown;
}> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  // E.164 format without leading "+"
  // Example for Turkey: 905414042404
  const to = process.env.WHATSAPP_ADMIN_PHONE;

  const templateName = process.env.WHATSAPP_TEMPLATE_NEW_LISTING || 'yeni_ilan_bildirimi';
  const languageCode: WhatsAppTemplateLanguageCode = process.env.WHATSAPP_TEMPLATE_LANG || 'tr';
  const apiVersion = process.env.WHATSAPP_GRAPH_VERSION || 'v19.0';

  if (!token || !phoneNumberId || !to) {
    console.log('[whatsapp] skipped (missing env vars)', {
      hasToken: Boolean(token),
      hasPhoneNumberId: Boolean(phoneNumberId),
      hasTo: Boolean(to),
    });
    return { sent: false, skipped: true };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: listing.title }],
        },
      ],
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  // Best-effort: avoid keeping the event loop alive
  (timeout as any).unref?.();

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      console.error('[whatsapp] send failed', {
        status: res.status,
        response: json,
        listingId: listing.id,
      });
      return { sent: false, status: res.status, response: json };
    }

    console.log('[whatsapp] sent', {
      listingId: listing.id,
      status: res.status,
    });

    return { sent: true, status: res.status, response: json };
  } catch (error) {
    console.error('[whatsapp] send error', {
      listingId: listing.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { sent: false };
  } finally {
    clearTimeout(timeout);
  }
}

