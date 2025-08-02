"use client";

import { QrCode, Scan, ScanStat } from "@/server/qr-codes";
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
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  QrCode as QrCodeIcon,
  Eye,
  Calendar,
  ExternalLink,
  Download,
  Edit,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { QrCodeActions } from "@/components/qr-code-actions";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const chartConfig = {
  scans: {
    label: "Scans",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface QrCodeDetailClientPageProps {
  qrCode: QrCode;
  scans: Scan[];
  scanStats: ScanStat[];
  qrCodeDataUrl: string;
}

export function QrCodeDetailClientPage({
  qrCode,
  scans,
  scanStats,
  qrCodeDataUrl,
}: QrCodeDetailClientPageProps) {
  const chartData = scanStats.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    scans: item.count,
  }));

  const totalScans = scans.length;
  const last7DaysScans = scans.filter((scan) => {
    const scanDate = new Date(scan.scannedAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return scanDate >= sevenDaysAgo;
  }).length;

  const countryStats = scans.reduce((acc, scan) => {
    if (scan.country) {
      acc[scan.country] = (acc[scan.country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryStats)
    .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/qr-codes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to QR Codes
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{qrCode.name}</h1>
          <p className="text-muted-foreground">
            Created on {new Date(qrCode.createdAt).toLocaleDateString()}
          </p>
        </div>
        <QrCodeActions qrCode={qrCode} />
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans}</div>
            <p className="text-xs text-muted-foreground">All time scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last7DaysScans}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <QrCodeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={qrCode.isActive ? "default" : "secondary"}
              className="text-sm"
            >
              {qrCode.isActive ? "Active" : "Inactive"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Current status</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(countryStats).length}
            </div>
            <p className="text-xs text-muted-foreground">Unique countries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
            <CardDescription>
              Scan this code to visit: {qrCode.url} (via tracking)
            </CardDescription>
            <CardDescription>
              Tracked URL: {window.location.origin + "/api/scan/" + qrCode.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <img
              src={qrCodeDataUrl}
              alt={`QR Code for ${qrCode.name}`}
              className="border rounded-lg"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={qrCode.url} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit URL
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scan History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Scan History</CardTitle>
            <CardDescription>Scans over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <YAxis
                  dataKey="scans"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="scans"
                  type="monotone"
                  stroke="var(--color-scans)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Countries Card */}
      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
          <CardDescription>Where your scans are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          {topCountries.length > 0 ? (
            <ul className="space-y-2">
              {topCountries.map((country, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{country.country}</span>
                  <Badge variant="secondary">{country.country}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No country data available yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Details</CardTitle>
          <CardDescription>Recent scan information</CardDescription>
        </CardHeader>
        <CardContent>
          {scans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Browser</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.slice(0, 10).map((scan, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(scan.scannedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{scan.country || "N/A"}</TableCell>
                    <TableCell>{scan.city || "N/A"}</TableCell>
                    <TableCell>{scan.os || "N/A"}</TableCell>
                    <TableCell>{scan.browser || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">No scans yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
