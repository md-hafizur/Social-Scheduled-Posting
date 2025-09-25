"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart3, TrendingUp, Users, Calendar, Sparkles, Filter } from "lucide-react"

interface PostResponse {
  id: number;
  content: string;
  platforms: string[];
  scheduled_time: string;
  hashtags?: string;
  status: string;
  image_url?: string;
  created_at: string;
  published_at?: string;
  error_message?: string;
}

interface AnalyticsSummary {
  posts_published: number;
  posts_scheduled: number;
  posts_failed: number;
  total_posts: number;
  platform_stats: Array<{ platform: string; count: number }>;
  recent_posts: PostResponse[];
}

interface AIInsight {
  insight: string;
  recommendations: string[];
  best_performing_platform?: string;
}

export default function Analytics() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [engagementTrends, setEngagementTrends] = useState<any[]>([]);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/analytics/summary");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics summary");
        }
        const data: AnalyticsSummary = await response.json();
        setAnalyticsSummary(data);
      } catch (error) {
        console.error("Error fetching analytics summary:", error);
      }
    };

    const fetchEngagementTrends = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/analytics/trends");
        if (!response.ok) {
          throw new Error("Failed to fetch engagement trends");
        }
        const data = await response.json();
        setEngagementTrends(data.trends);
      } catch (error) {
        console.error("Error fetching engagement trends:", error);
      }
    };

    fetchSummary();
    fetchEngagementTrends();
  }, []);

  const totalStats = analyticsSummary ? {
    published: analyticsSummary.posts_published,
    scheduled: analyticsSummary.posts_scheduled,
    failed: analyticsSummary.posts_failed,
    total: analyticsSummary.total_posts,
  } : { published: 0, scheduled: 0, failed: 0, total: 0 };

  const filteredData =
    selectedPlatform === "all" ? analyticsSummary?.platform_stats.map(stat => ({ platform: stat.platform, published: stat.count, scheduled: 0, failed: 0 })) || [] : analyticsSummary?.platform_stats.filter((item) => item.platform.toLowerCase() === selectedPlatform).map(stat => ({ platform: stat.platform, published: stat.count, scheduled: 0, failed: 0 })) || [];

  const pieData = [
    { name: "Published", value: totalStats.published, color: "#22c55e" },
    { name: "Scheduled", value: totalStats.scheduled, color: "#3b82f6" },
    { name: "Failed", value: totalStats.failed, color: "#ef4444" },
  ]

  const generateAIInsight = async () => {
    setIsGeneratingInsight(true)
    try {
      const response = await fetch("http://localhost:8000/api/analytics/insight");
      if (!response.ok) {
        throw new Error("Failed to fetch AI insight");
      }
      const data: AIInsight = await response.json();
      setAiInsight(data);
    } catch (error) {
      console.error("Error fetching AI insight:", error);
      setAiInsight({
        insight: "Failed to generate AI insight. Please try again later.",
        recommendations: [],
      });
    } finally {
      setIsGeneratingInsight(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your social media performance and insights</p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {analyticsSummary?.platform_stats.map((stat) => (
                <SelectItem key={stat.platform} value={stat.platform.toLowerCase()}>
                  {stat.platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{totalStats.published}</div>
            <p className="text-xs text-muted-foreground">Total published posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{totalStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Posts awaiting publication</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{totalStats.failed}</div>
            <p className="text-xs text-muted-foreground">Posts that failed to publish</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalStats.total}
            </div>
            <p className="text-xs text-muted-foreground">Overall posts count</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Posts by Platform Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Posts by Platform</CardTitle>
            <CardDescription>Published, scheduled, and failed posts across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                published: {
                  label: "Published",
                  color: "hsl(var(--chart-1))",
                },
                scheduled: {
                  label: "Scheduled",
                  color: "hsl(var(--chart-2))",
                },
                failed: {
                  label: "Failed",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="published" fill="var(--color-published)" name="Published" />
                  <Bar dataKey="scheduled" fill="var(--color-scheduled)" name="Scheduled" />
                  <Bar dataKey="failed" fill="var(--color-failed)" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Post Status Distribution</CardTitle>
            <CardDescription>Overall breakdown of post statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                published: {
                  label: "Published",
                  color: "#22c55e",
                },
                scheduled: {
                  label: "Scheduled",
                  color: "#3b82f6",
                },
                failed: {
                  label: "Failed",
                  color: "#ef4444",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
          <CardDescription>Daily engagement metrics over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              total_engagement: {
                label: "Total Engagement",
                color: "hsl(var(--chart-1))",
              },
              avg_engagement_rate: {
                label: "Avg. Engagement Rate",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="total_engagement" stroke="var(--color-likes)" name="Total Engagement" />
                <Line type="monotone" dataKey="avg_engagement_rate" stroke="var(--color-shares)" name="Avg. Engagement Rate" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>AI-Generated Insights</span>
          </CardTitle>
          <CardDescription>Get intelligent recommendations to improve your social media strategy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiInsight ? (
            <div className="p-4 bg-accent rounded-lg border border-border">
              <p className="text-sm text-foreground font-semibold">{aiInsight.insight}</p>
              {aiInsight.recommendations.length > 0 && (
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                  {aiInsight.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              )}
              {aiInsight.best_performing_platform && (
                <p className="text-xs text-muted-foreground mt-2">
                  Best performing platform: <span className="font-medium">{aiInsight.best_performing_platform}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Generate AI-powered insights based on your performance data</p>
            </div>
          )}

          <Button onClick={generateAIInsight} disabled={isGeneratingInsight} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            {isGeneratingInsight ? "Generating Insight..." : "Generate AI Insight"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}