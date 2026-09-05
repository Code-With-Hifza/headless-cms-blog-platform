import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function createAuditLog(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}) {
  try {
    const [log] = await db
      .insert(auditLogs)
      .values({
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details || null,
        ipAddress: params.ipAddress || null,
      })
      .returning();
    return log;
  } catch (err) {
    console.error("Failed to create audit log:", err);
    return null;
  }
}

export async function getAuditLogs(limit = 50) {
  return await db.query.auditLogs.findMany({
    orderBy: [desc(auditLogs.createdAt)],
    limit,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
