import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Sends a push notification to one subscription. Returns "gone" when the
 * subscription is no longer valid so the caller can delete it, "ok" on
 * success, or "error" for anything else (network issues, etc).
 */
export async function sendPush(
  sub: PushSubscriptionRow,
  payload: PushPayload
): Promise<"ok" | "gone" | "error"> {
  ensureConfigured();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload)
    );
    return "ok";
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.statusCode === 410) return "gone";
    return "error";
  }
}
