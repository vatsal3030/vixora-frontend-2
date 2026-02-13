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
    uploadVideo: (formData, onUploadProgress) => api.post('/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
    }),
    updateVideo: (videoId, data) => {
        const isFormData = data instanceof FormData;
        return api.patch(`/videos/${videoId}`, data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        })
    },
    deleteVideo: (videoId) => api.delete(`/videos/${videoId}`), // Backend soft-delete is standard delete
    restoreVideo: (videoId) => api.patch(`/videos/${videoId}/restore`),
    togglePublish: (videoId) => api.patch(`/videos/${videoId}/publish`),
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
    getSubscriptions: () => api.get('/subscriptions/u/subscriptions'),
    getSubscribedVideos: () => api.get('/subscriptions')
}

// Channel Service
// Channel Service
export const channelService = {
    getChannel: (channelId) => api.get(`/channels/${channelId}`),
    getChannelByUsername: (username) => api.get(`/users/u/${username}`),
    getChannelVideos: (channelId, params = {}) => api.get(`/videos/user/${channelId}`, { params }),
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
    updateAvatar: (formData) => api.patch('/users/update-avatar', formData),
    updateCoverImage: (formData) => api.patch('/users/update-coverImage', formData),
    getWatchHistory: () => api.get('/users/History'),
    getUserChannelProfile: (username) => api.get(`/users/u/${username}`),
    updateChannelDescription: (data) => api.patch('/users/update-description', data),
    getUserById: (userId) => api.get(`/users/id/${userId}`)
}

// Feed Service
export const feedService = {
    getHomeFeed: (params = {}) => api.get('/feed/home', { params }),
    getSubscriptionsFeed: (params = {}) => api.get('/feed/subscriptions', { params }),
    getTrendingFeed: (params = {}) => api.get('/feed/trending', { params }),
    getShortsFeed: (params = {}) => api.get('/feed/shorts', { params })
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
    createTweet: (data) => api.post('/tweets', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
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
    getOverview: () => api.get('/dashboard/overview'),
    getAnalytics: (period = '7d') => api.get('/dashboard/analytics', { params: { period } }),
    getTopVideos: (params = {}) => api.get('/dashboard/top-videos', { params }),
    getGrowthStats: () => api.get('/dashboard/growth'),
    getInsights: () => api.get('/dashboard/insights')
}

// Watch Service (for video streaming)
export const watchService = {
    watchVideo: (videoId) => api.get(`/watch/${videoId}`)
}

// Settings Service
export const settingsService = {
    getSettings: () => api.get('/settings'),
    updateSettings: (data) => api.patch('/settings', data),
    resetSettings: () => api.post('/settings/reset')
}
