"use server";

import { db } from "@/db/drizzle";
import { qrCode, qrCodeScan } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type QrCode = InferSelectModel<typeof qrCode>;
export type Scan = InferSelectModel<typeof qrCodeScan>;
import { eq, desc, count, sql, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export async function createQrCode(data: {
  name: string;
  url: string;
  description?: string;
  userId: string;
}) {
  try {
    const id = nanoid();

    const [newQrCode] = await db
      .insert(qrCode)
      .values({
        id,
        name: data.name,
        url: data.url,
        description: data.description,
        userId: data.userId,
      })
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/qr-codes");

    return { success: true, qrCode: newQrCode };
  } catch (error) {
    console.error("Error creating QR code:", error);
    return { success: false, error: "Failed to create QR code" };
  }
}

export async function getQrCodes(userId: string) {
  try {
    const qrCodes = await db
      .select({
        id: qrCode.id,
        name: qrCode.name,
        url: qrCode.url,
        description: qrCode.description,
        isActive: qrCode.isActive,
        createdAt: qrCode.createdAt,
        updatedAt: qrCode.updatedAt,
        scanCount: count(qrCodeScan.id),
      })
      .from(qrCode)
      .leftJoin(qrCodeScan, eq(qrCode.id, qrCodeScan.qrCodeId))
      .where(eq(qrCode.userId, userId))
      .groupBy(qrCode.id)
      .orderBy(desc(qrCode.createdAt));

    return { success: true, qrCodes };
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return { success: false, error: "Failed to fetch QR codes" };
  }
}

export async function getQrCodeById(id: string, userId: string) {
  try {
    const [qrCodeData] = await db
      .select()
      .from(qrCode)
      .where(and(eq(qrCode.id, id), eq(qrCode.userId, userId)))
      .limit(1);

    if (!qrCodeData) {
      return { success: false, error: "QR code not found" };
    }

    const scans = await db
      .select()
      .from(qrCodeScan)
      .where(eq(qrCodeScan.qrCodeId, id))
      .orderBy(desc(qrCodeScan.scannedAt));

    const scanStats = await db
      .select({
        date: sql<string>`DATE(${qrCodeScan.scannedAt})`,
        count: count(qrCodeScan.id),
      })
      .from(qrCodeScan)
      .where(eq(qrCodeScan.qrCodeId, id))
      .groupBy(sql`DATE(${qrCodeScan.scannedAt})`)
      .orderBy(sql`DATE(${qrCodeScan.scannedAt})`);

    console.log(qrCodeData);

    return {
      success: true,
      qrCode: qrCodeData,
      scans,
      scanStats,
    };
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return { success: false, error: "Failed to fetch QR code" };
  }
}

export async function updateQrCode(
  id: string,
  userId: string,
  data: {
    name?: string;
    url?: string;
    description?: string;
    isActive?: boolean;
  }
) {
  try {
    const [updatedQrCode] = await db
      .update(qrCode)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(qrCode.id, id), eq(qrCode.userId, userId)))
      .returning();

    if (!updatedQrCode) {
      return { success: false, error: "QR code not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/qr-codes");
    revalidatePath(`/dashboard/qr-codes/${id}`);

    return { success: true, qrCode: updatedQrCode };
  } catch (error) {
    console.error("Error updating QR code:", error);
    return { success: false, error: "Failed to update QR code" };
  }
}

export async function deleteQrCode(id: string, userId: string) {
  try {
    const [deletedQrCode] = await db
      .delete(qrCode)
      .where(eq(qrCode.id, id) && eq(qrCode.userId, userId))
      .returning();

    if (!deletedQrCode) {
      return { success: false, error: "QR code not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/qr-codes");

    return { success: true };
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return { success: false, error: "Failed to delete QR code" };
  }
}

export async function recordQrCodeScan(
  qrCodeId: string,
  data: {
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    os?: string;
    browser?: string;
  }
) {
  try {
    const scanId = nanoid();

    await db.insert(qrCodeScan).values({
      id: scanId,
      qrCodeId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      country: data.country,
      city: data.city,
      os: data.os,
      browser: data.browser,
    });

    return { success: true };
  } catch (error) {
    console.error("Error recording scan:", error);
    return { success: false, error: "Failed to record scan" };
  }
}

export interface ScanStat {
  date: string;
  count: number;
}

export interface RecentScan {
  date: string;
  count: number;
}

export interface TopQrCode {
  id: string;
  name: string;
  scanCount: number;
}

export interface TopCountry {
  country: string | null;
  scanCount: number;
}

export interface DashboardStats {
  totalQrCodes: number;
  totalScans: number;
  avgScansPerQr: number;
  recentScans: RecentScan[];
  topQrCodes: TopQrCode[];
  topCountries: TopCountry[];
  allScans: Scan[];
}

export async function getDashboardStats(
  userId: string
): Promise<{ success: boolean; stats?: DashboardStats; error?: string }> {
  try {
    const totalQrCodesResult = await db
      .select({ count: count() })
      .from(qrCode)
      .where(eq(qrCode.userId, userId));

    const totalQrCodes = totalQrCodesResult[0]?.count || 0;

    const totalScansResult = await db
      .select({ count: count() })
      .from(qrCodeScan)
      .leftJoin(qrCode, eq(qrCodeScan.qrCodeId, qrCode.id))
      .where(eq(qrCode.userId, userId));

    const totalScans = totalScansResult[0]?.count || 0;

    const avgScansPerQr = totalQrCodes > 0 ? totalScans / totalQrCodes : 0;

    const recentScans = await db
      .select({
        date: sql<string>`DATE(${qrCodeScan.scannedAt})`,
        count: count(qrCodeScan.id),
      })
      .from(qrCodeScan)
      .leftJoin(qrCode, eq(qrCodeScan.qrCodeId, qrCode.id))
      .where(eq(qrCode.userId, userId))
      .groupBy(sql`DATE(${qrCodeScan.scannedAt})`)
      .orderBy(sql`DATE(${qrCodeScan.scannedAt})`)
      .limit(30);

    const topQrCodes = await db
      .select({
        id: qrCode.id,
        name: qrCode.name,
        scanCount: count(qrCodeScan.id),
      })
      .from(qrCode)
      .leftJoin(qrCodeScan, eq(qrCode.id, qrCodeScan.qrCodeId))
      .where(eq(qrCode.userId, userId))
      .groupBy(qrCode.id, qrCode.name)
      .orderBy(desc(count(qrCodeScan.id)))
      .limit(5);

    const topCountries = await db
      .select({
        country: qrCodeScan.country,
        scanCount: count(qrCodeScan.id),
      })
      .from(qrCodeScan)
      .leftJoin(qrCode, eq(qrCodeScan.qrCodeId, qrCode.id))
      .where(eq(qrCode.userId, userId))
      .groupBy(qrCodeScan.country)
      .orderBy(desc(count(qrCodeScan.id)))
      .limit(5);

    // Get all scans for chart components
    const allScans = await db
      .select({
        id: qrCodeScan.id,
        qrCodeId: qrCodeScan.qrCodeId,
        scannedAt: qrCodeScan.scannedAt,
        ipAddress: qrCodeScan.ipAddress,
        userAgent: qrCodeScan.userAgent,
        country: qrCodeScan.country,
        city: qrCodeScan.city,
        os: qrCodeScan.os,
        browser: qrCodeScan.browser,
      })
      .from(qrCodeScan)
      .leftJoin(qrCode, eq(qrCodeScan.qrCodeId, qrCode.id))
      .where(eq(qrCode.userId, userId))
      .orderBy(desc(qrCodeScan.scannedAt));

    return {
      success: true,
      stats: {
        totalQrCodes,
        totalScans,
        avgScansPerQr,
        recentScans,
        topQrCodes,
        topCountries,
        allScans,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}
