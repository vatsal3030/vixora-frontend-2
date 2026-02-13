import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import getCroppedImg from '../../lib/imageUtils'
import { Loader2, RotateCw, ZoomIn } from 'lucide-react'

export function ImageCropModal({
    isOpen,
    onClose,
    imageSrc,
    onCropComplete,
    aspect = 1,
    title = 'Crop Image'
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [loading, setLoading] = useState(false)

    const onCropChange = (crop) => setCrop(crop)
    const onZoomChange = (zoom) => setZoom(zoom)

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        try {
            setLoading(true)
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation
            )
            onCropComplete(croppedImage)
            onClose()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="relative h-80 w-full bg-black/5 rounded-lg overflow-hidden mt-4">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-4">
                        <ZoomIn className="w-4 h-4 text-muted-foreground" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(val) => setZoom(val[0])}
                            className="flex-1"
                        />
                    </div>

                    <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-lg">
                        <span className="text-xs text-muted-foreground pl-2">Rotation: {rotation}°</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRotation((r) => (r + 90) % 360)}
                            className="text-xs h-8 gap-1"
                        >
                            <RotateCw className="w-3 h-3" />
                            Rotate
                        </Button>
                    </div>
                </div>

                <DialogFooter className="gap-2 mt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Apply Crop
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
