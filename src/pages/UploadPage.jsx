import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Check, ArrowRight, ArrowLeft, FileVideo, Smartphone, MonitorPlay, Tag } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { videoService, tweetService } from '../services/api'
import { uploadToCloudinary } from '../lib/cloudinaryUpload'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'sonner'
import { ImageCropModal } from '../components/common/ImageCropModal'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { Switch } from '../components/ui/Switch' // Assuming we have a Switch component or will use a checkbox

import { Video, FileText, Upload as UploadIcon, MessageSquareHeart } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'

const STEPS = [
    { number: 0, title: 'Category', icon: Tag },
    { number: 1, title: 'Upload', icon: Upload },
    { number: 2, title: 'Details', icon: FileVideo },
    { number: 3, title: 'Review', icon: Check }
]

const CATEGORIES = [
    { slug: 'music', label: 'Music', icon: '🎵' },
    { slug: 'gaming', label: 'Gaming', icon: '🎮' },
    { slug: 'tech', label: 'Tech', icon: '💻' },
    { slug: 'education', label: 'Education', icon: '📚' },
    { slug: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { slug: 'news', label: 'News', icon: '📰' },
    { slug: 'sports', label: 'Sports', icon: '⚽' },
    { slug: 'travel', label: 'Travel', icon: '✈️' },
    { slug: 'food', label: 'Food', icon: '🍕' },
    { slug: 'science', label: 'Science', icon: '🔬' },
    { slug: 'howto', label: 'How-To', icon: '🛠️' },
    { slug: 'comedy', label: 'Comedy', icon: '😂' },
    { slug: 'other', label: 'Other', icon: '✨' }
]

export default function UploadPage() {
    useDocumentTitle('Upload Video - Vixora')
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)

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
    const [isShort, setIsShort] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [selectedCategories, setSelectedCategories] = useState([])

    // Crop State
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState(null)

    // Tweet State
    const [tweetContent, setTweetContent] = useState('')
    const [tweetImageFile, setTweetImageFile] = useState(null)
    const [tweetImagePreview, setTweetImagePreview] = useState(null)
    const [postingTweet, setPostingTweet] = useState(false)

    const [searchParams] = useSearchParams()
    const defaultTab = searchParams.get('tab') || 'video'

    const handleTweetImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setTweetImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setTweetImagePreview(reader.result)
            reader.readAsDataURL(file)
        }
    }

    const removeTweetImage = () => {
        setTweetImageFile(null)
        setTweetImagePreview(null)
    }

    const handlePostTweet = async () => {
        if (!tweetContent.trim() && !tweetImageFile) return toast.error("Community post cannot be empty")
        setPostingTweet(true)
        try {
            let imagePublicId = null
            if (tweetImageFile) {
                const sigRes = await videoService.getUploadSignature('post')
                const sigData = sigRes.data.data
                const cloudData = await uploadToCloudinary(tweetImageFile, sigData)
                imagePublicId = cloudData.public_id
            }

            const payload = { content: tweetContent.trim() }
            if (imagePublicId) payload.imagePublicId = imagePublicId

            await tweetService.createTweet(payload)
            toast.success("Community post published successfully!")
            setTweetContent('')
            removeTweetImage()
            navigate('/dashboard?tab=tweets')
        } catch (err) {
            console.error(err)
            toast.error(err?.response?.data?.message || err.message || "Failed to post update")
        } finally {
            setPostingTweet(false)
        }
    }

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

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

    const toggleCategory = (slug) => {
        setSelectedCategories(prev => {
            if (prev.includes(slug)) return prev.filter(s => s !== slug)
            if (prev.length >= 3) {
                toast.error('You can select up to 3 categories')
                return prev
            }
            return [...prev, slug]
        })
    }

    // Upload progress state
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStage, setUploadStage] = useState('') // 'preparing' | 'uploading-video' | 'uploading-thumbnail' | 'finalizing' | 'complete'
    const uploadSubmittedRef = useRef(false)

    const handleSubmit = async () => {
        if (!videoFile || !thumbnailFile || !title) return
        if (uploadSubmittedRef.current) {
            toast.info('Upload already in progress, please wait...')
            return
        }

        uploadSubmittedRef.current = true
        setUploading(true)
        setUploadProgress(0)
        setUploadStage('preparing')
        toast.info('🚀 Upload starting! Please wait...')

        try {
            // 1. Create Upload Session & Get Video Upload Params
            const sessionRes = await videoService.createUploadSession({
                fileName: videoFile.name,
                fileSize: videoFile.size,
                mimeType: videoFile.type,
                uploadType: 'VIDEO'
            })

            const sessionId = sessionRes.data.data.id

            // 2. Get Signatures (Video & Thumbnail)
            setUploadStage('preparing')
            setUploadProgress(5)
            const [videoSigRes, thumbSigRes] = await Promise.all([
                videoService.getUploadSignature('video'),
                videoService.getUploadSignature('thumbnail')
            ])

            const videoSigData = videoSigRes.data.data
            if (!videoSigData.cloudName || !videoSigData.signature) {
                throw new Error("Failed to initialize secure upload session (Video)")
            }
            if (!videoSigData.resourceType) videoSigData.resourceType = 'video'

            const thumbSigData = thumbSigRes.data.data
            if (!thumbSigData.cloudName || !thumbSigData.signature) {
                throw new Error("Failed to initialize secure upload session (Thumbnail)")
            }
            thumbSigData.resourceType = 'image'

            // 3. Upload Video (with progress tracking — 10% to 80%)
            setUploadStage('uploading-video')
            setUploadProgress(10)
            const videoData = await uploadToCloudinary(videoFile, videoSigData, {
                onProgress: (pct) => {
                    // Map video progress 0-100 to overall 10-75
                    setUploadProgress(Math.round(10 + (pct * 0.65)))
                }
            })

            // 4. Upload Thumbnail (75% to 90%)
            setUploadStage('uploading-thumbnail')
            setUploadProgress(75)
            const thumbData = await uploadToCloudinary(thumbnailFile, thumbSigData, {
                onProgress: (pct) => {
                    setUploadProgress(Math.round(75 + (pct * 0.15)))
                }
            })

            // 5. Finalize (90% to 100%)
            setUploadStage('finalizing')
            setUploadProgress(90)
            const finalizePayload = {
                title,
                description,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                publicId: videoData.public_id,
                thumbnailPublicId: thumbData.public_id,
                duration: videoData.duration || 0,
                width: videoData.width || 0,
                height: videoData.height || 0,
                isShort,
                categories: selectedCategories.length > 0 ? selectedCategories : undefined
            }

            if (transcript.trim()) {
                finalizePayload.transcript = transcript.trim()
                finalizePayload.transcriptLanguage = 'en'
                finalizePayload.transcriptSource = 'IMPORTED'
            }

            const finalizeRes = await videoService.finalizeUpload(sessionId, finalizePayload)

            setUploadProgress(100)
            setUploadStage('complete')

            if (finalizeRes.data.success) {
                const videoId = finalizeRes.data.data.videoId || finalizeRes.data.data.id
                toast.success('🎉 Video uploaded successfully! Processing started.')
                
                // Wait a moment to show 100% before navigating
                await new Promise(r => setTimeout(r, 1200))

                if (videoId) {
                    navigate(`/watch/${videoId}`)
                } else {
                    navigate('/dashboard')
                }
            }

        } catch (error) {
            console.error("Upload failed", error)
            toast.error(error.message || "Upload failed. Please try again.")
            uploadSubmittedRef.current = false // Allow retry on error
        } finally {
            setUploading(false)
        }
    }

    return (
        <>
            <div className="min-h-[calc(100vh-64px)] py-4 px-4 flex justify-center">
                <div className="max-w-4xl mx-auto space-y-4 w-full">

                    <Tabs defaultValue={defaultTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4 glass-panel border-white/5 relative z-20 h-14 p-1">
                            <TabsTrigger value="video" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center justify-center gap-2 rounded-xl transition-all duration-300">
                                <Video className="w-4 h-4" />
                                <span className="font-bold uppercase tracking-wider text-xs">Upload Video</span>
                            </TabsTrigger>
                            <TabsTrigger value="tweet" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center justify-center gap-2 rounded-xl transition-all duration-300">
                                <MessageSquareHeart className="w-4 h-4" />
                                <span className="font-bold uppercase tracking-wider text-xs">Community Post</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="video" className="outline-none space-y-4 mt-0 relative">
                            {/* Modern Step Indicator */}
                            <div className="relative mb-6">
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />
                                <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 relative">
                                    {STEPS.map((step, i) => {
                                        const Icon = step.icon
                                        const isActive = currentStep === step.number
                                        const isPast = currentStep > step.number

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center group relative">
                                                <motion.button
                                                    onClick={() => (isPast || i < currentStep) && setCurrentStep(step.number)}
                                                    className={cn(
                                                        "relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                        isActive
                                                            ? "bg-primary text-primary-foreground shadow-[0_0_30px_rgba(239,68,68,0.3)] scale-110"
                                                            : isPast
                                                                ? "bg-secondary/80 text-primary border border-primary/20"
                                                                : "bg-[#111] text-muted-foreground border border-white/5 opacity-50"
                                                    )}
                                                    whileHover={!isActive ? { scale: 1.05, opacity: 1 } : {}}
                                                >
                                                    {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                                </motion.button>

                                                <div className="mt-3 flex flex-col items-center">
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
                                                        isActive ? "text-primary" : "text-muted-foreground/40"
                                                    )}>
                                                        {`Step 0${i + 1}`}
                                                    </span>
                                                    <span className={cn(
                                                        "text-xs font-semibold mt-0.5",
                                                        isActive ? "text-foreground" : "text-muted-foreground/60"
                                                    )}>
                                                        {step.title}
                                                    </span>
                                                </div>

                                                {/* Connecting line progress fill */}
                                                {i < STEPS.length - 1 && (
                                                    <div className="absolute top-6 left-[calc(50%+1.5rem)] w-[calc(100%-3rem)] h-[2px] pointer-events-none hidden sm:block">
                                                        <div className="h-full w-full bg-white/5" />
                                                        <motion.div
                                                            className="absolute top-0 left-0 h-full bg-primary"
                                                            initial={{ width: "0%" }}
                                                            animate={{ width: isPast ? "100%" : "0%" }}
                                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 p-4 md:p-6">
                                <AnimatePresence mode="wait">
                                    {/* STEP 0: CATEGORY */}
                                    {currentStep === 0 && (
                                        <motion.div
                                            key="step0"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6"
                                        >
                                            <div className="text-center mb-4">
                                                <h2 className="text-2xl font-bold mb-2">Choose Categories</h2>
                                                <p className="text-muted-foreground text-sm">Select up to 3 categories that best describe your video</p>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                                {CATEGORIES.map((cat) => {
                                                    const isSelected = selectedCategories.includes(cat.slug)
                                                    return (
                                                        <motion.button
                                                            key={cat.slug}
                                                            whileHover={{ y: -4, scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => toggleCategory(cat.slug)}
                                                            className={cn(
                                                                "group relative flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all duration-500",
                                                                isSelected
                                                                    ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                                                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                                                            )}
                                                        >
                                                            {isSelected && (
                                                                <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                                                            )}
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500",
                                                                isSelected ? "bg-primary/20 scale-110" : "bg-white/5 group-hover:bg-white/10"
                                                            )}>
                                                                {cat.icon}
                                                            </div>
                                                            <span className={cn(
                                                                "text-sm font-semibold transition-colors duration-300",
                                                                isSelected ? "text-primary" : "text-muted-foreground"
                                                            )}>
                                                                {cat.label}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                                                                    <Check className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                        </motion.button>
                                                    )
                                                })}
                                            </div>
                                            <div className="flex justify-between items-center pt-4">
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedCategories.length}/3 selected
                                                    {selectedCategories.length === 0 && ' (optional)'}
                                                </p>
                                                <Button onClick={() => setCurrentStep(1)} className="shadow-lg shadow-primary/20">
                                                    {selectedCategories.length > 0 ? 'Continue' : 'Skip'}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 1: UPLOAD */}
                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="h-full flex flex-col items-center justify-center text-center py-6"
                                        >
                                            <motion.div
                                                onClick={() => videoInputRef.current?.click()}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={cn(
                                                    "w-full max-w-2xl aspect-[16/9] border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-700 cursor-pointer group relative overflow-hidden",
                                                    dragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                <motion.div
                                                    className="w-24 h-24 rounded-[2rem] bg-secondary/50 flex items-center justify-center mb-8 relative z-10 border border-white/5"
                                                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                                                >
                                                    <Upload className="w-10 h-10 text-primary" />
                                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </motion.div>
                                                <div className="relative z-10 space-y-3">
                                                    <h3 className="text-3xl font-bold tracking-tight">Select Video File</h3>
                                                    <p className="text-muted-foreground text-lg font-light">Drag and drop your cinematic content here</p>
                                                </div>
                                                <div className="absolute bottom-10 flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                                                    <span className="flex items-center gap-2"><FileVideo className="w-4 h-4 text-primary/40" /> 4K Supported</span>
                                                    <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-primary/40" /> Adaptive Bitrate</span>
                                                </div>
                                            </motion.div>
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
                                                <div className="lg:col-span-2 space-y-4">
                                                    <div className="glass-card p-4 sm:p-6 rounded-[1.5rem] border-white/5 bg-white/[0.01] space-y-6">
                                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                            <div>
                                                                <h3 className="text-xl font-bold">Video Metadata</h3>
                                                                <p className="text-sm text-muted-foreground font-light">Information about your broadcast</p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => { setVideoFile(null); setCurrentStep(1) }}
                                                                className="text-primary hover:bg-primary/10 rounded-xl"
                                                            >
                                                                Change Video
                                                            </Button>
                                                        </div>

                                                        <div className="p-1 bg-[#111] rounded-2xl border border-white/5 flex gap-1">
                                                            <button
                                                                onClick={() => setIsShort(false)}
                                                                className={cn(
                                                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500",
                                                                    !isShort ? "bg-white/5 text-primary border border-white/10 shadow-lg" : "text-muted-foreground hover:bg-white/[0.02]"
                                                                )}
                                                            >
                                                                <MonitorPlay className="w-4 h-4" />
                                                                <span className="text-xs font-bold uppercase tracking-widest">Standard Video</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setIsShort(true)}
                                                                className={cn(
                                                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500",
                                                                    isShort ? "bg-white/5 text-primary border border-white/10 shadow-lg" : "text-muted-foreground hover:bg-white/[0.02]"
                                                                )}
                                                            >
                                                                <Smartphone className="w-4 h-4" />
                                                                <span className="text-xs font-bold uppercase tracking-widest">Vertical Short</span>
                                                            </button>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="space-y-3">
                                                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                                                                <Input
                                                                    value={title}
                                                                    onChange={(e) => setTitle(e.target.value)}
                                                                    placeholder="Give your video a catchy title"
                                                                    className="glass-input h-14 text-lg rounded-2xl border-white/5 focus:border-primary/50"
                                                                />
                                                            </div>
                                                            <div className="space-y-3">
                                                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                                                                <textarea
                                                                    value={description}
                                                                    onChange={(e) => setDescription(e.target.value)}
                                                                    placeholder="What is your video about?"
                                                                    className="w-full glass-input rounded-2xl p-4 min-h-[160px] resize-y border border-white/5 focus:border-primary/50 transition-all"
                                                                />
                                                            </div>
                                                            <div className="grid sm:grid-cols-2 gap-6">
                                                                <div className="space-y-3">
                                                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Tags</label>
                                                                    <Input
                                                                        value={tags}
                                                                        onChange={(e) => setTags(e.target.value)}
                                                                        placeholder="gaming, vlog, tutorial"
                                                                        className="glass-input h-12 rounded-2xl border-white/5"
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center justify-between ml-1">
                                                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Context</label>
                                                                        <span className="text-[10px] text-primary/60 font-medium">RECOMMENDED</span>
                                                                    </div>
                                                                    <textarea
                                                                        value={transcript}
                                                                        onChange={(e) => setTranscript(e.target.value)}
                                                                        placeholder="Paste transcript for AI analysis..."
                                                                        className="w-full glass-input rounded-2xl p-3 min-h-[48px] h-12 resize-none border border-white/5 focus:border-primary/50 transition-all font-mono text-xs overflow-hidden hover:overflow-y-auto"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <h3 className="text-lg font-semibold">Thumbnail</h3>
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
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="max-w-2xl mx-auto"
                                        >
                                            <div className="glass-card p-10 sm:p-14 rounded-[3rem] border border-white/5 bg-white/[0.01] text-center space-y-10 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50" />
                                                <div className="relative z-10">
                                                    <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                                                        <Check className="w-12 h-12 text-primary" />
                                                    </div>
                                                    <h2 className="text-4xl font-bold tracking-tight mb-4">Final Review</h2>
                                                    <p className="text-muted-foreground text-lg font-light max-w-md mx-auto">
                                                        Verification complete. Your cinematic broadcast is ready for the platform.
                                                    </p>
                                                </div>
                                                <div className="relative z-10 p-6 rounded-[2rem] bg-black/40 border border-white/5 flex flex-col sm:flex-row gap-6 text-left group">
                                                    <div className={cn("aspect-video rounded-2xl overflow-hidden shrink-0 bg-black/50 border border-white/10 group-hover:border-primary/50 transition-colors duration-500", isShort ? "aspect-[9/16] w-24" : "w-40")}>
                                                        {thumbnailPreview && <img src={thumbnailPreview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Final Preview" />}
                                                    </div>
                                                    <div className="flex flex-col justify-center flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg">
                                                                {isShort ? 'Shorts' : 'Standard'}
                                                            </span>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                {selectedCategories.length} Categories
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-2xl line-clamp-1 mb-2">{title}</h4>
                                                        <p className="text-sm text-muted-foreground font-light line-clamp-2">{description || "No description provided"}</p>
                                                    </div>
                                                </div>
                                                <Button size="lg" onClick={handleSubmit} disabled={uploading || uploadSubmittedRef.current} className="w-full h-16 rounded-[1.5rem] text-lg font-bold shadow-[0_20px_40px_-15px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                                                    {uploading ? (
                                                        <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Uploading... {uploadProgress}%</>
                                                    ) : (
                                                        <><Upload className="w-5 h-5 mr-3 group-hover:translate-y-[-2px] transition-transform" /> Initialize Broadcast</>
                                                    )}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer Nav */}
                            {
                                currentStep > 0 && !uploading && (
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
                                )
                            }

                        </TabsContent>

                        <TabsContent value="tweet" className="outline-none mt-0">
                            <div className="glass-card p-6 md:p-8 rounded-2xl border-white/5 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Create Community Post</h2>
                                    <p className="text-muted-foreground text-sm">Share an update, ask a question, or interact with your subscribers.</p>
                                </div>

                                <textarea
                                    value={tweetContent}
                                    onChange={e => setTweetContent(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="w-full glass-input rounded-xl p-4 min-h-[150px] resize-y text-sm leading-relaxed"
                                    autoFocus
                                />

                                {tweetImagePreview && (
                                    <div className="relative mb-4 inline-block">
                                        <img src={tweetImagePreview} alt="Preview" className="max-h-60 rounded-xl border border-white/10 object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeTweetImage}
                                            className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full hover:bg-black/80 text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="flex gap-1">
                                        <label className="cursor-pointer p-2 hover:bg-primary/20 hover:text-primary rounded-full text-muted-foreground transition-colors group">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleTweetImageSelect} />
                                            <ImageIcon className="w-5 h-5 group-hover:text-primary transition-colors" />
                                        </label>
                                    </div>
                                    <Button
                                        onClick={handlePostTweet}
                                        disabled={postingTweet || (!tweetContent.trim() && !tweetImageFile)}
                                        className="shadow-lg shadow-primary/20 h-10 px-6 rounded-full"
                                    >
                                        {postingTweet ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                                        ) : (
                                            <>Publish Post <ArrowRight className="w-4 h-4 ml-2" /></>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div >
            </div >

            <ImageCropModal
                isOpen={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                imageSrc={imageToCrop}
                onCropComplete={handleCropComplete}
                aspect={16 / 9}
                title="Crop Thumbnail"
            />

            {/* Upload Progress Overlay */}
            <AnimatePresence>
                {uploading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-[90vw] max-w-md p-8 rounded-3xl bg-[#1a1a1a] border border-white/10 shadow-2xl text-center space-y-6"
                        >
                            {/* Upload Icon */}
                            <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                {uploadStage === 'complete' ? (
                                    <Check className="w-10 h-10 text-green-400" />
                                ) : (
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                )}
                            </div>

                            {/* Progress Percentage */}
                            <div>
                                <p className="text-5xl font-bold text-white mb-1">{uploadProgress}%</p>
                                <p className="text-muted-foreground text-sm">
                                    {uploadStage === 'preparing' && 'Preparing upload session...'}
                                    {uploadStage === 'uploading-video' && 'Uploading video...'}
                                    {uploadStage === 'uploading-thumbnail' && 'Uploading thumbnail...'}
                                    {uploadStage === 'finalizing' && 'Finalizing your broadcast...'}
                                    {uploadStage === 'complete' && 'Upload complete! Redirecting...'}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className={cn(
                                        "h-full rounded-full transition-colors duration-300",
                                        uploadStage === 'complete' ? 'bg-green-500' : 'bg-primary'
                                    )}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                                />
                            </div>

                            {/* File Info */}
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p className="truncate">📁 {videoFile?.name}</p>
                                <p>{videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB` : ''}</p>
                            </div>

                            {uploadStage !== 'complete' && (
                                <p className="text-[10px] text-muted-foreground/60">Please do not close this page during the upload.</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
