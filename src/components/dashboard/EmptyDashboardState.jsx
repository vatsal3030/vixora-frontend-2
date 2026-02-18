import { BarChart3, Upload, Play, Info } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function EmptyDashboardState({ onUpload, onDemo }) {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center space-y-6 min-h-[500px] glass border-0 bg-white/5">
            <div className="p-6 rounded-full bg-primary/10 relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <BarChart3 className="w-16 h-16 text-primary relative z-10" />
            </div>

            <div className="max-w-md space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Access Your Creator Analytics</h2>
                <p className="text-muted-foreground">
                    You haven't uploaded any videos yet. Upload your first video to start tracking views, subscribers, and engagement metrics.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button size="lg" onClick={onUpload} className="w-full sm:w-auto gap-2">
                    <Upload className="w-4 h-4" />
                    Upload First Video
                </Button>
                <Button variant="outline" size="lg" onClick={onDemo} className="w-full sm:w-auto gap-2">
                    <Info className="w-4 h-4" />
                    View Demo Dashboard
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mt-8 border-t border-border w-full max-w-2xl">
                <div className="flex flex-col items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <Play className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Track Views</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                        <div className="w-4 h-4 font-bold text-xs flex items-center justify-center border border-current rounded-sm">S</div>
                    </div>
                    <span className="text-sm font-medium">Monitor Subs</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Analyze Growth</span>
                </div>
            </div>
        </Card>
    )
}
