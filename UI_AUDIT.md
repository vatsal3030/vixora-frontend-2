# Vixora UI Audit — Phase 0 Inventory

> Audited on `ui-overhaul` branch. Every item below is a concrete inconsistency to resolve during Phases 1–9.

---

## 1. Card Patterns — Where They Appear & How They Diverge

### 1.1 `VideoCard` (components/video/VideoCard.jsx — 528 lines)
| Surface | Grid columns | Gap | Animation |
|---|---|---|---|
| **HomePage** | `grid-cols-1 sm:2 lg:3 xl:4`, `gap-x-4 gap-y-8` | ✔ consistent | `animate-in fade-in slide-in-from-bottom-4` with staggered `animationDelay` |
| **TrendingPage** | Same 4-col | `gap-x-4 gap-y-8` | Uses `motion.div` with `initial/animate` (Framer Motion) — **different animation system** |
| **SubscriptionsPage** | Same 4-col | `gap-x-4 gap-y-8` | No per-card animation |
| **LikedVideosPage** | `grid-cols-1 sm:2 lg:3` (grid view) or `grid-cols-1` (list) | `gap-6` — **different gap** | `animate-in fade-in slide-in-from-bottom-4` |
| **WatchLaterPage** | Same as LikedVideos | `gap-6` — **same divergence** | Same animation |
| **HistoryPage** | `grid-cols-1 sm:2 lg:3` (grid view) or `grid-cols-1` (list) | `gap-6` | Same animation |
| **SearchPage** | Custom horizontal list card variant inline | Different layout entirely | N/A |
| **ChannelPage** | `grid-cols-1 sm:2 lg:3 xl:4` | `gap-x-4 gap-y-8` | None |
| **PlaylistDetailPage** | Uses `PlaylistVideoItem` instead | Vertical list | N/A |

**Issues:**
- ❌ Grid gap inconsistency: Home/Trending/Subs use `gap-x-4 gap-y-8`, Library pages use `gap-6`
- ❌ Library pages use only 3 columns max instead of 4 columns at xl breakpoint
- ❌ Animation system split: HomePage uses CSS `animate-in`, TrendingPage uses Framer Motion `motion.div`, SubscriptionsPage has none
- ❌ `VideoCard` hover preview fetches video URL on hover with 500ms delay — the `whileHover: { y: -4, scale: 1.01 }` from the `Card` primitive is **not** applied to `VideoCard` (it builds its own hover behavior)

### 1.2 `PlaylistCard` (components/playlist/PlaylistCard.jsx — 218 lines)
| Surface | Grid | Notes |
|---|---|---|
| **PlaylistsPage** | `PlaylistGrid` wrapper — auto grid `grid-cols-1 sm:2 lg:3 xl:4 gap-6` | Consistent |
| **ChannelPage** (Playlists tab) | Same PlaylistGrid | Consistent |

**Issues:**
- ✅ PlaylistCard is used consistently across surfaces (good)
- ❌ PlaylistCard has its own inline `glass-card`-like styling with hardcoded `bg-zinc-900/50` thumbnail overlay — doesn't use the `glass-card` token
- ❌ The `CompositeThumbnail` pattern is different from the stacked thumbnail approach in the card itself

### 1.3 `TweetCard` (components/tweet/TweetCard.jsx)
- Used on **TweetsPage** and **ChannelPage** Tweets tab
- ✅ Generally consistent usage
- ❌ Uses hardcoded `text-zinc-*` colors in multiple places instead of semantic tokens

### 1.4 `DeletedItemCard` (components/trash/DeletedItemCard.jsx)
- Used only on **TrashPage**
- Separate component from all other cards — its own styling pattern

---

## 2. Modal / Dialog Usage

| Component | Uses Radix `Dialog`? | Has `DialogDescription`? | Glassmorphism? |
|---|---|---|---|
| **ShareDialog** | ✅ Yes | ⚠️ Missing — triggers `Warning: Missing Description or aria-describedby` | Partial — hardcoded `bg-[#1a1a1a]/95` |
| **ReportDialog** | ✅ Yes | ⚠️ Missing | Partial — hardcoded background |
| **PlaylistModal** | ✅ Yes | ⚠️ Missing | Yes |
| **ConfirmationDialog** | ✅ Yes | ✅ Has it | Partial |
| **ConfirmDialog** | ✅ Yes | ⚠️ Unknown | Partial |
| **AddToPlaylistDialog** | ✅ Yes | ⚠️ Missing | Partial |
| **CreatePlaylistDialog** | ✅ Yes | ⚠️ Missing | Partial |
| **EditPlaylistDialog** | ✅ Yes | ⚠️ Missing | Partial |
| **ImageCropModal** | ✅ Yes | ⚠️ Missing | Partial |
| **KeyboardShortcutsModal** | ✅ Yes | ⚠️ Missing | Partial |

**Issues:**
- ❌ Most dialogs are missing `DialogDescription`, generating React console warnings
- ❌ Dialog backgrounds vary: some use `bg-background`, some hardcode `bg-[#1a1a1a]/95`, some use `glass-panel`
- ❌ Close button styling varies across dialogs (some use `X` icon, some have custom buttons)
- ❌ No consistent enter/exit animation — the base `Dialog` has Radix animations, but some wrappers override them

---

## 3. Empty, Loading & Error States Per Page

| Page | Skeleton (Loading) | Empty State | Error State | Notes |
|---|---|---|---|---|
| **HomePage** | ✅ `VideoCardSkeleton` ×8 | ✅ Icon + text + CTA | ✅ AlertCircle + retry | Good |
| **TrendingPage** | ✅ `VideoCardSkeleton` ×12 | ✅ Plain text (minimal) | ✅ AlertCircle + retry | ❌ Empty state too minimal (just text, no icon container) |
| **SubscriptionsPage** | ✅ `VideoCardSkeleton` ×12 | ✅ Icon + text + CTA | ✅ Error banner | ❌ Empty state icon container: `bg-secondary/30 rounded-full` — different from other pages |
| **HistoryPage** | ✅ `VideoCardSkeleton` ×8 | ❓ None visible in grid view | ✅ AlertCircle + retry | ❌ Missing dedicated empty state for grid view |
| **LikedVideosPage** | ✅ `VideoCardSkeleton` ×8 | ✅ `glass-card rounded-full` icon + text + CTA | ❌ **No error state** | ❌ Icon container uses `glass-card rounded-full` — unique to this page |
| **WatchLaterPage** | ✅ `VideoCardSkeleton` ×8 | ✅ `glass-card rounded-full` icon + text + CTA | ❌ **No error state** | Same as LikedVideos pattern |
| **PlaylistsPage** | ✅ `PlaylistCardSkeleton` ×12 | ✅ `bg-secondary/30 rounded-full` + glass-card container | ❌ **No error state** | ❌ Different empty state icon style from Liked/WatchLater |
| **TrashPage** | ✅ `TrashSkeleton` | ✅ `bg-secondary/30 rounded-full` icon + text | ❌ **No error state** | Yet another empty state pattern |
| **ChannelPage** | ✅ `VideoCardSkeleton` | ✅ `bg-secondary/30 rounded-full` icon | ✅ 404-like fallback | Pattern matches TrashPage |
| **SearchPage** | ✅ Skeletons | ✅ Has empty state | ✅ Error handling | Complex page, generally OK |
| **TweetsPage** | ❓ Unclear | ✅ `bg-secondary/20 rounded-2xl` + dashed border | ✅ Error state | ❌ Completely different empty pattern (dashed border) |
| **NotificationsPage** | ✅ `NotificationSkeleton` | ✅ Has empty state | ❓ | Separate component |
| **DashboardPage** | ✅ Custom skeleton | ✅ Has states | ✅ Error handling | Data-dense page |

**Summary of empty state inconsistency:**
- Pattern A: `glass-card rounded-full` icon container (LikedVideos, WatchLater)
- Pattern B: `bg-secondary/30 rounded-full` icon container (TrashPage, PlaylistsPage, ChannelPage, SubscriptionsPage)
- Pattern C: Minimal text only (TrendingPage)
- Pattern D: `bg-secondary/20 rounded-2xl border-dashed` (TweetsPage)
- Pattern E: `bg-red-500/10 rounded-full` for errors (HomePage, HistoryPage)
- ❌ **5 different empty state patterns** — needs a single reusable `EmptyState` component

---

## 4. Page Header Inconsistencies

| Page | Icon box style | Title | Subtitle | Has wrapper container? |
|---|---|---|---|---|
| **LikedVideosPage** | `p-3.5 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 rounded-2xl shadow-lg` | `text-2xl sm:3xl font-extrabold font-display` | `text-xs text-zinc-400` | `py-8 container mx-auto px-4` |
| **WatchLaterPage** | Same gradient box | Same title style | Same subtitle style | Same container |
| **PlaylistsPage** | ❌ **No icon box** | `text-2xl sm:3xl font-extrabold font-display` | `text-xs text-zinc-400` | `container mx-auto px-4 py-8` |
| **HistoryPage** | ❌ **No icon box** (uses SEO instead) | `text-2xl font-bold` — **different font weight** | `text-sm text-muted-foreground` — **different size** | Custom layout |
| **TrendingPage** | `p-3 bg-red-500/10 rounded-xl` inside `glass-panel` wrapper | `text-3xl font-bold` — **yet another variant** | `text-muted-foreground` | `glass-panel p-6 rounded-2xl` — **unique wrapped header** |
| **SubscriptionsPage** | `p-3 bg-primary/10 rounded-2xl` with blur glow | `text-3xl font-bold font-display` | `text-sm text-zinc-400` | Inline, no container class |
| **TrashPage** | Tabs-based header | Different structure entirely | N/A | N/A |
| **HomePage** | None | None (just tag chips) | N/A | N/A |

**Issues:**
- ❌ **Every library/sidebar page has a different header structure**
- ❌ Icon box styles vary: gradient + border, plain bg + rounded, glass-panel wrapper, none
- ❌ Title typography varies: `font-extrabold` vs `font-bold`, `text-2xl sm:3xl` vs `text-3xl`
- ❌ Subtitle color varies: `text-zinc-400` (hardcoded) vs `text-muted-foreground` (semantic)
- ❌ Container padding varies: `py-8` vs `py-6` vs inline

---

## 5. Sidebar Inconsistencies

### 5.1 Sidebar item styling (Sidebar.jsx)
- Main nav items: `px-3.5 py-2.5`, icon `w-4 h-4`, label `text-[14px]`
- Library items: `px-3.5 py-2`, icon `w-[18px] h-[18px]`, label `text-[15px]`
- ❌ **Icon sizes differ** between main and library sections (16px vs 18px)
- ❌ **Label font sizes differ** (14px vs 15px)
- ❌ **Vertical padding differs** (py-2.5 vs py-2)
- ❌ Active indicator has `shadow-[0_0_8px_rgba(59,130,246,0.5)]` which is **blue** but `--primary` is **red** — color mismatch

### 5.2 Mobile Bottom Nav (MobileBottomNav.jsx)
- Only 5 items: Home, Trending, Shorts, Subscriptions, Library
- Active state: `text-primary` with red glow `drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]` — correctly uses red
- ❌ Desktop sidebar active indicator glows **blue**, mobile nav glows **red** — inconsistent

---

## 6. Hardcoded Colors Bypassing Design Tokens

### `text-zinc-*` used instead of `text-muted-foreground`:
Files: LikedVideosPage, WatchLaterPage, PlaylistsPage, MyVideosPage, HomePage, ChannelPage, SubscriptionsPage, CommentItem, PlaylistInfo, PlaylistVideoItem, PlaylistWatchPanel, PlaylistCard, ShareDialog, Toaster, ParsedText, ChannelInfo, AISummaryCard (18 files total)

### `text-gray-*` used instead of semantic tokens:
Files: PlaceholderPage, DesignSystemPage, VideoPlayer, VideoGrid, VideoDescription, VideoActions, TranscriptPanel, MiniPlayer, ChaptersPanel, Badge, ReportDialog, VixoraAI (12 files total)

### `bg-[#1f1f1f]/95` hardcoded dropdown backgrounds:
Found in DropdownMenuContent across LikedVideosPage, PlaylistsPage, and other pages

---

## 7. Typography Scale Violations

Current observed font sizes across the codebase:
- `text-[10px]` — MobileBottomNav labels
- `text-[14px]` — Sidebar main nav labels (**off-scale**)
- `text-[15px]` — Sidebar library labels (**off-scale**)
- `text-xs` (12px) — Various subtitles
- `text-sm` (14px) — Body text
- `text-base` (16px) — Standard
- `text-lg` (18px) — Section headers
- `text-xl` (20px) — Empty state headers
- `text-2xl` (24px) — Page titles
- `text-3xl` (30px) — Some page titles

**Issues:**
- ❌ `text-[14px]` and `text-[15px]` are arbitrary values that should map to `text-sm` (14px)
- ❌ Page titles inconsistently use `text-2xl sm:text-3xl` vs just `text-3xl` vs `text-2xl`
- ❌ No enforced typographic scale — each page picks its own title/subtitle sizes

---

## 8. Spacing & Padding Inconsistencies

- Main content area (`Layout.jsx`): `px-3 sm:px-4 lg:px-6 pt-0 pb-20 md:pb-6`
- Library pages add their own: `container mx-auto px-4` (double-padding with Layout)
- TrendingPage: `space-y-6 py-6 container mx-auto px-4`
- SubscriptionsPage: `pt-6 px-4 sm:px-6 lg:px-8 container mx-auto max-w-[1600px]`
- ❌ **Every page has its own padding/container strategy** — some use `container mx-auto`, some don't, some have max-width, some rely on Layout

---

## 9. Sort Controls Inconsistency

| Page | Sort UI Pattern |
|---|---|
| **LikedVideosPage** | `DropdownMenu` with `Button variant="outline"` |
| **WatchLaterPage** | `Button variant="ghost" size="icon"` (just an icon, no label) |
| **PlaylistsPage** | `DropdownMenu` with `Button variant="outline" size="sm"` |
| **HistoryPage** | Custom dropdown with multi-select, date filters, bulk actions |

- ❌ Sort button presentation varies: some show label, some just icon
- ❌ View mode toggle (grid/list) styling varies between pages

---

## 10. Border Radius Scale

Currently observed:
- `rounded-lg` (0.5rem) — Cards, buttons
- `rounded-xl` (0.75rem) — Sidebar items, some buttons
- `rounded-2xl` (1rem) — Page headers, some containers
- `rounded-full` (9999px) — Avatars, badges, pills
- `rounded-md` (0.375rem) — Some smaller elements

**Issues:**
- ❌ The `Card` primitive uses `rounded-lg`, but `glass-card` CSS uses `var(--radius)` (0.75rem = `rounded-xl`)
- ❌ No consistent pattern for when to use `rounded-lg` vs `rounded-xl` vs `rounded-2xl`

---

## 11. Motion & Animation

- `PageTransition` component exists but is empty/minimal
- TrendingPage: Framer Motion `motion.div` with `initial/animate`
- HomePage: CSS `animate-in fade-in slide-in-from-bottom-4`
- SubscriptionsPage: `animate-in fade-in duration-500` on page wrapper
- Other pages: No page-level animations
- ❌ No consistent page transition system
- ❌ `prefers-reduced-motion` is respected in CSS but Framer Motion animations don't check it

---

## 12. Missing Features / Polish

- [ ] `PageTransition` component is a stub — no actual transition
- [ ] No breadcrumbs on nested views (Playlist detail, Studio sub-pages)
- [ ] `DesignSystemPage` exists (21KB) but may be outdated/stale
- [ ] `PlaceholderPage` exists as a stub
- [ ] `glass-panel` used inconsistently — some sidebars use it, some hardcode `bg-black/80 backdrop-blur-3xl`
- [ ] `glass-card:hover` has `box-shadow: 0 8px 30px rgba(0,0,0,0.3)` — may cause card lift that user previously complained about
- [ ] Duplicate scrollbar-thumb:hover rule in index.css (lines 157 and 185)
- [ ] `custom-scrollbar` styles are inside `@media (prefers-reduced-motion: reduce)` block — misplaced

---

## 13. Checklist for Phase 1 (Design System Foundation)

Based on this audit, Phase 1 must define:
- [ ] Finalized typography scale (remove `text-[14px]`, `text-[15px]`, standardize title sizes)
- [ ] Finalized spacing scale (standardize page padding, grid gaps)
- [ ] Finalized border-radius scale (pick 4 values: sm/md/lg/xl/full)
- [ ] Motion tokens as CSS custom properties (durations, easing)
- [ ] Standardized semantic color usage (eliminate `text-zinc-*`, `text-gray-*` in favor of `text-muted-foreground`)
- [ ] Fix misplaced CSS rules in index.css (duplicate scrollbar, custom-scrollbar in reduced-motion)
- [ ] Fix sidebar active indicator color (blue shadow → red to match `--primary`)
