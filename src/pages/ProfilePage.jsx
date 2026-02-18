import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService, videoService } from '../services/api'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { toast } from 'sonner'
import { Camera, Loader2, Save, Plus, Trash, ExternalLink, User, Layout, Link as LinkIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { ImageCropModal } from '../components/common/ImageCropModal'
import { getMediaUrl } from '../lib/media'

export default function ProfilePage() {
    const { user, checkAuth } = useAuth()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('details') // details, branding, links
    const [isDirty, setIsDirty] = useState(false)

    // Account details
    const [fullName, setFullName] = useState('')

    // Channel details
    const [channelData, setChannelData] = useState({
        description: '', // Maps to backend 'description' field
        channelCategory: '',
        channelLinks: [] // Array of { title, url }
    })

    const avatarInputRef = useRef(null)
    const coverInputRef = useRef(null)

    // Store initial state to compare for changes
    const initialDataRef = useRef(null)

    // Cropping State
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState(null)
    const [cropAspect, setCropAspect] = useState(1)
    const [cropType, setCropType] = useState('avatar') // 'avatar' | 'cover'

    useEffect(() => {
        if (user) {
            // Debug user object to ensure we map correctly


            const initialData = {
                fullName: user.fullName || '',
                // Use 'description' as primary key if available
                description: user.description || user.channelDescription || '',
                channelCategory: user.channelCategory || '',
                channelLinks: Array.isArray(user.channelLinks) ? user.channelLinks : []
            }

            setFullName(initialData.fullName)
            setChannelData({
                description: initialData.description,
                channelCategory: initialData.channelCategory,
                channelLinks: initialData.channelLinks
            })

            // Deep copy for initial ref
            initialDataRef.current = JSON.parse(JSON.stringify(initialData))
        }
    }, [user])

    // Check for changes effect
    useEffect(() => {
        if (!initialDataRef.current) return

        const hasFullNameChanged = fullName !== initialDataRef.current.fullName
        const hasDescriptionChanged = channelData.description !== initialDataRef.current.description
        const hasCategoryChanged = channelData.channelCategory !== initialDataRef.current.channelCategory
        const hasLinksChanged = JSON.stringify(channelData.channelLinks) !== JSON.stringify(initialDataRef.current.channelLinks)

        const dirty = hasFullNameChanged || hasDescriptionChanged || hasCategoryChanged || hasLinksChanged
        setIsDirty(dirty)
    }, [fullName, channelData, user])

    const handleChannelChange = (e) => {
        const { name, value } = e.target
        setChannelData(prev => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (value) => {
        setChannelData(prev => ({ ...prev, channelCategory: value }))
    }

    const handleLinkChange = (index, field, value) => {
        const newLinks = [...channelData.channelLinks]
        newLinks[index] = { ...newLinks[index], [field]: value }
        setChannelData(prev => ({ ...prev, channelLinks: newLinks }))
    }

    const addLink = () => {
        setChannelData(prev => ({
            ...prev,
            channelLinks: [...prev.channelLinks, { title: '', url: '' }]
        }))
    }

    const removeLink = (index) => {
        const newLinks = channelData.channelLinks.filter((_, i) => i !== index)
        setChannelData(prev => ({ ...prev, channelLinks: newLinks }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isDirty) return

        setLoading(true)

        try {
            if (fullName !== user?.fullName) {
                await userService.updateProfile({ fullName, email: user.email })
            }

            // Map frontend 'description' back to payload
            // Send both keys to be safe if backend is ambiguous
            const channelPayload = {
                description: channelData.description,
                channelDescription: channelData.description,
                channelCategory: channelData.channelCategory,
                channelLinks: channelData.channelLinks.filter(l => l.title && l.url)
            }

            await userService.updateChannelDescription(channelPayload)

            toast.success('Profile updated successfully')
            await checkAuth()
            // Reset dirty state logic handled by useEffect when user changes
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = (e, type) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.addEventListener('load', () => {
            setImageToCrop(reader.result)
            setCropType(type)
            setCropAspect(type === 'avatar' ? 1 : 16 / 9)
            setCropModalOpen(true)
        })
        reader.readAsDataURL(file)
        e.target.value = '' // Reset input
    }

    // Generic direct upload helper (could be moved to utils)
    const uploadToCloudinary = async (file, signatureData) => {
        const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${signatureData.resourceType}/upload`
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', signatureData.api_key)
        formData.append('timestamp', signatureData.timestamp)
        formData.append('signature', signatureData.signature)
        formData.append('public_id', signatureData.publicId)

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', url)
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText))
                } else {
                    reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`))
                }
            }
            xhr.onerror = () => reject(new Error('Network error'))
            xhr.send(formData)
        })
    }

    const handleCropComplete = async (croppedBlob) => {
        const loadingToast = toast.loading(`Uploading ${cropType}...`)

        try {
            // 1. Get Signature
            const resourceType = cropType === 'avatar' ? 'avatar' : 'coverImage' // Frontend 'coverImage' -> Backend 'thumbnail'? Wait, handoff says 'video', 'thumbnail', 'avatar', 'post'. Fallback 'misc'.
            // Actually, for cover, let's use 'thumbnail' or 'post' or check backend mapping. 
            // Handoff says: video->videos, thumbnail->thumbnails, avatar->avatars, post->posts.
            // But Cover Image Update expects `covers/<userId>`. 
            // The backend mapping list in Handoff Step B IS: video, thumbnail, avatar, post.
            // It DOES NOT explicitly list 'cover' in the signature mapping list, but the update endpoint expects it in `covers/`.
            // Wait, looking closer at Handoff Step B: "resourceType to Cloudinary folder mapping from backend... video, thumbnail, avatar, post".
            // It seems 'cover' isn't a top-level resource type in the signature endpoint's documented switch case?
            // BUT Section 3.2 says "Upload cover image to Cloudinary under covers/<userId>".
            // If the signature endpoint doesn't support 'cover' type, we might have an issue.
            // HOWEVER, usually 'post' or 'thumbnail' is just an image. 
            // Let's try sending 'cover' as resourceType to signature endpoint first, assuming the backend documentation list was non-exhaustive or we use 'post' as a generic image if cover fails.
            // Actually, let's try 'post' if 'cover' isn't listed, or just assume the backend developer handled 'cover'. 
            // Let's try 'cover' first. If that fails (400), we know.
            // *Correction*: Handoff 3.2 says "Upload cover image to Cloudinary under covers/<userId>".
            // Let's assume we pass 'cover' to `getUploadSignature` and hope the backend supports it.
            // If not, I'll default to 'image' or 'post'.

            // Re-reading Handoff "3.2 Image metadata finalize APIs": 
            // "1. Upload cover image to Cloudinary under covers/<userId>"
            // This implies the signature MUST return a publicId starting with `covers/`.
            // So `getUploadSignature('cover')` is the most logical guess.

            const sigRes = await videoService.getUploadSignature(cropType === 'avatar' ? 'avatar' : 'cover') // 'cover' or 'coverImage'? Let's try 'cover'.
            const sigData = sigRes.data.data

            // 2. Upload to Cloudinary
            const cloudData = await uploadToCloudinary(croppedBlob, sigData)

            // 3. Update Backend with Public ID
            const serviceMethod = cropType === 'avatar' ? userService.updateAvatar : userService.updateCoverImage
            const payload = cropType === 'avatar'
                ? { avatarPublicId: cloudData.public_id }
                : { coverImagePublicId: cloudData.public_id }

            const response = await serviceMethod(payload)

            if (response.status === 200) {
                toast.success(`${cropType === 'avatar' ? 'Avatar' : 'Cover image'} updated`, { id: loadingToast })
                await checkAuth()
            }
        } catch (error) {
            console.error(error)
            toast.error('Upload failed. ' + (error.message || ''), { id: loadingToast })
        }
    }

    if (!user) return null

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative ${activeTab === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
            {activeTab === id && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
            )}
        </button>
    )

    return (
        <div className="min-h-screen pb-20">
            {/* Hero / Cover Section */}
            <div className="relative h-48 md:h-64 lg:h-80 w-full bg-muted group overflow-hidden">
                <img
                    src={getMediaUrl(user.coverImage) || 'https://via.placeholder.com/1200x320'}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />

                {/* Cover Edit Button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button variant="ghost" className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md gap-2" onClick={() => coverInputRef.current?.click()}>
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">Change Cover</span>
                    </Button>
                    <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Profile Info */}
                {/* Removed negative margin from container to fix text misalignment. Added negative margin to Avatar only. */}
                <div className="relative mb-8 flex flex-col md:flex-row items-end gap-6 pb-6 border-b border-white/10">

                    {/* Avatar Container with Negative Margin */}
                    <div className="relative group shrink-0 mx-auto md:mx-0 -mt-16 md:-mt-20">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[4px] border-background overflow-hidden bg-secondary shadow-premium relative z-10">
                            <Avatar src={getMediaUrl(user.avatar)} fallback={user.username} size="w-full h-full text-5xl" className="rounded-none" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 cursor-pointer backdrop-blur-[2px] m-1" onClick={() => avatarInputRef.current?.click()}>
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                    </div>

                    <div className="flex-1 mb-2 text-center md:text-left w-full">
                        <h1 className="text-3xl font-bold text-foreground">{user.fullName || user.username}</h1>
                        <p className="text-muted-foreground">@{user.username}</p>
                        <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                            <a href={`/@${user.username}`} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full transition-colors">
                                View Channel <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    <div className="mb-2 w-full md:w-auto flex justify-center md:justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !isDirty}
                            className={`w-full md:w-auto gap-2 shadow-lg transition-all ${isDirty ? 'shadow-primary/20 hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'}`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Sidebar (Desktop) / Tabs (Mobile) */}
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="glass-card rounded-xl p-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible sticky top-24 z-30">
                            <TabButton id="details" label="Channel Details" icon={User} />
                            <TabButton id="branding" label="Branding" icon={Layout} />
                            <TabButton id="links" label="Links & Socials" icon={LinkIcon} />
                        </div>
                    </div>

                    {/* Content Form */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 space-y-6"
                            >
                                {activeTab === 'details' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-1">Channel Details</h3>
                                            <p className="text-sm text-muted-foreground mb-6">Update your channel name and description.</p>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Display Name</label>
                                                    <input
                                                        type="text"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="w-full glass-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Channel Description</label>
                                                    <textarea
                                                        name="description"
                                                        value={channelData.description}
                                                        onChange={handleChannelChange}
                                                        rows="5"
                                                        className="w-full glass-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-y min-h-[120px]"
                                                        placeholder="Tell viewers about your channel..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Category</label>
                                                    <Select value={channelData.channelCategory} onValueChange={handleCategoryChange}>
                                                        <SelectTrigger className="w-full bg-secondary/30 border-white/10 h-[50px] rounded-xl">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Gaming">Gaming</SelectItem>
                                                            <SelectItem value="Technology">Technology</SelectItem>
                                                            <SelectItem value="Education">Education</SelectItem>
                                                            <SelectItem value="Music">Music</SelectItem>
                                                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                                                            <SelectItem value="News">News</SelectItem>
                                                            <SelectItem value="Vlogs">Vlogs</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'branding' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-1">Branding</h3>
                                            <p className="text-sm text-muted-foreground mb-6">Manage your channel's visual identity.</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-sm font-medium block">Profile Picture</label>
                                                    <div className="flex flex-col items-center p-6 border-2 border-dashed border-white/10 rounded-2xl glass-card hover:bg-white/5 transition-colors">
                                                        <Avatar src={getMediaUrl(user.avatar)} fallback={user.username} size="xl" className="mb-4 text-2xl" />
                                                        <p className="text-xs text-muted-foreground text-center mb-4">Recommended: 98x98 px<br />PNG or JPG. Max 4MB.</p>
                                                        <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} className="glass-btn border-white/10">Change</Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-sm font-medium block">Banner Image</label>
                                                    <div className="flex flex-col items-center p-6 border-2 border-dashed border-white/10 rounded-2xl glass-card hover:bg-white/5 transition-colors">
                                                        <div className="w-full aspect-[3/1] bg-black/20 rounded-lg overflow-hidden mb-4 relative">
                                                            <img src={getMediaUrl(user.coverImage)} className="w-full h-full object-cover opacity-80" alt="Banner preview" />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground text-center mb-4">Recommended: 2048x1152 px<br />Aspect ratio 16:9.</p>
                                                        <Button variant="outline" size="sm" onClick={() => coverInputRef.current?.click()} className="glass-btn border-white/10">Change</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'links' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-1">Links</h3>
                                                <p className="text-sm text-muted-foreground">Add links to your sites and social media.</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={addLink} className="gap-2">
                                                <Plus className="w-4 h-4" />
                                                Add Link
                                            </Button>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            {channelData.channelLinks.length === 0 ? (
                                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                                                    <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                                    <p className="text-muted-foreground">No links added yet.</p>
                                                </div>
                                            ) : (
                                                channelData.channelLinks.map((link, index) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        key={index}
                                                        className="flex gap-4 items-start bg-secondary/20 p-4 rounded-xl group"
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                                            <div className="space-y-1">
                                                                <label className="text-xs text-muted-foreground ml-1">Link Title</label>
                                                                <input
                                                                    placeholder="e.g. My Website"
                                                                    value={link.title}
                                                                    onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                                                                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-xs text-muted-foreground ml-1">URL</label>
                                                                <input
                                                                    placeholder="https://..."
                                                                    value={link.url}
                                                                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                                                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLink(index)}
                                                            className="mt-6 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <ImageCropModal
                isOpen={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                imageSrc={imageToCrop}
                onCropComplete={handleCropComplete}
                aspect={cropAspect}
                title={cropType === 'avatar' ? 'Crop Profile Picture' : 'Crop Channel Banner'}
            />
        </div>
    )
}
