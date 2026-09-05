import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { sendEmail, getNewsletterWelcomeEmailTemplate } from "@/lib/email";

export async function getSubscribers() {
  return await db.query.newsletterSubscribers.findMany({
    orderBy: [desc(newsletterSubscribers.subscribedAt)],
  });
}

export async function subscribeNewsletter(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.email, normalizedEmail),
  });

  if (existing) {
    if (existing.status === "SUBSCRIBED") {
      return { success: true, message: "You are already subscribed to our newsletter!" };
    }
    // Resubscribe
    const token = crypto.randomUUID();
    await db
      .update(newsletterSubscribers)
      .set({
        status: "SUBSCRIBED",
        token,
        subscribedAt: new Date(),
        unsubscribedAt: null,
      })
      .where(eq(newsletterSubscribers.id, existing.id));

    return { success: true, message: "Welcome back! You have been resubscribed." };
  }

  const token = crypto.randomUUID();
  const [subscriber] = await db
    .insert(newsletterSubscribers)
    .values({
      email: normalizedEmail,
      status: "SUBSCRIBED",
      token,
    })
    .returning();

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${token}`;

  await sendEmail({
    to: normalizedEmail,
    subject: "Welcome to ContentFlow Newsletter",
    html: getNewsletterWelcomeEmailTemplate(unsubscribeUrl),
  });

  return { success: true, message: "Thank you for subscribing to our newsletter!" };
}

export async function unsubscribeNewsletter(token: string) {
  const subscriber = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.token, token),
  });

  if (!subscriber) {
    return { success: false, message: "Invalid or expired unsubscribe link." };
  }

  await db
    .update(newsletterSubscribers)
    .set({
      status: "UNSUBSCRIBED",
      unsubscribedAt: new Date(),
    })
    .where(eq(newsletterSubscribers.id, subscriber.id));

  return { success: true, message: "You have been unsubscribed successfully." };
}
