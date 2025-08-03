"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateName({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: "Unauthorized" } as const;
    }

    if (session.user.id !== userId) {
      return { success: false, error: "Forbidden" } as const;
    }

    await db.update(userTable).set({ name }).where(eq(userTable.id, userId));

    return { success: true } as const;
  } catch (e) {
    console.error(e);
    return { success: false, error: "Unexpected error" } as const;
  }
}
