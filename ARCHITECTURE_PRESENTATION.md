# Exchange Student Guide Website - Architecture & Setup

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Authentication Flow](#authentication-flow)
6. [Data Storage](#data-storage)
7. [Image Storage](#image-storage)
8. [Deployment](#deployment)
9. [Key Components](#key-components)
10. [Data Flow Examples](#data-flow-examples)

---

## 🎯 Overview

**Exchange Student Guide Website** is a full-stack web application that helps exchange students share tips, reviews, and information about courses, restaurants, activities, trips, and nightlife in Donostia (San Sebastián).

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase Edge Functions (Deno) + Hono Framework
- **Database:** Deno KV (Key-Value Store)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for images)
- **Deployment:** GitHub Pages (frontend) + Supabase (backend)

**Live URL:** https://emblabrowall.github.io

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Pages (Frontend)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React App (Vite Build)                              │  │
│  │  - HomePage, PostListPage, ForumPage, etc.          │  │
│  │  - Client-side routing                               │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS API Calls
                        │ (Authorization Header)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions (Backend)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Hono Framework                                       │  │
│  │  - REST API endpoints                                 │  │
│  │  - Authentication middleware                          │  │
│  │  - CORS configuration                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │                                    │
│        ┌───────────────┼───────────────┐                    │
│        ▼               ▼               ▼                    │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Supabase │  │   Deno KV    │  │   Supabase   │        │
│  │   Auth   │  │  (Database)   │  │   Storage    │        │
│  │          │  │              │  │   (Images)   │        │
│  │ - Users  │  │ - Posts      │  │ - Photos     │        │
│  │ - Admin  │  │ - Comments   │  │ - Public URLs│        │
│  │ - Verify │  │ - Threads    │  │              │        │
│  │          │  │ - Replies    │  │              │        │
│  └──────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend Setup

### Technology Stack
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite 6.3.5** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component library
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Motion** - Animations

### Project Structure
```
src/
├── components/          # React components
│   ├── HomePage.tsx     # Landing page
│   ├── PostListPage.tsx # List of tips/posts
│   ├── PostCard.tsx     # Individual post display
│   ├── AddTipForm.tsx   # Form to add new tips
│   ├── ForumPage.tsx    # Forum thread list
│   ├── ThreadView.tsx   # Single thread view
│   ├── CalendarPage.tsx # Trip calendar
│   ├── AdminPage.tsx    # Admin panel
│   ├── Navigation.tsx   # Main navigation
│   └── ui/              # Reusable UI components
├── utils/
│   ├── api.ts           # API client functions
│   └── supabase/
│       └── info.tsx     # Supabase config (project ID, keys)
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx    # Edge Function (backend)
│           └── kv_store.tsx # KV store wrapper
├── App.tsx              # Main app component (routing)
└── main.tsx            # Entry point
```

### Build Configuration
- **Output Directory:** `docs/` (for GitHub Pages)
- **Base Path:** `/` (root)
- **Dev Server:** Port 3000
- **Build Target:** ESNext

### API Client (`src/utils/api.ts`)
The frontend communicates with the backend through a centralized API client:

```typescript
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3134d39c`

// Example API calls:
api.signup(email, password, name, verificationCode)
api.login(email, password)
api.getPosts(category)
api.createPost(postData)
api.deleteThread(threadId)
api.getAllUsers() // Admin only
```

---

## ⚙️ Backend Setup

### Technology Stack
- **Deno Runtime** - JavaScript/TypeScript runtime
- **Hono Framework** - Web framework (similar to Express)
- **Supabase Edge Functions** - Serverless function hosting
- **Deno KV** - Key-value database (built into Deno)

### Edge Function Location
```
src/supabase/functions/server/index.tsx
```

### Key Features
1. **CORS Configuration** - Allows requests from GitHub Pages and localhost
2. **Authentication Middleware** - Validates JWT tokens from Supabase Auth
3. **Admin Authorization** - Checks user admin status before sensitive operations
4. **Storage Initialization** - Creates and configures Supabase Storage bucket

### API Endpoints

#### Authentication
- `POST /signup` - Create new user account
- `POST /verify-code` - Verify student code or admin code
- `GET /user` - Get current user info

#### Posts/Tips
- `POST /posts` - Create a new tip/post
- `GET /posts` - Get all posts (with optional category filter)
- `POST /posts/:postId/upvote` - Upvote a post
- `POST /posts/:postId/comments` - Add comment to post
- `GET /posts/:postId/comments` - Get comments for a post
- `GET /posts/:postId/comment-count` - Get comment count
- `DELETE /posts/:postId` - Delete a post

#### Forum
- `POST /forum/threads` - Create a forum thread
- `GET /forum/threads` - Get all threads
- `GET /forum/threads/:threadId` - Get single thread
- `POST /forum/threads/:threadId/replies` - Add reply to thread
- `GET /forum/threads/:threadId/replies` - Get replies for thread
- `DELETE /forum/threads/:threadId` - Delete thread (admin/owner)
- `DELETE /forum/replies/:replyId` - Delete reply (admin/owner)

#### Admin
- `GET /admin/users` - Get all users (admin only)
- `DELETE /admin/users/:userId` - Delete user (admin only)

---

## 🔐 Authentication Flow

### 1. User Registration
```
User fills signup form
    ↓
Frontend calls: api.signup(email, password, name, verificationCode)
    ↓
Backend validates verification code
    ↓
Creates user in Supabase Auth
    ↓
Stores user metadata in Deno KV (verified, admin status)
    ↓
Returns user object to frontend
```

### 2. User Login
```
User fills login form
    ↓
Frontend calls: api.login(email, password)
    ↓
Supabase Auth validates credentials
    ↓
Returns session with JWT token
    ↓
Frontend stores session in Supabase client
    ↓
All subsequent API calls include: Authorization: Bearer <token>
```

### 3. Admin Access
- **Admin Code:** `CASAPINA2025` (grants admin privileges)
- **Admin Emails:** Configured via `ADMIN_EMAILS` environment variable
- **Verification:** Backend checks `users:${userId}` in KV store for `admin: true`

### 4. Verification Codes
- **Student Codes:** `DONOSTI2025`, `EXCHANGE2025` (grants verified status)
- Stored in KV store under key `verification-codes`
- Verified users can see verified badge and have access to verified-only features

---

## 💾 Data Storage

### Deno KV Structure

All data is stored in Deno KV using key-value pairs:

```
users:{userId}
  → { email, name, verified, admin, ... }

posts:{postId}
  → { id, title, category, content, authorId, photoUrl, ... }

comments:{postId}:{commentId}
  → { id, postId, authorId, content, timestamp, ... }

threads:{threadId}
  → { id, title, category, content, authorId, replyCount, ... }

replies:{threadId}:{replyId}
  → { id, threadId, authorId, content, timestamp, helpful, ... }

upvotes:{postId}:{userId}
  → true (if user upvoted)

thread-upvotes:{threadId}:{userId}
  → true (if user upvoted thread)

reply-upvotes:{replyId}:{userId}
  → true (if user upvoted reply)

verification-codes
  → ['DONOSTI2025', 'EXCHANGE2025']

analytics
  → { totalPosts, verifiedUsers, topSearches }
```

### Data Operations

**Get by Prefix:**
```typescript
// Get all posts
const posts = await kv.getByPrefix('posts:')

// Get all comments for a post
const comments = await kv.getByPrefix(`comments:${postId}:`)
```

**Set/Get:**
```typescript
// Store a post
await kv.set(`posts:${postId}`, post)

// Get a post
const post = await kv.get(`posts:${postId}`)
```

**Delete:**
```typescript
// Delete a post
await kv.del(`posts:${postId}`)
```

---

## 🖼️ Image Storage

### Supabase Storage Setup

**Bucket Name:** `make-3134d39c-donosti-photos`
**Access:** Public (for easy preview and access)

### Image Upload Flow

```
User selects image in AddTipForm
    ↓
Image converted to base64 data URL
    ↓
Frontend sends photoData to backend
    ↓
Backend converts base64 to binary buffer
    ↓
Uploads to Supabase Storage: {postId}.jpg
    ↓
Generates public URL (if bucket is public)
    ↓
Stores URL in post object: photoUrl
    ↓
Post saved to Deno KV with photoUrl
```

### URL Generation

**Public URLs (if bucket is public):**
```
https://{projectId}.supabase.co/storage/v1/object/public/{bucket}/{filename}
```

**Signed URLs (if bucket is private):**
```
https://{projectId}.supabase.co/storage/v1/object/sign/{bucket}/{filename}?token=...
```

### URL Conversion

When fetching posts, the backend automatically converts old signed URLs to public URLs if the bucket is public, ensuring all images display correctly.

---

## 🚀 Deployment

### Frontend Deployment (GitHub Pages)

**Workflow:** `.github/workflows/deploy.yml`

```
Push to main branch
    ↓
GitHub Actions triggered
    ↓
npm install
    ↓
npm run build (outputs to docs/)
    ↓
Deploy docs/ folder to GitHub Pages
    ↓
Site available at: https://emblabrowall.github.io
```

**Build Output:** `docs/` directory (configured in `vite.config.ts`)

### Backend Deployment (Supabase Edge Functions)

**Function Name:** `make-server-3134d39c`

**Deployment Steps:**
1. Code located in `src/supabase/functions/server/`
2. Deploy via Supabase CLI or Dashboard
3. Environment variables set in Supabase Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAILS` (optional)

**Function URL:**
```
https://{projectId}.supabase.co/functions/v1/make-server-3134d39c
```

---

## 🧩 Key Components

### Frontend Components

**App.tsx**
- Main application router
- Manages global state (user, current page, search query)
- Handles authentication state
- Routes to different pages based on `currentPage` state

**Navigation.tsx**
- Main navigation bar
- Shows admin shield icon for admins
- Handles logout
- Search functionality

**PostCard.tsx**
- Displays individual tips/posts
- Shows category-specific details (courses, food, activities, etc.)
- Handles upvotes, comments, reports
- Displays images with fallback

**AddTipForm.tsx**
- Multi-category form for adding tips
- Handles image upload (converts to base64)
- Category-specific fields (price, ratings, etc.)
- Client-side validation

**ForumPage.tsx**
- Lists all forum threads
- Category filtering
- Admin/owner delete functionality

**ThreadView.tsx**
- Displays single thread and replies
- Reply functionality
- Upvote threads and replies
- Mark replies as helpful
- Admin/owner delete functionality

**AdminPage.tsx**
- Lists all users
- Search functionality
- Delete users (admin only)
- User statistics

### Backend Components

**index.tsx (Edge Function)**
- Main API server
- Route handlers
- Authentication middleware
- Admin authorization checks
- Storage operations

**kv_store.tsx**
- Wrapper around Deno KV
- Provides get, set, del, getByPrefix operations
- Handles Supabase KV store integration

---

## 🔄 Data Flow Examples

### Example 1: Creating a Tip

```
1. User fills AddTipForm
   ↓
2. User clicks "Submit"
   ↓
3. Frontend: api.createPost({ title, category, content, photoData, ... })
   ↓
4. Backend: Validates JWT token
   ↓
5. Backend: Uploads image to Supabase Storage
   ↓
6. Backend: Generates photoUrl
   ↓
7. Backend: Creates post object with all fields
   ↓
8. Backend: Saves to Deno KV: kv.set(`posts:${postId}`, post)
   ↓
9. Backend: Updates analytics
   ↓
10. Backend: Returns { success: true, post }
   ↓
11. Frontend: Shows success toast, refreshes post list
```

### Example 2: Viewing Posts

```
1. User navigates to category page
   ↓
2. Frontend: api.getPosts(category)
   ↓
3. Backend: Gets all posts from KV: kv.getByPrefix('posts:')
   ↓
4. Backend: Filters by category (if specified)
   ↓
5. Backend: Converts photo URLs to public URLs (if needed)
   ↓
6. Backend: Sorts by timestamp (newest first)
   ↓
7. Backend: Returns { posts: [...] }
   ↓
8. Frontend: Renders PostCard components
   ↓
9. Frontend: Displays images using ImageWithFallback component
```

### Example 3: Admin Deleting a User

```
1. Admin clicks delete button on AdminPage
   ↓
2. Frontend: Shows confirmation dialog
   ↓
3. Frontend: api.deleteUser(userId)
   ↓
4. Backend: Validates JWT token
   ↓
5. Backend: Checks if user is admin
   ↓
6. Backend: Prevents self-deletion
   ↓
7. Backend: Deletes user from KV: kv.del(`users:${userId}`)
   ↓
8. Backend: Deletes all user's posts, comments, threads, replies
   ↓
9. Backend: Deletes user from Supabase Auth
   ↓
10. Backend: Returns { success: true }
   ↓
11. Frontend: Refreshes user list
```

---

## 🔗 Key Connections

### Frontend ↔ Backend
- **API Base URL:** `https://psbeaujrpvdkszhjxocm.supabase.co/functions/v1/make-server-3134d39c`
- **Authentication:** JWT tokens in `Authorization` header
- **CORS:** Configured to allow GitHub Pages origin

### Backend ↔ Supabase Auth
- **Service Role Key:** Used for admin operations (create/delete users)
- **User Metadata:** Stored in both Auth and KV store
- **Session Validation:** JWT tokens validated on each request

### Backend ↔ Deno KV
- **Storage:** All application data (posts, comments, threads, users)
- **Operations:** get, set, del, getByPrefix
- **Keys:** Structured with prefixes (e.g., `posts:`, `users:`)

### Backend ↔ Supabase Storage
- **Bucket:** `make-3134d39c-donosti-photos`
- **Access:** Public (for easy image access)
- **File Naming:** `{postId}.jpg`
- **URLs:** Public URLs generated for public bucket

---

## 📝 Environment Variables

### Supabase Edge Function
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `ADMIN_EMAILS` - Comma-separated list of admin emails (optional)

### Frontend
- Supabase config in `src/utils/supabase/info.tsx`:
  - `projectId` - Supabase project ID
  - `publicAnonKey` - Public anonymous key

---

## 🎯 Summary

This application uses a **serverless architecture** with:
- **Frontend:** React SPA hosted on GitHub Pages
- **Backend:** Supabase Edge Functions (Deno) for API
- **Database:** Deno KV for key-value storage
- **Auth:** Supabase Auth for user management
- **Storage:** Supabase Storage for images

All components communicate via REST API calls with JWT authentication, providing a scalable and maintainable architecture for the exchange student guide platform.

