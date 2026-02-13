---
description: Fix Library UI Consistency and Bugs
---

# Fix Library UI Consistency & Bugs

1.  **Fix "0 views views" Bug**
    - Edit `src/components/video/VideoCard.jsx`: Remove " views" text adjacent to `{formatViews(...)}`.

2.  **Standardize VideoCard**
    - Update `VideoCard` to support `context` prop ('history', 'liked', 'watch-later') for custom menu actions.
    - Refactor `HistoryPage.jsx` to use `VideoCard`.
    - Refactor `LikedVideosPage.jsx` to use `VideoCard`.
    - Refactor `WatchLaterPage.jsx` to use `VideoCard`.

3.  **Add Headers**
    - Add consistent `<h1>` header to `LikedVideosPage.jsx`.
    - Add consistent `<h1>` header to `WatchLaterPage.jsx`.

4.  **Verify Thumbnails**
    - Ensure `getMediaUrl` is effective in all these pages (via `VideoCard` usage).
