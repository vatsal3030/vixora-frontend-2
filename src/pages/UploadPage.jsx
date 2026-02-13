import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useNavigate } from 'react-router-dom'
import { videoService } from '../services/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'sonner'
import { ImageCropModal } from '../components/common/ImageCropModal'

export default function UploadPage() {
    useDocumentTitle('Upload Video - Vixora')
    const navigate = useNavigate()
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [videoFile, setVideoFile] = useState(null)
    const [videoPreview, setVideoPreview] = useState(null)
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [thumbnailPreview, setThumbnailPreview] = useState(null)

    // Crop State
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState(null)

    // Upload Stats
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadSpeed, setUploadSpeed] = useState(0) // bytes per second
    const [timeRemaining, setTimeRemaining] = useState(0) // seconds
    const [uploadedBytes, setUploadedBytes] = useState(0)
    const [totalBytes, setTotalBytes] = useState(0)
    const startTimeRef = useRef(0)

    // Form State
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')

    const videoInputRef = useRef(null)
    const thumbnailInputRef = useRef(null)

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragging(false)

        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('video/')) {
            handleVideoSelect(file)
        } else {
            toast.error('Please upload a valid video file')
        }
    }

    const handleVideoSelect = (file) => {
        if (file.size > 500 * 1024 * 1024) { // 500MB limit as per spec
            toast.error('File size exceeds 500MB limit')
            return
        }
        setVideoFile(file)
        setVideoPreview(URL.createObjectURL(file))
        // Auto-fill title from filename
        if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ""))
        }
    }

    const handleThumbnailSelect = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setImageToCrop(reader.result)
                setCropModalOpen(true)
            })
            reader.readAsDataURL(file)
            if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
        } else {
            toast.error('Please upload a valid image file')
        }
    }

    const handleCropComplete = (croppedBlob) => {
        setThumbnailFile(croppedBlob)
        setThumbnailPreview(URL.createObjectURL(croppedBlob))
    }

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatTime = (seconds) => {
        if (!isFinite(seconds) || seconds < 0) return 'Calculating...'
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}m ${s}s`
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!videoFile || !thumbnailFile || !title) {
            toast.error('Please fill in all required fields')
            return
        }

        setUploading(true)
        startTimeRef.current = Date.now()

        const formData = new FormData()
        formData.append('videoFile', videoFile)
        formData.append('thumbnail', thumbnailFile)
        formData.append('title', title)
        formData.append('description', description)
        formData.append('tags', tags)

        try {
            const response = await videoService.uploadVideo(formData, (progressEvent) => {
                const { loaded, total } = progressEvent
                const percent = Math.floor((loaded * 100) / total)
                setUploadProgress(percent)
                setUploadedBytes(loaded)
                setTotalBytes(total)

                // Calculate speed and ETR
                const now = Date.now()
                const elapsed = (now - startTimeRef.current) / 1000 // seconds
                if (elapsed > 0) {
                    const speed = loaded / elapsed // bytes per second
                    setUploadSpeed(speed)
                    const remaining = total - loaded
                    const etr = remaining / speed
                    setTimeRemaining(etr)
                }
            })

            if (response.data.success) {
                toast.success('Video uploaded successfully!')
                navigate(`/video/${response.data.data.id || response.data.data._id}`)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const clearVideo = () => {
        setVideoFile(null)
        setVideoPreview(null)
        if (videoInputRef.current) videoInputRef.current.value = ''
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-8">Upload Video</h1>

            {uploading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-background rounded-xl p-8 max-w-md w-full shadow-2xl border border-border">
                        <h3 className="text-xl font-bold mb-6">Uploading Video...</h3>

                        {/* Progress Bar */}
                        <div className="h-4 bg-secondary rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm font-medium mb-6">
                            <span>{uploadProgress}%</span>
                            <span>{formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}</span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                                <p>Speed</p>
                                <p className="font-medium text-foreground">{formatBytes(uploadSpeed)}/s</p>
                            </div>
                            <div className="text-right">
                                <p>Time remaining</p>
                                <p className="font-medium text-foreground">{formatTime(timeRemaining)}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <p className="text-xs text-muted-foreground">Please do not close this window</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Video Upload Section */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium mb-2">Video File</label>
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 transition-colors ${dragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary/50'
                            } ${videoPreview ? 'border-none p-0 overflow-hidden bg-black' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {videoPreview ? (
                            <div className="relative aspect-video">
                                <video src={videoPreview} controls className="w-full h-full object-contain" />
                                <button
                                    type="button"
                                    onClick={clearVideo}
                                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                                <div className="p-4 bg-secondary rounded-full mb-4">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">Drag and drop video files to upload</h3>
                                <p className="text-sm text-muted-foreground mb-6">Your videos will be private until you publish them.</p>
                                <Button type="button" variant="secondary">Select Files</Button>
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files[0] && handleVideoSelect(e.target.files[0])}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Thumbnail & Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title <span className="text-red-500">*</span></label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Add a title that describes your video"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell viewers about your video"
                                className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tags</label>
                            <Input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Comma separated tags (e.g., gaming, funny, vlog)"
                            />
                        </div>
                    </div>

                    {/* Right: Thumbnail Upload */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium mb-2">Thumbnail <span className="text-red-500">*</span></label>
                        <div
                            className="aspect-video rounded-lg border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors overflow-hidden relative group"
                            onClick={() => thumbnailInputRef.current?.click()}
                        >
                            {thumbnailPreview ? (
                                <>
                                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <p className="text-white font-medium">Change Thumbnail</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                    <p className="text-xs text-muted-foreground">Upload Thumbnail</p>
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
                        <p className="text-xs text-muted-foreground">
                            Select or upload a picture that shows what's in your video. A good thumbnail stands out and draws viewers' attention.
                        </p>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" disabled={uploading || !videoFile || !thumbnailFile || !title}>
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload Video'
                        )}
                    </Button>
                </div>
            </form>

            <ImageCropModal
                isOpen={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                imageSrc={imageToCrop}
                onCropComplete={handleCropComplete}
                aspect={16 / 9}
                title="Crop Thumbnail"
            />
        </div>
    )
}
