"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { QrCode, Eye, TrendingUp, Calendar } from "lucide-react";
import { DashboardStats, RecentScan, TopQrCode } from "@/server/qr-codes";

const chartConfig = {
  scans: {
    label: "Scans",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface DashboardClientPageProps {
  stats: DashboardStats;
}

export default function DashboardClientPage({
  stats,
}: DashboardClientPageProps) {
  const chartData = stats.recentScans.map((item: RecentScan) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    scans: item.count,
  }));

  const topQrCodesChartData = stats.topQrCodes.map((item: TopQrCode) => ({
    name: item.name,
    scans: item.scanCount,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
          <QrCode className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQrCodes}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalScans}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Scans per QR
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.avgScansPerQr.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.recentScans[stats.recentScans.length - 1]?.count || 0} scans
            today
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Daily Scan Activity (Last 30 Days)</CardTitle>
          <CardDescription>Scans over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
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
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { day: "numeric" });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toLocaleString()}
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

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Top Performing QR Codes</CardTitle>
          <CardDescription>QR codes with the most scans</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={topQrCodesChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="scans" fill="var(--color-scans)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
          <CardDescription>Where your scans are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topCountries.length > 0 ? (
            <ul className="space-y-2">
              {stats.topCountries.map((country, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{country.country ?? "Unknown"}</span>
                  <Badge variant="secondary">{country.scanCount}</Badge>
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
    </div>
  );
}
