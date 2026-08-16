import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { userService } from '../../services/api'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'

const AVATAR_PRESETS = [
    { id: 'fun-emoji', label: 'Emoji' },
    { id: 'bottts', label: 'Robots' },
    { id: 'avataaars', label: 'Avatars' },
    { id: 'micah', label: 'Micah' },
    { id: 'lorelei', label: 'Lorelei' },
    { id: 'pixel-art', label: 'Pixel' },
    { id: 'identicon', label: 'Identicon' },
    { id: 'rings', label: 'Rings' }
]

const COVER_PRESETS = [
    { id: 'shapes', label: 'Shapes' },
    { id: 'rings', label: 'Rings' },
    { id: 'identicon', label: 'Identicon' },
    { id: 'pixel-art', label: 'Pixel' }
]

export function PresetSelectorModal({ isOpen, onClose, type = 'avatar' }) // type is 'avatar' or 'cover'
{
    const { user, checkAuth } = useAuth()
    const [selectedType, setSelectedType] = useState(null)
    const [loading, setLoading] = useState(false)

    if (!user) return null

    const presets = type === 'avatar' ? AVATAR_PRESETS : COVER_PRESETS
    const title = type === 'avatar' ? 'Choose Avatar Preset' : 'Choose Cover Preset'

    const handleSave = async () => {
        if (!selectedType) return

        setLoading(true)
        try {
            if (type === 'avatar') {
                await userService.updateDefaultAvatar(selectedType)
            } else {
                await userService.updateDefaultCoverImage(selectedType)
            }
            toast.success(`${type === 'avatar' ? 'Avatar' : 'Cover image'} updated with preset`)
            await checkAuth()
            onClose()
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to update preset')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-background border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
                        style={{ maxHeight: '90vh' }}
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {presets.map((preset) => {
                                    // Generate a preview URL
                                    let previewUrl = ''
                                    if (type === 'avatar') {
                                        previewUrl = `https://api.dicebear.com/7.x/${preset.id}/svg?seed=${user.username}`
                                    } else {
                                        previewUrl = `https://api.dicebear.com/7.x/${preset.id}/svg?seed=${user.username}cover&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
                                    }

                                    const isSelected = selectedType === preset.id

                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => setSelectedType(preset.id)}
                                            className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                                                isSelected ? 'border-primary' : 'border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="absolute inset-0 bg-secondary/50 -z-10" />
                                            <img
                                                src={previewUrl}
                                                alt={preset.label}
                                                className={`w-full h-full object-cover transition-transform duration-300 ${
                                                    isSelected ? 'scale-110' : 'group-hover:scale-110'
                                                }`}
                                            />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                    <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
                                                        <Check className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                <span className="text-xs font-medium text-white">{preset.label}</span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-secondary/20">
                            <Button variant="ghost" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={!selectedType || loading} className="min-w-[120px]">
                                {loading ? 'Saving...' : 'Save Preset'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
