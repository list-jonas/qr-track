"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createQrCode } from "@/server/qr-codes";
import { QrCode, Loader2 } from "lucide-react";
import QRCodeLib from "qrcode";
import Image from "next/image";

import { useSession } from "@/hooks/use-session";

export default function CreateQrCodePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
  });

  const generateQrCodePreview = async (url: string) => {
    if (!url) {
      setQrCodeDataUrl(null);
      return;
    }

    try {
      // For preview, we'll show the tracking URL that would be generated
      const trackingUrl = `${window.location.origin}/api/scan/preview`;
      const dataUrl = await QRCodeLib.toDataURL(trackingUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code preview:", error);
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, url }));
    generateQrCodePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) {
      toast.error("Name and URL are required");
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      if (!session?.user?.id) {
        toast.error("You must be logged in to create QR codes");
        return;
      }

      const result = await createQrCode({
        ...formData,
        userId: session.user.id,
      });

      if (result.success) {
        toast.success("QR code created successfully!");
        router.push("/dashboard/qr-codes");
      } else {
        toast.error(result.error || "Failed to create QR code");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create QR Code</h1>
        <p className="text-muted-foreground">
          Generate a new QR code to track and manage
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Details</CardTitle>
            <CardDescription>
              Enter the information for your new QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="My QR Code"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description for your QR code"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Create QR Code
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Live preview of your QR code</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {qrCodeDataUrl ? (
              <div className="text-center space-y-4">
                <div className="relative w-48 h-48">
                  <Image
                    src={qrCodeDataUrl}
                    alt="QR Code Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  QR code for: {formData.url}
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4 py-12">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Enter a URL to see the QR code preview
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
