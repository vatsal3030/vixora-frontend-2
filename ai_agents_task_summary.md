# Vixora - Complete AI Agent Implementation Guide

## 🎯 Project Mission

Build a production-ready YouTube-like video streaming platform with modern UI/UX, complete feature parity, responsive design, and beautiful animations.

---

## 📐 Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 19 + Vite + Tailwind CSS + ShadCN UI                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Contexts   │     │
│  │   (28)       │  │   (50+)      │  │   (5)        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Hooks      │  │  Services    │  │   Utils      │     │
│  │   (4)        │  │   (12)       │  │   (3)        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
                    (Axios with Interceptors)
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  Node.js + Express + PostgreSQL + Prisma                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Controllers │  │  Services    │  │  Middleware  │     │
│  │              │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Models     │  │   Routes     │  │   Utils      │     │
│  │  (Prisma)    │  │   (100+)     │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Cloudinary  │  │   Nodemailer │  │   Google     │     │
│  │  (Storage)   │  │   (Email)    │  │   OAuth      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Design System

### Design Principles

1. **Modern & Clean** - Minimalist design, focus on content
2. **Responsive** - Mobile-first approach, works on all devices
3. **Accessible** - WCAG 2.1 AA compliant
4. **Performant** - Fast loading, smooth animations
5. **Consistent** - Unified design language across all pages

### Color System

```css
/* Light Mode */
--background: #ffffff --foreground: #0f172a --primary: #3b82f6 (Blue)
  --primary-hover: #2563eb --secondary: #64748b (Gray) --accent: #f1f5f9
  --border: #e2e8f0 --muted: #f8fafc --destructive: #ef4444 (Red)
  --success: #10b981 (Green) --warning: #f59e0b (Orange) /* Dark Mode */
  --background: #0f172a --foreground: #f8fafc --primary: #60a5fa
  --primary-hover: #3b82f6 --secondary: #475569 --accent: #1e293b
  --border: #334155 --muted: #1e293b --destructive: #dc2626 --success: #059669
  --warning: #d97706;
```

### Typography

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

/* Font Sizes */
--text-xs: 0.75rem (12px)
--text-sm: 0.875rem (14px)
--text-base: 1rem (16px)
--text-lg: 1.125rem (18px)
--text-xl: 1.25rem (20px)
--text-2xl: 1.5rem (24px)
--text-3xl: 1.875rem (30px)
--text-4xl: 2.25rem (36px)

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing System

```css
/* Spacing Scale (Tailwind) */
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
```

### Border Radius

```css
--radius-sm: 0.25rem (4px) --radius-md: 0.5rem (8px) --radius-lg: 0.75rem (12px)
  --radius-xl: 1rem (16px) --radius-full: 9999px (circular);
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05) --shadow-md: 0 4px 6px -1px
  rgb(0 0 0 / 0.1) --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1) --shadow-xl: 0
  20px 25px -5px rgb(0 0 0 / 0.1);
```

### Animations

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide Up */
@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Slide Down */
@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Spin */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

### Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices (large desktops) */
2xl: 1536px /* 2X large devices (larger desktops) */
```

---

## 🔐 Backend API Structure

### Base URL

```
Development: http://localhost:10000/api/v1
Production: https://vixora-backend-ysg8.onrender.com/api/v1
```

### Standard Response Format

```javascript
// Success Response
{
  statusCode: 200 | 201 | 204,
  data: {
    // Response data here
  },
  message: "Success message",
  success: true
}

// Error Response
{
  statusCode: 400 | 401 | 403 | 404 | 500,
  data: null,
  message: "Error message",
  success: false,
  errors: [
    {
      field: "fieldName",
      message: "Validation error message"
    }
  ]
}

// Paginated Response
{
  statusCode: 200,
  data: {
    docs: [...items],
    totalDocs: 100,
    limit: 20,
    page: 1,
    totalPages: 5,
    hasNextPage: true,
    hasPrevPage: false,
    nextPage: 2,
    prevPage: null
  },
  message: "Success",
  success: true
}
```

### Authentication Flow

```
JWT tokens stored in HTTP-only cookies
- accessToken: 15 minutes expiry
- refreshToken: 7 days expiry

Headers:
- Cookie: accessToken=xxx; refreshToken=xxx
- Authorization: Bearer <accessToken> (fallback)

Middleware: verifyJWT
- Checks accessToken in cookies or Authorization header
- Validates token signature
- Attaches user to req.user
- Returns 401 if invalid/expired
```

### Error Codes

```javascript
400 - Bad Request (Validation errors)
401 - Unauthorized (Not logged in / Invalid token)
403 - Forbidden (No permission)
404 - Not Found (Resource doesn't exist)
409 - Conflict (Duplicate entry)
422 - Unprocessable Entity (Business logic error)
429 - Too Many Requests (Rate limit)
500 - Internal Server Error (Server error)
```

---

## 📡 Complete API Endpoints

### 1. Authentication APIs

#### Register User

```http
POST /users/register
Content-Type: multipart/form-data

Body:
{
  fullName: string (required, min 3 chars)
  username: string (required, min 3 chars, alphanumeric + underscore)
  email: string (required, valid email)
  password: string (required, min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)
  avatar: File (optional, image only, max 5MB)
}

Success Response (201):
{
  statusCode: 201,
  data: {
    user: {
      id: "uuid",
      fullName: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      avatar: "https://cloudinary.com/...",
      isEmailVerified: false,
      createdAt: "2024-01-01T00:00:00.000Z"
    }
  },
  message: "User registered successfully. Please verify your email.",
  success: true
}

Error Response (400):
{
  statusCode: 400,
  data: null,
  message: "Validation failed",
  success: false,
  errors: [
    { field: "email", message: "Email already exists" },
    { field: "username", message: "Username already taken" }
  ]
}
```

#### Verify Email (OTP)

```http
POST /users/verify-email
Content-Type: application/json

Body:
{
  identifier: string (email or username)
  otp: string (6-digit code)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    user: {
      id: "uuid",
      isEmailVerified: true,
      ...userDetails
    }
  },
  message: "Email verified successfully",
  success: true
}

Error Response (400):
{
  statusCode: 400,
  data: null,
  message: "Invalid or expired OTP",
  success: false
}
```

#### Resend OTP

```http
POST /users/resend-otp
Content-Type: application/json

Body:
{
  identifier: string (email or username)
}

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "OTP sent successfully to your email",
  success: true
}
```

#### Login

```http
POST /users/login
Content-Type: application/json

Body:
{
  identifier: string (email or username)
  password: string
}

Success Response (200):
{
  statusCode: 200,
  data: {
    user: {
      id: "uuid",
      fullName: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      avatar: "https://...",
      coverImage: "https://...",
      isEmailVerified: true,
      subscribersCount: 0,
      subscribedToCount: 0
    },
    accessToken: "jwt_token",
    refreshToken: "jwt_token"
  },
  message: "User logged in successfully",
  success: true
}

Note: Tokens automatically set in HTTP-only cookies

Error Response (401):
{
  statusCode: 401,
  data: null,
  message: "Invalid credentials",
  success: false
}
```

#### Get Current User

```http
GET /users/current-user
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    fullName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    avatar: "https://...",
    coverImage: "https://...",
    isEmailVerified: true,
    subscribersCount: 150,
    subscribedToCount: 25,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  message: "Current user fetched successfully",
  success: true
}

Error Response (401):
{
  statusCode: 401,
  data: null,
  message: "Unauthorized",
  success: false
}
```

#### Logout

```http
POST /users/logout
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "User logged out successfully",
  success: true
}

Note: Clears HTTP-only cookies
```

#### Forgot Password

```http
POST /users/forgot-password
Content-Type: application/json

Body:
{
  email: string
}

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Password reset OTP sent to your email",
  success: true
}
```

#### Verify Forgot Password OTP

```http
POST /users/forgot-password/verify
Content-Type: application/json

Body:
{
  email: string
  otp: string (6-digit)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    resetToken: "temporary_token_for_password_reset"
  },
  message: "OTP verified successfully",
  success: true
}
```

#### Reset Password

```http
POST /users/reset-password
Content-Type: application/json

Body:
{
  resetToken: string (from forgot-password/verify)
  newPassword: string (min 8 chars, strong password)
}

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Password reset successfully",
  success: true
}
```

#### Refresh Token

```http
POST /users/refresh-token
Content-Type: application/json

Body:
{
  refreshToken: string
}

Success Response (200):
{
  statusCode: 200,
  data: {
    accessToken: "new_jwt_token",
    refreshToken: "new_refresh_token"
  },
  message: "Access token refreshed successfully",
  success: true
}
```

---

### 2. Video APIs

#### Get Videos (with filters)

```http
GET /videos?page=1&limit=20&sortBy=createdAt&sortType=desc&search=keyword

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 50)
- sortBy: string (createdAt | views | likes | title)
- sortType: string (asc | desc)
- search: string (search in title, description)
- userId: string (filter by uploader)
- category: string (filter by category)

Success Response (200):
{
  statusCode: 200,
  data: {
    docs: [
      {
        id: "uuid",
        title: "Video Title",
        description: "Video description",
        videoFile: "https://cloudinary.com/video.mp4",
        thumbnail: "https://cloudinary.com/thumb.jpg",
        duration: 300, // seconds
        views: 1500,
        likesCount: 50,
        commentsCount: 10,
        isPublished: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        owner: {
          id: "uuid",
          username: "johndoe",
          fullName: "John Doe",
          avatar: "https://...",
          subscribersCount: 150
        },
        isLiked: false, // if user is logged in
        progress: { // if user has watch history
          percentage: 45,
          lastWatched: "2024-01-02T00:00:00.000Z"
        }
      }
    ],
    totalDocs: 100,
    limit: 20,
    page: 1,
    totalPages: 5,
    hasNextPage: true,
    hasPrevPage: false
  },
  message: "Videos fetched successfully",
  success: true
}
```

#### Get Single Video

```http
GET /videos/:videoId

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    title: "Video Title",
    description: "Full description...",
    videoFile: "https://cloudinary.com/video.mp4",
    thumbnail: "https://cloudinary.com/thumb.jpg",
    duration: 300,
    views: 1500,
    likesCount: 50,
    commentsCount: 10,
    isPublished: true,
    tags: ["tag1", "tag2"],
    category: "Education",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    owner: {
      id: "uuid",
      username: "johndoe",
      fullName: "John Doe",
      avatar: "https://...",
      coverImage: "https://...",
      subscribersCount: 150,
      description: "Channel description"
    },
    isLiked: false,
    isSubscribed: false
  },
  message: "Video fetched successfully",
  success: true
}

Error Response (404):
{
  statusCode: 404,
  data: null,
  message: "Video not found",
  success: false
}
```

#### Upload Video

```http
POST /videos
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Body:
{
  videoFile: File (required, video only, max 500MB)
  thumbnail: File (required, image only, max 5MB)
  title: string (required, min 3 chars, max 100 chars)
  description: string (optional, max 5000 chars)
  tags: string[] (optional, max 10 tags)
  category: string (optional)
  isPublished: boolean (default: true)
}

Success Response (201):
{
  statusCode: 201,
  data: {
    id: "uuid",
    title: "Video Title",
    videoFile: "https://cloudinary.com/video.mp4",
    thumbnail: "https://cloudinary.com/thumb.jpg",
    duration: 300,
    ...videoDetails
  },
  message: "Video uploaded successfully",
  success: true
}

Error Response (400):
{
  statusCode: 400,
  data: null,
  message: "Validation failed",
  success: false,
  errors: [
    { field: "videoFile", message: "Video file is required" },
    { field: "thumbnail", message: "Thumbnail is required" }
  ]
}
```

#### Update Video

```http
PATCH /videos/:videoId
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Body:
{
  title: string (optional)
  description: string (optional)
  thumbnail: File (optional)
  tags: string[] (optional)
  category: string (optional)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    title: "Updated Title",
    ...updatedVideoDetails
  },
  message: "Video updated successfully",
  success: true
}

Error Response (403):
{
  statusCode: 403,
  data: null,
  message: "You don't have permission to update this video",
  success: false
}
```

#### Delete Video (Soft Delete)

```http
DELETE /videos/:videoId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Video deleted successfully",
  success: true
}

Note: Video moved to trash, can be restored within 30 days
```

#### Restore Video

```http
PATCH /videos/:videoId/restore
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    ...restoredVideoDetails
  },
  message: "Video restored successfully",
  success: true
}
```

#### Toggle Publish Status

```http
PATCH /videos/:videoId/publish
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    isPublished: true,
    ...videoDetails
  },
  message: "Video publish status updated",
  success: true
}
```

#### Get My Videos

```http
GET /videos/me?page=1&limit=20
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    docs: [...videos],
    ...pagination
  },
  message: "Your videos fetched successfully",
  success: true
}
```

#### Get Deleted Videos (Trash)

```http
GET /videos/trash/me
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: [
    {
      id: "uuid",
      title: "Deleted Video",
      deletedAt: "2024-01-01T00:00:00.000Z",
      ...videoDetails
    }
  ],
  message: "Deleted videos fetched successfully",
  success: true
}
```

---

### 3. Comment APIs

#### Get Comments

```http
GET /comments/:videoId

Success Response (200):
{
  statusCode: 200,
  data: [
    {
      id: "uuid",
      content: "Great video!",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      likesCount: 5,
      isLiked: false,
      owner: {
        id: "uuid",
        username: "johndoe",
        fullName: "John Doe",
        avatar: "https://..."
      }
    }
  ],
  message: "Comments fetched successfully",
  success: true
}
```

#### Add Comment

```http
POST /comments/:videoId
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  content: string (required, min 1 char, max 500 chars)
}

Success Response (201):
{
  statusCode: 201,
  data: {
    id: "uuid",
    content: "Great video!",
    createdAt: "2024-01-01T00:00:00.000Z",
    owner: {...currentUser}
  },
  message: "Comment added successfully",
  success: true
}
```

#### Update Comment

```http
PATCH /comments/c/:commentId
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  content: string (required)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    content: "Updated comment",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  message: "Comment updated successfully",
  success: true
}
```

#### Delete Comment

```http
DELETE /comments/c/:commentId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Comment deleted successfully",
  success: true
}
```

---

### 4. Like APIs

#### Toggle Video Like

```http
POST /likes/toggle/v/:videoId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    isLiked: true,
    likesCount: 51
  },
  message: "Like toggled successfully",
  success: true
}
```

#### Toggle Comment Like

```http
POST /likes/toggle/c/:commentId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    isLiked: true,
    likesCount: 6
  },
  message: "Like toggled successfully",
  success: true
}
```

#### Get Liked Videos

```http
GET /likes/videos
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: [
    {
      id: "uuid",
      ...videoDetails,
      likedAt: "2024-01-01T00:00:00.000Z"
    }
  ],
  message: "Liked videos fetched successfully",
  success: true
}
```

---

### 5. Subscription APIs

#### Toggle Subscription

```http
POST /subscriptions/c/:channelId/subscribe
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    isSubscribed: true,
    subscriberCount: 151
  },
  message: "Subscription toggled successfully",
  success: true
}
```

#### Set Notification Level

```http
PATCH /subscriptions/c/:channelId/notifications
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  level: string (ALL | PERSONALIZED | NONE)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    notificationLevel: "ALL"
  },
  message: "Notification level updated",
  success: true
}
```

#### Get Subscription Status

```http
GET /subscriptions/c/:channelId/status
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    isSubscribed: true,
    notificationLevel: "ALL",
    subscribedAt: "2024-01-01T00:00:00.000Z"
  },
  message: "Subscription status fetched",
  success: true
}
```

#### Get Subscriptions

```http
GET /subscriptions/u/subscriptions
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: [
    {
      id: "uuid",
      channel: {
        id: "uuid",
        username: "channel1",
        fullName: "Channel Name",
        avatar: "https://...",
        subscribersCount: 1000
      },
      subscribedAt: "2024-01-01T00:00:00.000Z",
      notificationLevel: "ALL"
    }
  ],
  message: "Subscriptions fetched successfully",
  success: true
}
```

#### Get Subscribed Videos Feed

```http
GET /subscriptions?page=1&limit=20
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    docs: [...videos from subscribed channels],
    ...pagination
  },
  message: "Subscribed videos fetched",
  success: true
}
```

---

### 6. Playlist APIs

#### Create Playlist

```http
POST /playlists
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  name: string (required, min 3 chars, max 100 chars)
  description: string (optional, max 500 chars)
  isPrivate: boolean (default: false)
}

Success Response (201):
{
  statusCode: 201,
  data: {
    id: "uuid",
    name: "My Playlist",
    description: "Playlist description",
    isPrivate: false,
    videosCount: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
    owner: {...currentUser}
  },
  message: "Playlist created successfully",
  success: true
}
```

#### Get My Playlists

```http
GET /playlists/user/me?page=1&limit=20
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    docs: [
      {
        id: "uuid",
        name: "My Playlist",
        description: "Description",
        isPrivate: false,
        videosCount: 5,
        thumbnail: "https://...", // First video thumbnail
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    ],
    ...pagination
  },
  message: "Playlists fetched successfully",
  success: true
}
```

#### Get Playlist Details

```http
GET /playlists/:playlistId

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    name: "My Playlist",
    description: "Description",
    isPrivate: false,
    videosCount: 5,
    createdAt: "2024-01-01T00:00:00.000Z",
    owner: {
      id: "uuid",
      username: "johndoe",
      fullName: "John Doe",
      avatar: "https://..."
    },
    videos: [
      {
        id: "uuid",
        title: "Video Title",
        thumbnail: "https://...",
        duration: 300,
        views: 1500,
        owner: {...videoOwner},
        addedAt: "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  message: "Playlist fetched successfully",
  success: true
}

Error Response (404):
{
  statusCode: 404,
  data: null,
  message: "Playlist not found",
  success: false
}
```

#### Update Playlist

```http
PATCH /playlists/:playlistId
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  name: string (optional)
  description: string (optional)
  isPrivate: boolean (optional)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    name: "Updated Name",
    ...updatedPlaylistDetails
  },
  message: "Playlist updated successfully",
  success: true
}
```

#### Add Video to Playlist

```http
PATCH /playlists/add/:videoId/:playlistId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    playlistId: "uuid",
    videoId: "uuid",
    addedAt: "2024-01-01T00:00:00.000Z"
  },
  message: "Video added to playlist",
  success: true
}

Error Response (409):
{
  statusCode: 409,
  data: null,
  message: "Video already in playlist",
  success: false
}
```

#### Remove Video from Playlist

```http
PATCH /playlists/remove/:videoId/:playlistId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Video removed from playlist",
  success: true
}
```

#### Delete Playlist

```http
DELETE /playlists/:playlistId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Playlist deleted successfully",
  success: true
}
```

#### Toggle Watch Later

```http
POST /playlists/watch-later/:videoId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    saved: true
  },
  message: "Video saved to Watch Later",
  success: true
}
```

#### Get Watch Later

```http
GET /playlists/watch-later
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    videos: [...videos],
    count: 10
  },
  message: "Watch Later fetched successfully",
  success: true
}
```

---

### 7. Watch History APIs

#### Save Watch Progress

```http
POST /watch-history
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  videoId: string (required)
  progress: number (required, 0-100)
  duration: number (required, video duration in seconds)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    videoId: "uuid",
    progress: 45,
    duration: 300,
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  message: "Watch progress saved",
  success: true
}
```

#### Get Watch Progress

```http
GET /watch-history/:videoId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    videoId: "uuid",
    progress: 45,
    duration: 300,
    lastWatched: "2024-01-01T00:00:00.000Z"
  },
  message: "Watch progress fetched",
  success: true
}
```

#### Get Continue Watching

```http
GET /watch-history
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    videos: [
      {
        progress: 45,
        duration: 300,
        updatedAt: "2024-01-01T00:00:00.000Z",
        video: {
          id: "uuid",
          title: "Video Title",
          thumbnail: "https://...",
          ...videoDetails
        }
      }
    ],
    pagination: {...}
  },
  message: "Watch history fetched",
  success: true
}
```

---

### 8. Feed APIs

#### Get Home Feed

```http
GET /feed/home

Success Response (200):
{
  statusCode: 200,
  data: {
    videos: [...recommended videos],
    ...pagination
  },
  message: "Home feed fetched",
  success: true
}
```

#### Get Trending Feed

```http
GET /feed/trending

Success Response (200):
{
  statusCode: 200,
  data: {
    videos: [...trending videos sorted by views/engagement],
    ...pagination
  },
  message: "Trending feed fetched",
  success: true
}
```

#### Get Shorts Feed

```http
GET /feed/shorts

Success Response (200):
{
  statusCode: 200,
  data: {
    videos: [...short videos < 60 seconds],
    ...pagination
  },
  message: "Shorts feed fetched",
  success: true
}
```

---

### 9. Channel APIs

#### Get Channel Profile

```http
GET /users/u/:username

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    username: "johndoe",
    fullName: "John Doe",
    email: "john@example.com", // Only if own profile
    avatar: "https://...",
    coverImage: "https://...",
    description: "Channel description",
    subscribersCount: 150,
    subscribedToCount: 25,
    videosCount: 10,
    isSubscribed: false, // If logged in
    notificationLevel: "NONE",
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  message: "Channel profile fetched",
  success: true
}
```

#### Get Channel Videos

```http
GET /channels/:channelId/videos?page=1&limit=20

Success Response (200):
{
  statusCode: 200,
  data: {
    docs: [...videos],
    ...pagination
  },
  message: "Channel videos fetched",
  success: true
}
```

#### Get Channel Playlists

```http
GET /channels/:channelId/playlists

Success Response (200):
{
  statusCode: 200,
  data: [
    {
      id: "uuid",
      name: "Playlist Name",
      videosCount: 5,
      thumbnail: "https://...",
      isPrivate: false
    }
  ],
  message: "Channel playlists fetched",
  success: true
}
```

---

### 10. User Profile APIs

#### Update Profile

```http
PATCH /users/update-account
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  fullName: string (optional)
  email: string (optional)
  username: string (optional)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    fullName: "Updated Name",
    ...updatedUserDetails
  },
  message: "Profile updated successfully",
  success: true
}
```

#### Update Avatar

```http
PATCH /users/update-avatar
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Body:
{
  avatar: File (required, image only, max 5MB)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    avatar: "https://cloudinary.com/new-avatar.jpg"
  },
  message: "Avatar updated successfully",
  success: true
}
```

#### Update Cover Image

```http
PATCH /users/update-coverImage
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Body:
{
  coverImage: File (required, image only, max 10MB)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    coverImage: "https://cloudinary.com/new-cover.jpg"
  },
  message: "Cover image updated successfully",
  success: true
}
```

#### Change Password

```http
POST /users/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  oldPassword: string (required)
  newPassword: string (required, min 8 chars, strong)
}

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Password changed successfully",
  success: true
}

Error Response (400):
{
  statusCode: 400,
  data: null,
  message: "Old password is incorrect",
  success: false
}
```

#### Delete Account

```http
DELETE /users/delete-account
Authorization: Bearer <accessToken>
Content-Type: application/json

Body:
{
  password: string (required, for confirmation)
}

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Account deleted successfully. You can restore within 30 days.",
  success: true
}
```

#### Restore Account Request

```http
PATCH /users/restore-account/request
Content-Type: application/json

Body:
{
  identifier: string (email or username)
}

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Account restoration OTP sent to your email",
  success: true
}
```

#### Restore Account Confirm

```http
PATCH /users/restore-account/confirm
Content-Type: application/json

Body:
{
  identifier: string (email or username)
  otp: string (6-digit)
}

Success Response (200):
{
  statusCode: 200,
  data: {
    user: {
      id: "uuid",
      ...restoredUserDetails,
      isDeleted: false
    }
  },
  message: "Account restored successfully",
  success: true
}
```

---

### 11. Notification APIs

#### Get All Notifications

```http
GET /notifications
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: [
    {
      id: "uuid",
      type: "LIKE" | "COMMENT" | "SUBSCRIPTION" | "UPLOAD",
      title: "New like on your video",
      message: "John Doe liked your video",
      isRead: false,
      createdAt: "2024-01-01T00:00:00.000Z",
      relatedUser: {
        id: "uuid",
        username: "johndoe",
        avatar: "https://..."
      },
      relatedVideo: {
        id: "uuid",
        title: "Video Title",
        thumbnail: "https://..."
      }
    }
  ],
  message: "Notifications fetched",
  success: true
}
```

#### Get Unread Count

```http
GET /notifications/unread-count
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    count: 5
  },
  message: "Unread count fetched",
  success: true
}
```

#### Mark as Read

```http
PATCH /notifications/:notificationId/read
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    id: "uuid",
    isRead: true
  },
  message: "Notification marked as read",
  success: true
}
```

#### Mark All as Read

```http
PATCH /notifications/read-all
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "All notifications marked as read",
  success: true
}
```

#### Delete Notification

```http
DELETE /notifications/:notificationId
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: null,
  message: "Notification deleted",
  success: true
}
```

---

### 12. Dashboard APIs

#### Get Overview

```http
GET /dashboard/overview
Authorization: Bearer <accessToken>

Success Response (200):
{
  statusCode: 200,
  data: {
    totalViews: 10000,
    totalVideos: 25,
    totalSubscribers: 150,
    totalLikes: 500,
    recentViews: 250, // Last 7 days
    recentSubscribers: 10,
    recentLikes: 25
  },
  message: "Dashboard overview fetched",
  success: true
}
```

#### Get Analytics

```http
GET /dashboard/analytics?period=7d
Authorization: Bearer <accessToken>

Query Parameters:
- period: string (7d | 30d | 90d | 1y)

Success Response (200):
{
  statusCode: 200,
  data: {
    viewsChart: [
      { date: "2024-01-01", views: 100 },
      { date: "2024-01-02", views: 150 }
    ],
    subscribersChart: [...],
    likesChart: [...],
    topVideos: [
      {
        id: "uuid",
        title: "Video Title",
        views: 1500,
        likes: 50
      }
    ]
  },
  message: "Analytics fetched",
  success: true
}
```

---

## 🎯 Frontend Implementation Guide

### Project Setup

```bash
# Create Vite + React project
npm create vite@latest vixora-frontend -- --template react

# Install dependencies
npm install react-router-dom@7.11.0
npm install axios@1.13.2
npm install tailwindcss@3.4.19 postcss autoprefixer
npm install @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select
npm install @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch
npm install lucide-react@0.562.0
npm install sonner@2.0.7
npm install clsx tailwind-merge class-variance-authority
npm install react-hook-form@7.54.2

# Initialize Tailwind
npx tailwindcss init -p
```

### Folder Structure

```
src/
├── api/
│   ├── axios.js              # Axios instance
│   └── services.js           # API services
├── components/
│   ├── common/               # Shared components
│   ├── skeletons/            # Loading skeletons
│   ├── ui/                   # ShadCN components
│   └── video/                # Video components
├── context/                  # React contexts
├── hooks/                    # Custom hooks
├── layouts/                  # Layout components
├── pages/                    # Page components
├── styles/                   # CSS files
├── utils/                    # Utility functions
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🔄 Complete Feature Workflows

### 1. User Registration & Email Verification Flow

**Step-by-Step Implementation:**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User fills registration form                        │
├─────────────────────────────────────────────────────────────┤
│ UI Components:                                               │
│ - Full Name input (text, required, min 3 chars)            │
│ - Username input (text, required, alphanumeric + _)        │
│ - Email input (email, required, validation)                │
│ - Password input (password, required, strength indicator)  │
│ - Confirm Password (must match password)                   │
│ - Avatar upload (optional, image preview)                  │
│ - Terms checkbox (required)                                │
│ - Submit button (disabled until valid)                     │
│                                                              │
│ Validation Rules:                                           │
│ - Full Name: 3-50 chars                                    │
│ - Username: 3-30 chars, alphanumeric + underscore only    │
│ - Email: Valid email format                                │
│ - Password: Min 8 chars, 1 uppercase, 1 lowercase,        │
│             1 number, 1 special char                       │
│ - Avatar: Max 5MB, jpg/png/webp only                      │
│                                                              │
│ Real-time Validation:                                       │
│ - Show error messages below each field                     │
│ - Green checkmark when valid                               │
│ - Password strength meter (Weak/Medium/Strong)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend validation passes                          │
├─────────────────────────────────────────────────────────────┤
│ Actions:                                                     │
│ 1. Disable submit button                                   │
│ 2. Show loading spinner on button                          │
│ 3. Create FormData object                                  │
│ 4. Append all fields to FormData                           │
│ 5. Call authService.register(formData)                     │
│                                                              │
│ Code:                                                        │
│ const formData = new FormData()                            │
│ formData.append('fullName', fullName)                      │
│ formData.append('username', username)                      │
│ formData.append('email', email)                            │
│ formData.append('password', password)                      │
│ if (avatar) formData.append('avatar', avatar)              │
│                                                              │
│ const response = await authService.register(formData)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Backend processes request                           │
├─────────────────────────────────────────────────────────────┤
│ Backend Actions:                                             │
│ 1. Validate all fields                                      │
│ 2. Check if email/username already exists                  │
│ 3. Hash password with bcrypt                               │
│ 4. Upload avatar to Cloudinary (if provided)               │
│ 5. Generate 6-digit OTP                                    │
│ 6. Store OTP in database with 10-min expiry               │
│ 7. Send OTP email via Nodemailer                           │
│ 8. Create user record in database                          │
│ 9. Return user data (without password)                     │
│                                                              │
│ Success Response (201):                                     │
│ {                                                            │
│   statusCode: 201,                                          │
│   data: {                                                   │
│     user: {                                                 │
│       id: "uuid",                                           │
│       fullName: "John Doe",                                │
│       username: "johndoe",                                 │
│       email: "john@example.com",                           │
│       avatar: "https://cloudinary.com/...",               │
│       isEmailVerified: false                               │
│     }                                                        │
│   },                                                         │
│   message: "User registered. Please verify your email.",   │
│   success: true                                             │
│ }                                                            │
│                                                              │
│ Error Response (400):                                       │
│ {                                                            │
│   statusCode: 400,                                          │
│   message: "Validation failed",                            │
│   errors: [                                                 │
│     { field: "email", message: "Email already exists" }   │
│   ]                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Frontend handles response                           │
├─────────────────────────────────────────────────────────────┤
│ Success Path:                                                │
│ 1. Store user data in state (not in context yet)           │
│ 2. Show success toast: "Registration successful!"          │
│ 3. Navigate to /verify-otp with state                      │
│    navigate('/verify-otp', {                               │
│      state: { email: user.email, from: 'register' }       │
│    })                                                        │
│                                                              │
│ Error Path:                                                  │
│ 1. Parse error response                                     │
│ 2. Show field-specific errors below inputs                 │
│ 3. Show toast with general error message                   │
│ 4. Re-enable submit button                                 │
│ 5. Keep form data (don't clear)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: OTP Verification Page                               │
├─────────────────────────────────────────────────────────────┤
│ UI Components:                                               │
│ - Display user's email                                      │
│ - 6 separate input boxes for OTP digits                    │
│ - Auto-focus next input on digit entry                     │
│ - Auto-submit when all 6 digits entered                    │
│ - Verify button                                             │
│ - Resend OTP button with countdown (60s)                   │
│ - "Didn't receive? Check spam" message                     │
│                                                              │
│ OTP Input Behavior:                                         │
│ - Only accept numbers (0-9)                                │
│ - Auto-focus next input on entry                           │
│ - Backspace moves to previous input                        │
│ - Paste support (paste 6-digit code)                       │
│ - Clear all on error                                        │
│                                                              │
│ Countdown Timer:                                             │
│ - Start at 60 seconds                                       │
│ - Disable resend button during countdown                   │
│ - Show "Resend OTP (45s)" format                           │
│ - Enable button when countdown reaches 0                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: User enters OTP and submits                         │
├─────────────────────────────────────────────────────────────┤
│ Frontend Actions:                                            │
│ 1. Combine 6 digits into single string                     │
│ 2. Validate OTP is 6 digits                                │
│ 3. Show loading state                                       │
│ 4. Call authService.verifyEmail({                          │
│      identifier: email,                                     │
│      otp: otpString                                         │
│    })                                                        │
│                                                              │
│ Backend Actions:                                             │
│ 1. Find OTP record for user                                │
│ 2. Check if OTP expired (10 min limit)                     │
│ 3. Compare OTP with stored hash                            │
│ 4. Update user.isEmailVerified = true                      │
│ 5. Delete OTP record                                        │
│ 6. Generate JWT tokens                                      │
│ 7. Set HTTP-only cookies                                    │
│ 8. Return user data with tokens                            │
│                                                              │
│ Success Response (200):                                     │
│ {                                                            │
│   statusCode: 200,                                          │
│   data: {                                                   │
│     user: { ...userData, isEmailVerified: true },          │
│     accessToken: "jwt...",                                 │
│     refreshToken: "jwt..."                                 │
│   },                                                         │
│   message: "Email verified successfully"                   │
│ }                                                            │
│                                                              │
│ Error Response (400):                                       │
│ {                                                            │
│   statusCode: 400,                                          │
│   message: "Invalid or expired OTP"                        │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Frontend completes authentication                   │
├─────────────────────────────────────────────────────────────┤
│ Success Path:                                                │
│ 1. Update AuthContext with user data                       │
│ 2. Store tokens in cookies (automatic from backend)        │
│ 3. Show success toast: "Welcome to Vixora!"               │
│ 4. Navigate to home page (/)                               │
│ 5. Show welcome animation/confetti                         │
│                                                              │
│ Error Path:                                                  │
│ 1. Show error toast with message                           │
│ 2. Clear OTP inputs                                         │
│ 3. Focus first input                                        │
│ 4. Shake animation on inputs                               │
│ 5. If "expired", show resend button                        │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Video Upload Flow

**Complete Implementation:**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Upload Page UI                                      │
├─────────────────────────────────────────────────────────────┤
│ Layout:                                                      │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Upload Video                                         │   │
│ │                                                       │   │
│ │ ┌─────────────────────────────────────────────┐    │   │
│ │ │  Drag & Drop Video File                      │    │   │
│ │ │  or Click to Browse                          │    │   │
│ │ │  (Max 500MB, MP4/MOV/AVI)                   │    │   │
│ │ └─────────────────────────────────────────────┘    │   │
│ │                                                       │   │
│ │ [Video Preview Player]                               │   │
│ │                                                       │   │
│ │ ┌─────────────────────────────────────────────┐    │   │
│ │ │  Drag & Drop Thumbnail                       │    │   │
│ │ │  or Click to Browse                          │    │   │
│ │ │  (Max 5MB, JPG/PNG)                         │    │   │
│ │ └─────────────────────────────────────────────┘    │   │
│ │                                                       │   │
│ │ [Thumbnail Preview]                                  │   │
│ │                                                       │   │
│ │ Title: [_____________________________]              │   │
│ │                                                       │   │
│ │ Description:                                         │   │
│ │ [________________________________]                  │   │
│ │ [________________________________]                  │   │
│ │ [________________________________]                  │   │
│ │                                                       │   │
│ │ Tags: [tag1] [tag2] [+ Add Tag]                    │   │
│ │                                                       │   │
│ │ Category: [Select ▼]                                │   │
│ │                                                       │   │
│ │ Visibility: ○ Public  ○ Private                     │   │
│ │                                                       │   │
│ │ [Cancel]  [Upload Video →]                          │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: File Selection & Validation                         │
├─────────────────────────────────────────────────────────────┤
│ Video File Validation:                                       │
│ - Accept: .mp4, .mov, .avi, .mkv, .webm                   │
│ - Max Size: 500MB                                           │
│ - Check MIME type: video/*                                  │
│ - Extract duration using video element                      │
│ - Show preview player                                       │
│                                                              │
│ Thumbnail Validation:                                        │
│ - Accept: .jpg, .jpeg, .png, .webp                        │
│ - Max Size: 5MB                                             │
│ - Check MIME type: image/*                                  │
│ - Show preview image                                        │
│ - Auto-generate from video if not provided                 │
│                                                              │
│ Form Validation:                                             │
│ - Title: Required, 3-100 chars                             │
│ - Description: Optional, max 5000 chars                    │
│ - Tags: Optional, max 10 tags, each max 30 chars          │
│ - Category: Optional, from predefined list                 │
│                                                              │
│ UI Feedback:                                                 │
│ - Show file size and duration                              │
│ - Show validation errors in red                            │
│ - Disable upload button until valid                        │
│ - Show character count for title/description               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Upload Process                                      │
├─────────────────────────────────────────────────────────────┤
│ Frontend Actions:                                            │
│ 1. Create FormData object                                   │
│ 2. Append all fields                                        │
│ 3. Show upload progress modal                              │
│ 4. Call videoService.uploadVideo(formData) with progress   │
│                                                              │
│ Upload Progress UI:                                          │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Uploading Video...                                   │   │
│ │                                                       │   │
│ │ [████████████░░░░░░░░░░░░] 65%                      │   │
│ │                                                       │   │
│ │ Uploading: 325MB / 500MB                            │   │
│ │ Speed: 2.5 MB/s                                      │   │
│ │ Time remaining: 1m 10s                               │   │
│ │                                                       │   │
│ │ [Cancel Upload]                                      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                              │
│ Axios Config:                                                │
│ {                                                            │
│   onUploadProgress: (progressEvent) => {                   │
│     const percentCompleted = Math.round(                   │
│       (progressEvent.loaded * 100) / progressEvent.total   │
│     )                                                        │
│     setUploadProgress(percentCompleted)                    │
│   }                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Backend Processing                                  │
├─────────────────────────────────────────────────────────────┤
│ Backend Actions:                                             │
│ 1. Validate JWT token (verifyJWT middleware)               │
│ 2. Validate file types and sizes                           │
│ 3. Upload video to Cloudinary                              │
│    - Folder: vixora/videos                                 │
│    - Resource type: video                                   │
│    - Format: mp4                                            │
│    - Quality: auto                                          │
│ 4. Upload thumbnail to Cloudinary                          │
│    - Folder: vixora/thumbnails                             │
│    - Resource type: image                                   │
│    - Transformation: w_1280,h_720,c_fill                   │
│ 5. Extract video metadata (duration, format, size)         │
│ 6. Create video record in database                         │
│ 7. Return video data                                        │
│                                                              │
│ Database Record:                                             │
│ {                                                            │
│   id: "uuid",                                               │
│   title: "Video Title",                                    │
│   description: "Description",                              │
│   videoFile: "cloudinary_url",                             │
│   thumbnail: "cloudinary_url",                             │
│   duration: 300,                                            │
│   views: 0,                                                 │
│   likesCount: 0,                                            │
│   commentsCount: 0,                                         │
│   isPublished: true,                                        │
│   ownerId: "user_uuid",                                     │
│   tags: ["tag1", "tag2"],                                  │
│   category: "Education",                                    │
│   createdAt: "timestamp"                                    │
│ }                                                            │
│                                                              │
│ Success Response (201):                                     │
│ {                                                            │
│   statusCode: 201,                                          │
│   data: { ...videoData },                                  │
│   message: "Video uploaded successfully"                   │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Post-Upload Actions                                 │
├─────────────────────────────────────────────────────────────┤
│ Success Path:                                                │
│ 1. Hide upload progress modal                              │
│ 2. Show success animation (checkmark)                      │
│ 3. Show toast: "Video uploaded successfully!"             │
│ 4. Navigate to video page: /video/:videoId                 │
│ 5. Show "Share your video" prompt                          │
│                                                              │
│ Error Path:                                                  │
│ 1. Hide progress modal                                      │
│ 2. Show error toast with message                           │
│ 3. Keep form data (don't clear)                            │
│ 4. Allow retry                                              │
│ 5. If network error, show "Retry" button                   │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Video Watch & Interaction Flow

**Complete Implementation:**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Video Page Load                                     │
├─────────────────────────────────────────────────────────────┤
│ URL: /video/:videoId                                         │
│                                                              │
│ Parallel API Calls:                                          │
│ 1. GET /videos/:videoId (video details)                    │
│ 2. GET /comments/:videoId (comments)                        │
│ 3. GET /watch-history/:videoId (watch progress)            │
│ 4. GET /subscriptions/c/:channelId/status (if logged in)   │
│                                                              │
│ Loading State:                                               │
│ - Show skeleton for video player                           │
│ - Show skeleton for video info                             │
│ - Show skeleton for comments                               │
│                                                              │
│ Error Handling:                                              │
│ - If video not found (404): Show "Video not found" page   │
│ - If private video: Show "This video is private"          │
│ - If deleted video: Show "Video unavailable"              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Video Player Initialization                         │
├─────────────────────────────────────────────────────────────┤
│ Player Setup:                                                │
│ 1. Load video source from videoFile URL                    │
│ 2. Set poster image from thumbnail                         │
│ 3. Check for saved watch progress                          │
│ 4. If progress > 5%, show resume prompt                    │
│                                                              │
│ Resume Prompt:                                               │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Resume from 2:45?                                    │   │
│ │ [Start from beginning]  [Resume]                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                              │
│ Player Controls:                                             │
│ - Play/Pause button                                         │
│ - Progress bar with seek                                    │
│ - Volume slider                                             │
│ - Mute/Unmute button                                        │
│ - Settings (Quality, Speed)                                 │
│ - Fullscreen button                                         │
│ - Picture-in-Picture button                                 │
│                                                              │
│ Keyboard Shortcuts:                                          │
│ - Space: Play/Pause                                         │
│ - M: Mute/Unmute                                            │
│ - F: Fullscreen                                             │
│ - ← →: Seek -10s / +10s                                    │
│ - ↑ ↓: Volume +10% / -10%                                  │
│ - 0-9: Seek to 0%-90%                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Watch Progress Tracking                             │
├─────────────────────────────────────────────────────────────┤
│ Progress Tracking Logic:                                     │
│ 1. Track currentTime on timeupdate event                   │
│ 2. Calculate progress percentage                           │
│ 3. Throttle save to every 5 seconds                        │
│ 4. Save on pause, seek, and page unload                   │
│                                                              │
│ Save Progress API Call:                                      │
│ POST /watch-history                                          │
│ {                                                            │
│   videoId: "uuid",                                          │
│   progress: 45, // percentage                              │
│   duration: 300 // seconds                                  │
│ }                                                            │
│                                                              │
│ Progress Calculation:                                        │
│ const progress = (currentTime / duration) * 100            │
│                                                              │
│ Throttle Implementation:                                     │
│ let lastSaveTime = 0                                        │
│ const SAVE_INTERVAL = 5000 // 5 seconds                    │
│                                                              │
│ const saveProgress = () => {                                │
│   const now = Date.now()                                   │
│   if (now - lastSaveTime > SAVE_INTERVAL) {               │
│     watchHistoryService.saveWatchProgress({...})          │
│     lastSaveTime = now                                     │
│   }                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Like Button Interaction                             │
├─────────────────────────────────────────────────────────────┤
│ UI State:                                                    │
│ - Thumbs up icon                                            │
│ - Like count number                                         │
│ - Blue color when liked                                     │
│ - Gray color when not liked                                 │
│                                                              │
│ Click Flow:                                                  │
│ 1. User clicks like button                                 │
│ 2. Optimistic update (instant UI change)                   │
│    - Toggle isLiked state                                  │
│    - Increment/decrement likesCount                        │
│    - Change button color                                    │
│    - Play animation (scale + fade)                         │
│ 3. Call API: POST /likes/toggle/v/:videoId                │
│ 4. If API fails, revert optimistic update                  │
│ 5. Show error toast if failed                              │
│                                                              │
│ Code Implementation:                                         │
│ const handleLike = async () => {                           │
│   const prevLiked = isLiked                                │
│   const prevCount = likesCount                             │
│                                                              │
│   // Optimistic update                                      │
│   setIsLiked(!prevLiked)                                   │
│   setLikesCount(prev => prevLiked ? prev - 1 : prev + 1)  │
│                                                              │
│   try {                                                      │
│     await likeService.toggleVideoLike(videoId)            │
│   } catch (error) {                                         │
│     // Revert on error                                      │
│     setIsLiked(prevLiked)                                  │
│     setLikesCount(prevCount)                               │
│     toast.error('Failed to like video')                    │
│   }                                                          │
│ }                                                            │
│                                                              │
│ Animation:                                                   │
│ @keyframes likeAnimation {                                  │
│   0% { transform: scale(1); }                              │
│   50% { transform: scale(1.2); }                           │
│   100% { transform: scale(1); }                            │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Subscribe Button Interaction                        │
├─────────────────────────────────────────────────────────────┤
│ UI States:                                                   │
│ - Not Subscribed: "Subscribe" (blue button)                │
│ - Subscribed: "Subscribed" (gray button) + Bell icon      │
│                                                              │
│ Click Flow:                                                  │
│ 1. User clicks subscribe button                            │
│ 2. Optimistic update                                        │
│    - Toggle isSubscribed state                             │
│    - Update subscriber count                               │
│    - Change button text and color                          │
│ 3. Call API: POST /subscriptions/c/:channelId/subscribe   │
│ 4. If subscribed, show notification level dropdown         │
│ 5. If API fails, revert changes                            │
│                                                              │
│ Notification Level Dropdown:                                 │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🔔 All notifications                                 │   │
│ │ 🔔 Personalized                                      │   │
│ │ 🔕 None                                              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                              │
│ Notification Level Change:                                   │
│ PATCH /subscriptions/c/:channelId/notifications             │
│ { level: "ALL" | "PERSONALIZED" | "NONE" }                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Comment Interaction                                 │
├─────────────────────────────────────────────────────────────┤
│ Add Comment Flow:                                            │
│ 1. User types in comment textarea                          │
│ 2. Show character count (0/500)                            │
│ 3. Enable "Comment" button when text entered               │
│ 4. User clicks "Comment" button                            │
│ 5. Show loading state on button                            │
│ 6. Call API: POST /comments/:videoId                       │
│ 7. Add new comment to top of list                          │
│ 8. Clear textarea                                           │
│ 9. Increment comment count                                 │
│ 10. Show success animation                                  │
│                                                              │
│ Comment Sort:                                                │
│ - Latest first (default)                                    │
│ - Oldest first                                              │
│                                                              │
│ Comment Actions (for owner):                                 │
│ - Edit: Show textarea with current text                    │
│ - Delete: Show confirmation dialog                         │
│                                                              │
│ Comment Like:                                                │
│ - Same optimistic update pattern as video like            │
│ - POST /likes/toggle/c/:commentId                          │
└─────────────────────────────────────────────────────────────┘
```

---
