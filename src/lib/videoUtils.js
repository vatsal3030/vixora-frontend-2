/**
 * Helper: Convert transcript cues into chapter objects.
 * Groups every N cues or uses explicit chapter hints in the transcript.
 * Use this when a video has no explicit chapters field.
 */
export function cuesAsChapters(cues, maxChapters = 8, poster) {
    if (!cues || cues.length === 0) return []
    const step = Math.max(1, Math.floor(cues.length / maxChapters))
    return cues
        .filter((_, i) => i % step === 0)
        .slice(0, maxChapters)
        .map((cue, i) => ({
            title: cue.text?.slice(0, 60) || `Chapter ${i + 1}`,
            startSeconds: (cue.startMs ?? 0) / 1000,
            thumbnail: poster || null,
        }))
}
