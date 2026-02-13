import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { PlaylistVideoItem } from './PlaylistVideoItem'
import { Button } from '../ui/Button'
import { Loader2 } from 'lucide-react'

export function PlaylistVideoList({ videos, onReorder, onRemove }) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            const oldIndex = videos.findIndex(v => v._id === active.id)
            const newIndex = videos.findIndex(v => v._id === over.id)

            const newVideos = arrayMove(videos, oldIndex, newIndex)
            onReorder(newVideos)
        }
    }

    if (!videos || videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground mb-4">This playlist has no videos yet.</p>
                <Button variant="outline">Browse Videos</Button>
            </div>
        )
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={videos.map(v => v._id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-2 pb-10">
                    {videos.map((video, index) => (
                        <PlaylistVideoItem
                            key={video._id}
                            video={video}
                            index={index}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            </SortableContext>

            {/* Drag Overlay could be added for better UX, but not strictly required by prompt if performance is concern */}
        </DndContext>
    )
}
