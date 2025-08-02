import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { qrCode } from "@/db/schema";
import { eq } from "drizzle-orm";
import { recordQrCodeScan } from "@/server/qr-codes";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the QR code from database
    const [qrCodeData] = await db
      .select()
      .from(qrCode)
      .where(eq(qrCode.id, id))
      .limit(1);

    if (!qrCodeData || !qrCodeData.isActive) {
      return NextResponse.json(
        { error: "QR code not found or inactive" },
        { status: 404 }
      );
    }

    // Get request information for analytics
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded
      ? forwarded.split(",")[0].trim()
      : headersList.get("x-real-ip") || undefined;

    let os: string | undefined;
    let browser: string | undefined;
    if (userAgent) {
      const ua = new UAParser(userAgent);
      os = ua.getOS().name || undefined;
      browser = ua.getBrowser().name || undefined;
    }

    // Get geographic information (you might want to use a service like ipapi.co)
    let country: string | undefined;
    let city: string | undefined;

    if (ipAddress && ipAddress !== "127.0.0.1" && ipAddress !== "::1") {
      try {
        const geoResponse = await fetch(
          `http://ip-api.com/json/${ipAddress}?fields=country,city`
        );
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          country = geoData.country;
          city = geoData.city;
        }
      } catch (error) {
        // Ignore geo lookup errors
        console.warn("Failed to get geographic data:", error);
      }
    }

    // Record the scan
    await recordQrCodeScan(id, {
      ipAddress,
      userAgent,
      country,
      city,
      os,
      browser,
    });

    // Redirect to the target URL
    return NextResponse.redirect(qrCodeData.url);
  } catch (error) {
    console.error("Error processing QR code scan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
