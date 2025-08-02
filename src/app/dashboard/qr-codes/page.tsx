import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QrCode, Eye, Calendar, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { getQrCodes } from "@/server/qr-codes";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function QrCodesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { success, qrCodes } = await getQrCodes(session.user.id);

  if (!success) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load QR codes</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
          <p className="text-muted-foreground">
            Manage and track your QR codes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="mr-2 h-4 w-4" />
            Create QR Code
          </Link>
        </Button>
      </div>

      {qrCodes!.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No QR codes yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first QR code to start tracking scans and analytics
            </p>
            <Button asChild>
              <Link href="/dashboard/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First QR Code
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your QR Codes</CardTitle>
            <CardDescription>
              {qrCodes!.length} QR code{qrCodes!.length !== 1 ? "s" : ""}{" "}
              created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Scans</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes!.map((qrCode) => (
                  <TableRow key={qrCode.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        {qrCode.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-xs">
                        <span className="truncate">{qrCode.url}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-6 w-6 p-0"
                        >
                          <a
                            href={qrCode.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={qrCode.isActive ? "default" : "secondary"}
                      >
                        {qrCode.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" />
                        {qrCode.scanCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(qrCode.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/qr-codes/${qrCode.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
