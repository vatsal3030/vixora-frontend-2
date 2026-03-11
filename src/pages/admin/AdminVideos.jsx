import { useState, useEffect } from 'react'
import { adminService, videoService } from '../../services/api'
import { toast } from 'sonner'
import { formatTimeAgo, formatViews } from '../../lib/utils'
import { getMediaUrl } from '../../lib/media'
import { MoreVertical, ShieldBan, ShieldCheck, Eye, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu"

export default function AdminVideos() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchVideos = async () => {
        try {
            setLoading(true)
            const res = await adminService.getVideos({ limit: 50 })
            setVideos(res.data.data?.items || res.data.data?.videos || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load videos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVideos()
    }, [])

    const handleDeleteVideo = async (videoId) => {
        if (!confirm('Are you sure you want to delete this video?')) return
        try {
            await videoService.deleteVideo(videoId)
            toast.success('Video deleted')
            fetchVideos()
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete video')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold">Videos</h1>
                <p className="text-muted-foreground mt-1">Manage global platform videos</p>
            </div>

            <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-secondary/30">
                                <th className="text-left p-4 pl-6 font-medium text-muted-foreground w-1/2">Video</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Creator</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">Views</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-right p-4 pr-6 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        Loading videos...
                                    </td>
                                </tr>
                            ) : videos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        No videos found
                                    </td>
                                </tr>
                            ) : (
                                videos.map((video) => (
                                    <tr key={video._id || video.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex gap-4 items-start">
                                                <div className="w-24 aspect-video bg-black rounded relative overflow-hidden flex-shrink-0">
                                                    <img src={getMediaUrl(video.thumbnail)} alt={video.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground line-clamp-2">{video.title}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">{formatTimeAgo(video.createdAt)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">@{video.owner?.username}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right tabular-nums">
                                            {formatViews(video.views).replace('views', '')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                video.isPublished ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                                {video.isPublished ? 'PUBLISHED' : 'PRIVATE'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => window.open(`/watch/${video._id || video.id}`, '_blank')}>
                                                        <Eye className="w-4 h-4 mr-2" /> View Video
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteVideo(video._id || video.id)} className="text-red-500">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Video
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
