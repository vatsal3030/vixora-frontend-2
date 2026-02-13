import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { cn } from '../../lib/utils'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

export function DashboardStatsCard({ title, value, icon: Icon, trend, trendValue, data = [], loading, className, color = "blue" }) {
    if (loading) {
        return (
            <Card className={className}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        <Skeleton className="h-4 w-24" />
                    </CardTitle>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        <Skeleton className="h-8 w-16 mb-1" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                </CardContent>
            </Card>
        )
    }

    const isPositive = trend === 'up' || (typeof trendValue === 'number' && trendValue > 0)
    const isNegative = trend === 'down' || (typeof trendValue === 'number' && trendValue < 0)
    const isNeutral = !isPositive && !isNegative

    // Map color prop to utility classes/hex
    const colorMap = {
        blue: {
            text: 'text-blue-500',
            bg: 'bg-blue-500/10',
            stroke: '#3b82f6',
            fill: '#3b82f6'
        },
        green: {
            text: 'text-green-500',
            bg: 'bg-green-500/10',
            stroke: '#22c55e',
            fill: '#22c55e'
        },
        purple: {
            text: 'text-purple-500',
            bg: 'bg-purple-500/10',
            stroke: '#a855f7',
            fill: '#a855f7'
        },
        orange: {
            text: 'text-orange-500',
            bg: 'bg-orange-500/10',
            stroke: '#f97316',
            fill: '#f97316'
        },
        primary: {
            text: 'text-primary',
            bg: 'bg-primary/10',
            stroke: '#ef4444', // Assuming primary is red-500
            fill: '#ef4444'
        }
    }

    const activeColor = colorMap[color] || colorMap.blue

    // Default sparkline data if none provided (using deterministic values)
    const defaultSparkData = [
        { value: 30 }, { value: 50 }, { value: 35 }, { value: 65 }, { value: 45 },
        { value: 70 }, { value: 55 }, { value: 80 }, { value: 60 }, { value: 75 }
    ]
    const sparkData = data.length > 0 ? data : defaultSparkData

    return (
        <Card className={cn("overflow-hidden relative", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 z-10 relative p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-1.5 sm:p-2 rounded-lg", activeColor.bg, activeColor.text)}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
            </CardHeader>
            <CardContent className="z-10 relative pt-0 p-3 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold">{value}</div>
                <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    {isPositive && <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500 mr-0.5 sm:mr-1" />}
                    {isNegative && <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 mr-0.5 sm:mr-1" />}
                    {isNeutral && <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground mr-0.5 sm:mr-1" />}

                    <span className={cn(
                        "font-medium",
                        isPositive && "text-green-500",
                        isNegative && "text-red-500"
                    )}>
                        {trendValue}%
                    </span>
                    <span className="ml-0.5 sm:ml-1 opacity-70">from last period</span>
                </div>
            </CardContent>

            {/* Sparkline Background */}
            <div className="absolute inset-x-0 bottom-0 h-16 opacity-10">
                <ResponsiveContainer width="100%" height={64}>
                    <AreaChart data={sparkData}>
                        <defs>
                            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={activeColor.fill} stopOpacity={0.5} />
                                <stop offset="100%" stopColor={activeColor.fill} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={activeColor.stroke}
                            fill={`url(#gradient-${color})`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
