export const QUERY_KEYS = {
  // Auth
  CURRENT_USER: ['currentUser'],
  
  // Feed
  FEED_HOME: (page) => ['feed', 'home', page],
  FEED_TRENDING: (page) => ['feed', 'trending', page],
  FEED_SHORTS: (page) => ['feed', 'shorts', page],
  FEED_SUBSCRIPTIONS: (page) => ['feed', 'subscriptions', page],
  
  // Videos
  VIDEO_DETAIL: (id) => ['video', id],
  VIDEO_WATCH: (id) => ['watch', id],
  
  // Channel
  CHANNEL: (id) => ['channel', id],
  CHANNEL_VIDEOS: (id, page) => ['channel', id, 'videos', page],
  CHANNEL_SHORTS: (id, page) => ['channel', id, 'shorts', page],
  CHANNEL_PLAYLISTS: (id, page) => ['channel', id, 'playlists', page],
  CHANNEL_TWEETS: (id, page) => ['channel', id, 'tweets', page],
  
  // Playlists
  MY_PLAYLISTS: ['playlists', 'me'],
  PLAYLIST_DETAIL: (id) => ['playlist', id],
  WATCH_LATER: (page) => ['watchLater', page],
  
  // Dashboard
  DASHBOARD: (period) => ['dashboard', period],
  
  // Notifications
  NOTIFICATIONS: ['notifications'],
  UNREAD_COUNT: ['notifications', 'unreadCount'],
  
  // Search
  SEARCH: (scope, q, tags, page) => ['search', scope, q, tags, page],
  
  // User
  USER_PROFILE: (username) => ['user', username],
  SUBSCRIPTION_STATUS: (channelId) => ['subscription', channelId],
}
