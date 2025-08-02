"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { Scan } from "@/server/qr-codes";

interface CountryMapChartProps {
  scans: Scan[];
  title?: string;
  description?: string;
  maxCountries?: number;
}

const chartConfig = {
  visits: {
    label: "Visits",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Country code to flag emoji mapping
const countryFlags: Record<string, string> = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Japan: "🇯🇵",
  Australia: "🇦🇺",
  Brazil: "🇧🇷",
  India: "🇮🇳",
  China: "🇨🇳",
  Russia: "🇷🇺",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Denmark: "🇩🇰",
  Finland: "🇫🇮",
  Switzerland: "🇨🇭",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  Poland: "🇵🇱",
  "Czech Republic": "🇨🇿",
  Hungary: "🇭🇺",
  Portugal: "🇵🇹",
  Greece: "🇬🇷",
  Turkey: "🇹🇷",
  "South Korea": "🇰🇷",
  Mexico: "🇲🇽",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  Peru: "🇵🇪",
  Venezuela: "🇻🇪",
  "South Africa": "🇿🇦",
  Egypt: "🇪🇬",
  Nigeria: "🇳🇬",
  Kenya: "🇰🇪",
  Morocco: "🇲🇦",
  Israel: "🇮🇱",
  "Saudi Arabia": "🇸🇦",
  UAE: "🇦🇪",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
  Singapore: "🇸🇬",
  Malaysia: "🇲🇾",
  Indonesia: "🇮🇩",
  Philippines: "🇵🇭",
  "New Zealand": "🇳🇿",
};

export function CountryMapChart({
  scans,
  title = "Global Visits",
  description = "Countries with the most visits",
  maxCountries = 10,
}: CountryMapChartProps) {
  // Process country data
  const countryStats = scans.reduce((acc, scan) => {
    const country = scan.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(countryStats)
    .map(([name, visits]) => ({
      name,
      visits,
      flag: countryFlags[name] || "🌍",
      displayName: name.length > 12 ? name.substring(0, 12) + "..." : name,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, maxCountries);

  const totalVisits = countryData.reduce((sum, item) => sum + item.visits, 0);

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: { name: string; flag: string }; value: number }>;

  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalVisits) * 100).toFixed(1);
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Country
              </span>
              <span className="font-bold text-muted-foreground">
                {data.payload.flag} {data.payload.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Visits
              </span>
              <span className="font-bold">
                {data.value} ({percentage}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {countryData.length > 0 ? (
          <>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <BarChart
                accessibilityLayer
                data={countryData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayName"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="visits"
                  fill="var(--primary)"
                  radius={8}
                  maxBarSize={100}
                />
              </BarChart>
            </ChartContainer>

            {/* Country list with flags */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Top Countries</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {countryData.slice(0, 6).map((country, index) => {
                  const percentage = (
                    (country.visits / totalVisits) *
                    100
                  ).toFixed(1);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <span className="font-medium">{country.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{country.visits}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No country data available yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
