Model Choice & Full Procedure Guide

🤖 WHICH MODEL TO USE (Per Phase)
Looking at your available models:
PhaseBest ModelWhyPhase 0 — Full codebase auditGemini 3.1 Pro (High)Largest context window, best for scanning entire codebase at oncePhase 1 — Critical bug fixes (logic heavy)Gemini 3.1 Pro (High)Best reasoning + long context for complex fixesPhase 2 — API integration fixesGemini 3.1 Pro (High)Same reasonPhase 3 — Navigation/mobileGemini 3.1 Pro (Low)Fast, good enough for layout/CSS fixes, saves creditsPhase 4 — Glass morphism UIGemini 3.1 Pro (Low)CSS/design work doesn't need heavy reasoningPhase 5 — Performance/optimizationGemini 3.1 Pro (High)Needs to reason about bundle strategy
General rule:

Use High when fixing logic, APIs, data flow, complex bugs
Use Low when fixing CSS, layout, styling, small UI tweaks
Never use Flash for this — too weak for codebase-level work
GPT-OSS 120B is okay as a backup if Gemini credits run out


📋 FULL STEP-BY-STEP PROCEDURE
STEP 1 — Before Opening Antigravity (Do This Once)

Open your frontend project in your code editor
Make sure it runs locally (npm run dev works, no compile errors)
Create a Git branch right now:

bash   git checkout -b vixora-frontend-fixes
```
   This is your safety net. Every session, commit before starting.

4. Note down your exact tech stack (React version, router version, state management, HTTP client — Axios or fetch, any UI library). You'll need this for the context primer.

---

#### STEP 2 — Session Setup (Do This at the Start of EVERY Antigravity Session)

1. Open Antigravity → Select **Gemini 3.1 Pro (High)**
2. **Always start with the Context Primer** from the plan (Appendix section). Paste it as your very first message. Don't skip this — without it, the AI won't know your API rules.
3. Then attach the relevant files for that session (more on this below)
4. Then paste the specific prompt from the plan

---

#### STEP 3 — File Attachment Strategy Per Session

This is critical. Antigravity works best when you give it the exact files it needs — not the whole project.

| Session / Prompt | Files to Attach |
|---|---|
| PROMPT-0A (audit) | Attach your entire `src/` folder as a zip, OR attach files one by one starting with: router config, all page components, all API service files |
| PROMPT-1A (scroll) | `App.jsx` or `main.jsx`, your router config file |
| PROMPT-1B (watch later) | The Watch Later page component, the playlists API service file |
| PROMPT-1C (playlists) | Playlist page, playlist detail page, playlist API service file, any playlist hooks |
| PROMPT-1D (dashboard) | Dashboard page component, dashboard API service file, the chart component |
| PROMPT-1E (tags) | VideoCard component, any tag component, the search page component |
| PROMPT-1F (shorts) | The entire Shorts page component |
| PROMPT-2A (channel) | Channel page component, channel API service file, subscriptions service file |
| PROMPT-3B (navigation) | Sidebar component, Navbar component, App.jsx/router |
| PROMPT-4A (glass morphism) | Your global CSS file / `index.css` / `tailwind.config.js` |

---

#### STEP 4 — The Session Workflow (Every Single Session)

Follow this exact loop:
```
1. Git commit current state
   git add . && git commit -m "before: [session name]"

2. Open Antigravity → set model → paste Context Primer

3. Attach relevant files

4. Paste the prompt from the plan

5. READ the output BEFORE applying it:
   - Does it make sense?
   - Did it change anything it shouldn't have (colors, unrelated components)?
   - Are there any TODO comments or placeholders left in the code?

6. Apply the changes

7. Test in browser immediately:
   - Does it work?
   - Did it break anything else?

8. If it broke something → paste the error back into the SAME session
   (same session = AI has context of what it just changed)

9. When working → git commit
   git add . && git commit -m "fix: [what was fixed]"

10. Close session. Start new session for next prompt.
```

**Important:** Don't string multiple bug fixes in one session. One prompt → one fix → test → commit → new session.

---

#### STEP 5 — When a Fix Doesn't Work (Recovery Strategy)

If Antigravity's fix breaks something or doesn't work:

**First try (same session):**
```
That didn't work. Here is the error I'm seeing: [paste error]
Here is what the browser shows: [describe]
Here is the current state of the component after your changes: [paste code]
What went wrong and how do we fix it?
```

**Second try (still same session, switch to High if on Low):**
```
Let's approach this differently. Instead of modifying the existing component, 
show me the complete rewritten version of [filename] from scratch that fixes 
the issue. Include every line — don't use "rest of the code remains the same".
```

**If still broken:** Roll back with Git, start a new session, and try a more specific prompt.

---

#### STEP 6 — Extensions / MCP Servers (Your Question)

Here's my honest recommendation — **keep it minimal for this project:**

| Tool | Recommended? | Why |
|---|---|---|
| **Figma MCP** | ❌ Not needed | You're not redesigning from Figma — you're fixing existing UI |
| **Stitch** | ❌ Not needed | Stitch generates UI from scratch — you already have UI, you need fixes |
| **GitHub MCP** | ✅ Useful | Lets Antigravity read your repo directly instead of manual file uploads |
| **Browser/Playwright MCP** | ✅ Very useful | Lets Antigravity see your live app in browser and debug visually |
| **File System MCP** | ✅ Very useful | Lets it read/write files directly without copy-paste overhead |

**Bottom line:** If Antigravity supports a **filesystem or local project** integration, enable that. It removes the biggest friction (manually attaching files). Everything else (Figma, Stitch, design tools) would slow you down here — you're in fix & polish mode, not design-from-scratch mode.

---

### 🗓️ SUGGESTED DAILY SCHEDULE
```
Day 1: Phase 0 + Phase 1 (Bugs 001–003) — scroll, watch later, playlists
Day 2: Phase 1 continued (Bugs 004–006) — dashboard, tags, shorts autoplay  
Day 3: Phase 2 — channel page + list response audit
Day 4: Phase 3 — navigation IA + mobile responsiveness
Day 5: Phase 4 — glass morphism + micro-interactions + shorts redesign
Day 6: Phase 4 continued + profile page
Day 7: Phase 5 — performance + full acceptance checklist run
Do 2–3 sessions per day max. More than that and you lose track of what changed what.

⚠️ 3 THINGS NEVER TO DO

Never paste all prompts in one session — the context overflows and quality collapses
Never skip the Git commit step — one bad AI change with no rollback = hours of manual undo
Never let Antigravity change colors or redesign components you didn't ask about — if it does, reject and re-prompt with "Do not change [X], only fix [Y]"

Once you complete Phase 1 (all critical bugs fixed and tested), let me know and I'll review or help with anything that didn't work as expected.so lets start7:21 PMCharted initial setup steps and prepared guidanceCharted initial setup steps and prepared guidanceLet's go! Follow these steps right now:

🔴 STEP 1 — Do This in Your Terminal First (30 seconds)
bashcd your-frontend-project-folder
git add .
git commit -m "checkpoint: before fixes"
git checkout -b vixora-frontend-fixes
```

---

### 🔴 STEP 2 — Open Antigravity

1. Select **Gemini 3.1 Pro (High)**
2. Attach these files from your `src/` folder:
   - Your router config (`App.jsx` or `routes.jsx` or wherever routes are defined)
   - All files inside `src/pages/` or `src/views/`
   - All files inside `src/services/` or `src/api/` (API call files)
   - All files inside `src/components/` (or zip the whole folder)
3. Paste this **exact message:**

---
```
CONTEXT PRIMER — Read this first before doing anything:
========================================================
This is "Vixora" — a YouTube-like video platform. React + Vite frontend.

Backend API rules (non-negotiable):
- All API calls must have credentials: { withCredentials: true }
- Success response is at: response.data.data (double .data)
- Paginated lists are at: response.data.data.items (NOT .videos, .playlists etc.)
- Pagination info: response.data.data.pagination
- API base: /api/v1
- Auth: access token in HttpOnly cookie named "accessToken"

Design rules (do not violate):
- DO NOT change any colors — color palette is fixed
- DO NOT remove existing UI components
- DO NOT change sidebar navigation structure

Now do the FULL CODEBASE AUDIT:

1. Scan every component, page, service/api file, hook, and router config
2. Find all bugs: broken API calls, wrong endpoint paths, missing error handling,
   undefined variable crashes, broken imports, race conditions, missing useEffect
   dependencies, stale closures, missing null checks
3. Find all features wired but not working:
   Watch Later, Playlists, Channel page data, Shorts autoplay, Tag clicks,
   Dashboard chart showing 0-1 range instead of real values
4. Find all scroll/navigation issues (pages sharing scroll position)
5. Find any hardcoded localhost URLs or dev-only values

Output a clean list of ALL bugs found grouped by severity:
CRITICAL | HIGH | MEDIUM | LOW

For each bug include:
- File name and line number
- What is broken
- Why it is broken
- How to fix it (brief)

Do not fix anything yet. Just report.

🔴 STEP 3 — After Antigravity Responds
Come back here and paste the output. I'll review it with you before you start fixing anything — to make sure nothing important was missed and the fix order is right.
Ready? Go! 🚀Vixora Frontend Bug Registry
Based on Codebase Audit against Backend Contract Rules

CRITICAL
BUG-001: Page Scroll Position Leak
File: 
src/components/common/ScrollToTop.jsx
 (Lines 7-10)
What is broken: Navigating between pages doesn't reset scroll to the top reliably.
Why it is broken: Thpastedanigavity optput and bug report file :
I have completed the full codebase audit according to Phase 0 of the Vixora Frontend Master Plan.
I scanned all components, pages, hooks, and services to cross-reference the frontend implementations against the backend API rules you provided. I successfully found the root causes for the key issues (such as useInfiniteScroll pulling from data.docs instead of data.items, Watch Later arrays mismatching the contract, missing intersection observer logic for Shorts, etc.).
I compiled all the issues into the bug_report.md artifact, categorized by CRITICAL, HIGH, MEDIUM, and LOW severity levels. Please review the audit report. Once approved, I am ready to begin Phase 1: Critical Bug Fixes (P0), starting with the Page Scroll Position Leak and Watch/Playlist API integrations.bug report fileShow more7:28 PMValidated audit findings and prioritized bug fixes strategicallyValidated audit findings and prioritized bug fixes strategicallyGreat audit! The report is solid. Before you start fixing, here's my analysis:

🔍 KEY INSIGHT FROM THE AUDIT
BUG-008a is actually the MOST IMPACTFUL bug — useInfiniteScroll.js reading .docs instead of .items is breaking ALL feeds simultaneously (home, trending, shorts, watch later, channel videos). Fix this ONE line and half the app will start working automatically. Start here, not BUG-001.

✅ REVISED FIX ORDER (Based on Audit Results)
Session 1: BUG-008a → fixes ALL feeds at once (1 line change, massive impact)
Session 2: BUG-008b → fix localhost URLs (5 mins, do it while fresh)
Session 3: BUG-002  → Watch Later full fix
Session 4: BUG-003  → Playlists full fix
Session 5: BUG-007  → Channel page full fix
Session 6: BUG-001  → Scroll position fix
Session 7: BUG-004  → Dashboard chart fix
Session 8: BUG-005  → Tag click fix
Session 9: BUG-006  → Shorts autoplay fix
Session 10: FIX-009 → Sidebar sizing

🚀 SESSION 1 — Do This Right Now
Open Antigravity → Gemini 3.1 Pro (High) → Attach these files:

src/hooks/useInfiniteScroll.js
src/utils/config.js
src/lib/media.js

Then paste:
CONTEXT PRIMER:
- Backend paginated lists are ALWAYS at: response.data.data.items
- Never at: .docs, .videos, .playlists, .data, or any other key
- API base: /api/v1
- Credentials: withCredentials: true on all calls
- DO NOT change any colors or unrelated components

FIX BUG-008a + BUG-008b together (they are both tiny fixes):

BUG-008a — File: src/hooks/useInfiniteScroll.js Line 37
Current broken code reads: const newItems = response.data.data.docs || []
Fix: Change "docs" to "items" → const newItems = response.data.data.items || []
Also check the ENTIRE file for any other place that reads .docs, .videos, 
.playlists or any non-"items" key from paginated responses and fix all of them.

BUG-008b — Files: src/utils/config.js and src/lib/media.js
Current broken code has hardcoded fallback: "http://localhost:10000/api/v1"
Fix: Change to read ONLY from environment variable import.meta.env.VITE_API_BASE_URL
If env variable is missing, throw a clear error in development mode instead of 
silently falling back to localhost. In production, never use localhost.

Show me:
1. The complete fixed useInfiniteScroll.js file
2. The complete fixed config.js file  
3. The complete fixed media.js file

After showing the fixes, tell me: which pages/components import useInfiniteScroll 
so I know what to test after applying this fix.

After Session 1
Apply the changes, then test these pages in browser:

Home feed
Trending
Subscriptions feed
Watch Later list

If any of them now show data that was previously empty — that confirms BUG-008a was the root cause. Come back here and tell me what changed, then we move to Session 2.
Go! 🚀now give next sessions premier. so instead of give one by one session give all by once .7:30 PMRecognized request to consolidate multiple sessions into single deliveryRecognized request to consolidate multiple sessions into single deliveryHere are all remaining sessions. Save this and work through them one by one in order — don't skip ahead.

SESSION 2 — BUG-008b: Fix Localhost URLs
Attach: src/utils/config.js, src/lib/media.js
CONTEXT PRIMER:
- API base must come from: import.meta.env.VITE_API_BASE_URL
- Never hardcode localhost URLs in production code
- DO NOT change any other files

FIX BUG-008b:

Files: src/utils/config.js and src/lib/media.js
Problem: Both files have hardcoded fallback "http://localhost:10000/api/v1"

Fix rules:
1. Primary value: always import.meta.env.VITE_API_BASE_URL
2. If VITE_API_BASE_URL is missing in development mode 
   (import.meta.env.DEV === true), console.warn a clear message:
   "⚠️ VITE_API_BASE_URL is not set. Using localhost fallback for dev only."
   and fall back to "http://localhost:10000/api/v1"
3. If VITE_API_BASE_URL is missing in production mode 
   (import.meta.env.PROD === true), throw an Error:
   "VITE_API_BASE_URL must be set in production environment"
4. Export the final resolved URL as the default API base

Show me the complete fixed versions of both files.
Also check if any OTHER file in the codebase has a hardcoded localhost 
URL and list them with file + line number.

SESSION 3 — BUG-002: Watch Later Full Fix
Attach: src/pages/WatchLaterPage.jsx, your playlists API service file (likely src/services/playlistService.js or src/api/playlists.js)
CONTEXT PRIMER:
- Backend paginated lists: response.data.data.items
- Pagination: response.data.data.pagination
- Auth: withCredentials: true on ALL calls
- DO NOT change colors or unrelated components

FIX BUG-002 — Watch Later:

Backend contract (use exactly these endpoints):
- Toggle watch-later (add/remove): POST /api/v1/playlists/watch-later/:videoId
- Fetch watch later list: GET /api/v1/playlists/watch-later?page=1&limit=20
- Response list format: data.items array + data.pagination object

Tasks:
1. Fix the API service function for watch-later to use exactly those endpoints
2. Fix WatchLaterPage.jsx:
   - Read data from response.data.data.items (not .videos or any alias)
   - Show loading skeleton while fetching (simple pulsing card placeholders)
   - Show empty state if items array is empty: 
     icon + "No videos saved to Watch Later" + "Browse videos" button
   - Show error state if API fails: "Failed to load. Try again" with retry button
   - Each video card must show: thumbnail, title, channel name, duration
3. Fix the "Save to Watch Later" toggle button on VideoCard:
   - Call POST /api/v1/playlists/watch-later/:videoId
   - Optimistically update the icon state immediately on click
   - On success: show a toast "Saved to Watch Later" or "Removed from Watch Later"
   - On failure: revert the optimistic update + show error toast
4. Invalidate/refetch watch-later query after toggle so the list stays in sync

Show me every file you are changing with the complete fixed content.
After fixes, tell me exactly how to test this in the browser.

SESSION 4 — BUG-003: Playlist System Full Fix
Attach: src/pages/PlaylistsPage.jsx, src/pages/PlaylistDetailPage.jsx (or equivalent), your playlist API service file, any playlist-related modal or hook files
CONTEXT PRIMER:
- Backend paginated lists: response.data.data.items
- Auth: withCredentials: true
- DO NOT change colors, layout structure, or unrelated components

FIX BUG-003 — Full Playlist System:

Backend contract (use exactly these):
POST   /api/v1/playlists                           body: { name, description?, isPublic? }
GET    /api/v1/playlists/user/me                   → data.items (my playlists)
GET    /api/v1/playlists/user/:userId              → data.items (another user's playlists)
GET    /api/v1/playlists/:playlistId               → single playlist object with videos array
PATCH  /api/v1/playlists/:playlistId               body: { name?, description? }
DELETE /api/v1/playlists/:playlistId               soft delete
PATCH  /api/v1/playlists/add/:videoId/:playlistId  add video to playlist
PATCH  /api/v1/playlists/remove/:videoId/:playlistId  remove video
PATCH  /api/v1/playlists/:playlistId/toggle-visibility
GET    /api/v1/playlists/trash/me                  → data.items

Fix tasks:
1. Fix playlist API service — all functions must use exact endpoints above
   with withCredentials: true

2. Fix PlaylistsPage.jsx:
   - Fetch from GET /api/v1/playlists/user/me
   - Read from data.items
   - Show playlist cards: name, description, video count, thumbnail, 
     public/private badge
   - "Create Playlist" button opens modal with: name input (required), 
     description textarea (optional), public/private toggle
   - On create: POST /api/v1/playlists, then refetch list
   - Each playlist card has: Edit button, Delete button (with confirm dialog)

3. Fix PlaylistDetailPage.jsx:
   - Fetch from GET /api/v1/playlists/:playlistId
   - Show all videos in the playlist
   - Owner only: show "Remove" button on each video
     → PATCH /api/v1/playlists/remove/:videoId/:playlistId

4. Fix "Add to Playlist" modal (on video cards and watch page):
   - Fetch user playlists from GET /api/v1/playlists/user/me
   - Show each playlist as a checkbox row
   - On check/uncheck: call add or remove endpoint respectively
   - Show toast on success/failure

5. All mutations must show toast feedback and refetch affected data

Show me every file being changed with complete content.

SESSION 5 — BUG-007: Channel Page Full Fix
Attach: src/pages/ChannelPage.jsx, your channel API service file, your subscriptions API service file
CONTEXT PRIMER:
- Backend paginated lists: response.data.data.items
- Single object responses: response.data.data
- Auth: withCredentials: true
- DO NOT change colors or layout structure

FIX BUG-007 — Channel Page:

Backend contract:
GET /api/v1/channels/:channelId          full channel profile + stats
GET /api/v1/channels/:channelId/about    about section data
GET /api/v1/channels/:channelId/videos   → data.items (paginated)
GET /api/v1/channels/:channelId/shorts   → data.items (paginated)
GET /api/v1/channels/:channelId/playlists → data.items (paginated)
GET /api/v1/channels/:channelId/tweets   → data.items (paginated)
GET /api/v1/subscriptions/c/:channelId/status  is current user subscribed?
POST /api/v1/subscriptions/c/:channelId/subscribe  toggle subscribe

Channel header response fields:
- avatar, coverImage, fullName, username
- subscribersCount, totalViews, videosCount, shortsCount
- channelDescription, channelLinks, joinedAt

URL NOTE: The route is likely /@username or /channel/:username.
You must resolve username to channelId using:
GET /api/v1/users/u/:username → response.data.data.id
Use that id for all channel sub-requests.

Fix tasks:
1. Fix channel data resolution: username → channelId → all channel requests
2. Fix channel header:
   - Display: avatar, coverImage, fullName, @username
   - subscribersCount (real number from API, not 0)
   - videosCount (real number)
   - channelDescription
3. Fix each tab (lazy load — only fetch when tab is active):
   - Videos: GET /channels/:id/videos → data.items
   - Shorts: GET /channels/:id/shorts → data.items
   - Playlists: GET /channels/:id/playlists → data.items
   - Tweets: GET /channels/:id/tweets → data.items
   - About: GET /channels/:id/about
   Each tab needs: loading skeleton, empty state, pagination
4. Fix Subscribe button:
   - On load: GET subscription status
   - Show "Subscribe" or "Subscribed" based on status
   - On click: POST toggle, optimistic update, update subscriber count
5. Remove ALL fallback reading patterns like:
   page?.videos || page?.items || page?.docs
   Replace with ONLY: data.items

Show me every file changed with complete content.

SESSION 6 — BUG-001: Scroll Position Fix
Attach: src/App.jsx (or main router file), src/components/common/ScrollToTop.jsx
CONTEXT PRIMER:
- React Router v6
- DO NOT change any page components or styling

FIX BUG-001 — Page Scroll Position Leak:

Problem: Every new page opens at the same scroll Y position as the previous page.

Fix requirements:
1. Create/fix ScrollToTop component at src/components/common/ScrollToTop.jsx:
   - On every pathname change: window.scrollTo({ top: 0, behavior: 'instant' })
   - Use useLocation() + useEffect with [pathname] dependency
   - Exception: do NOT reset scroll when only the search query params change 
     on the same page (e.g. filters changing on search page)

2. For feed pages (home, trending, subscriptions):
   - Save scroll position to sessionStorage when navigating AWAY
   - Restore scroll position when navigating BACK (browser back button)
   - Key format: "scroll_/feed/home", "scroll_/trending" etc.
   - Use window.history.scrollRestoration = 'manual' to disable browser default

3. For Watch page:
   - Always scroll to top when videoId changes
   - Listen to both pathname AND search params for this page

4. Mount ScrollToTop inside BrowserRouter, ABOVE all Routes

5. For Shorts page: do nothing — it manages its own scroll internally

Show me:
- Complete ScrollToTop component
- Where exactly to mount it in App.jsx (show surrounding code)
- Any changes needed to feed pages for save/restore logic

SESSION 7 — BUG-004: Dashboard Chart Fix
Attach: src/pages/DashboardPage.jsx, your dashboard chart component (likely src/components/dashboard/DashboardCharts.jsx or similar), your dashboard API service file
CONTEXT PRIMER:
- Dashboard API: GET /api/v1/dashboard/full?period=30d
- Response: response.data.data (contains overview, analytics, topVideos, growth, insights)
- Auth: withCredentials: true
- DO NOT change dashboard layout or colors

FIX BUG-004 — Dashboard Chart Y-Axis and Real Data:

Backend /dashboard/full response structure:
{
  period: "30d",
  overview: {
    totalSubscribers: <integer>,
    totalViews: <integer>,
    totalLikes: <integer>,
    totalVideos: <integer>,
    subscribersChange: <number>,  // % change
    viewsChange: <number>,
    likesChange: <number>,
    videosChange: <number>
  },
  analytics: [
    { date: "2026-02-01", views: <integer>, subscribers: <integer>, likes: <integer> }
    // ... one entry per day
  ],
  topVideos: [...],
  growth: [...],
  insights: {...}
}

Fix tasks:
1. Fix the API call:
   - Use GET /api/v1/dashboard/full?period=${period}
   - period state should be one of: "7d" | "30d" | "90d" | "1y"
   - Default period: "30d"
   - When user changes period selector, re-fetch with new period value

2. Fix stat cards to read from response.data.data.overview:
   - Total Subscribers: overview.totalSubscribers
   - Total Views: overview.totalViews
   - Total Likes: overview.totalLikes
   - Total Videos: overview.totalVideos
   - Change indicators: overview.subscribersChange etc.

3. Fix chart data:
   - Pass analytics array directly to the chart component
   - Each entry already has: date, views, subscribers, likes as integers
   - Do NOT normalize, do NOT divide by anything, pass raw integers

4. Fix Recharts YAxis:
   - Remove any hardcoded domain={[0,1]} or domain={[0,'dataMax']}
   - Replace with: domain={['auto', 'auto']}
   - Add allowDecimals={false} to YAxis
   - Add tickFormatter={(val) => val.toLocaleString()} to YAxis

5. Fix the period selector buttons (7d/30d/90d/1y):
   - Must update period state
   - Must trigger API refetch with new period
   - Active period button must have visible selected style

Show me every file changed with complete content.
After fixes tell me exactly what data I should see in the stat cards 
based on the API response to verify it's working.

SESSION 8 — BUG-005: Tag Click Fix
Attach: src/App.jsx, any component that renders tags (likely src/components/video/VideoCard.jsx, src/pages/WatchPage.jsx), src/pages/SearchPage.jsx
CONTEXT PRIMER:
- Search endpoint: GET /api/v1/search?scope=videos&tags=<tagName>
- Response for typed scope: data.items + data.pagination
- DO NOT change colors or unrelated components

FIX BUG-005 — Tag Click Navigation:

Problem: Clicking a tag tries to navigate to /tags/:tagName which doesn't exist.
Backend expects tags via: GET /api/v1/search?scope=videos&tags=<tagName>

Fix tasks:
1. Find every place tags are rendered in the codebase (VideoCard, WatchPage, etc.)
2. Fix the onClick handler on every tag element:
   WRONG: navigate('/tags/' + tagName)
   CORRECT: navigate('/search?scope=videos&tags=' + encodeURIComponent(tagName))

3. Fix App.jsx routing:
   - Remove the /tags/:tagName route if it exists
   - Make sure /search route exists and handles query params

4. Fix SearchPage.jsx to read the "tags" query param:
   const [searchParams] = useSearchParams()
   const tags = searchParams.get('tags')    // read tags param
   const scope = searchParams.get('scope') || 'all'
   const q = searchParams.get('q') || ''
   
   Pass tags to the API call:
   GET /api/v1/search?scope=${scope}&q=${q}&tags=${tags}
   
   Only include tags param in API call if it's not null/empty

5. On the search results page, when arriving from a tag click:
   - Show a header: "Videos tagged: #<tagName>"
   - The search input should be empty (tag filter is separate from text search)

Show me every file changed with complete content.

SESSION 9 — BUG-006: Shorts Autoplay Fix
Attach: src/pages/ShortsPage.jsx, src/components/shorts/ShortsPlayer.jsx (and any other shorts-related component files)
CONTEXT PRIMER:
- Shorts feed API: GET /api/v1/feed/shorts?page=1&limit=10
- Response: data.items array (each item has playbackUrl or masterPlaylistUrl field)
- Auth: withCredentials: true (optional auth)
- DO NOT change existing color scheme or button styles

FIX BUG-006 — Shorts Autoplay with IntersectionObserver:

Requirements:
1. ShortsPage.jsx:
   - Fetch from GET /api/v1/feed/shorts?page=1&limit=10
   - Read from data.items
   - Full viewport height container (height: 100vh, overflow-y: scroll)
   - Each short takes full height (height: 100vh, scroll-snap-align: start)
   - Add scroll-snap-type: y mandatory to container
   - Use IntersectionObserver (threshold: 0.7) to detect which short 
     is currently in view
   - Pass the index of the currently visible short as activeIndex to children
   - When activeIndex changes: pause the previous video, play the new one
   - Load more shorts when user reaches the last 2 items (infinite scroll)

2. ShortsPlayer.jsx:
   - Accept props: short (data), isActive (boolean), onVisible (callback)
   - Video element must have: autoPlay muted playsInline
   - When isActive becomes true: videoRef.current.play()
   - When isActive becomes false: videoRef.current.pause() + reset to currentTime=0
   - Video source: use short.playbackUrl || short.masterPlaylistUrl || short.videoFile
   - Tap on video: toggle play/pause
   - Mute/unmute button: top right corner (already in UI, just wire it up)
   
3. Browser autoplay policy handling:
   - Videos MUST start muted (muted attribute) for autoplay to work
   - Add a visible "🔇 Tap to unmute" indicator when first short loads
   - This disappears after user manually unmutes

4. Cleanup:
   - On component unmount (navigating away): pause all videos + disconnect observer

5. Desktop only additions:
   - Up arrow button: go to previous short
   - Down arrow button: go to next short
   - Keyboard: ArrowUp / ArrowDown navigate between shorts

Show me complete rewritten ShortsPage.jsx and ShortsPlayer.jsx.

SESSION 10 — FIX-009: Sidebar Size + Final Polish
Attach: src/components/layout/Sidebar.jsx, your global CSS or Tailwind config
CONTEXT PRIMER:
- DO NOT change colors, navigation structure, or any functionality
- Only change sizes, spacing, and padding values
- Keep all existing Tailwind classes, just adjust size values

FIX-009 — Sidebar Library Section Size Increase:

Problem: Library section items (History, Watch Later, Liked Videos, Playlists, 
Your Videos, Dashboard, Trash, Settings) have text and icons too small.

Fix tasks:
1. Icons in library section:
   - Current size is likely: w-4 h-4 (16px)
   - Change to: w-5 h-5 (20px)

2. Text in library section:
   - Current size is likely: text-xs (12px)
   - Change to: text-sm (14px)

3. Each library item row minimum height:
   - Add: min-h-[40px] or py-2.5 to ensure comfortable touch target

4. Spacing between library items:
   - Add slight gap: gap-0.5 or space-y-0.5 between items

5. The "LIBRARY" section label:
   - Keep same size but add slightly more top margin for breathing room

6. Do NOT change the main nav items (Home, Trending, Shorts, Subscriptions)
   These should stay at their current size

7. Active state: make sure the active/selected state highlight is visible
   and uses the correct red accent color consistently across ALL items
   (both main nav and library items should have the same active style)

Show me the complete fixed Sidebar.jsx.

BONUS — also check these quick wins in the same file:
- Hover states: all items should have consistent hover background
- Transition: add transition-colors duration-150 to all nav items if missing
- Tooltip: on icon-only collapsed sidebar mode (if it exists), ensure 
  tooltips show the item name on hover

⚡ QUICK REFERENCE CARD
Save this — paste it at the start of every single session:
CONTEXT PRIMER (paste at start of every session):
===================================================
App: Vixora — YouTube-like platform. React + Vite.
- All API calls: withCredentials: true (HttpOnly cookie auth)
- Success response: response.data.data
- Paginated lists: response.data.data.items  ← ALWAYS this, never .docs/.videos/.playlists
- Pagination: response.data.data.pagination
- API base: /api/v1
- NEVER change: colors, sidebar structure, existing UI components
- ONLY fix what the prompt explicitly asks for

✅ AFTER ALL 10 SESSIONS — TEST CHECKLIST
□ Home feed shows videos (BUG-008a)
□ Trending page shows videos (BUG-008a)
□ API calls don't use localhost in production (BUG-008b)
□ Watch Later list loads and shows saved videos (BUG-002)
□ Watch Later toggle on video cards works (BUG-002)
□ Playlists page shows user's playlists (BUG-003)
□ Create playlist modal works (BUG-003)
□ Add video to playlist modal works (BUG-003)
□ Channel page shows real avatar, real subscriber count (BUG-007)
□ Channel Videos/Shorts/Playlists/Tweets tabs load data (BUG-007)
□ New page always opens at scroll Y=0 (BUG-001)
□ Dashboard stat cards show real numbers not 0 (BUG-004)
□ Dashboard chart Y-axis shows real range not 0-1 (BUG-004)
□ Clicking a tag goes to search results for that tag (BUG-005)
□ Shorts autoplay when page loads (BUG-006)
□ Shorts switch video on scroll (BUG-006)
□ Sidebar library text/icons are larger and comfortable (FIX-009)
Once all boxes are checked, come back here and we'll move to Phase 3 — UI/UX overhaul (glass morphism, mobile responsiveness, micro-interactions). 🚀now phase 39:35 PMIdentified Phase 3 UI/UX enhancement requirements and scopeIdentified Phase 3 UI/UX enhancement requirements and scopeHere are all Phase 3 sessions. Same rule — one session at a time, test and commit before moving to next.

QUICK REFERENCE CARD (paste at start of every session)
CONTEXT PRIMER (paste at start of every session):
===================================================
App: Vixora — YouTube-like platform. React + Vite.
- All API calls: withCredentials: true
- Paginated lists: response.data.data.items
- API base: /api/v1
- NEVER change: colors, color palette, sidebar navigation structure
- NEVER remove existing working functionality
- NEVER change API calls or data logic — Phase 3 is UI/UX only
- Mobile first: min touch target 44x44px, no horizontal scroll
- Existing color tokens must stay exactly as they are

SESSION 11 — Glass Morphism Design Token System
Attach: src/index.css (or global CSS file), tailwind.config.js, src/components/layout/Sidebar.jsx, src/components/layout/Navbar.jsx (or Header)
CONTEXT PRIMER (paste above first)

PHASE 3 — SESSION 11: LIQUID GLASS MORPHISM FOUNDATION
========================================================

Goal: Add a glass morphism layer to the app without changing ANY colors,
removing any components, or touching any API/data logic.
This is purely additive CSS + class changes.

STEP 1 — Add these CSS custom properties to your root CSS file
(add to :root block, do not replace existing variables):

--glass-bg: rgba(255, 255, 255, 0.04);
--glass-bg-hover: rgba(255, 255, 255, 0.07);
--glass-bg-modal: rgba(255, 255, 255, 0.06);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-border-strong: rgba(255, 255, 255, 0.14);
--glass-blur-sm: blur(12px);
--glass-blur-md: blur(20px);
--glass-blur-lg: blur(40px);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
--glass-shadow-sm: 0 4px 16px rgba(0, 0, 0, 0.3);
--glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.08);

STEP 2 — Add these reusable CSS utility classes:

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-md);
  -webkit-backdrop-filter: var(--glass-blur-md);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow), var(--glass-inset);
  border-radius: 16px;
}

.glass-surface {
  background: var(--glass-bg-modal);
  backdrop-filter: var(--glass-blur-lg);
  -webkit-backdrop-filter: var(--glass-blur-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.glass-hover {
  transition: background 150ms ease, border-color 150ms ease;
}
.glass-hover:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-strong);
}

STEP 3 — Apply to Sidebar:
- Add backdrop-filter: var(--glass-blur-lg) to the sidebar container
- Add border-right: 1px solid var(--glass-border) 
- Keep the existing background color — just add the blur + border on top
- sidebar must have position: sticky, top: 0, height: 100vh
- Add the glass-inset to give it a subtle top highlight

STEP 4 — Apply to Navbar/Header:
- Add backdrop-filter: var(--glass-blur-md) to navbar
- Add border-bottom: 1px solid var(--glass-border)
- Keep existing background color — just add blur + border
- Navbar must have position: sticky, top: 0, z-index: 50

STEP 5 — Apply to Video Cards:
- Add subtle glass-card class or equivalent inline styles
- Keep existing card background — just add the border and inset highlight
- border: 1px solid var(--glass-border)
- box-shadow: var(--glass-shadow-sm), var(--glass-inset)
- border-radius: 12px (or keep existing if already rounded)

IMPORTANT RULES:
- Do NOT use backdrop-filter on elements that have a fully opaque 
  solid background — it will have no visible effect. 
  The background must be semi-transparent for glass to work.
- Do NOT add backdrop-filter to every element — only sidebar, navbar, 
  modals, dropdowns, and cards
- Test that text remains readable on all glass surfaces
- Sidebar and navbar glass effect should be visible when scrolling 
  content passes behind them

Show me:
1. The complete additions to index.css (only additions, not replacements)
2. The exact class/style changes in Sidebar.jsx
3. The exact class/style changes in Navbar.jsx
4. Nothing else should change

SESSION 12 — Glass Morphism on Modals & Dropdowns
Attach: Any modal component files, notification dropdown, search dropdown, src/components/ui/Modal.jsx or equivalent
CONTEXT PRIMER (paste above first)

PHASE 3 — SESSION 12: GLASS MORPHISM ON OVERLAYS
==================================================

Apply glass morphism to all overlay elements.
Do NOT touch any layout, data logic, or color values.

Targets:
1. ALL modal/dialog backgrounds:
   - Remove any solid dark background
   - Replace with: background: var(--glass-bg-modal)
   - Add: backdrop-filter: var(--glass-blur-lg)
   - Add: border: 1px solid var(--glass-border)
   - Add: box-shadow: var(--glass-shadow), var(--glass-inset)
   - Keep existing border-radius
   - The modal BACKDROP (overlay behind modal): 
     background: rgba(0, 0, 0, 0.6)
     backdrop-filter: blur(4px)

2. Notification dropdown panel:
   - Apply glass-surface styles
   - border: 1px solid var(--glass-border-strong)
   - border-radius: 16px

3. Search suggestions dropdown (if exists):
   - Apply glass-surface styles
   - border-radius: 12px

4. Any context menus or popover menus:
   - Apply glass-surface styles
   - border-radius: 10px

5. AI Chat panel (if it's a floating panel):
   - Apply glass-surface with stronger blur (var(--glass-blur-lg))
   - border-radius: 20px

6. Dashboard stat cards:
   - Apply glass-card class
   - Keep all existing text/content untouched

7. Profile settings form sections:
   - Wrap each section (Channel Details, Branding, Links & Socials) 
     in glass-card
   - Add padding: 24px inside each section

For ALL changes above:
- Do NOT change any text colors
- Do NOT change any button styles or colors
- Do NOT remove any existing content
- ONLY add/modify background, border, backdrop-filter, box-shadow

Show me every component file changed with the exact additions.

SESSION 13 — Micro-Interactions & Motion System
Attach: src/index.css, tailwind.config.js, src/components/video/VideoCard.jsx, any button component files, any toast/notification component
CONTEXT PRIMER (paste above first)

PHASE 3 — SESSION 13: MICRO-INTERACTIONS & SMOOTH MOTION
=========================================================

Add production-grade micro-interactions. 
Pure CSS + minimal JS. No new animation libraries unless already installed.
Do NOT change any colors, layouts, or data logic.

STEP 1 — Add motion tokens to CSS root:

--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--dur-instant: 80ms;
--dur-fast: 150ms;
--dur-normal: 200ms;
--dur-slow: 300ms;

STEP 2 — Page transition (add to main content wrapper):

@keyframes pageEnter {
  from { 
    opacity: 0; 
    transform: translateY(6px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.page-enter {
  animation: pageEnter var(--dur-normal) var(--ease-smooth) forwards;
}

Add the page-enter class to the main content area that wraps all pages.
Trigger by adding a key={location.pathname} to the wrapper so React 
remounts it on navigation.

STEP 3 — Button interactions (add to all button elements):

Primary buttons (red accent):
  transition: transform var(--dur-instant) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-smooth);
  &:hover { box-shadow: 0 0 20px rgba(var(--red-accent-rgb), 0.3); }
  &:active { transform: scale(0.97); }

Icon buttons:
  transition: transform var(--dur-fast) var(--ease-spring);
  &:hover { transform: scale(1.1); }
  &:active { transform: scale(0.93); }

All buttons: cursor: pointer (ensure this is global)

STEP 4 — Video Card hover:

.video-card {
  transition: transform var(--dur-normal) var(--ease-smooth),
              box-shadow var(--dur-normal) var(--ease-smooth);
}
.video-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}

STEP 5 — Like button animation:

@keyframes likePoP {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.like-pop {
  animation: likePoP var(--dur-slow) var(--ease-spring);
}

Add this class to the like icon element when liked state toggles to true.
Remove the class right after animation ends (use onAnimationEnd callback).

STEP 6 — Subscribe button transition:

.subscribe-btn {
  transition: background var(--dur-normal) var(--ease-smooth),
              color var(--dur-normal) var(--ease-smooth),
              border-color var(--dur-normal) var(--ease-smooth),
              min-width var(--dur-normal) var(--ease-smooth);
  min-width: 100px; /* prevents layout shift during text change */
  overflow: hidden;
  white-space: nowrap;
}

STEP 7 — Skeleton shimmer loading:

@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.04) 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 8px;
}

Replace ALL existing gray placeholder boxes (loading states) with .skeleton class.

STEP 8 — Modal open/close animation:

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes modalOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.95); }
}

.modal-enter { animation: modalIn var(--dur-normal) var(--ease-spring); }
.modal-exit  { animation: modalOut var(--dur-fast) var(--ease-smooth); }

Apply to modal content box (not the backdrop).

Show me:
1. All CSS additions to index.css
2. VideoCard.jsx changes
3. Like button component changes  
4. Subscribe button changes
5. Any modal component changes
6. Where to add page-enter class in the router/layout

SESSION 14 — Mobile Navigation Bar
Attach: src/components/layout/Sidebar.jsx, src/components/layout/Navbar.jsx, src/App.jsx or main layout file
CONTEXT PRIMER (paste above first)

PHASE 3 — SESSION 14: MOBILE BOTTOM NAVIGATION BAR
====================================================

Add a mobile bottom navigation bar for screens < 768px.
Desktop behavior must stay COMPLETELY unchanged.
Do NOT remove the sidebar — just hide it on mobile.

MOBILE BOTTOM NAV REQUIREMENTS:

1. Create new component: src/components/layout/MobileBottomNav.jsx

   Structure (5 items):
   [Home] [Shorts] [⬆ Upload] [Subscriptions] [Profile]

   Styles:
   - position: fixed, bottom: 0, left: 0, right: 0
   - height: 56px (plus safe area for iPhone notch: padding-bottom: env(safe-area-inset-bottom))
   - background: same as app background BUT add glass effect:
     backdrop-filter: blur(20px)
     border-top: 1px solid var(--glass-border)
   - z-index: 100
   - display: none on desktop (hidden md:hidden or @media min-width 768px display none)
   - display: flex on mobile with justify-content: space-around, align-items: center

   Each nav item:
   - min-width: 44px, min-height: 44px (touch targets)
   - display: flex, flex-direction: column, align-items: center, gap: 2px
   - Icon: 22px, Label: 10px text
   - Active item: use red accent color (same as sidebar active)
   - Inactive: muted color (same as sidebar inactive)
   - Transition: color 150ms ease

   Upload button (center):
   - Slightly larger: 48px circle
   - Red accent background (same as the floating upload button)
   - Upload/plus icon in white
   - Slightly elevated: translateY(-8px) to float above the bar
   - box-shadow: 0 4px 12px rgba(red, 0.4)

2. Hide sidebar on mobile:
   In Sidebar.jsx add: hidden md:block (or @media max-width 767px display:none)
   The sidebar should be invisible on mobile — the bottom nav replaces it

3. Add bottom padding to main content on mobile:
   When bottom nav is visible, add padding-bottom: 72px to main content
   so content doesn't hide behind the nav bar

4. Mount MobileBottomNav in the main layout (App.jsx or layout wrapper)
   alongside the existing Sidebar — it will auto-hide on desktop

5. Top Navbar on mobile:
   - Keep: Logo + Search icon + Notification bell + Avatar
   - Hide: any items that are already in the bottom nav
   - Make sure hamburger menu (if exists) still works

6. Active state:
   - Use useLocation() to detect current route
   - Match /feed/home or / → Home active
   - Match /shorts → Shorts active
   - Match /subscriptions → Subscriptions active
   - Match /profile or /settings → Profile active

Show me:
1. Complete MobileBottomNav.jsx component
2. Changes to Sidebar.jsx (hide on mobile)
3. Changes to main layout for bottom padding
4. Where to mount the component

SESSION 15 — Mobile Responsiveness: Home Feed + Watch Page
Attach: src/pages/HomePage.jsx (or feed page), src/pages/WatchPage.jsx, src/components/video/VideoCard.jsx
CONTEXT PRIMER (paste above first)

PHASE 3 — SESSION 15: MOBILE RESPONSIVENESS — FEED + WATCH PAGE
================================================================

Fix mobile layout for the two most used pages.
Do NOT change any data fetching logic, API calls, or colors.
Test target: 375px width (iPhone SE), 390px (iPhone 14).

HOME FEED PAGE — Fix rules:
1. Video grid:
   - Mobile (< 640px): 1 column, full width cards
   - Tablet (640px – 1023px): 2 columns
   - Desktop (≥ 1024px): keep existing layout (3-4 columns)
   - Use CSS grid with responsive columns:
     grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
     On mobile override: grid-template-columns: 1fr

2. VideoCard on mobile:
   - Thumbnail: full width, aspect-ratio: 16/9
   - Title: max 2 lines (line-clamp: 2)
   - Channel name: 1 line max
   - No horizontal overflow
   - Touch target for the entire card: at minimum 44px height for text area

3. Feed page header (if any filters/tabs exist):
   - Horizontal scroll for filter chips on mobile
   - No wrapping: overflow-x: auto, flex-wrap: nowrap
   - Hide scrollbar: scrollbar-width: none

WATCH PAGE — Fix rules:
1. Layout switch:
   - Desktop: player left (70%) + sidebar right (30%) — keep existing
   - Mobile: STACK vertically — player top, then description, then comments
   - Use CSS: flex-direction column on mobile, row on desktop

2. Video player on mobile:
   - Full width: width: 100%
   - aspect-ratio: 16/9
   - No fixed height

3. Video info section on mobile:
   - Title: full width, 2-3 lines allowed
   - Like/dislike/share buttons: horizontal scroll row if too many
   - Channel info row: avatar + name + subscribe button all in one row

4. Description on mobile:
   - Collapsed by default (show first 2 lines)
   - "Show more" / "Show less" toggle button
   - Tags: horizontal scroll row

5. Comments on mobile:
   - Full width
   - Comment input box: sticky bottom (optional but nice)

6. Related videos on mobile:
   - Below the main content (not sidebar)
   - Horizontal scroll row OR vertical list

GENERAL MOBILE RULES for both pages:
- No element should cause horizontal scroll (overflow-x: hidden on body)
- All font sizes minimum 14px
- All inputs minimum font-size: 16px (prevents iOS zoom)
- Images: loading="lazy" + width and height attributes where missing

Show me the complete fixed files for:
1. Home feed page / video grid component
2. VideoCard.jsx (mobile-responsive version)
3. WatchPage.jsx (mobile layout fix)

SESSION 16 — Mobile Responsiveness: Remaining Pages
Attach: src/pages/SearchPage.jsx, src/pages/DashboardPage.jsx, src/pages/ChannelPage.jsx, src/pages/PlaylistsPage.jsx
CONTEXT PRIMER (paste above first)

PHASE 3 — SESSION 16: MOBILE RESPONSIVENESS — REMAINING PAGES
==============================================================

Fix mobile layout for remaining key pages.
Do NOT change data logic, API calls, or colors.
Test target: 375px width.

SEARCH PAGE — Fix:
1. Results grid: 1 column on mobile (same as home feed)
2. Filter bar: horizontal scroll, no wrapping
3. Search input: full width, font-size: 16px (no iOS zoom)
4. Scope tabs (All/Videos/Channels/Tweets): horizontal scroll

DASHBOARD PAGE — Fix:
1. Stat cards grid:
   - Mobile: 2x2 grid (2 columns)
   - Tablet: 4 in a row
   - Desktop: keep existing
   
2. Analytics chart:
   - On mobile: min-height: 200px, allow horizontal scroll within chart container
   - Wrap chart in: overflow-x: auto
   - Chart itself: min-width: 500px inside the scroll wrapper
   - This is better than squishing the chart

3. Period selector (7d/30d/90d/1y):
   - On mobile: make it a horizontal scroll row, not wrapping buttons

4. Top videos list (if exists):
   - Mobile: single column, horizontal thumbnail + text layout

CHANNEL PAGE — Fix:
1. Cover image:
   - Desktop: keep existing height
   - Mobile: height: 120px (reduced)
   
2. Channel header info:
   - Stack vertically on mobile
   - Avatar: centered, 72px
   - Name + username: centered text
   - Stats row (subscribers, videos): centered, horizontal flex
   - Subscribe button: full width on mobile

3. Tabs (Videos/Shorts/Playlists/Tweets/About):
   - Horizontal scroll row on mobile
   - overflow-x: auto, flex-wrap: nowrap
   - Each tab: min-width: fit-content, padding: 8px 16px

4. Tab content grid:
   - Videos: 2 columns on mobile
   - Playlists: 2 columns on mobile

PLAYLISTS PAGE — Fix:
1. Playlist cards grid:
   - Mobile: 2 columns
   - Tablet: 3 columns
   - Desktop: keep existing
2. Create playlist button: 
   - Mobile: full width or prominent floating button

ALL MODALS on mobile:
- Change from centered dialog to bottom sheet style:
  position: fixed
  bottom: 0, left: 0, right: 0
  border-radius: 20px 20px 0 0
  max-height: 90vh
  overflow-y: auto
  padding-bottom: env(safe-area-inset-bottom)
  animation: slide up from bottom (translateY(100%) → translateY(0))

Show me complete fixed versions of all 4 page files.

SESSION 17 — Shorts Page Full Consistency Redesign
Attach: src/pages/ShortsPage.jsx, src/components/shorts/ShortsPlayer.jsx, src/index.css
CONTEXT PRIMER (paste above first)

PHASE 3 — SESSION 17: SHORTS PAGE CONSISTENCY REDESIGN
=======================================================

Redesign the Shorts page to be visually consistent with the rest of the app
while keeping its TikTok/YouTube Shorts-style vertical scroll format.
Keep ALL the autoplay/IntersectionObserver logic from Session 9 intact.
Only change the VISUAL DESIGN and add missing UI features.

CONTAINER LAYOUT:
- Full viewport: height: 100vh, overflow hidden on the page wrapper
- Center the short: max-width: 420px, margin: 0 auto
- The scroll container: height: 100vh, overflow-y: scroll, scroll-snap-type: y mandatory
- Each short wrapper: height: 100vh, scroll-snap-align: start
- On mobile: full width (no max-width centering — edge to edge)

VIDEO ELEMENT:
- Fill container: width: 100%, height: 100%, object-fit: cover
- border-radius: 0 on mobile, 16px on desktop (inside centered container)

RIGHT-SIDE ACTION COLUMN (matches app button style):
- position: absolute, right: 12px, bottom: 120px
- display: flex, flex-direction: column, gap: 20px
- Each action button:
  - Glass background: background: rgba(0,0,0,0.5), backdrop-filter: blur(8px)
  - border-radius: 50% (circle)
  - width: 48px, height: 48px
  - Icon: 22px, same color as app icons
  - Count label below: 11px, same muted color as app
  - Active states match app (like = red accent color)

BOTTOM AUTHOR OVERLAY:
- position: absolute, bottom: 0, left: 0, right: 0
- background: linear-gradient(transparent, rgba(0,0,0,0.8))
- padding: 60px 16px 20px 16px
- Avatar: 40px circle with border: 2px solid white
- @username: 14px, font-weight: 600, white
- Video title: 13px, muted white, max 2 lines
- Subscribe button: 
  - Same style as app's subscribe button
  - Small size: height 28px, padding 0 12px
  - Positioned inline next to username

TOP CONTROLS:
- position: absolute, top: 16px
- Left: back arrow button (on mobile only, to exit shorts)
- Right: mute/unmute button + options (3-dot menu)
- Same glass circle style as action buttons

DESKTOP ADDITIONS:
- Left side of centered container: large arrow button (←) for previous short
- Right side: large arrow button (→) for next short
- Both arrows: glass background, 48px, hover to reveal
- Keyboard: ArrowUp/ArrowDown also work
- Short counter: "3 / 12" shown subtly above action buttons

PROGRESS INDICATOR:
- Thin progress bar at very top of the video (like Instagram stories)
- Shows playback progress of current video
- height: 2px, background: rgba(255,255,255,0.3)
- Fill: white, updated by video timeupdate event

CONSISTENCY RULES:
- Font family: same as rest of app
- Icon set: same icon library as rest of app (no mixing different icon sets)
- Red accent color: exact same value as rest of app
- Toast notifications: same component as rest of app
- Loading skeleton: same .skeleton class from Session 13

Show me complete rewritten ShortsPage.jsx and ShortsPlayer.jsx
with all visual improvements while keeping autoplay logic intact.

SESSION 18 — Profile Page Polish
Attach: src/pages/ProfilePage.jsx (or Settings page), any avatar/cover upload component files
CONTEXT PRIMER (paste above first)

PHASE 3 — SESSION 18: PROFILE PAGE IMPROVEMENTS
================================================

Polish the profile/settings page. Keep all existing functionality.
Only improve UX, visual design, and upload flow feedback.
Do NOT change colors, API calls, or navigation structure.

AVATAR UPLOAD UX:
1. The circular avatar area should show on hover:
   - Semi-transparent dark overlay on the avatar
   - Camera icon (✏️ or camera SVG) centered in the overlay
   - Tooltip text: "Change Photo"
   - Cursor: pointer
   - Smooth transition: opacity 0 → 1 on hover (150ms)

2. Upload flow feedback:
   - During upload: show a circular progress spinner over the avatar
   - On success: brief checkmark animation then revert to normal
   - On failure: red X icon + error toast

3. Avatar upload must follow this exact flow:
   a. User clicks avatar → file picker opens (accept: "image/*")
   b. GET /api/v1/upload/signature?resourceType=avatar → get Cloudinary signature
   c. Upload directly to Cloudinary using the signature
   d. On Cloudinary success: PATCH /api/v1/users/update-avatar 
      with body { avatarPublicId: publicId }  ← publicId from signature response
   e. Refresh user data

COVER IMAGE UPLOAD UX:
1. "Change Cover" button: always visible in top-right of cover area
2. Same upload flow as avatar but resourceType=cover and 
   endpoint: PATCH /api/v1/users/update-coverImage 
   with body { coverImagePublicId: publicId }
3. During upload: show loading overlay on the entire cover image area

SAVE CHANGES BUTTON:
1. Add unsaved changes indicator:
   - When any form field is changed from its original value:
     Show a small yellow dot on the Save Changes button
     OR show an "Unsaved changes" badge near the button
2. Button loading state during save: spinner + "Saving..." text
3. On success: "Saved ✓" text for 2 seconds then revert

FORM IMPROVEMENTS:
1. Description textarea:
   - Add character count: "143 / 500" shown bottom-right of textarea
   - Warn (yellow) at 80% usage, error (red) at 100%

2. Social links input:
   - Add URL format validation (must start with https://)
   - Show green checkmark if valid URL, red X if invalid format
   - Validate on blur (when user leaves the field)

3. Username field (if editable):
   - Show @prefix inside the field visually
   - Validate: only lowercase letters, numbers, underscores

TABS IMPROVEMENT:
- Active tab: sliding underline indicator
  - Use a div with background: red accent color
  - Use CSS transform: translateX() to slide to active tab position
  - Transition: 200ms ease
- Tab content: fade in animation (opacity 0 → 1, 150ms) on tab switch

SECTION LAYOUT:
- Each form section (Channel Details, Branding, Links & Socials) gets:
  - glass-card styling from Session 11
  - Clear section header with title + subtitle
  - 24px internal padding
  - 16px gap between sections

Show me complete fixed profile/settings page with all improvements.
Include the avatar upload component if it's separate.

SESSION 19 — Final Consistency Pass
Attach: All component files from src/components/ui/ (buttons, inputs, badges, toasts etc.), tailwind.config.js
CONTEXT PRIMER (paste above first)

PHASE 3 — SESSION 19: GLOBAL UI CONSISTENCY PASS
=================================================

Final pass to make everything consistent across the app.
This is about fixing small inconsistencies, not adding new features.

AUDIT AND FIX these specific consistency issues:

1. TOAST NOTIFICATIONS:
   - Must look the same everywhere in the app
   - Position: bottom-right on desktop, bottom-center on mobile
   - Style: glass-surface background + colored left border 
     (green for success, red for error, yellow for warning, blue for info)
   - Animation: slide up from bottom + fade in (200ms)
   - Auto-dismiss: 3 seconds
   - If using a toast library (react-hot-toast, sonner, etc.): 
     customize its theme to match app colors

2. EMPTY STATES:
   Audit every page for empty states. Each empty state must have:
   - An icon (60px, muted color)
   - A title: "No [content] yet" (16px, slightly bright)
   - A subtitle: helpful message (14px, muted)
   - Optional: a CTA button
   Pages to check: Watch Later, Playlists, Search results, 
   Channel tabs (when no content), History, Notifications

3. ERROR STATES:
   Every page that fetches data must handle API errors:
   - Show: error icon + "Something went wrong" + "Try Again" button
   - "Try Again" button must trigger a refetch
   - Consistent styling across all pages

4. LOADING STATES:
   - All pages must use the .skeleton shimmer class from Session 13
   - Replace any spinner-only loading with skeleton cards that 
     match the shape of the actual content
   - VideoCard skeleton: same dimensions as actual video card
   - Channel header skeleton: cover shape + circle avatar + text lines

5. BUTTON CONSISTENCY:
   Audit all buttons in the app. Categorize and fix:
   - Primary action buttons: red accent, consistent height (36px or 40px), border-radius
   - Secondary buttons: outlined/ghost style, same height as primary
   - Icon-only buttons: same circular glass style
   - Destructive buttons (delete, remove): red but different shade or outlined red
   All buttons same font-weight and letter-spacing

6. INPUT FIELD CONSISTENCY:
   All text inputs, textareas, selects must have:
   - Same border color: var(--glass-border-strong)
   - Same background: var(--glass-bg)
   - Same border-radius: 8px
   - Same focus ring: red accent color, 2px
   - Same padding: 10px 14px
   - font-size: 15px (never below 16px on mobile)

7. SCROLLBAR STYLING:
   Add custom thin scrollbar for the app:
   ::-webkit-scrollbar { width: 4px; height: 4px; }
   ::-webkit-scrollbar-track { background: transparent; }
   ::-webkit-scrollbar-thumb { 
     background: rgba(255,255,255,0.15); 
     border-radius: 4px; 
   }
   ::-webkit-scrollbar-thumb:hover { 
     background: rgba(255,255,255,0.25); 
   }

8. FOCUS STATES (accessibility):
   All interactive elements must have visible focus ring:
   outline: 2px solid var(--red-accent);
   outline-offset: 2px;
   Only show on keyboard navigation (use :focus-visible not :focus)

Show me:
1. Global CSS additions (index.css)
2. Any shared component fixes (Button, Input, EmptyState, ErrorState)
3. List of pages that need empty/error state components added
   (don't implement all pages — just list them with the component to add)

✅ PHASE 3 COMPLETE — TEST CHECKLIST
GLASS MORPHISM:
□ Sidebar has frosted glass effect (blur visible when scrolling content behind it)
□ Navbar has frosted glass effect
□ Modals have glass background (not solid black)
□ Notification dropdown has glass background
□ Dashboard stat cards have glass card style
□ Video cards have subtle glass border

MICRO-INTERACTIONS:
□ Page navigation has fade+slide-up transition
□ Buttons scale down on press (0.97)
□ Primary buttons glow on hover
□ Video cards lift slightly on hover
□ Like button has pop animation when clicked
□ Subscribe button smoothly transitions text
□ All loading states use shimmer skeleton

MOBILE:
□ Home feed is 1 column on 375px width
□ Watch page stacks vertically (player → info → comments) on mobile
□ Channel page header stacks vertically on mobile
□ Channel tabs scroll horizontally on mobile
□ Dashboard stat cards are 2x2 grid on mobile
□ Bottom navigation bar visible on mobile
□ Bottom nav hides on desktop (≥768px)
□ No horizontal scroll on any page at 375px
□ All inputs font-size ≥ 16px (no iOS zoom)
□ All touch targets ≥ 44x44px
□ Modals are bottom-sheet on mobile

SHORTS:
□ Shorts page centered on desktop, full-width on mobile
□ Action buttons (like/dislike/share) match app button style
□ Author overlay has gradient background
□ Subscribe button matches app subscribe button
□ Progress bar visible during playback
□ Previous/Next arrows visible on desktop
□ Keyboard ArrowUp/Down navigation works

PROFILE PAGE:
□ Avatar shows camera icon overlay on hover
□ Avatar upload shows spinner during upload
□ Cover image upload works with progress feedback
□ Save button shows unsaved changes indicator
□ Description has character count
□ Tab switching has sliding underline animation
□ Form sections have glass card styling

CONSISTENCY:
□ Toast notifications look identical everywhere
□ All empty states have icon + title + subtitle
□ All error states have retry button
□ All loading states use shimmer skeleton
□ All buttons have consistent sizing
□ All inputs have consistent styling
□ Custom thin scrollbar visible
□ Focus rings visible on keyboard navigation

Here are all Phase 4 sessions — performance, optimization, and production readiness.

QUICK REFERENCE CARD (paste at start of every session)
CONTEXT PRIMER (paste at start of every session):
===================================================
App: Vixora — YouTube-like platform. React + Vite.
- All API calls: withCredentials: true
- Paginated lists: response.data.data.items
- API base: /api/v1
- NEVER change: colors, working functionality, UI layout
- NEVER break any fixes from Phase 1, 2, or 3
- Phase 4 is PERFORMANCE & PRODUCTION only
- No visual changes unless explicitly stated in the prompt

SESSION 20 — Bundle Analysis & Code Splitting
Attach: vite.config.js, src/App.jsx (router file), package.json
CONTEXT PRIMER (paste above first)

PHASE 4 — SESSION 20: BUNDLE ANALYSIS & CODE SPLITTING
=======================================================

Goal: Reduce initial bundle size using route-level lazy loading.
Do NOT change any component logic, styles, or API calls.

STEP 1 — Add bundle analyzer to see current state:
In vite.config.js add rollup-plugin-visualizer:

import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
  react(),
  visualizer({
    open: true,
    filename: 'dist/bundle-analysis.html',
    gzipSize: true,
    brotliSize: true,
  })
]

Run: npm run build
This opens a visual map of bundle sizes. Note the largest chunks.

STEP 2 — Lazy load ALL page components in App.jsx:

Replace every static page import like:
  import HomePage from './pages/HomePage'
  
With lazy imports:
  const HomePage = lazy(() => import('./pages/HomePage'))

Wrap the entire Routes tree in:
  <Suspense fallback={<PageLoadingSkeleton />}>
    <Routes>...</Routes>
  </Suspense>

STEP 3 — Create PageLoadingSkeleton component:
File: src/components/common/PageLoadingSkeleton.jsx

A full-page skeleton that matches the general app layout:
- Navbar skeleton at top (same height as real navbar)
- Sidebar skeleton on left (desktop only)
- Content area: 3x2 grid of video card skeletons
- Use .skeleton shimmer class from Phase 3

STEP 4 — Group chunks logically in vite.config.js:

build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-query': ['@tanstack/react-query'],
        'vendor-charts': ['recharts'],
        'vendor-ui': ['any UI library you use'],
        'pages-auth': [
          './src/pages/LoginPage',
          './src/pages/RegisterPage',
          './src/pages/ForgotPasswordPage'
        ],
        'pages-admin': [
          // any admin pages if they exist
        ],
      }
    }
  }
}

STEP 5 — Prefetch on hover for sidebar links:
In Sidebar.jsx, on mouseenter of each nav link:
  const prefetchRoute = (importFn) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = importFn.toString() // won't work directly
  }
  
Better approach: use dynamic import on hover:
  onMouseEnter={() => import('../pages/WatchPage')} 
  // this primes the chunk in browser cache

Add this to the 3 most visited links: Home, Trending, Shorts

STEP 6 — Image optimization:
Audit every <img> tag in the codebase. Add to ALL of them:
  loading="lazy"
  decoding="async"
  
For avatar/thumbnail images, add explicit width and height to prevent 
Cumulative Layout Shift (CLS).

Show me:
1. Updated vite.config.js
2. Updated App.jsx with all lazy imports + Suspense
3. Complete PageLoadingSkeleton.jsx
4. List of all img tags that are missing loading="lazy"

SESSION 21 — React Query Setup & API Caching
Attach: src/main.jsx, package.json, your most-used API service files (feed, videos, channel, user)
CONTEXT PRIMER (paste above first)

PHASE 4 — SESSION 21: REACT QUERY CACHING SETUP
=================================================

Goal: Set up proper API caching to eliminate duplicate requests and 
improve perceived performance. 
Do NOT change any UI or styles.

STEP 1 — Check if React Query (@tanstack/react-query) is already installed.
If yes: show me the current QueryClient config.
If no: 
  npm install @tanstack/react-query @tanstack/react-query-devtools

STEP 2 — Configure QueryClient in src/main.jsx:

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,          // 30 seconds — data stays fresh
      gcTime: 5 * 60 * 1000,         // 5 minutes — cache kept in memory
      retry: 1,                       // retry once on failure
      refetchOnWindowFocus: false,    // don't refetch when tab regains focus
      refetchOnReconnect: true,       // do refetch when internet reconnects
    },
    mutations: {
      retry: 0,                       // don't retry mutations
    }
  }
})

Wrap app in:
  <QueryClientProvider client={queryClient}>
    <App />
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>

STEP 3 — Create query key constants file:
File: src/lib/queryKeys.js

Export a QUERY_KEYS object:
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

STEP 4 — Migrate these 4 critical data fetches to useQuery:

A) Current User (global auth state):
   Replace whatever is currently used for current user with:
   useQuery({
     queryKey: QUERY_KEYS.CURRENT_USER,
     queryFn: () => api.get('/users/current-user').then(r => r.data.data),
     staleTime: 5 * 60 * 1000,  // user data stays fresh 5 mins
     retry: false,               // if 401, don't retry
   })

B) Dashboard:
   useQuery({
     queryKey: QUERY_KEYS.DASHBOARD(period),
     queryFn: () => api.get(`/dashboard/full?period=${period}`).then(r => r.data.data),
     staleTime: 60 * 1000,  // 1 minute
   })

C) Channel detail:
   useQuery({
     queryKey: QUERY_KEYS.CHANNEL(channelId),
     queryFn: () => api.get(`/channels/${channelId}`).then(r => r.data.data),
     staleTime: 2 * 60 * 1000,
     enabled: !!channelId,
   })

D) My Playlists:
   useQuery({
     queryKey: QUERY_KEYS.MY_PLAYLISTS,
     queryFn: () => api.get('/playlists/user/me').then(r => r.data.data.items),
     staleTime: 60 * 1000,
   })

STEP 5 — Add optimistic updates to like toggle:
When user clicks like:
1. Immediately update the local query cache (optimistic)
2. Call the API mutation
3. On success: invalidate the video query to get fresh data
4. On error: roll back the optimistic update

useMutation example:
  mutationFn: (videoId) => api.post(`/likes/toggle/v/${videoId}`),
  onMutate: async (videoId) => {
    await queryClient.cancelQueries({ queryKey: QUERY_KEYS.VIDEO_WATCH(videoId) })
    const previous = queryClient.getQueryData(QUERY_KEYS.VIDEO_WATCH(videoId))
    queryClient.setQueryData(QUERY_KEYS.VIDEO_WATCH(videoId), old => ({
      ...old,
      isLiked: !old.isLiked,
      likesCount: old.isLiked ? old.likesCount - 1 : old.likesCount + 1
    }))
    return { previous }
  },
  onError: (err, videoId, context) => {
    queryClient.setQueryData(QUERY_KEYS.VIDEO_WATCH(videoId), context.previous)
  },
  onSettled: (videoId) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VIDEO_WATCH(videoId) })
  }

Show me:
1. Updated main.jsx with QueryClientProvider
2. Complete queryKeys.js file
3. The 4 migrated useQuery implementations
4. The like toggle useMutation with optimistic update

SESSION 22 — Infinite Scroll Feed Optimization
Attach: src/hooks/useInfiniteScroll.js, src/pages/HomePage.jsx, feed-related page files
CONTEXT PRIMER (paste above first)

PHASE 4 — SESSION 22: INFINITE SCROLL WITH REACT QUERY
=======================================================

Upgrade the feed infinite scroll to use React Query's useInfiniteQuery.
This eliminates duplicate requests and adds proper pagination caching.
Do NOT change any visual components or styles.

STEP 1 — Replace useInfiniteScroll hook with React Query version:

New file: src/hooks/useFeed.js

import { useInfiniteQuery } from '@tanstack/react-query'
import { useIntersectionObserver } from './useIntersectionObserver'
import { QUERY_KEYS } from '../lib/queryKeys'
import api from '../lib/api'

export function useHomeFeed() {
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.FEED_HOME,
    queryFn: ({ pageParam = 1 }) => 
      api.get(`/feed/home?page=${pageParam}&limit=20`)
         .then(r => r.data.data),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage 
        ? lastPage.pagination.currentPage + 1 
        : undefined,
    staleTime: 30 * 1000,
  })
  
  // Flatten pages into single items array
  const items = query.data?.pages.flatMap(page => page.items) ?? []
  
  return { ...query, items }
}

Create similar hooks for:
- useTrendingFeed()  → /feed/trending
- useShortsFeed()    → /feed/shorts  
- useSubscriptionFeed() → /feed/subscriptions

STEP 2 — Create useIntersectionObserver hook:
File: src/hooks/useIntersectionObserver.js

A hook that returns a ref to attach to a "sentinel" element.
When the sentinel enters the viewport, calls a callback.
Use this to trigger fetchNextPage when user scrolls near the bottom.

export function useIntersectionObserver(callback, options = {}) {
  const ref = useRef(null)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callback() },
      { threshold: 0.1, ...options }
    )
    
    observer.observe(element)
    return () => observer.disconnect()
  }, [callback])
  
  return ref
}

STEP 3 — Update feed pages to use new hooks:

In HomePage.jsx:
  const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } 
    = useHomeFeed()
  
  const sentinelRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  })
  
  return (
    <div>
      <VideoGrid videos={items} isLoading={isLoading} />
      
      {/* Sentinel element — when visible, loads next page */}
      <div ref={sentinelRef} className="h-4" />
      
      {isFetchingNextPage && <LoadingSpinner />}
      {!hasNextPage && items.length > 0 && (
        <p className="text-center text-muted py-8">You've reached the end</p>
      )}
    </div>
  )

STEP 4 — Prefetch next page before user reaches bottom:
Add this to feed pages — prefetch when user is at 80% scroll:

  const prefetchRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) {
      // This prefetches silently without showing loading indicator
      fetchNextPage()
    }
  }, { rootMargin: '400px' })  // trigger 400px before reaching bottom
  
  // Place prefetchRef div 5 items before the end of the list

STEP 5 — Add "Pull to refresh" on mobile feeds:
On mobile (detect via window.innerWidth < 768):
- When user pulls down from top of feed (touch events)
- Show a small refresh indicator
- Call queryClient.invalidateQueries for the feed key
- Simple implementation using touch events:
  touchstart: record startY
  touchmove: if pulled down > 60px, show indicator
  touchend: if indicator showing, trigger refetch

Show me:
1. Complete useFeed.js with all 4 feed hooks
2. Complete useIntersectionObserver.js
3. Updated HomePage.jsx using the new hook
4. Pull-to-refresh implementation (mobile only)

SESSION 23 — Real-Time Notifications Setup
Attach: src/main.jsx or wherever Socket.IO client is initialized, notification-related components, src/services/notificationService.js
CONTEXT PRIMER (paste above first)

PHASE 4 — SESSION 23: REAL-TIME NOTIFICATIONS WITH SOCKET.IO
=============================================================

Wire up real-time notifications properly.
Backend emits Socket.IO event: "notification:new"
Do NOT change notification UI styles.

STEP 1 — Create Socket.IO client singleton:
File: src/lib/socket.js

import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', ''), {
      withCredentials: true,
      path: import.meta.env.VITE_SOCKET_PATH || '/socket.io',
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect()
}

STEP 2 — Create useNotifications hook:
File: src/hooks/useNotifications.js

This hook:
1. Connects socket when user is authenticated
2. Listens for "notification:new" event
3. Updates unread count in React Query cache
4. Shows a toast for new notifications
5. Disconnects socket on logout

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket, connectSocket, disconnectSocket } from '../lib/socket'
import { QUERY_KEYS } from '../lib/queryKeys'
import { useCurrentUser } from './useCurrentUser'
import toast from 'react-hot-toast' // or your toast library

export function useNotifications() {
  const queryClient = useQueryClient()
  const { user } = useCurrentUser()
  
  useEffect(() => {
    if (!user) return  // only connect when logged in
    
    connectSocket()
    const socket = getSocket()
    
    socket.on('notification:new', (notification) => {
      // 1. Increment unread count in cache
      queryClient.setQueryData(QUERY_KEYS.UNREAD_COUNT, (old) => 
        (old || 0) + 1
      )
      
      // 2. Invalidate full notifications list so it refetches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS })
      
      // 3. Show toast for important notifications
      if (notification.type !== 'SYSTEM') {
        toast(notification.title || notification.message, {
          icon: getNotificationIcon(notification.type),
          duration: 4000,
        })
      }
    })
    
    return () => {
      socket.off('notification:new')
    }
  }, [user?.id])
  
  // Disconnect when user logs out
  useEffect(() => {
    if (!user) disconnectSocket()
  }, [user])
}

function getNotificationIcon(type) {
  const icons = {
    LIKE: '❤️',
    COMMENT: '💬',
    SUBSCRIPTION: '🔔',
    UPLOAD: '📹',
    MENTION: '@',
    SYSTEM: 'ℹ️',
  }
  return icons[type] || '🔔'
}

STEP 3 — Mount the hook at app level:
In your main App component or layout:
  useNotifications() // call once at top level

STEP 4 — Fix notification bell component:
The bell icon in navbar should:
1. Fetch unread count: GET /api/v1/notifications/unread-count
   Use: useQuery({ queryKey: QUERY_KEYS.UNREAD_COUNT, ... })
   Poll every 60 seconds as fallback: refetchInterval: 60 * 1000
   
2. Show red badge with count when count > 0
   Badge: if count > 99 show "99+"
   
3. On click: open dropdown panel
   Fetch: GET /api/v1/notifications/unread (first 10)
   
4. "Mark all read" button: 
   PATCH /api/v1/notifications/read-all
   Then: queryClient.invalidateQueries for NOTIFICATIONS + UNREAD_COUNT

5. On notification item click:
   PATCH /api/v1/notifications/:id/read
   Navigate to relevant content based on notification.type + notification.videoId

STEP 5 — Handle socket connection errors gracefully:
socket.on('connect_error', (err) => {
  console.warn('Socket connection failed:', err.message)
  // Do NOT show error to user — notifications will still work via polling
})

Show me:
1. Complete src/lib/socket.js
2. Complete src/hooks/useNotifications.js  
3. Updated notification bell component
4. Where to call useNotifications() in the app

SESSION 24 — Error Boundaries & Global Error Handling
Attach: src/App.jsx, src/main.jsx, any existing error boundary files
CONTEXT PRIMER (paste above first)

PHASE 4 — SESSION 24: ERROR BOUNDARIES & GLOBAL ERROR HANDLING
===============================================================

Add production-grade error handling throughout the app.
This prevents a single broken component from crashing the entire page.

STEP 1 — Create ErrorBoundary component:
File: src/components/common/ErrorBoundary.jsx

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to console in dev, could send to Sentry in prod
    console.error('ErrorBoundary caught:', error, errorInfo)
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload() // or use React Router navigate
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted text-sm max-w-sm text-center">
            This section failed to load. Try refreshing the page.
          </p>
          <button onClick={this.handleReset} className="btn-primary">
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

STEP 2 — Wrap key sections in ErrorBoundary:
In App.jsx, wrap each route with its own ErrorBoundary:

<ErrorBoundary key={location.pathname}>
  <Suspense fallback={<PageLoadingSkeleton />}>
    <Routes>...</Routes>
  </Suspense>
</ErrorBoundary>

Also wrap the Sidebar and Navbar separately:
<ErrorBoundary fallback={<div className="w-64" />}>
  <Sidebar />
</ErrorBoundary>

STEP 3 — Global Axios error interceptor:
File: src/lib/api.js (or wherever axios instance is created)

Add response interceptor:

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401: try token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await api.post('/users/refresh-token')
        return api(originalRequest) // retry original request
      } catch (refreshError) {
        // Refresh failed — redirect to login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    // Handle 403: redirect to home
    if (error.response?.status === 403) {
      window.location.href = '/'
    }
    
    // Handle 404: let component handle it
    // Handle 429: show rate limit toast
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.')
    }
    
    // Handle 500+: show generic error
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.')
    }
    
    return Promise.reject(error)
  }
)

STEP 4 — 404 Page:
File: src/pages/NotFoundPage.jsx

A proper 404 page that:
- Shows a friendly message
- Has a "Go Home" button
- Has a "Go Back" button using useNavigate(-1)
- Matches app design (dark background, same fonts)
- NOT a blank white page

Add to router: catch-all route <Route path="*" element={<NotFoundPage />} />

STEP 5 — Loading state for auth check:
When app first loads, it checks if user is authenticated.
During this check (usually 200-500ms) show a proper loading state:
- Full screen with centered logo + subtle pulse animation
- NOT a blank white flash

If user is unauthenticated on a protected route:
- Redirect to /login
- Save the intended destination: ?redirect=/watch/videoId
- After login, redirect back to saved destination

Show me:
1. Complete ErrorBoundary.jsx
2. Updated api.js with interceptors
3. Complete NotFoundPage.jsx
4. App loading state implementation
5. Protected route implementation with redirect logic

SESSION 25 — Performance: Image & Video Optimization
Attach: src/components/video/VideoCard.jsx, src/components/common/Avatar.jsx (or wherever avatars are rendered), any image component files
CONTEXT PRIMER (paste above first)

PHASE 4 — SESSION 25: IMAGE & VIDEO PERFORMANCE
================================================

Optimize all media loading for faster perceived performance.
Do NOT change visual appearance or functionality.

STEP 1 — Create optimized Image component:
File: src/components/common/OptimizedImage.jsx

A wrapper around <img> that:
1. Always has loading="lazy" and decoding="async"
2. Shows skeleton shimmer while loading
3. Falls back to a placeholder on error
4. Optionally accepts Cloudinary transformation params

function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  fallback = '/placeholder-thumbnail.jpg',
  cloudinaryTransform = null  // e.g. "w_480,h_270,c_fill,q_auto,f_auto"
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  
  // Build Cloudinary optimized URL if transform provided
  const optimizedSrc = cloudinaryTransform && src?.includes('cloudinary')
    ? src.replace('/upload/', `/upload/${cloudinaryTransform}/`)
    : src
  
  return (
    <div className={cn('relative overflow-hidden', className)} 
         style={{ width, height }}>
      
      {/* Skeleton shown while loading */}
      {!loaded && !error && (
        <div className="skeleton absolute inset-0" />
      )}
      
      <img
        src={error ? fallback : optimizedSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-200',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  )
}

STEP 2 — Replace all thumbnail images with OptimizedImage:
In VideoCard.jsx, replace:
  <img src={video.thumbnail} ... />
With:
  <OptimizedImage 
    src={video.thumbnail}
    alt={video.title}
    cloudinaryTransform="w_480,h_270,c_fill,q_auto,f_auto"
    className="aspect-video w-full rounded-lg"
  />

STEP 3 — Replace all avatar images with OptimizedImage:
All avatar images should use:
  cloudinaryTransform="w_80,h_80,c_fill,q_auto,f_auto,r_max"
  (r_max = circular crop in Cloudinary)

STEP 4 — Video thumbnail hover preview (nice-to-have):
In VideoCard, on hover show a brief 3-second GIF preview if available.
Most cards won't have this, so only enable if video has a previewUrl field.
If not: just keep the static thumbnail hover effect from Phase 3.

STEP 5 — Cloudinary URL optimization for cover images:
Cover images (channel/profile cover) should use:
  cloudinaryTransform="w_1280,h_350,c_fill,q_auto,f_auto"

STEP 6 — Avoid layout shift (CLS):
Every image container MUST have explicit aspect ratio or dimensions.
Use aspect-ratio CSS:
  Thumbnails: aspect-ratio: 16/9
  Avatars: aspect-ratio: 1/1
  Cover images: aspect-ratio: 32/9 (or fixed height)

This prevents page jumping as images load.

STEP 7 — Audit and fix all remaining raw <img> tags:
Scan the entire codebase. Find every <img> tag.
If it's missing any of: loading="lazy", decoding="async", defined dimensions
→ Wrap it in OptimizedImage or add the missing attributes.

List every file and line where raw <img> tags still exist after your fix.

Show me:
1. Complete OptimizedImage.jsx component
2. Updated VideoCard.jsx using OptimizedImage
3. List of all other files that need img → OptimizedImage updates

SESSION 26 — Final Production Audit
Attach: src/utils/config.js, .env.example (if exists), vite.config.js, package.json, src/App.jsx
CONTEXT PRIMER (paste above first)

PHASE 4 — SESSION 26: FINAL PRODUCTION AUDIT
=============================================

A complete pre-deployment checklist. Fix everything found.
This is the final session before the app is production-ready.

AUDIT 1 — Environment Variables:
Scan all files. Find every place that reads import.meta.env.*
List all env variables the app uses. Create a complete .env.example:

VITE_API_BASE_URL=https://your-backend.com/api/v1
VITE_SOCKET_PATH=/socket.io
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_APP_NAME=Vixora
# Add any others found in the codebase

Make sure EVERY env variable has a fallback or throws in production if missing.

AUDIT 2 — Console logs cleanup:
Find every console.log, console.error, console.warn in the codebase.
- Remove ALL console.log statements that are debug/dev-only
- Keep console.error only in actual error handlers
- Replace important logging with a proper logger that auto-silences in production:

File: src/lib/logger.js
const isDev = import.meta.env.DEV

export const logger = {
  log: (...args) => isDev && console.log('[Vixora]', ...args),
  warn: (...args) => isDev && console.warn('[Vixora]', ...args),
  error: (...args) => console.error('[Vixora]', ...args), // always log errors
}

AUDIT 3 — Security check:
Scan for any of these in the codebase and REMOVE them:
- API keys hardcoded anywhere (Cloudinary api_key etc.)
- JWT tokens stored in localStorage (must be HttpOnly cookies from backend)
- Sensitive user data logged to console
- dangerouslySetInnerHTML without sanitization

If dangerouslySetInnerHTML is used: install DOMPurify and wrap:
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}

AUDIT 4 — Performance quick wins:
1. Check for any synchronous operations in render:
   Heavy computations must be in useMemo
   Stable callbacks must be in useCallback
   
2. Find any components re-rendering too often:
   Parent state changes should not re-render all children
   Use React.memo on expensive list item components:
   - VideoCard
   - PlaylistItem  
   - NotificationItem

3. Check for memory leaks:
   Every useEffect with subscriptions/listeners must have cleanup:
   - Socket event listeners: return () => socket.off('event')
   - IntersectionObserver: return () => observer.disconnect()
   - setTimeout/setInterval: return () => clearTimeout/clearInterval
   Find any useEffect that is missing cleanup and fix them.

AUDIT 5 — Accessibility basics:
1. All images must have alt text (not empty alt="" unless decorative)
2. All buttons must have accessible labels:
   Icon-only buttons: add aria-label="Like video"
3. All form inputs must have associated <label> elements
4. Tab navigation: all interactive elements must be focusable
5. Color contrast: headings and body text must be readable on dark bg

Run this check: search for <button without aria-label on icon-only buttons
and list all that need to be fixed.

AUDIT 6 — Vite build configuration for production:
In vite.config.js verify:

build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,     // removes all console.logs in production
      drop_debugger: true,    // removes debugger statements
    }
  },
  chunkSizeWarningLimit: 600,
  sourcemap: false,            // no sourcemaps in production (security)
}

AUDIT 7 — Check for these common React anti-patterns:
1. Using array index as key in mapped lists → use item.id as key
2. useState for derived data → use useMemo instead
3. Calling API directly in render → should be in useEffect or query hooks
4. Mutating state directly → should use setState with new object

Find and fix all instances of using array index as key:
  items.map((item, index) => <Component key={index} />)  ← WRONG
  items.map((item) => <Component key={item.id} />)       ← CORRECT

FINAL OUTPUT:
Show me:
1. Complete .env.example file
2. Complete src/lib/logger.js
3. Updated vite.config.js with production build settings
4. List of all console.log statements to remove with file + line
5. List of all missing cleanup functions in useEffect
6. List of all icon-only buttons missing aria-label
7. List of all array index keys that need to be fixed
8. React.memo additions for VideoCard, PlaylistItem, NotificationItem

✅ PHASE 4 COMPLETE — FINAL TEST CHECKLIST
PERFORMANCE:
□ npm run build completes with no errors
□ Initial JS bundle < 500KB (check dist folder)
□ Route chunks load lazily (check Network tab in DevTools)
□ PageLoadingSkeleton shows during lazy chunk load
□ No duplicate API calls for same data (check Network tab)
□ Feed loads next page automatically as you scroll
□ Pull-to-refresh works on mobile

CACHING:
□ Navigating back to home feed is instant (cached)
□ Navigating back to channel page is instant (cached)
□ Dashboard data doesn't re-fetch on every visit (30s stale time)
□ Like toggle updates immediately (optimistic update)

REAL-TIME:
□ New notification appears in bell without page refresh
□ Unread count badge updates in real time
□ Socket reconnects after internet interruption

ERROR HANDLING:
□ Breaking one component doesn't crash entire page
□ 401 response triggers token refresh automatically
□ 401 after refresh failure redirects to login
□ 404 route shows proper NotFoundPage (not blank)
□ App shows loading state during initial auth check
□ Protected routes redirect to login with ?redirect param

IMAGES:
□ All thumbnails load lazily (check Network tab — only visible ones load)
□ No layout shift when thumbnails load (stable dimensions)
□ Skeleton shimmer shows while thumbnail loads
□ Broken image URLs show fallback placeholder
□ Cloudinary URLs have optimization transforms (check image URLs)

PRODUCTION:
□ npm run build has 0 warnings about chunk sizes
□ No console.log statements in production build
□ No hardcoded localhost URLs anywhere
□ .env.example has all required variables documented
□ All useEffect hooks have proper cleanup functions
□ No array index used as React key
□ All icon-only buttons have aria-label

🏁 ALL 4 PHASES DONE — WHAT'S NEXT?
After Phase 4 checklist passes, your app is production-ready. The final step is deploying:
DEPLOYMENT CHECKLIST:
□ Set all env variables on Vercel/Netlify
□ VITE_API_BASE_URL = production backend URL
□ CORS_ORIGIN on backend includes your frontend domain
□ Test the deployed URL on real mobile device
□ Test login → watch → playlist → shorts flow end to end
□ Admin panel: test /admin/me returns correct role
□ Check browser console on prod — should be completely silent

Here are all Phase 5 sessions — building the complete Admin Panel frontend.

---

## QUICK REFERENCE CARD (paste at start of every session)

```
CONTEXT PRIMER (paste at start of every session):
===================================================
App: Vixora Admin Panel — separate frontend for moderation.
Backend admin base: /api/v1/admin
Auth: same login as main app (HttpOnly cookie "accessToken")
- All API calls: withCredentials: true
- Single object responses: response.data.data
- Paginated lists: response.data.data.items + response.data.data.pagination
- Admin panel uses SAME color palette as main Vixora app
- Same typography, spacing, glass morphism tokens from Phase 3
- DO NOT build a generic "enterprise" admin theme
- Match the Vixora design language exactly
```

---

## SESSION 27 — Admin Panel Project Setup

**Attach:** `package.json`, `vite.config.js`, `src/App.jsx` from main app

```
CONTEXT PRIMER (paste above first)

PHASE 5 — SESSION 27: ADMIN PANEL SETUP & ARCHITECTURE
=======================================================

Set up the admin panel. It can be either:
A) A separate /admin route section inside the existing Vixora frontend
B) A completely separate Vite project

RECOMMENDED: Option A — same project, separate route section.
This shares the same auth cookies, same design system, same components.

STEP 1 — Create admin route structure in App.jsx:

Add a protected admin section:
/admin                    → redirect to /admin/dashboard
/admin/dashboard          → AdminDashboardPage
/admin/reports            → AdminReportsPage
/admin/users              → AdminUsersPage
/admin/videos             → AdminVideosPage
/admin/tweets             → AdminTweetsPage
/admin/comments           → AdminCommentsPage
/admin/playlists          → AdminPlaylistsPage
/admin/audit-logs         → AdminAuditLogsPage

ALL /admin/* routes must be wrapped in:
1. AdminAuthGuard — checks if user is admin via GET /api/v1/admin/me
2. Suspense with PageLoadingSkeleton fallback
3. ErrorBoundary

STEP 2 — Create AdminAuthGuard:
File: src/components/admin/AdminAuthGuard.jsx

function AdminAuthGuard({ children }) {
  const { data: adminProfile, isLoading, error } = useQuery({
    queryKey: ['adminMe'],
    queryFn: () => api.get('/admin/me').then(r => r.data.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
  
  if (isLoading) return <PageLoadingSkeleton />
  
  if (error?.response?.status === 404) {
    return <AdminDisabledPage /> // ADMIN_PANEL_ENABLED=false
  }
  
  if (error?.response?.status === 403) {
    return <AdminUnauthorizedPage /> // not an admin
  }
  
  if (error?.response?.status === 401) {
    return <Navigate to="/login?redirect=/admin/dashboard" replace />
  }
  
  if (!adminProfile) return null
  
  // Store admin profile in context for permission gating
  return (
    <AdminContext.Provider value={{ adminProfile }}>
      {children}
    </AdminContext.Provider>
  )
}

STEP 3 — Create AdminContext:
File: src/context/AdminContext.jsx

Provides:
- adminProfile: the full admin profile from /admin/me
- role: adminProfile.role (USER/MODERATOR/ADMIN/SUPER_ADMIN)
- permissions: computed permissions list
- can(action): helper to check permission

Permission helper:
function can(action, role) {
  const PERMISSIONS = {
    MODERATOR: [
      'view:reports', 'resolve:reports',
      'moderate:videos', 'moderate:tweets', 
      'moderate:comments', 'moderate:playlists',
      'update:user-status-restricted'
    ],
    ADMIN: [
      ...MODERATOR_PERMISSIONS,
      'suspend:user', 'delete:user', 'restore:user',
      'verify:user-email', 'view:audit-logs'
    ],
    SUPER_ADMIN: [
      ...ADMIN_PERMISSIONS,
      'update:user-role'
    ]
  }
  return PERMISSIONS[role]?.includes(action) ?? false
}

Usage: const { can, role } = useAdmin()
       can('update:user-role') // returns true only for SUPER_ADMIN

STEP 4 — Create Admin Layout:
File: src/components/admin/AdminLayout.jsx

Layout:
- Left sidebar: 240px, sticky, full height
- Top bar: same height as main app navbar
- Main content: remaining width, scrollable
- Glass morphism on sidebar and top bar (same tokens from Phase 3)

Admin Sidebar items:
Dashboard        /admin/dashboard
─────────────────────────────────
Reports          /admin/reports     (with unread count badge)
─────────────────────────────────
Users            /admin/users
Videos           /admin/videos
Tweets           /admin/tweets
Comments         /admin/comments
Playlists        /admin/playlists
─────────────────────────────────
Audit Logs       /admin/audit-logs  (ADMIN+ only — hide for MODERATOR)
─────────────────────────────────
← Back to Vixora (link to main app)

Show role badge in sidebar header under admin name:
MODERATOR → yellow badge
ADMIN → blue badge
SUPER_ADMIN → red/gold badge (matches Vixora red accent)

STEP 5 — Create helper pages:
AdminDisabledPage: "Admin panel is currently disabled. Contact your system administrator."
AdminUnauthorizedPage: "You don't have admin access." + "Go Back" button

STEP 6 — Add query keys for admin:
Add to src/lib/queryKeys.js:

ADMIN_ME: ['admin', 'me'],
ADMIN_DASHBOARD: (period) => ['admin', 'dashboard', period],
ADMIN_REPORTS: (filters) => ['admin', 'reports', filters],
ADMIN_REPORT: (id) => ['admin', 'report', id],
ADMIN_USERS: (filters) => ['admin', 'users', filters],
ADMIN_USER: (id) => ['admin', 'user', id],
ADMIN_VIDEOS: (filters) => ['admin', 'videos', filters],
ADMIN_TWEETS: (filters) => ['admin', 'tweets', filters],
ADMIN_COMMENTS: (filters) => ['admin', 'comments', filters],
ADMIN_PLAYLISTS: (filters) => ['admin', 'playlists', filters],
ADMIN_AUDIT_LOGS: (filters) => ['admin', 'auditLogs', filters],

Show me:
1. Updated App.jsx with admin routes
2. Complete AdminAuthGuard.jsx
3. Complete AdminContext.jsx with permissions
4. Complete AdminLayout.jsx
5. AdminDisabledPage and AdminUnauthorizedPage
6. Updated queryKeys.js
```

---

## SESSION 28 — Admin Dashboard Page

**Attach:** `src/components/admin/AdminLayout.jsx` (from Session 27), your existing `DashboardCharts` component if reusable

```
CONTEXT PRIMER (paste above first)

PHASE 5 — SESSION 28: ADMIN DASHBOARD PAGE
==========================================

Build the admin dashboard overview page.
Match Vixora design language. Reuse chart components from main app where possible.

Backend endpoints:
GET /api/v1/admin/dashboard/overview?period=7d|30d|90d|1y
GET /api/v1/admin/dashboard/activity?period=7d|30d|90d|1y

Overview response includes platform-wide stats:
- totalUsers, newUsers, activeUsers
- totalVideos, newVideos, publishedVideos
- totalViews, totalLikes, totalComments
- pendingReports, resolvedReports, totalReports
- platformGrowth data

Activity response includes:
- Time-series data: signups, video uploads, views per day
- Recent actions log

PAGE LAYOUT:

TOP BAR:
- Page title: "Admin Dashboard"
- Period selector: 7d | 30d | 90d | 1y (same style as main dashboard)
- Last updated timestamp: "Updated 2 mins ago"

STAT CARDS ROW (4 cards, same glass-card style):
1. Total Users — totalUsers — with newUsers delta
2. Total Videos — totalVideos — with newVideos delta
3. Pending Reports — pendingReports — with red highlight if > 0
4. Total Views — totalViews (platform-wide)

SECOND ROW (3 cards):
1. Active Users (last 30d) — activeUsers
2. Published Videos — publishedVideos
3. Reports Resolved — resolvedReports

MAIN CHART:
- Line chart showing: signups + video uploads over time
- Period controlled by the top period selector
- Same Recharts component style as main app dashboard
- domain={['auto','auto']}, allowDecimals={false}
- Two lines: "New Users" (blue) + "New Videos" (green)

PENDING REPORTS ALERT:
- If pendingReports > 0: show an amber alert banner
- "You have {n} pending reports requiring review"
- Button: "Review Reports" → navigates to /admin/reports?status=PENDING
- This should be prominent — above the stat cards

RECENT ACTIVITY FEED (right column or bottom):
- List of last 10 platform actions from activity endpoint
- Each item: actor avatar + action description + timestamp
- Types to show: new user signup, video published, report filed, action taken
- Relative timestamp: "2 hours ago"

QUICK ACTIONS (small buttons):
- "View All Reports" 
- "Review Users"
- "View Audit Log"

All stats must use:
queryKey: QUERY_KEYS.ADMIN_DASHBOARD(period)
queryFn: () => api.get(`/admin/dashboard/overview?period=${period}`)
         .then(r => r.data.data)
staleTime: 60 * 1000 (1 minute)

Show me complete AdminDashboardPage.jsx.
```

---

## SESSION 29 — Admin Reports Page

**Attach:** `src/components/admin/AdminLayout.jsx`, `src/context/AdminContext.jsx`

```
CONTEXT PRIMER (paste above first)

PHASE 5 — SESSION 29: ADMIN REPORTS PAGE
=========================================

Build the reports moderation page — the most important admin page.

Backend endpoints:
GET  /api/v1/admin/reports?page&limit&status&targetType&q&sortBy&sortType&from&to
GET  /api/v1/admin/reports/:reportId
PATCH /api/v1/admin/reports/:reportId/resolve

Resolve body:
{
  "status": "REVIEWED" | "REJECTED" | "ACTION_TAKEN",
  "note": "...",
  "action": {           ← optional, only when ACTION_TAKEN
    "type": "VIDEO_UNPUBLISH" | "VIDEO_PUBLISH" | "VIDEO_SOFT_DELETE" |
            "USER_SET_STATUS" | "USER_SOFT_DELETE" | "TWEET_SOFT_DELETE" |
            "COMMENT_SOFT_DELETE" | "PLAYLIST_SOFT_DELETE" etc,
    "targetType": "VIDEO" | "USER" | "TWEET" | "COMMENT" | "PLAYLIST",
    "targetId": "uuid",
    "payload": { "reason": "..." }
  }
}

Report status values: PENDING | REVIEWED | REJECTED | ACTION_TAKEN

PAGE LAYOUT:

FILTER BAR (sticky at top):
- Search input: q (search by report content or target)
- Status filter dropdown: All | PENDING | REVIEWED | REJECTED | ACTION_TAKEN
- Target type filter: All | VIDEO | COMMENT | USER | CHANNEL
- Date range: from + to date pickers
- Sort: Newest | Oldest | Most Recent Update
- "Clear Filters" button

REPORTS TABLE:
Columns:
- Checkbox (for bulk actions — future)
- Reporter: avatar + username
- Target: type badge (VIDEO/USER/COMMENT) + target title/name
- Reason: truncated text (max 60 chars)
- Status: colored badge
  PENDING → amber
  REVIEWED → blue
  REJECTED → gray
  ACTION_TAKEN → green
- Filed: relative timestamp
- Actions: "Review" button

TABLE BEHAVIOR:
- Clicking any row OR "Review" button opens the Detail Drawer (right side)
- Pagination at bottom: page numbers + items per page selector
- Loading: skeleton rows (same height as real rows)
- Empty state: "No reports found" with filter context

REPORT DETAIL DRAWER (slides in from right, 480px wide):
Shows full report detail:
- Report ID (small, copyable)
- Status badge
- Reporter info: avatar + username + "Reported on [date]"
- Target section:
  - Type: VIDEO / USER / COMMENT
  - For VIDEO: thumbnail + title + channel + link to watch page
  - For USER: avatar + username + email + link to user detail
  - For COMMENT: comment text + video context
- Report reason + description (full text)
- Timeline: created → last updated

RESOLVE SECTION (at bottom of drawer):
Only show if status is PENDING.
Three action buttons:
1. "Mark Reviewed" (blue) — sets status=REVIEWED, no action required
2. "Reject Report" (gray) — sets status=REJECTED
3. "Take Action" (red) — opens Action Selection Modal

ACTION SELECTION MODAL:
When "Take Action" is clicked:
- Status automatically: ACTION_TAKEN
- Note textarea: "Add a note about this action..."
- Action type selector (dropdown based on targetType):
  For VIDEO targets: Unpublish Video | Delete Video | Publish Video
  For USER targets: Restrict User | Suspend User | Delete User
  For COMMENT targets: Delete Comment
  For TWEET targets: Delete Tweet
  For PLAYLIST targets: Delete Playlist
- Reason input (required for destructive actions)
- "Confirm Action" button (red)
- "Cancel" button

On resolve:
1. POST PATCH /api/v1/admin/reports/:reportId/resolve
2. Show success toast: "Report resolved"
3. Update report status in the table (invalidate query)
4. Close drawer
5. If next PENDING report exists, auto-advance to it

Permission gating:
- MODERATOR: can resolve reports, can restrict user status
- ADMIN+: can also suspend/delete users
- Hide actions the current role can't perform (use can() from AdminContext)

Show me complete AdminReportsPage.jsx with drawer and action modal.
```

---

## SESSION 30 — Admin Users Page

**Attach:** `src/context/AdminContext.jsx`, `src/lib/queryKeys.js`

```
CONTEXT PRIMER (paste above first)

PHASE 5 — SESSION 30: ADMIN USERS PAGE
=======================================

Build the user moderation page.

Backend endpoints:
GET   /api/v1/admin/users?page&limit&q&status&role&isDeleted&sortBy&sortType
GET   /api/v1/admin/users/:userId
PATCH /api/v1/admin/users/:userId/status        body: { status, reason }
PATCH /api/v1/admin/users/:userId/verify-pending-email
PATCH /api/v1/admin/users/:userId/soft-delete
PATCH /api/v1/admin/users/:userId/restore
PATCH /api/v1/admin/users/:userId/role          body: { role, reason } — SUPER_ADMIN only

Status values: ACTIVE | RESTRICTED | SUSPENDED
Role values: USER | MODERATOR | ADMIN | SUPER_ADMIN

PAGE LAYOUT:

FILTER BAR:
- Search: q (name, email, username)
- Status filter: All | ACTIVE | RESTRICTED | SUSPENDED
- Role filter: All | USER | MODERATOR | ADMIN | SUPER_ADMIN
- Deleted filter: Active Only | Deleted Only | All
- Sort: Newest | Oldest | Most Videos | Most Subscribers

USERS TABLE:
Columns:
- Avatar + Full Name + @username (combined cell)
- Email
- Role badge: 
  USER → gray
  MODERATOR → yellow
  ADMIN → blue
  SUPER_ADMIN → red (Vixora accent)
- Status badge:
  ACTIVE → green
  RESTRICTED → amber
  SUSPENDED → red
- Joined date
- Actions: "View" button

TABLE BEHAVIOR:
- Click row OR "View" button → open User Detail Drawer
- Pagination at bottom
- Deleted users: show with strikethrough name + "Deleted" badge
- Loading: skeleton rows

USER DETAIL DRAWER (480px from right):
Header:
- Large avatar (80px)
- Full name + @username
- Email (with verification badge ✓ or ⚠️ pending)
- Role badge + Status badge
- "Joined: [date]"

Stats row:
- Total videos, total subscribers, total views

Quick info:
- Last active (if available)
- IP (if available in response)
- Moderation note (if any)

ACTION BUTTONS (role-gated using can()):
All actions require a reason input before confirming.
Use a confirmation modal with reason textarea for all destructive actions.

MODERATOR can do:
├── Set Status: ACTIVE ← shows if currently RESTRICTED or SUSPENDED
├── Set Status: RESTRICTED ← shows if currently ACTIVE
└── (cannot suspend, delete, or change role)

ADMIN can do (all MODERATOR actions plus):
├── Set Status: SUSPENDED ← can suspend
├── Verify Pending Email ← shows if emailVerified=false
├── Soft Delete User ← requires reason, confirm dialog
└── Restore User ← shows only if isDeleted=true and within 7 days

SUPER_ADMIN can do (all ADMIN actions plus):
└── Change Role ← dropdown: USER/MODERATOR/ADMIN/SUPER_ADMIN
    Safety: cannot demote the last SUPER_ADMIN
    Show warning if demoting current SUPER_ADMIN

MODERATION HISTORY (bottom of drawer):
- Recent audit log entries for this user
- GET /api/v1/admin/audit-logs?targetId=userId&limit=5
- Shows: action taken, by whom, when, reason

All mutations:
- Show confirmation modal with reason field
- Call appropriate endpoint
- On success: toast + invalidate user query + update status in table
- On error: show error message from API response

Show me complete AdminUsersPage.jsx with all drawers and modals.
```

---

## SESSION 31 — Admin Content Pages (Videos, Tweets, Comments, Playlists)

**Attach:** `src/context/AdminContext.jsx`, `src/components/admin/AdminLayout.jsx`

```
CONTEXT PRIMER (paste above first)

PHASE 5 — SESSION 31: ADMIN CONTENT MODERATION PAGES
=====================================================

Build 4 content moderation pages. They follow the same pattern — 
build one and reuse the pattern for all 4.

SHARED PATTERN for all 4 pages:
- Filter bar with search + owner filter + deleted toggle + sort
- Data table with pagination
- Detail drawer on row click
- Soft-delete + Restore actions
- Videos also have: publish + unpublish

═══════════════════════════════════
1. ADMIN VIDEOS PAGE (/admin/videos)
═══════════════════════════════════
Endpoint: GET /api/v1/admin/videos?page&limit&q&ownerId&isShort&isPublished&isDeleted&processingStatus&sortBy&sortType

Table columns:
- Thumbnail (60x34px) + Title (combined)
- Owner: avatar + @username
- Status badges: Published/Unpublished + Short/Regular
- Processing: COMPLETED/PENDING/FAILED badge
- Views count
- Uploaded date
- Actions: "View" button

Filters:
- Search by title
- isShort: All | Videos | Shorts
- isPublished: All | Published | Unpublished
- isDeleted: Active | Deleted
- processingStatus: All | COMPLETED | PENDING | FAILED

Detail drawer:
- Thumbnail + title + description
- Owner info
- All status badges
- Stats: views, likes, comments count
- Tags list
- Created/Updated dates

Action buttons:
MODERATOR + ADMIN can:
├── Unpublish: PATCH /admin/videos/:id/unpublish
├── Publish: PATCH /admin/videos/:id/publish
├── Soft Delete: PATCH /admin/videos/:id/soft-delete (requires reason)
└── Restore: PATCH /admin/videos/:id/restore (only if deleted, within 7 days)

═══════════════════════════════════
2. ADMIN TWEETS PAGE (/admin/tweets)
═══════════════════════════════════
Endpoint: GET /api/v1/admin/tweets?page&limit&q&ownerId&isDeleted&sortBy&sortType

Table columns:
- Tweet content (truncated 80 chars)
- Owner: avatar + @username
- Has Image badge (if imageUrl present)
- Deleted badge (if isDeleted)
- Created date
- Actions

Detail drawer:
- Full tweet content
- Image (if any)
- Owner info
- Created date

Actions:
├── Soft Delete: PATCH /admin/tweets/:id/soft-delete
└── Restore: PATCH /admin/tweets/:id/restore

═════════════════════════════════════
3. ADMIN COMMENTS PAGE (/admin/comments)
═════════════════════════════════════
Endpoint: GET /api/v1/admin/comments?page&limit&q&ownerId&videoId&isDeleted&sortBy&sortType

Table columns:
- Comment content (truncated)
- Author: avatar + @username
- Video: thumbnail + title (small)
- Deleted badge
- Created date

Detail drawer:
- Full comment text
- Author info
- Video context (thumbnail + title + link)
- Created date

Actions:
├── Soft Delete: PATCH /admin/comments/:id/soft-delete
└── Restore: PATCH /admin/comments/:id/restore

══════════════════════════════════════
4. ADMIN PLAYLISTS PAGE (/admin/playlists)
══════════════════════════════════════
Endpoint: GET /api/v1/admin/playlists?page&limit&q&ownerId&isDeleted&isPublic&sortBy&sortType

Table columns:
- Playlist name
- Owner
- Video count
- Public/Private badge
- Deleted badge
- Created date

Detail drawer:
- Name + description
- Owner info
- Video count + first few video thumbnails
- Public/Private
- Created date

Actions:
├── Soft Delete: PATCH /admin/playlists/:id/soft-delete
└── Restore: PATCH /admin/playlists/:id/restore

═══════════════════════════
SHARED COMPONENTS TO CREATE:
═══════════════════════════

1. AdminDataTable — reusable table component:
   Props: columns, data, isLoading, onRowClick, pagination, onPageChange
   Features: skeleton loading rows, empty state, pagination controls

2. AdminDetailDrawer — reusable right-side drawer:
   Props: isOpen, onClose, title, children
   Behavior: slide in from right, backdrop, close on Escape key

3. AdminActionModal — reusable confirmation modal:
   Props: isOpen, onClose, title, description, onConfirm, isLoading
   Features: reason textarea (required), confirm + cancel buttons

4. AdminStatusBadge — colored badge component:
   Props: status (ACTIVE/RESTRICTED/SUSPENDED/PENDING/etc.)
   Automatically picks the right color

Show me:
1. All 4 shared components (AdminDataTable, AdminDetailDrawer, 
   AdminActionModal, AdminStatusBadge)
2. AdminVideosPage.jsx (complete)
3. AdminTweetsPage.jsx (complete)
4. AdminCommentsPage.jsx (complete)
5. AdminPlaylistsPage.jsx (complete)
```

---

## SESSION 32 — Admin Audit Logs Page

**Attach:** `src/context/AdminContext.jsx`, `src/components/admin/AdminDataTable.jsx` (from Session 31)

```
CONTEXT PRIMER (paste above first)

PHASE 5 — SESSION 32: ADMIN AUDIT LOGS PAGE
============================================

Build the audit log viewer. Read-only page — no actions.
ADMIN and SUPER_ADMIN only (hide from MODERATOR using can('view:audit-logs')).

Backend endpoints:
GET /api/v1/admin/audit-logs?page&limit&actorId&action&targetType&targetId&from&to&sortBy&sortType
GET /api/v1/admin/audit-logs/:logId

Audit log fields:
- id
- actorId, actorRole (who performed the action)
- action (e.g. VIDEO_UNPUBLISH, USER_SOFT_DELETE, REPORT_RESOLVE)
- targetType (VIDEO/USER/TWEET/COMMENT/PLAYLIST/REPORT)
- targetId
- reason
- before, after (state snapshots)
- ip, userAgent
- createdAt

PAGE LAYOUT:

FILTER BAR:
- Actor search: search by admin username who performed action
- Action type filter: dropdown of all action types
  (VIDEO_UNPUBLISH, VIDEO_PUBLISH, VIDEO_SOFT_DELETE, VIDEO_RESTORE,
   USER_SET_STATUS, USER_SOFT_DELETE, USER_RESTORE, USER_VERIFY_PENDING_EMAIL,
   TWEET_SOFT_DELETE, TWEET_RESTORE, COMMENT_SOFT_DELETE, COMMENT_RESTORE,
   PLAYLIST_SOFT_DELETE, PLAYLIST_RESTORE, REPORT_RESOLVE, USER_ROLE_UPDATE)
- Target type filter: VIDEO | USER | TWEET | COMMENT | PLAYLIST | REPORT
- Date range: from + to (date pickers)
- Sort: Newest first (default) | Oldest first

AUDIT LOG TABLE:
Columns:
- Action: colored badge based on action type
  Delete actions → red badge
  Restore actions → green badge
  Status change → amber badge
  Role change → purple badge
  Report resolve → blue badge
- Target: type + ID (truncated, copyable on click)
- Performed by: avatar + @username + role badge
- Reason: truncated (50 chars)
- IP Address: show last 3 octets only (privacy: 192.168.1.xxx)
- Timestamp: relative + absolute on hover

ROW CLICK → Log Detail Drawer:
- Full action details
- Before/after state comparison (show as two columns if both exist):
  Before: { status: "ACTIVE" }  →  After: { status: "SUSPENDED" }
- Full reason text
- Full IP + User Agent (only visible to SUPER_ADMIN)
- Target info: link to the affected content

EXPORT BUTTON (SUPER_ADMIN only):
- "Export CSV" button in filter bar
- Exports current filtered results
- Basic CSV with: timestamp, actor, action, targetType, targetId, reason

EMPTY STATE:
"No audit log entries found for the selected filters."

PAGINATION:
Standard pagination at bottom, same as other admin pages.

SECURITY NOTE in UI:
Show a small info banner:
"Audit logs cannot be deleted or modified. All admin actions are permanently recorded."

Show me complete AdminAuditLogsPage.jsx.
```

---

## SESSION 33 — Admin Panel Polish & Mobile

**Attach:** All admin component files from Sessions 27–32, `src/index.css`

```
CONTEXT PRIMER (paste above first)

PHASE 5 — SESSION 33: ADMIN PANEL POLISH & MOBILE RESPONSIVENESS
================================================================

Final polish pass for the entire admin panel.
Match Vixora's liquid glass morphism design from Phase 3.
Make it work on tablet (768px–1024px) and basic mobile (≥375px).

VISUAL CONSISTENCY PASS:

1. Admin Sidebar:
   - Same glass morphism as main app sidebar (backdrop-filter, border-right)
   - Role badge in sidebar header: pill badge with role name
   - Active route: red accent highlight (same as main app)
   - Hover states: same transition as main app
   - "← Back to Vixora" at bottom with home icon

2. Admin Top Bar:
   - Same height and glass effect as main app navbar
   - Show: Page title (left) + Admin name + Avatar (right)
   - Avatar dropdown: "View Profile" + "Back to Vixora" + "Logout"

3. Stat Cards (Dashboard):
   - Same glass-card style from Phase 3
   - Pending reports card: if value > 0, use amber/red tint on glass bg
   - Hover: same lift effect as main app video cards

4. Tables:
   - Table rows: subtle hover background (var(--glass-bg-hover))
   - Alternating row: very subtle (rgba(255,255,255,0.01))
   - Table header: glass-surface background, sticky at top
   - Border between rows: 1px solid var(--glass-border)

5. Drawers (Detail Drawer):
   - Glass morphism background
   - Slide-in animation: translateX(100%) → translateX(0), 250ms ease
   - Backdrop: rgba(0,0,0,0.5) with blur(4px)
   - Close button: top-right, glass circle button

6. Action Modals:
   - Same glass modal style from Phase 3 Session 12
   - Destructive confirm button: red with extra confirmation
     (type "DELETE" or "CONFIRM" in an input to enable the button)

7. Status Badges:
   Make all badges consistent with a pill shape:
   - padding: 2px 10px
   - border-radius: 999px
   - font-size: 11px
   - font-weight: 600
   - Use glass variant:
     background: rgba(color, 0.15)
     border: 1px solid rgba(color, 0.3)
     color: lighter shade of color

MOBILE/TABLET RESPONSIVENESS:

TABLET (768px–1023px):
- Admin sidebar: collapse to 64px icon-only
- Tooltips on sidebar icons (title attribute)
- Table: hide less important columns (IP, userAgent)
- Drawers: full width (100%) instead of 480px

MOBILE (<768px):
- Admin sidebar: hidden, replaced with top hamburger → slide-out drawer
- Tables: horizontal scroll within a scroll container
  Each table gets: overflow-x: auto, min-width: 600px
- Drawers: full-screen bottom sheet (same as main app modals)
- Filter bars: collapsible (tap "Filters" to expand/collapse)
- Action buttons in drawers: full-width stacked

EMPTY STATES for all admin pages:
Each page must have a consistent empty state:
- Icon (relevant to content type)
- "No [content] found"
- "Try adjusting your filters" (if filters are active)
- "Clear Filters" button

LOADING STATES:
- Table skeleton: 5 rows of skeleton cells matching column widths
- Dashboard skeleton: stat card skeletons + chart skeleton
- Drawer skeleton: avatar skeleton + text line skeletons

MICRO-INTERACTIONS (same as main app):
- Table row hover: 150ms background transition
- Drawer open: spring animation
- Badge: no animation (static)
- Action button click: scale(0.97)
- Destructive button: subtle shake animation if clicked before typing confirm

Show me:
1. Updated AdminLayout.jsx with glass morphism + responsive sidebar
2. Updated AdminDataTable.jsx with responsive behavior
3. Updated AdminDetailDrawer.jsx with animations
4. CSS additions to index.css for admin-specific styles
5. Mobile hamburger menu for admin sidebar
```

---

## SESSION 34 — Admin Panel API Service Layer

**Attach:** `src/services/` folder contents, `src/lib/api.js`

```
CONTEXT PRIMER (paste above first)

PHASE 5 — SESSION 34: ADMIN API SERVICE LAYER
=============================================

Create a clean, centralized admin API service.
All admin API calls in one file. Do NOT scatter them across pages.

Create file: src/services/adminService.js

Import the configured axios instance (with withCredentials: true already set).

═══════════════════
ADMIN AUTH
═══════════════════
getAdminProfile()
  GET /admin/me

═══════════════════
ADMIN DASHBOARD
═══════════════════
getDashboardOverview(period)
  GET /admin/dashboard/overview?period=${period}

getDashboardActivity(period)
  GET /admin/dashboard/activity?period=${period}

═══════════════════
ADMIN REPORTS
═══════════════════
getReports({ page, limit, status, targetType, q, sortBy, sortType, from, to })
  GET /admin/reports with query params

getReport(reportId)
  GET /admin/reports/:reportId

resolveReport(reportId, { status, note, action })
  PATCH /admin/reports/:reportId/resolve
  Body: { status, note, action? }

═══════════════════
ADMIN USERS
═══════════════════
getUsers({ page, limit, q, status, role, isDeleted, sortBy, sortType })
  GET /admin/users with query params

getUser(userId)
  GET /admin/users/:userId

updateUserStatus(userId, { status, reason })
  PATCH /admin/users/:userId/status

verifyUserEmail(userId)
  PATCH /admin/users/:userId/verify-pending-email

softDeleteUser(userId, { reason })
  PATCH /admin/users/:userId/soft-delete
  Body: { reason }

restoreUser(userId)
  PATCH /admin/users/:userId/restore

updateUserRole(userId, { role, reason })
  PATCH /admin/users/:userId/role
  Body: { role, reason }
  Note: SUPER_ADMIN only

═══════════════════
ADMIN VIDEOS
═══════════════════
getVideos({ page, limit, q, ownerId, isShort, isPublished, isDeleted, processingStatus, sortBy, sortType })
  GET /admin/videos with query params

getVideo(videoId)
  GET /admin/videos/:videoId

unpublishVideo(videoId, { reason })
  PATCH /admin/videos/:videoId/unpublish

publishVideo(videoId)
  PATCH /admin/videos/:videoId/publish

softDeleteVideo(videoId, { reason })
  PATCH /admin/videos/:videoId/soft-delete

restoreVideo(videoId)
  PATCH /admin/videos/:videoId/restore

═══════════════════
ADMIN TWEETS
═══════════════════
getTweets({ page, limit, q, ownerId, isDeleted, sortBy, sortType })
getTweet(tweetId)
softDeleteTweet(tweetId, { reason })
restoreTweet(tweetId)

═══════════════════
ADMIN COMMENTS
═══════════════════
getComments({ page, limit, q, ownerId, videoId, isDeleted, sortBy, sortType })
getComment(commentId)
softDeleteComment(commentId, { reason })
restoreComment(commentId)

═══════════════════
ADMIN PLAYLISTS
═══════════════════
getPlaylists({ page, limit, q, ownerId, isDeleted, isPublic, sortBy, sortType })
getPlaylist(playlistId)
softDeletePlaylist(playlistId, { reason })
restorePlaylist(playlistId)

═══════════════════
ADMIN AUDIT LOGS
═══════════════════
getAuditLogs({ page, limit, actorId, action, targetType, targetId, from, to, sortBy, sortType })
getAuditLog(logId)

═══════════════════
HELPER: buildQueryString
═══════════════════
Create a helper that filters out undefined/null/empty values 
from a params object before building the query string:

function buildQueryString(params) {
  const filtered = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
  return new URLSearchParams(filtered).toString()
}

All list endpoints must use this helper so empty filters 
are not sent as ?status=&role=&q= etc.

Show me the complete src/services/adminService.js file.
All functions should return response.data.data directly
(not the full axios response — the service layer normalizes this).
```

---

## ✅ PHASE 5 COMPLETE — ADMIN PANEL TEST CHECKLIST

```
AUTH & ACCESS:
□ /admin/* redirects to login if not authenticated
□ /admin/* shows "unauthorized" page if logged in but not admin
□ /admin/* shows "panel disabled" page if ADMIN_PANEL_ENABLED=false
□ MODERATOR role can access reports and content pages
□ MODERATOR role CANNOT see audit logs page
□ ADMIN role can see audit logs
□ SUPER_ADMIN role can change user roles
□ Role badge shows correctly in sidebar

DASHBOARD:
□ Stat cards show real platform-wide numbers
□ Pending reports card is highlighted if > 0
□ Chart shows real data with correct Y-axis range
□ Period selector changes chart data
□ "Review Reports" alert banner shows when pending reports exist

REPORTS:
□ Reports table loads with filters working
□ Clicking a row opens detail drawer
□ "Mark Reviewed" resolves report as REVIEWED
□ "Reject" resolves report as REJECTED
□ "Take Action" opens action modal
□ Action modal submits correct payload to resolve endpoint
□ After resolve: report status updates in table
□ MODERATOR cannot suspend/delete users from reports page

USERS:
□ Users table loads with search/filter working
□ User detail drawer shows real data
□ Status change (restrict/suspend) works + reason required
□ Verify email works
□ Soft delete shows confirmation + reason required
□ Restore works (within 7 days)
□ Role update only visible to SUPER_ADMIN
□ Last SUPER_ADMIN cannot be demoted (error handled gracefully)

CONTENT PAGES:
□ Videos, Tweets, Comments, Playlists all load data
□ Search and filters work on each page
□ Detail drawer shows full content on row click
□ Soft delete requires reason + confirmation
□ Restore works where applicable
□ Video publish/unpublish works

AUDIT LOGS:
□ Audit logs table loads (ADMIN+ only)
□ Filters by action, actor, date range work
□ Detail drawer shows before/after state comparison
□ MODERATOR is redirected away from this page

DESIGN:
□ Admin panel matches Vixora design language
□ Glass morphism on sidebar and top bar
□ Role badges display with correct colors
□ Status badges consistent across all pages
□ Table rows have hover effect
□ Drawers slide in with animation
□ Modals have glass background
□ Mobile: sidebar collapses to icons on tablet
□ Mobile: tables scroll horizontally
□ Mobile: drawers are full-screen bottom sheets

API:
□ All admin API calls use withCredentials: true
□ adminService.js is used for all admin API calls (no scattered api calls)
□ buildQueryString filters out empty params
□ All mutations show toast on success/failure
□ All mutations invalidate relevant queries after success
```

---

## 🏁 ALL 5 PHASES DONE

```
FINAL DEPLOYMENT SEQUENCE:
===========================
1. Run: npm run build — must complete with 0 errors
2. Check bundle-analysis.html — no single chunk > 600KB
3. Set all Vercel/Netlify env variables
4. Deploy
5. Test on production URL:
   □ Login works
   □ Feed loads
   □ Video plays
   □ Upload flow works
   □ /admin/dashboard accessible with admin account
6. Test on real iPhone (not just DevTools):
   □ Bottom nav bar visible
   □ Shorts swipe navigation works
   □ No zoom on input focus
   □ Modals are bottom sheets
7. Done ✅
```

Come back when Phase 5 is complete — we can do a **final full review, edge case testing, or start the next feature** (e.g. AI chat panel polish, multi-account switcher UI, or PWA setup). 🚀
