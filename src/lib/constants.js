/**
 * Application constants
 */

export const VIDEO_CATEGORIES = [
    'Music',
    'Gaming',
    'Education',
    'Sports',
    'Entertainment',
    'News',
    'Technology',
    'Cooking',
    'Travel',
    'Fashion',
    'Fitness',
    'Comedy',
    'Science',
    'Movies',
    'Anime',
    'Documentary',
    'DIY',
    'Vlogs',
    'Other',
]

export const NOTIFICATION_TYPES = {
    LIKE: 'LIKE',
    COMMENT: 'COMMENT',
    SUBSCRIPTION: 'SUBSCRIPTION',
    UPLOAD: 'UPLOAD',
    REPLY: 'REPLY',
}

export const NOTIFICATION_LEVELS = {
    ALL: 'ALL',
    PERSONALIZED: 'PERSONALIZED',
    NONE: 'NONE',
}

export const SORT_OPTIONS = {
    LATEST: 'createdAt',
    OLDEST: 'createdAt',
    VIEWS: 'views',
    LIKES: 'likes',
    TITLE: 'title',
}

export const SORT_TYPES = {
    ASC: 'asc',
    DESC: 'desc',
}

export const FILE_SIZE_LIMITS = {
    AVATAR: 5 * 1024 * 1024, // 5MB
    COVER: 10 * 1024 * 1024, // 10MB
    THUMBNAIL: 5 * 1024 * 1024, // 5MB
    VIDEO: 500 * 1024 * 1024, // 500MB
}

export const FILE_TYPES = {
    VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
}

export const PAGINATION_LIMITS = {
    DEFAULT: 20,
    MAX: 50,
    MIN: 10,
}

export const VIDEO_QUALITY_OPTIONS = [
    { value: 'auto', label: 'Auto' },
    { value: '1080p', label: '1080p' },
    { value: '720p', label: '720p' },
    { value: '480p', label: '480p' },
    { value: '360p', label: '360p' },
]

export const PLAYBACK_SPEED_OPTIONS = [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: 'Normal' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 1.75, label: '1.75x' },
    { value: 2, label: '2x' },
]

export const TIME_PERIODS = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
]

export const COMMENT_MAX_LENGTH = 500
export const TITLE_MAX_LENGTH = 100
export const DESCRIPTION_MAX_LENGTH = 5000
export const MAX_TAGS = 10
export const TAG_MAX_LENGTH = 30

export const TRASH_RETENTION_DAYS = 30
