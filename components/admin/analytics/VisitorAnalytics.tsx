"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Eye, Users, MousePointer, Clock } from "lucide-react";
import { format } from "date-fns";

interface PageView {
  id: string;
  page: string;
  timestamp: string;
  referrer: string | null;
  user_agent: string;
  ip_address: string;
}

interface VisitorAnalyticsProps {
  pageViews: PageView[];
  dateRange: string;
}

const COLORS = [
  "#A62828",
  "#E63946",
  "#F77F00",
  "#FCBF49",
  "#06D6A0",
  "#118AB2",
];

export default function VisitorAnalytics({
  pageViews,
  dateRange,
}: VisitorAnalyticsProps) {
  // Calculate metrics
  const totalPageViews = pageViews.length;
  const uniqueVisitors = new Set(pageViews.map((pv) => pv.ip_address)).size;

  // Page views by day
  const viewsByDay: Record<string, number> = {};
  pageViews.forEach((pv) => {
    const date = format(new Date(pv.timestamp), "yyyy-MM-dd");
    viewsByDay[date] = (viewsByDay[date] || 0) + 1;
  });

  const viewsByDayArray = Object.entries(viewsByDay)
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top pages
  const pageCount: Record<string, number> = {};
  pageViews.forEach((pv) => {
    const page = pv.page === "/" ? "Home" : pv.page;
    pageCount[page] = (pageCount[page] || 0) + 1;
  });

  const topPages = Object.entries(pageCount)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Referrer sources
  const referrerCount: Record<string, number> = {};
  pageViews.forEach((pv) => {
    if (pv.referrer) {
      try {
        const url = new URL(pv.referrer);
        const domain = url.hostname.replace("www.", "");
        referrerCount[domain] = (referrerCount[domain] || 0) + 1;
      } catch {
        referrerCount["Direct"] = (referrerCount["Direct"] || 0) + 1;
      }
    } else {
      referrerCount["Direct"] = (referrerCount["Direct"] || 0) + 1;
    }
  });

  const topReferrers = Object.entries(referrerCount)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Device types (basic detection from user agent)
  const deviceCount = { Mobile: 0, Desktop: 0, Tablet: 0 };
  pageViews.forEach((pv) => {
    const ua = pv.user_agent.toLowerCase();
    if (ua.includes("mobile")) {
      deviceCount.Mobile++;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      deviceCount.Tablet++;
    } else {
      deviceCount.Desktop++;
    }
  });

  const deviceData = Object.entries(deviceCount)
    .map(([device, count]) => ({ device, count }))
    .filter((d) => d.count > 0);

  // Average session duration (simplified - time between page views per IP)
  const sessionTimes: number[] = [];
  const ipSessions: Record<string, string[]> = {};

  pageViews.forEach((pv) => {
    if (!ipSessions[pv.ip_address]) {
      ipSessions[pv.ip_address] = [];
    }
    ipSessions[pv.ip_address].push(pv.timestamp);
  });

  Object.values(ipSessions).forEach((timestamps) => {
    if (timestamps.length > 1) {
      const sorted = timestamps.sort();
      const duration =
        (new Date(sorted[sorted.length - 1]).getTime() -
          new Date(sorted[0]).getTime()) /
        1000 /
        60; // minutes
      sessionTimes.push(duration);
    }
  });

  const avgSessionDuration =
    sessionTimes.length > 0
      ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Visitor Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Page Views</p>
                <p className="text-2xl font-bold font-playfair">
                  {totalPageViews.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last {dateRange} days
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Eye className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Unique Visitors</p>
                <p className="text-2xl font-bold font-playfair">
                  {uniqueVisitors.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalPageViews > 0
                    ? `${(totalPageViews / uniqueVisitors).toFixed(1)} pages/visitor`
                    : "No data"}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg. Session</p>
                <p className="text-2xl font-bold font-playfair">
                  {avgSessionDuration.toFixed(1)}
                  <span className="text-sm font-normal ml-1">min</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Duration</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="size-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bounce Rate</p>
                <p className="text-2xl font-bold font-playfair">
                  {uniqueVisitors > 0
                    ? `${((Object.values(ipSessions).filter((s) => s.length === 1).length / uniqueVisitors) * 100).toFixed(1)}%`
                    : "0%"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Single page visits</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <MousePointer className="size-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Views Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair flex items-center gap-2">
            <Eye className="size-5" />
            Page Views Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewsByDayArray.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsByDayArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(label) =>
                    format(new Date(label), "MMM d, yyyy")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Page Views"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <MousePointer className="size-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                No data available
              </p>
            ) : (
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{page.page}</p>
                      <p className="text-xs text-gray-500">
                        {((page.count / totalPageViews) * 100).toFixed(1)}% of
                        total
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-primary">{page.count}</p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Users className="size-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topReferrers.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                No data available
              </p>
            ) : (
              <div className="space-y-3">
                {topReferrers.map((ref, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ref.referrer}</p>
                      <p className="text-xs text-gray-500">
                        {((ref.count / totalPageViews) * 100).toFixed(1)}% of
                        traffic
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-primary">{ref.count}</p>
                      <p className="text-xs text-gray-500">visits</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        {deviceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <MousePointer className="size-5" />
                Device Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label={({ device, count }: any) =>
                      `${device}: ${count} (${((count / totalPageViews) * 100).toFixed(1)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
