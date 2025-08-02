import { getQrCodeById } from "@/server/qr-codes";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import QRCodeLib from "qrcode";
import { QrCodeDetailClientPage } from "@/components/qr-code-detail-client-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QrCodeDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { success, qrCode, scans, scanStats, error } = await getQrCodeById(
    id,
    session.user.id
  );

  if (!success || !qrCode) {
    notFound();
  }

  // Generate QR code image with tracking URL
  const trackingUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/api/scan/${qrCode.id}`;
  const qrCodeDataUrl = await QRCodeLib.toDataURL(trackingUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return (
    <QrCodeDetailClientPage
      qrCode={qrCode}
      scans={scans!}
      scanStats={scanStats!}
      qrCodeDataUrl={qrCodeDataUrl}
    />
  );
}
