import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { videoService } from '../services/api'
import { Button } from '../components/ui/Button'
import { toast } from 'sonner'
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Sparkles, Wand2, Eye, EyeOff } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'

export default function EditVideoPage() {
    const { videoId } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Internal state for form inputs
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [isPublished, setIsPublished] = useState(true)
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [thumbnailPreview, setThumbnailPreview] = useState(null)

    const thumbnailInputRef = useRef(null)

    // Fetch Video Details
    const { isLoading: loading, error } = useQuery({
        queryKey: ['video', videoId],
        queryFn: async () => {
            const response = await videoService.getVideo(videoId)
            const data = response.data.data
            // Set initial state
            setTitle(data.title)
            setDescription(data.description)
            setTags(Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''))
            setIsPublished(data.isPublished)
            setThumbnailPreview(data.thumbnail)
            return data
        },
        enabled: !!videoId,
        refetchOnWindowFocus: false
    })

    // Update Video Mutation
    const updateMutation = useMutation({
        mutationFn: (formData) => videoService.updateVideo(videoId, formData),
        onSuccess: () => {
            toast.success('Video updated successfully')
            queryClient.invalidateQueries({ queryKey: ['video', videoId] })
            navigate('/my-videos')
        },
        onError: (error) => {
            console.error(error)
            toast.error(error.response?.data?.message || 'Update failed')
        }
    })

    // Toggle Publish Mutation
    const togglePublishMutation = useMutation({
        mutationFn: () => videoService.togglePublish(videoId),
        onSuccess: (response) => {
            const newState = response.data.data.isPublished
            setIsPublished(newState)
            toast.success(newState ? 'Video published' : 'Video hidden')
            queryClient.invalidateQueries({ queryKey: ['video', videoId] })
        },
        onError: () => toast.error('Failed to update publish status')
    })

    const handleThumbnailSelect = (file) => {
        if (file && file.type.startsWith('image/')) {
            setThumbnailFile(file)
            setThumbnailPreview(URL.createObjectURL(file))
        } else {
            toast.error('Please upload a valid image file')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title) {
            toast.error('Title is required')
            return
        }

        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('tags', tags)
        formData.append('isPublished', isPublished)

        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile)
        }

        updateMutation.mutate(formData)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-xl text-muted-foreground">Video not found</p>
                <Button onClick={() => navigate('/my-videos')}>Go Back</Button>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-8 max-w-6xl"
        >
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary group" onClick={() => navigate('/my-videos')}>
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Studio
            </Button>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Form Area */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Edit Video Details
                            </h1>
                            <p className="text-muted-foreground mt-1">Manage your video metadata and visibility</p>
                        </div>
                    </div>

                    <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="glass-card p-6 rounded-2xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/80">Title</label>
                                <div className="relative">
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Give your video a catchy title"
                                        maxLength={100}
                                        required
                                        className="w-full bg-secondary/30 border border-white/5 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/50"
                                    />
                                    <div className="absolute right-3 top-3.5 text-xs text-muted-foreground">
                                        {title.length}/100
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/80">Description</label>
                                <div className="relative">
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Tell viewers about your video..."
                                        className="w-full min-h-[150px] bg-secondary/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 resize-y"
                                    />
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Wand2 className="w-4 h-4 text-primary cursor-pointer hover:scale-110 transition-transform" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                                    Tags
                                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Optional</span>
                                </label>
                                <input
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="gaming, tutorial, react (comma separated)"
                                    className="w-full bg-secondary/30 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sidebar / Preview Area */}
                <div className="lg:w-[350px] space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Thumbnail Card */}
                        <div className="glass-card p-4 rounded-2xl space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-primary" />
                                Thumbnail
                            </h3>
                            <div
                                className="aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 hover:border-primary/50 transition-all overflow-hidden relative group"
                                onClick={() => thumbnailInputRef.current?.click()}
                            >
                                {thumbnailPreview ? (
                                    <>
                                        <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                                            <div className="flex flex-col items-center gap-2">
                                                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                                                <p className="text-white font-medium text-sm">Change Thumbnail</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Click to upload</p>
                                    </>
                                )}
                                <input
                                    ref={thumbnailInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files[0] && handleThumbnailSelect(e.target.files[0])}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Recommended: 1280x720 (16:9)
                            </p>
                        </div>

                        {/* Visibility Card */}
                        <div className="glass-card p-4 rounded-2xl space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Eye className="w-4 h-4 text-primary" />
                                Visibility
                            </h3>
                            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`} />
                                    <span className="font-medium">{isPublished ? 'Public' : 'Private'}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePublishMutation.mutate()}
                                    disabled={togglePublishMutation.isPending}
                                    className="hover:bg-background/50"
                                >
                                    {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                type="submit"
                                form="edit-form" // Link to the form ID
                                disabled={updateMutation.isPending}
                                className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/my-videos')} className="w-full glass border-white/10 hover:bg-secondary/50">
                                Discard Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
