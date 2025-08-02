"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
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
import { Monitor, Smartphone } from "lucide-react";
import { Scan } from "@/server/qr-codes";

interface BrowserOsPieChartProps {
  scans: Scan[];
  title?: string;
  description?: string;
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
];

const chartConfig = {
  count: {
    label: "Count",
  },
} satisfies ChartConfig;

export function BrowserOsPieChart({
  scans,
  title = "Browser & OS Distribution",
  description = "Distribution of browsers and operating systems",
}: BrowserOsPieChartProps) {
  const [activeView, setActiveView] = useState<"browser" | "os">("browser");

  // Process browser data
  const browserStats = scans.reduce((acc, scan) => {
    const browser = scan.browser || "Unknown";
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browserData = Object.entries(browserStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 browsers

  // Process OS data
  const osStats = scans.reduce((acc, scan) => {
    const os = scan.os || "Unknown";
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const osData = Object.entries(osStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 operating systems

  const currentData = activeView === "browser" ? browserData : osData;
  const total = currentData.reduce((sum, item) => sum + item.value, 0);

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: { name: string }; value: number }>;
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {activeView === "browser" ? "Browser" : "OS"}
              </span>
              <span className="font-bold text-muted-foreground">
                {data.payload.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Count
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
    <Card className="p-0">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row mb-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex">
          {["browser", "os"].map((key) => {
            const isActive = activeView === key;
            return (
              <button
                key={key}
                data-active={isActive}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveView(key as "browser" | "os")}
              >
                <span className="text-xs text-muted-foreground">
                  {key === "browser" ? (
                    <Monitor className="h-4 w-4" />
                  ) : (
                    <Smartphone className="h-4 w-4" />
                  )}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {key === "browser" ? "Browsers" : "OS"}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full h-[400px]"
        >
          <PieChart className="h-full">
            <ChartTooltip content={<CustomTooltip />} />
            <Pie
              data={currentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {currentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  radius={8}
                />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
        {currentData.length === 0 && (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No {activeView} data available yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
