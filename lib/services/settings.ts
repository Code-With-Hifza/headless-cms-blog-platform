import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSiteSettings() {
  const settings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, "default"),
  });

  if (!settings) {
    // Seed default settings row if missing
    const [created] = await db
      .insert(siteSettings)
      .values({
        id: "default",
        siteName: "ContentFlow",
        siteDescription: "A modern, high-performance headless CMS and digital publishing platform.",
        allowComments: true,
        requireCommentModeration: true,
        allowRegistration: true,
        defaultRole: "USER",
      })
      .returning();
    return created;
  }

  return settings;
}

export async function updateSiteSettings(data: Partial<{
  siteName: string;
  siteDescription: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  socialLinks: Record<string, string>;
  allowComments: boolean;
  requireCommentModeration: boolean;
  allowRegistration: boolean;
  defaultRole: string;
}>) {
  const [updated] = await db
    .insert(siteSettings)
    .values({
      id: "default",
      siteName: data.siteName || "ContentFlow",
      siteDescription: data.siteDescription || "Modern publishing platform",
      logoUrl: data.logoUrl || null,
      faviconUrl: data.faviconUrl || null,
      socialLinks: data.socialLinks || {},
      allowComments: data.allowComments ?? true,
      requireCommentModeration: data.requireCommentModeration ?? true,
      allowRegistration: data.allowRegistration ?? true,
      defaultRole: data.defaultRole || "USER",
    })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    })
    .returning();

  return updated;
}
