"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Clock } from "lucide-react";
import { Scan } from "@/server/qr-codes";

interface ActivityHeatmapProps {
  scans: Scan[];
  title?: string;
  description?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ActivityHeatmap({
  scans,
  title = "Activity Heatmap",
  description = "Scan activity by day and hour",
}: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Initialize grid with zeros
    const grid = Array(7).fill(null).map(() => Array(24).fill(0));
    
    // Count scans by day of week and hour
    scans.forEach((scan) => {
      const date = new Date(scan.scannedAt);
      const dayOfWeek = date.getDay(); // 0 = Sunday
      const hour = date.getHours();
      grid[dayOfWeek][hour]++;
    });
    
    return grid;
  }, [scans]);

  const maxValue = useMemo(() => {
    return Math.max(...heatmapData.flat());
  }, [heatmapData]);

  const getIntensity = (value: number) => {
    if (maxValue === 0) return 0;
    return value / maxValue;
  };

  const getColorClass = (intensity: number) => {
    if (intensity === 0) return "bg-muted";
    if (intensity <= 0.25) return "bg-chart-1/25";
    if (intensity <= 0.5) return "bg-chart-1/50";
    if (intensity <= 0.75) return "bg-chart-1/75";
    return "bg-chart-1";
  };

  const totalScans = scans.length;
  const peakHour = useMemo(() => {
    let maxHourValue = 0;
    let peakHourIndex = 0;
    
    for (let hour = 0; hour < 24; hour++) {
      const hourTotal = heatmapData.reduce((sum, day) => sum + day[hour], 0);
      if (hourTotal > maxHourValue) {
        maxHourValue = hourTotal;
        peakHourIndex = hour;
      }
    }
    
    return { hour: peakHourIndex, count: maxHourValue };
  }, [heatmapData]);

  const peakDay = useMemo(() => {
    let maxDayValue = 0;
    let peakDayIndex = 0;
    
    heatmapData.forEach((day, index) => {
      const dayTotal = day.reduce((sum, hour) => sum + hour, 0);
      if (dayTotal > maxDayValue) {
        maxDayValue = dayTotal;
        peakDayIndex = index;
      }
    });
    
    return { day: DAYS[peakDayIndex], count: maxDayValue };
  }, [heatmapData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalScans > 0 ? (
          <>
            {/* Heatmap Grid */}
            <div className="space-y-2">
              {/* Hour labels */}
              <div className="flex gap-1 pl-12">
                {HOURS.map((hour) => (
                  <div key={hour} className="w-4 text-xs text-muted-foreground text-center">
                    {hour}
                  </div>
                ))}
              </div>
              
              {/* Grid */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center gap-1">
                  <div className="w-10 text-xs text-muted-foreground text-right">
                    {day}
                  </div>
                  <div className="flex gap-1">
                    {HOURS.map((hour) => {
                      const value = heatmapData[dayIndex][hour];
                      const intensity = getIntensity(value);
                      return (
                        <div
                          key={hour}
                          className={`w-4 h-4 rounded-sm border ${getColorClass(intensity)} hover:ring-2 hover:ring-primary/50 cursor-pointer transition-all`}
                          title={`${day} ${hour}:00 - ${value} scans`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted border" />
                  <div className="w-3 h-3 rounded-sm bg-chart-1/25 border" />
                  <div className="w-3 h-3 rounded-sm bg-chart-1/50 border" />
                  <div className="w-3 h-3 rounded-sm bg-chart-1/75 border" />
                  <div className="w-3 h-3 rounded-sm bg-chart-1 border" />
                </div>
                <span>More</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Peak Hour</div>
                <div className="text-lg font-bold">
                  {peakHour.hour}:00
                </div>
                <div className="text-xs text-muted-foreground">
                  {peakHour.count} scans
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Peak Day</div>
                <div className="text-lg font-bold">
                  {peakDay.day}
                </div>
                <div className="text-xs text-muted-foreground">
                  {peakDay.count} scans
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No activity data available yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}