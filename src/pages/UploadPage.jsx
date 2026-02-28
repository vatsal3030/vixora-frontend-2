import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Check, ArrowRight, ArrowLeft, FileVideo, Smartphone, MonitorPlay } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useNavigate } from 'react-router-dom'
import { videoService } from '../services/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'sonner'
import { ImageCropModal } from '../components/common/ImageCropModal'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { Switch } from '../components/ui/Switch' // Assuming we have a Switch component or will use a checkbox

const STEPS = [
    { number: 1, title: 'Upload', icon: Upload },
    { number: 2, title: 'Details', icon: FileVideo },
    { number: 3, title: 'Review', icon: Check }
]

export default function UploadPage() {
    useDocumentTitle('Upload Video - Vixora')
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)

    // Upload State
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [videoFile, setVideoFile] = useState(null)
    const [videoPreview, setVideoPreview] = useState(null)

    // Metadata State
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [isShort, setIsShort] = useState(false) // New state for Shorts
    const [transcript, setTranscript] = useState('') // New state for Transcript

    // Crop State
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState(null)

    // Upload Stats
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadSpeed, setUploadSpeed] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(0)
    const startTimeRef = useRef(0)

    const videoInputRef = useRef(null)
    const thumbnailInputRef = useRef(null)

    // Drag & Drop Handlers
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
        if (file.size > 500 * 1024 * 1024) {
            toast.error('File size exceeds 500MB limit')
            return
        }
        setVideoFile(file)
        setVideoPreview(URL.createObjectURL(file))
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""))

        // Auto-detect if short? (Optional enhancement, usually shorts are < 60s and vertical)
        // We'll leave it manual for now as per user request.

        setCurrentStep(2) // Auto-advance
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

    // Navigation Handlers
    const nextStep = () => {
        if (currentStep === 2 && (!title || !thumbnailFile)) {
            toast.error('Please fill in title and thumbnail')
            return
        }
        setCurrentStep(prev => Math.min(prev + 1, 3))
    }

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    // Formatter Helpers
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

    // --- Direct Cloudinary Upload Logic ---
    const uploadToCloudinary = async (file, signatureData, onProgress) => {
        const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${signatureData.resourceType}/upload`
        const formData = new FormData()
        formData.append('file', file)

        if (signatureData.uploadPreset) {
            formData.append('upload_preset', signatureData.uploadPreset)
        }

        if (signatureData.signature) {
            formData.append('api_key', signatureData.api_key)
            formData.append('timestamp', signatureData.timestamp)
            formData.append('signature', signatureData.signature)
        }

        // Always append folder if provided
        if (signatureData.folder) {
            formData.append('folder', signatureData.folder)
        }

        // Handle public_id logic
        if (signatureData.publicId) {
            formData.append('public_id', signatureData.publicId)
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', url)

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    onProgress(e.loaded, e.total)
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText))
                } else {
                    try {
                        const err = JSON.parse(xhr.responseText)
                        reject(new Error(err.error?.message || `Cloudinary Error: ${xhr.statusText}`))
                    } catch {
                        reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`))
                    }
                }
            }

            xhr.onerror = () => reject(new Error('Cloudinary upload network error'))
            xhr.send(formData)
        })
    }

    const handleSubmit = async () => {
        if (!videoFile || !thumbnailFile || !title) return

        setUploading(true)
        startTimeRef.current = Date.now()
        setUploadProgress(0)

        try {
            // 1. Create Upload Session & Get Video Upload Params
            const sessionRes = await videoService.createUploadSession({
                fileName: videoFile.name,
                fileSize: videoFile.size,
                mimeType: videoFile.type
            })

            const sessionId = sessionRes.data.data.id

            // 2. Get Signatures (Video & Thumbnail)
            const [videoSigRes, thumbSigRes] = await Promise.all([
                videoService.getUploadSignature('video'),
                videoService.getUploadSignature('thumbnail')
            ])

            const videoSigData = videoSigRes.data.data
            if (!videoSigData.cloudName || !videoSigData.signature) {
                throw new Error("Failed to initialize secure upload session (Video)")
            }
            // Ensure resourceType is set if not present
            if (!videoSigData.resourceType) videoSigData.resourceType = 'video'

            const thumbSigData = thumbSigRes.data.data
            if (!thumbSigData.cloudName || !thumbSigData.signature) {
                throw new Error("Failed to initialize secure upload session (Thumbnail)")
            }
            // Force 'image' for thumbnail upload to Cloudinary
            thumbSigData.resourceType = 'image'



            // 3. Upload Video
            const videoData = await uploadToCloudinary(videoFile, videoSigData, (loaded, total) => {
                const percent = Math.floor((loaded * 100) / total)
                setUploadProgress(percent)

                const now = Date.now()
                const elapsed = (now - startTimeRef.current) / 1000
                if (elapsed > 0) {
                    const speed = loaded / elapsed
                    setUploadSpeed(speed)
                    setTimeRemaining((total - loaded) / speed)
                }

                if (percent % 10 === 0) {
                    videoService.reportProgress(sessionId, loaded).catch(() => { })
                }
            })

            // 4. Upload Thumbnail
            const thumbData = await uploadToCloudinary(thumbnailFile, thumbSigData, () => { })

            // 5. Finalize
            // SECURITY: Do not send trusted URLs. Backend will verify via publicId.
            // STRICT API: Only send fields defined in FRONTEND_API_HANDOFF.md to avoid 400 Bad Request
            const finalizePayload = {
                title,
                description,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                publicId: videoData.public_id,
                thumbnailPublicId: thumbData.public_id,
                duration: videoData.duration || 0,
                width: videoData.width || 0,
                height: videoData.height || 0,
                isShort
            }

            // Include transcript inline in finalize if provided (backend supports it)
            if (transcript.trim()) {
                finalizePayload.transcript = transcript.trim()
                finalizePayload.transcriptLanguage = 'en'
                finalizePayload.transcriptSource = 'IMPORTED'
            }

            const finalizeRes = await videoService.finalizeUpload(sessionId, finalizePayload)

            if (finalizeRes.data.success) {
                const videoId = finalizeRes.data.data.videoId || finalizeRes.data.data.id

                toast.success('Video uploaded successfully! Processing started.')
                if (videoId) {
                    navigate(`/watch/${videoId}`)
                } else {
                    navigate('/dashboard')
                }
            }

        } catch (error) {
            console.error("Upload failed", error)
            toast.error(error.message || "Upload failed. Please try again.")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] py-8 px-4 flex justify-center">
            <div className="w-full max-w-5xl">

                {/* Steps Header */}
                <div className="mb-8 flex items-center justify-center">
                    <div className="flex items-center gap-4">
                        {STEPS.map((step, idx) => {
                            const isActive = currentStep === step.number
                            const isCompleted = currentStep > step.number

                            return (
                                <div key={step.number} className="flex items-center">
                                    <div className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
                                        isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/25" :
                                            isCompleted ? "bg-secondary text-primary border-primary/50" :
                                                "bg-secondary/30 text-muted-foreground border-transparent"
                                    )}>
                                        <step.icon className="w-4 h-4" />
                                        <span className="font-medium text-sm hidden sm:inline">{step.title}</span>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className={cn(
                                            "w-8 h-[1px] mx-2 transition-colors duration-300",
                                            isCompleted ? "bg-primary/50" : "bg-white/10"
                                        )} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="glass-card rounded-2xl overflow-hidden relative min-h-[500px] flex flex-col">

                    {/* Upload Overlay */}
                    <AnimatePresence>
                        {uploading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-8"
                            >
                                <div className="max-w-md w-full space-y-6 text-center">
                                    <div className="relative w-20 h-20 mx-auto">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary transition-all duration-300 ease-linear" strokeDasharray={226} strokeDashoffset={226 - (226 * uploadProgress) / 100} />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xl font-bold">{uploadProgress}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Uploading Video...</h3>
                                        <p className="text-muted-foreground text-sm">Please keep this tab open</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/30 p-4 rounded-xl">
                                        <div className="text-left">
                                            <p className="text-xs text-muted-foreground">Speed</p>
                                            <p className="font-medium">{formatBytes(uploadSpeed)}/s</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Time Left</p>
                                            <p className="font-medium">{formatTime(timeRemaining)}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step Content */}
                    <div className="flex-1 p-6 md:p-8">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: UPLOAD */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-12"
                                >
                                    <div
                                        onClick={() => videoInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={cn(
                                            "w-full max-w-2xl aspect-[2/1] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group hover:bg-white/5",
                                            dragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-white/10"
                                        )}
                                    >
                                        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                            <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Drag & Drop Video</h3>
                                        <p className="text-muted-foreground mb-8">or click to browse files</p>
                                        <div className="flex gap-8 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><FileVideo className="w-3 h-3" /> MP4, WebM, MOV</span>
                                            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile Friendly</span>
                                        </div>
                                    </div>
                                    <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && handleVideoSelect(e.target.files[0])} />
                                </motion.div>
                            )}

                            {/* STEP 2: DETAILS */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column: Form */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                    <h3 className="text-lg font-semibold">Video Details</h3>
                                                    <Button variant="ghost" size="sm" onClick={() => { setVideoFile(null); setCurrentStep(1) }} className="text-destructive hover:text-destructive w-full sm:w-auto justify-start sm:justify-center">
                                                        Change Video
                                                    </Button>
                                                </div>

                                                {/* Shorts Toggle */}
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary/20 rounded-xl border border-white/5 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("p-2 rounded-lg", isShort ? "bg-primary/20 text-primary" : "bg-secondary/50 text-muted-foreground")}>
                                                            {isShort ? <Smartphone className="w-5 h-5" /> : <MonitorPlay className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">Video Type</div>
                                                            <div className="text-xs text-muted-foreground">{isShort ? 'Shorts (Vertical, < 60s)' : 'Standard Video'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                                                        <span className={cn("text-xs font-medium transition-colors cursor-pointer", !isShort ? "text-primary" : "text-muted-foreground")} onClick={() => setIsShort(false)}>Standard</span>
                                                        <button
                                                            onClick={() => setIsShort(!isShort)}
                                                            className={cn("w-12 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0", isShort ? "bg-primary" : "bg-secondary/80")}
                                                        >
                                                            <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow-sm", isShort ? "left-7" : "left-1")} />
                                                        </button>
                                                        <span className={cn("text-xs font-medium transition-colors cursor-pointer", isShort ? "text-primary" : "text-muted-foreground")} onClick={() => setIsShort(true)}>Shorts</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Title</label>
                                                    <Input
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        placeholder="Give your video a catchy title"
                                                        className="glass-input h-12 text-lg"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Description</label>
                                                    <textarea
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        placeholder="What is your video about?"
                                                        className="w-full glass-input rounded-xl p-4 min-h-[150px] resize-y"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Tags</label>
                                                    <Input
                                                        value={tags}
                                                        onChange={(e) => setTags(e.target.value)}
                                                        placeholder="gaming, vlog, tutorial (comma separated)"
                                                        className="glass-input"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">Transcript <span className="text-white/30 font-normal">(Optional)</span></label>
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Recommended for AI</span>
                                                    </div>
                                                    <textarea
                                                        value={transcript}
                                                        onChange={(e) => setTranscript(e.target.value)}
                                                        placeholder="Paste your video transcript here (SRT, VTT, or plain text). This helps Vixora AI understand your video better."
                                                        className="w-full glass-input rounded-xl p-4 min-h-[120px] resize-y text-xs font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Thumbnail & Preview */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold">Thumbnail</h3>

                                            {/* Thumbnail Upload */}
                                            <div
                                                onClick={() => thumbnailInputRef.current?.click()}
                                                className="aspect-video rounded-xl overflow-hidden relative cursor-pointer group border border-white/10 hover:border-primary/50 transition-all bg-black/20"
                                            >
                                                {thumbnailPreview ? (
                                                    <>
                                                        <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <ImageIcon className="w-8 h-8 text-white" />
                                                                <span className="text-xs font-medium text-white">Change Thumbnail</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                                        <ImageIcon className="w-10 h-10 mb-2" />
                                                        <span className="text-sm font-medium">Upload Thumbnail</span>
                                                    </div>
                                                )}
                                                <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleThumbnailSelect(e.target.files[0])} />
                                            </div>

                                            {/* Video Preview Card */}
                                            <div className="pt-6 border-t border-white/10">
                                                <h3 className="text-sm font-medium mb-3">Video Preview</h3>
                                                <div className="bg-background rounded-xl overflow-hidden border border-white/5 shadow-lg group relative">
                                                    <div className={cn("bg-black relative", isShort ? "aspect-[9/16] w-2/3 mx-auto" : "aspect-video")}>
                                                        {videoPreview && (
                                                            <video
                                                                src={videoPreview}
                                                                className="w-full h-full object-cover"
                                                                controls
                                                                controlsList="nodownload"
                                                            />
                                                        )}

                                                        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => { setVideoFile(null); setCurrentStep(1) }}
                                                                className="glass-btn bg-black/50 text-white hover:bg-black/70 text-xs h-7 px-2 backdrop-blur-md"
                                                            >
                                                                Change Video
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <h4 className="font-semibold text-sm line-clamp-1 mb-1">{title || "Video Title"}</h4>
                                                        <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: REVIEW */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="max-w-2xl mx-auto text-center"
                                >
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                                        <Check className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Ready to Upload?</h2>
                                    <p className="text-muted-foreground mb-8">
                                        Your video <span className="text-foreground font-medium">"{title}"</span> is ready to be published to your channel.
                                    </p>

                                    <div className="bg-secondary/20 p-6 rounded-2xl border border-white/5 text-left mb-8 flex gap-4">
                                        <div className={cn("aspect-video rounded-lg overflow-hidden shrink-0 bg-black", isShort ? "aspect-[9/16] w-20" : "w-32")}>
                                            {thumbnailPreview && <img src={thumbnailPreview} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold line-clamp-1 text-lg">{title}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description || "No description provided"}</p>
                                            <div className="mt-2 text-xs px-2 py-1 bg-white/10 rounded inline-block">
                                                {isShort ? 'Shorts' : 'Video'}
                                            </div>
                                        </div>
                                    </div>

                                    <Button size="lg" onClick={handleSubmit} className="w-full shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform">
                                        <Upload className="w-5 h-5 mr-2" />
                                        Upload Video
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Nav */}
                    {currentStep > 1 && !uploading && (
                        <div className="p-6 border-t border-white/5 flex justify-between bg-black/20">
                            <Button variant="ghost" onClick={prevStep}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            {currentStep === 2 && (
                                <Button onClick={nextStep} className="shadow-lg shadow-primary/20">
                                    Next Step
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

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
