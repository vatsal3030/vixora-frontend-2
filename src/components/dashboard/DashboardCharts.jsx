import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs'
import { Skeleton } from '../ui/Skeleton'
import { cn, formatViews } from '../../lib/utils'

export function DashboardCharts({ data = [], loading, className }) {
    const [activeTab, setActiveTab] = useState('views')

    if (loading) {
        return (
            <Card className={cn("col-span-1 lg:col-span-4", className)}>
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full rounded-xl" />
                </CardContent>
            </Card>
        )
    }

    // Prepare data based on active tab
    // Assuming data structure: [{ date: '2023-01-01', views: 100, subscribers: 5, likes: 20 }, ...]
    const chartConfig = {
        views: {
            label: "Views",
            color: "#3b82f6", // blue-500
            gradientStart: "#3b82f6",
            gradientEnd: "#93c5fd",
            dataKey: "views"
        },
        subscribers: {
            label: "Subscribers",
            color: "#ef4444", // red-500 (Vixora Primary)
            gradientStart: "#ef4444",
            gradientEnd: "#fca5a5",
            dataKey: "subscribers"
        },
        likes: {
            label: "Likes",
            color: "#22c55e", // green-500
            gradientStart: "#22c55e",
            gradientEnd: "#86efac",
            dataKey: "likes"
        }
    }

    const currentConfig = chartConfig[activeTab]

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-xl">
                    <p className="font-medium mb-2">{label}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: payload[0].color }}
                        />
                        <span className="text-muted-foreground capitalize">{activeTab}:</span>
                        <span className="font-bold">
                            {activeTab === 'views' ? formatViews(payload[0].value) : payload[0].value.toLocaleString()}
                        </span>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <Card className={cn("col-span-1 lg:col-span-4", className)}>
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-border">
                <div className="space-y-0.5 sm:space-y-1">
                    <CardTitle className="text-base sm:text-lg">Channel Analytics</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Your channel's performance over time
                    </CardDescription>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 sm:w-[280px] h-8 sm:h-9">
                        <TabsTrigger value="views" className="text-xs sm:text-sm">Views</TabsTrigger>
                        <TabsTrigger value="subscribers" className="text-xs sm:text-sm">Subs</TabsTrigger>
                        <TabsTrigger value="likes" className="text-xs sm:text-sm">Likes</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <CardContent className="p-3 sm:p-6 pl-0 sm:pl-2">
                <div className="w-full">
                    <ResponsiveContainer width="100%" height={250} className="sm:!h-[350px]">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`gradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentConfig.gradientStart} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={currentConfig.gradientEnd} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                                    return value;
                                }}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-30" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey={currentConfig.dataKey}
                                stroke={currentConfig.color}
                                fillOpacity={1}
                                fill={`url(#gradient-${activeTab})`}
                                strokeWidth={3}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

