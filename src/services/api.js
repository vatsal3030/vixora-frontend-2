import api from './axios'

// Auth Service
export const authService = {
    register: (formData) => api.post('/users/register', formData),
    verifyEmail: (data) => api.post('/users/verify-email', data),
    resendOtp: (identifier) => api.post('/users/resend-otp', { identifier }),
    login: (data) => api.post('/users/login', data),
    getGoogleAuthUrl: () => `${api.defaults.baseURL}/auth/google`,
    logout: () => api.post('/users/logout'),
    refreshToken: (refreshToken) => api.post('/users/refresh-token', { refreshToken }),
    getCurrentUser: () => api.get('/users/current-user'),
    forgotPassword: (email) => api.post('/users/forgot-password', { email }),
    forgotPasswordVerify: (data) => api.post('/users/forgot-password/verify', data),
    resetPassword: (data) => api.post('/users/reset-password', data)
}

// Video Service
export const videoService = {
    getVideos: (params = {}) => {
        const defaultParams = { page: 1, limit: 20, sortBy: 'createdAt', sortType: 'desc', ...params }
        return api.get('/videos', { params: defaultParams })
    },
    getVideo: (videoId) => api.get(`/videos/${videoId}`),
    getMyVideos: (params = {}) => api.get('/videos/me', { params }),
    getDeletedVideos: (params = {}) => api.get('/videos/trash/me', { params }),

    // --- New Direct Cloudinary Upload Flow ---
    // 1. Create Session
    createUploadSession: (data) => api.post('/upload/session', data),

    // 2. Get Signatures (resourceType: 'video' | 'thumbnail' | 'avatar' | 'post')
    getUploadSignature: (resourceType) => api.get('/upload/signature', { params: { resourceType } }),

    // 3. Report Progress (optional)
    reportProgress: (sessionId, uploadedBytes) => api.patch(`/upload/progress/${sessionId}`, { uploadedBytes }),

    // 4. Finalize
    finalizeUpload: (sessionId, data) => api.post(`/upload/finalize/${sessionId}`, data),

    // 5. Processing & Publish
    getProcessingStatus: (videoId) => api.get(`/videos/${videoId}/processing-status`),
    publishVideo: (videoId) => api.patch(`/videos/${videoId}/publish`),
    cancelProcessing: (videoId) => api.patch(`/videos/${videoId}/cancel-processing`),
    // -----------------------------------------

    updateVideo: (videoId, data) => api.patch(`/videos/${videoId}`, data),
    deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
    restoreVideo: (videoId) => api.patch(`/videos/${videoId}/restore`),
    getUserVideos: (userId, params = {}) => api.get(`/videos/user/${userId}`, { params })
}

// Comment Service  
export const commentService = {
    getComments: (videoId, params = {}) => api.get(`/comments/${videoId}`, { params }),
    addComment: (videoId, content) => api.post(`/comments/${videoId}`, { content }),
    updateComment: (commentId, content) => api.patch(`/comments/c/${commentId}`, { content }),
    deleteComment: (commentId) => api.delete(`/comments/c/${commentId}`)
}

// Like Service
export const likeService = {
    toggleVideoLike: (videoId) => api.post(`/likes/toggle/v/${videoId}`),
    toggleCommentLike: (commentId) => api.post(`/likes/toggle/c/${commentId}`),
    toggleTweetLike: (tweetId) => api.post(`/likes/toggle/t/${tweetId}`),
    getLikedVideos: (params = {}) => api.get('/likes/videos', { params })
}

// Subscription Service
export const subscriptionService = {
    toggleSubscription: (channelId) => api.post(`/subscriptions/c/${channelId}/subscribe`),
    setNotificationLevel: (channelId, level) => api.patch(`/subscriptions/c/${channelId}/notifications`, { level }),
    getSubscriptionStatus: (channelId) => api.get(`/subscriptions/c/${channelId}/status`),
    getSubscriberCount: (channelId) => api.get(`/subscriptions/c/${channelId}/subscribers/count`),
    getSubscriptions: (params = {}) => api.get('/subscriptions/u/subscriptions', { params }),
    // Subscribed channel videos feed (uses /feed/subscriptions, not /subscriptions)
    getSubscribedVideos: (params = {}) => api.get('/feed/subscriptions', { params })
}

// Channel Service
export const channelService = {
    getChannel: (channelId) => api.get(`/channels/${channelId}`),
    getChannelAbout: (channelId) => api.get(`/channels/${channelId}/about`),
    getChannelByUsername: (username) => api.get(`/users/u/${username}`),
    // These use the correct /channels/:id/* endpoints (not /videos/user/:id)
    getChannelVideos: (channelId, params = {}) => api.get(`/channels/${channelId}/videos`, { params }),
    getChannelShorts: (channelId, params = {}) => api.get(`/channels/${channelId}/shorts`, { params }),
    getChannelPlaylists: (channelId, params = {}) => api.get(`/channels/${channelId}/playlists`, { params }),
    getChannelTweets: (channelId, params = {}) => api.get(`/channels/${channelId}/tweets`, { params })
}

// User Service
export const userService = {
    updateProfile: (data) => api.patch('/users/update-account', data),
    changePassword: (data) => api.post('/users/change-password', data),
    deleteAccount: (data) => api.delete('/users/delete-account', { data }),
    restoreAccountRequest: (data) => api.patch('/users/restore-account/request', data),
    restoreAccountConfirm: (data) => api.patch('/users/restore-account/confirm', data),

    // Updated for direct upload flow - expects { avatarPublicId } or { coverImagePublicId }
    updateAvatar: (data) => api.patch('/users/update-avatar', data),
    updateCoverImage: (data) => api.patch('/users/update-coverImage', data),

    getWatchHistory: () => api.get('/watch-history'),
    getUserChannelProfile: (username) => api.get(`/users/u/${username}`),
    updateChannelDescription: (data) => api.patch('/users/update-description', data),
    getUserById: (userId) => api.get(`/users/id/${userId}`)
}

// Feed Service
export const feedService = {
    getHomeFeed: (params = {}) => api.get('/feed/home', { params }),
    getSubscriptionsFeed: (params = {}) => api.get('/feed/subscriptions', { params }),
    getTrendingFeed: (params = {}) => api.get('/feed/trending', { params }),
    getShortsFeed: (params = {}) => api.get('/feed/shorts', { params }) // Corrected endpoint based on handoff
}

// Playlist Service
export const playlistService = {
    getMyPlaylists: (params = {}) => api.get('/playlists/user/me', { params }),
    getUserPlaylists: (userId, params = {}) => api.get(`/playlists/user/${userId}`, { params }),
    getDeletedPlaylists: () => api.get('/playlists/trash/me'),
    createPlaylist: (data) => api.post('/playlists', data),
    addVideoToPlaylist: (videoId, playlistId) => api.patch(`/playlists/add/${videoId}/${playlistId}`),
    removeVideoFromPlaylist: (videoId, playlistId) => api.patch(`/playlists/remove/${videoId}/${playlistId}`),
    getPlaylist: (playlistId) => api.get(`/playlists/${playlistId}`),
    updatePlaylist: (playlistId, data) => api.patch(`/playlists/${playlistId}`, data),
    deletePlaylist: (playlistId) => api.delete(`/playlists/${playlistId}`),
    restorePlaylist: (playlistId) => api.patch(`/playlists/${playlistId}/restore`),
    togglePlaylistPrivacy: (playlistId) => api.patch(`/playlists/${playlistId}/toggle-visibility`),
    // Watch Later specific APIs
    toggleWatchLater: (videoId) => api.post(`/playlists/watch-later/${videoId}`),
    getWatchLater: () => api.get('/playlists/watch-later'),
    reorderPlaylistVideos: (playlistId, videoIds) => api.put(`/playlists/${playlistId}/reorder`, { videoIds })
}

// Tweet Service
export const tweetService = {
    createTweet: (data) => api.post('/tweets', data),
    getUserTweets: (userId, params = {}) => api.get(`/tweets/user/${userId}`, { params }),
    getTweetById: (tweetId) => api.get(`/tweets/${tweetId}`),
    updateTweet: (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content }),
    deleteTweet: (tweetId) => api.delete(`/tweets/${tweetId}`),
    restoreTweet: (tweetId) => api.patch(`/tweets/${tweetId}/restore`),
    getDeletedTweets: () => api.get('/tweets/trash/me')
}

// Notification Service
export const notificationService = {
    getAllNotifications: (params = {}) => api.get('/notifications', { params }),
    getUnreadNotifications: (params = {}) => api.get('/notifications/unread', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
    deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
    deleteAllNotifications: () => api.delete('/notifications')
}

// Watch History Service
export const watchHistoryService = {
    saveWatchProgress: (videoId, progress, duration) => api.post('/watch-history', { videoId, progress, duration }),
    getWatchProgress: (videoId) => api.get(`/watch-history/${videoId}`),
    getHistory: (params = {}) => api.get('/watch-history', { params }),
    getContinueWatching: (params = {}) => api.get('/watch-history', { params }), // Alias or distinct endpoint if needed
    getProgressForVideos: (videoIds) => api.post('/watch-history/bulk', { videoIds }),
    clearHistory: () => api.delete('/watch-history')
}

// Dashboard Service
export const dashboardService = {
    // Single-call full dashboard (recommended)
    getFullDashboard: (params = {}) => api.get('/dashboard/full', { params }),
    getOverview: (period = '7d') => api.get('/dashboard/overview', { params: { period } }),
    getAnalytics: (period = '7d') => api.get('/dashboard/analytics', { params: { period } }),
    getTopVideos: (params = {}) => api.get('/dashboard/top-videos', { params }),
    getGrowthStats: (period = '7d') => api.get('/dashboard/growth', { params: { period } }),
    getInsights: () => api.get('/dashboard/insights')
}

// Watch Service (for video streaming)
export const watchService = {
    // Initial load: increments views + returns quality-resolved playback URL
    watchVideo: (videoId, quality = 'auto') =>
        api.get(`/watch/${videoId}`, { params: { quality } }),

    // Quality switch: returns new URL without incrementing views
    getStreamMeta: (videoId, quality = 'auto') =>
        api.get(`/watch/${videoId}/stream`, { params: { quality } })
}

// Settings Service
export const settingsService = {
    getSettings: () => api.get('/settings'),
    updateSettings: (data) => api.patch('/settings', data),
    resetSettings: () => api.post('/settings/reset')
}

// AI Service (Vixora AI — powered by Gemini)
export const aiService = {
    // Chat Sessions
    createSession: (data = {}) => api.post('/ai/sessions', data), // { videoId?, title? }
    getSessions: (params = {}) => api.get('/ai/sessions', { params }),
    getSessionMessages: (sessionId, params = {}) => api.get(`/ai/sessions/${sessionId}/messages`, { params }),
    sendMessage: (sessionId, message) => api.post(`/ai/sessions/${sessionId}/messages`, { message }),
    updateSession: (sessionId, data) => api.patch(`/ai/sessions/${sessionId}`, data), // { title }
    deleteSession: (sessionId) => api.delete(`/ai/sessions/${sessionId}`),
    clearAllSessions: () => api.delete('/ai/sessions/all'),

    // Video-specific AI
    getVideoSummary: (videoId) => api.get(`/ai/videos/${videoId}/summary`),
    generateVideoSummary: (videoId, force = false) => api.post(`/ai/videos/${videoId}/summary`, { force }),
    askAboutVideo: (videoId, question) => api.post(`/ai/videos/${videoId}/ask`, { question }),

    // Transcript (AI route — auth required)
    getVideoTranscript: (videoId, params = {}) => api.get(`/ai/videos/${videoId}/transcript`, { params }),
    uploadTranscript: (videoId, body) => api.post(`/ai/videos/${videoId}/transcript`, body),
    deleteTranscript: (videoId) => api.delete(`/ai/videos/${videoId}/transcript`),
}

// Transcript Service (public read via watch route + owner management)
export const transcriptService = {
    // Public — watch route (supports q, from, to, fromSeconds, toSeconds, page, limit)
    getWatchTranscript: (videoId, params = {}) => api.get(`/watch/${videoId}/transcript`, { params }),
    // Auth — AI route (same data, requires login)
    getAITranscript: (videoId, params = {}) => api.get(`/ai/videos/${videoId}/transcript`, { params }),
    // Owner only — upsert transcript (plain text, SRT/VTT, or cues array)
    uploadTranscript: (videoId, body) => api.post(`/ai/videos/${videoId}/transcript`, body),
    // Owner only — delete transcript
    deleteTranscript: (videoId) => api.delete(`/ai/videos/${videoId}/transcript`),
}

// Feedback Service (Not Interested, Block Channel, Reports)
export const feedbackService = {
    // Not Interested
    markNotInterested: (videoId, reason) => api.post(`/feedback/not-interested/${videoId}`, { reason }),
    removeNotInterested: (videoId) => api.delete(`/feedback/not-interested/${videoId}`),
    getNotInterested: (params = {}) => api.get('/feedback/not-interested', { params }),

    // Blocked Channels
    blockChannel: (channelId) => api.post(`/feedback/blocked-channels/${channelId}`),
    unblockChannel: (channelId) => api.delete(`/feedback/blocked-channels/${channelId}`),
    getBlockedChannels: (params = {}) => api.get('/feedback/blocked-channels', { params }),

    // Reports
    report: ({ targetType, targetId, reason, description }) =>
        api.post('/feedback/reports', { targetType, targetId, reason, description }),
    getMyReports: (params = {}) => api.get('/feedback/reports/me', { params })
}

// Account Service (Multi-Account Switch)
export const accountService = {
    getAccountSwitchToken: () => api.get('/users/account-switch-token'),
    switchAccount: (accountSwitchToken) => api.post('/users/switch-account', { accountSwitchToken }),
    resolveAccounts: (tokens) => api.post('/users/switch-account/resolve', { tokens })
}

// Admin Service
export const adminService = {
    getMe: () => api.get('/admin/me'),
    getDashboardOverview: (params = {}) => api.get('/admin/dashboard/overview', { params }),
    getDashboardActivity: (params = {}) => api.get('/admin/dashboard/activity', { params }),

    getUsers: (params = {}) => api.get('/admin/users', { params }),
    getUser: (userId) => api.get(`/admin/users/${userId}`),
    updateUserStatus: (userId, data) => api.patch(`/admin/users/${userId}/status`, data), // { status, reason }
    updateUserRole: (userId, data) => api.patch(`/admin/users/${userId}/role`, data), // { role, reason }
    verifyPendingEmail: (userId) => api.patch(`/admin/users/${userId}/verify-pending-email`),

    getReports: (params = {}) => api.get('/admin/reports', { params }),
    getReport: (reportId) => api.get(`/admin/reports/${reportId}`),
    resolveReport: (reportId, data) => api.patch(`/admin/reports/${reportId}/resolve`, data), // { resolution, actionTaken }

    getVideos: (params = {}) => api.get('/admin/videos', { params }),
    getVideo: (videoId) => api.get(`/admin/videos/${videoId}`),

    getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
    getAuditLog: (logId) => api.get(`/admin/audit-logs/${logId}`)
}
