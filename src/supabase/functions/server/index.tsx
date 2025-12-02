import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Configure CORS to explicitly allow GitHub Pages origin
app.use('*', cors({
  origin: ['https://emblabrowall.github.io', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const storageSupabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Initialize storage bucket
const bucketName = 'make-3134d39c-donosti-photos'
const initStorage = async () => {
  const { data: buckets } = await storageSupabase.storage.listBuckets()
  const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)
  if (!bucketExists) {
    // Create bucket as public so images can be previewed in Supabase dashboard
    // Signed URLs will still work for private access if needed
    await storageSupabase.storage.createBucket(bucketName, { public: true })
    console.log(`Created bucket: ${bucketName}`)
  } else {
    // If bucket exists, try to make it public (won't error if already public)
    const { data: bucket } = await storageSupabase.storage.getBucket(bucketName)
    if (bucket && !bucket.public) {
      await storageSupabase.storage.updateBucket(bucketName, { public: true })
      console.log(`Updated bucket ${bucketName} to public`)
    }
  }
}
await initStorage()

// Initialize verification codes
const initVerificationCodes = async () => {
  const codes = await kv.get('verification-codes')
  if (!codes) {
    await kv.set('verification-codes', ['DONOSTI2025', 'EXCHANGE2025'])
  }
}
await initVerificationCodes()

// Helper function to check if user is admin
const isAdmin = async (userId: string): Promise<boolean> => {
  const userInfo = await kv.get(`users:${userId}`)
  return userInfo?.admin === true
}

// Helper function to get user info
const getUserInfo = async (userId: string) => {
  return await kv.get(`users:${userId}`) || {}
}

// Signup route
app.post('/make-server-3134d39c/signup', async (c) => {
  try {
    const { email, password, name, verificationCode } = await c.req.json()

    // Check if verification code is valid
    const validCodes = await kv.get('verification-codes') || []
    const isVerified = validCodes.includes(verificationCode)

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, verified: isVerified },
      email_confirm: true, // Auto-confirm since email server not configured
    })

    if (error) {
      console.log(`Signup error: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }

    // Check if admin (using special email or verification code)
    const adminEmails = Deno.env.get('ADMIN_EMAILS')?.split(',') || []
    const isAdminUser =
      adminEmails.includes(email.toLowerCase()) || verificationCode === 'CASAPINA2025'
    
    // Store user info in KV
    await kv.set(`users:${data.user.id}`, {
      email,
      name,
      verified: isVerified,
      admin: isAdminUser,
    })

    // Update analytics
    if (isVerified) {
      const analytics = await kv.get('analytics') || { totalPosts: 0, verifiedUsers: 0, topSearches: {} }
      analytics.verifiedUsers = (analytics.verifiedUsers || 0) + 1
      await kv.set('analytics', analytics)
    }

    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log(`Signup error: ${error}`)
    return c.json({ error: 'Signup failed' }, 500)
  }
})

// Get current user info
app.get('/make-server-3134d39c/user', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userInfo = await kv.get(`users:${user.id}`)
    return c.json({ 
      user: {
        id: user.id,
        email: user.email,
        ...userInfo
      }
    })
  } catch (error) {
    console.log(`Get user error: ${error}`)
    return c.json({ error: 'Failed to get user' }, 500)
  }
})

// Shared handler to verify or upgrade user (student verification or admin)
const handleVerifyCode = async (c: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { code } = await c.req.json()
    const trimmedCode = (code || '').toString().trim()
    if (!trimmedCode) {
      return c.json({ error: 'No code provided' }, 400)
    }

    const validCodes = await kv.get('verification-codes') || []
    const adminCode = 'CASAPINA2025'

    let userInfo = await getUserInfo(user.id)
    let changed = false

    if (validCodes.includes(trimmedCode) && !userInfo.verified) {
      userInfo.verified = true
      changed = true

      const analytics = await kv.get('analytics') || { totalPosts: 0, verifiedUsers: 0, topSearches: {} }
      analytics.verifiedUsers = (analytics.verifiedUsers || 0) + 1
      await kv.set('analytics', analytics)
    }

    if (trimmedCode === adminCode && !userInfo.admin) {
      userInfo.admin = true
      changed = true
    }

    if (!changed) {
      return c.json({ error: 'Invalid code or no change' }, 400)
    }

    await kv.set(`users:${user.id}`, {
      ...(await kv.get(`users:${user.id}`)),
      ...userInfo,
    })

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        ...userInfo,
      },
    })
  } catch (error) {
    console.log(`Verify code error: ${error}`)
    return c.json({ error: 'Failed to verify code' }, 500)
  }
}

// Verify or upgrade user (student verification or admin)
app.post('/make-server-3134d39c/verify-code', handleVerifyCode)
// Also support calls without the function-name prefix (for safety)
app.post('/verify-code', handleVerifyCode)

// Create a new post/tip
app.post('/make-server-3134d39c/posts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userInfo = await kv.get(`users:${user.id}`)
    const body = await c.req.json()
    const {
      title,
      category,
      area,
      price,
      rating,
      content,
      photoData,
      ...extraFields
    } = body

    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    let photoUrl = null
    if (photoData) {
      try {
        // Upload photo to Supabase Storage
        const photoBuffer = Uint8Array.from(atob(photoData.split(',')[1]), c => c.charCodeAt(0))
        const photoPath = `${postId}.jpg`
        
        const { error: uploadError } = await storageSupabase.storage
          .from(bucketName)
          .upload(photoPath, photoBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadError) {
          console.log(`Photo upload error: ${uploadError.message}`)
          // Continue without photo if upload fails
        } else {
          // If bucket is public, use public URL (simpler and works with previews)
          // Otherwise, use signed URL for private access
          const { data: bucket } = await storageSupabase.storage.getBucket(bucketName)
          if (bucket?.public) {
            const { data: publicUrlData } = await storageSupabase.storage
              .from(bucketName)
              .getPublicUrl(photoPath)
            photoUrl = publicUrlData?.publicUrl
          } else {
            const { data: signedUrlData, error: signedUrlError } = await storageSupabase.storage
              .from(bucketName)
              .createSignedUrl(photoPath, 60 * 60 * 24 * 365) // 1 year
            
            if (signedUrlError) {
              console.log(`Signed URL creation error: ${signedUrlError.message}`)
            } else {
              photoUrl = signedUrlData?.signedUrl
            }
          }
        }
      } catch (photoError) {
        console.log(`Photo processing error: ${photoError}`)
        // Continue without photo if processing fails
      }
    }

    const post = {
      id: postId,
      title,
      category,
      area,
      price,
      rating: rating !== undefined && rating !== null ? parseFloat(rating) : undefined,
      content,
      authorId: user.id,
      authorName: userInfo?.name || 'Anonymous',
      verified: userInfo?.verified || false,
      timestamp: new Date().toISOString(),
      photoUrl,
      upvotes: 0,
      reportCount: 0,
      ...extraFields,
    }

    await kv.set(`posts:${postId}`, post)

    // Update analytics
    const analytics = await kv.get('analytics') || { totalPosts: 0, verifiedUsers: 0, topSearches: {} }
    analytics.totalPosts = (analytics.totalPosts || 0) + 1
    await kv.set('analytics', analytics)

    return c.json({ success: true, post })
  } catch (error) {
    console.log(`Create post error: ${error}`)
    return c.json({ error: 'Failed to create post' }, 500)
  }
})

// Get all posts (with optional category filter)
app.get('/make-server-3134d39c/posts', async (c) => {
  try {
    const category = c.req.query('category')
    // getByPrefix already returns an array of values directly
    let posts = await kv.getByPrefix('posts:') || []
    
    // Filter out null/undefined posts and ensure they're valid objects
    posts = posts.filter(post => post && typeof post === 'object')
    
    if (category && category !== 'all') {
      posts = posts.filter(post => post.category === category)
    }

    // Sort by timestamp (newest first)
    posts.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return timeB - timeA
    })

    return c.json({ posts })
  } catch (error) {
    console.log(`Get posts error: ${error}`)
    return c.json({ error: 'Failed to get posts', details: error.message || String(error) }, 500)
  }
})

// Upvote a post
app.post('/make-server-3134d39c/posts/:postId/upvote', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postId = c.req.param('postId')
    const upvoteKey = `upvotes:${postId}:${user.id}`
    
    const hasUpvoted = await kv.get(upvoteKey)
    
    const post = await kv.get(`posts:${postId}`)
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }

    if (hasUpvoted) {
      // Remove upvote
      await kv.del(upvoteKey)
      post.upvotes = Math.max(0, post.upvotes - 1)
    } else {
      // Add upvote
      await kv.set(upvoteKey, true)
      post.upvotes = (post.upvotes || 0) + 1
    }

    await kv.set(`posts:${postId}`, post)

    return c.json({ success: true, upvotes: post.upvotes, hasUpvoted: !hasUpvoted })
  } catch (error) {
    console.log(`Upvote error: ${error}`)
    return c.json({ error: 'Failed to upvote' }, 500)
  }
})

// Report a post
app.post('/make-server-3134d39c/posts/:postId/report', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postId = c.req.param('postId')
    const reportKey = `reports:${postId}:${user.id}`
    
    const hasReported = await kv.get(reportKey)
    if (hasReported) {
      return c.json({ error: 'Already reported' }, 400)
    }

    await kv.set(reportKey, true)

    const post = await kv.get(`posts:${postId}`)
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }

    post.reportCount = (post.reportCount || 0) + 1
    await kv.set(`posts:${postId}`, post)

    return c.json({ success: true })
  } catch (error) {
    console.log(`Report error: ${error}`)
    return c.json({ error: 'Failed to report' }, 500)
  }
})

// Add comment to a post
app.post('/make-server-3134d39c/posts/:postId/comments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userInfo = await kv.get(`users:${user.id}`)
    const postId = c.req.param('postId')
    const { content } = await c.req.json()

    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const comment = {
      id: commentId,
      postId,
      authorId: user.id,
      authorName: userInfo?.name || 'Anonymous',
      verified: userInfo?.verified || false,
      content,
      timestamp: new Date().toISOString(),
    }

    await kv.set(`comments:${postId}:${commentId}`, comment)

    return c.json({ success: true, comment })
  } catch (error) {
    console.log(`Add comment error: ${error}`)
    return c.json({ error: 'Failed to add comment' }, 500)
  }
})

// Get comments for a post
app.get('/make-server-3134d39c/posts/:postId/comments', async (c) => {
  try {
    const postId = c.req.param('postId')
    // getByPrefix already returns an array of values directly
    const comments = await kv.getByPrefix(`comments:${postId}:`) || []
    comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return c.json({ comments })
  } catch (error) {
    console.log(`Get comments error: ${error}`)
    return c.json({ error: 'Failed to get comments' }, 500)
  }
})

// Get comment count for a post
app.get('/make-server-3134d39c/posts/:postId/comment-count', async (c) => {
  try {
    const postId = c.req.param('postId')
    const comments = await kv.getByPrefix(`comments:${postId}:`) || []
    return c.json({ count: comments.length })
  } catch (error) {
    console.log(`Get comment count error: ${error}`)
    return c.json({ error: 'Failed to get comment count' }, 500)
  }
})

// Delete a post
app.delete('/make-server-3134d39c/posts/:postId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postId = c.req.param('postId')
    const post = await kv.get(`posts:${postId}`)
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }

    const userIsAdmin = await isAdmin(user.id)
    const isOwner = post.authorId === user.id

    if (!userIsAdmin && !isOwner) {
      return c.json({ error: 'Forbidden: You can only delete your own posts' }, 403)
    }

    // Delete post
    await kv.del(`posts:${postId}`)
    
    // Delete all comments for this post
    const comments = await kv.getByPrefix(`comments:${postId}:`) || []
    for (const comment of comments) {
      await kv.del(`comments:${postId}:${comment.id}`)
    }
    
    // Delete all upvotes for this post
    const upvotes = await kv.getByPrefix(`upvotes:${postId}:`) || []
    for (const upvote of upvotes) {
      // Extract user ID from upvote key if needed
      // For now, we'll delete by pattern
    }
    
    // Delete photo from storage if exists
    if (post.photoUrl) {
      try {
        const photoPath = post.photoUrl.split('/').pop()?.split('?')[0]
        if (photoPath) {
          await storageSupabase.storage.from(bucketName).remove([photoPath])
        }
      } catch (err) {
        console.log('Error deleting photo:', err)
      }
    }

    return c.json({ success: true })
  } catch (error) {
    console.log(`Delete post error: ${error}`)
    return c.json({ error: 'Failed to delete post' }, 500)
  }
})

// Delete a comment
app.delete('/make-server-3134d39c/posts/:postId/comments/:commentId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postId = c.req.param('postId')
    const commentId = c.req.param('commentId')
    const comment = await kv.get(`comments:${postId}:${commentId}`)
    
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404)
    }

    const userIsAdmin = await isAdmin(user.id)
    const isOwner = comment.authorId === user.id

    if (!userIsAdmin && !isOwner) {
      return c.json({ error: 'Forbidden: You can only delete your own comments' }, 403)
    }

    await kv.del(`comments:${postId}:${commentId}`)

    return c.json({ success: true })
  } catch (error) {
    console.log(`Delete comment error: ${error}`)
    return c.json({ error: 'Failed to delete comment' }, 500)
  }
})

// Get analytics
app.get('/make-server-3134d39c/analytics', async (c) => {
  try {
    const analytics = await kv.get('analytics') || { totalPosts: 0, verifiedUsers: 0, topSearches: {} }
    return c.json({ analytics })
  } catch (error) {
    console.log(`Get analytics error: ${error}`)
    return c.json({ error: 'Failed to get analytics' }, 500)
  }
})

// Track search
app.post('/make-server-3134d39c/track-search', async (c) => {
  try {
    const { query } = await c.req.json()
    if (!query || query.trim().length === 0) {
      return c.json({ success: true })
    }

    const analytics = await kv.get('analytics') || { totalPosts: 0, verifiedUsers: 0, topSearches: {} }
    analytics.topSearches = analytics.topSearches || {}
    analytics.topSearches[query.toLowerCase()] = (analytics.topSearches[query.toLowerCase()] || 0) + 1
    await kv.set('analytics', analytics)

    return c.json({ success: true })
  } catch (error) {
    console.log(`Track search error: ${error}`)
    return c.json({ error: 'Failed to track search' }, 500)
  }
})

// Check if user has upvoted a post
app.get('/make-server-3134d39c/posts/:postId/upvote-status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ hasUpvoted: false })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ hasUpvoted: false })
    }

    const postId = c.req.param('postId')
    const upvoteKey = `upvotes:${postId}:${user.id}`
    const hasUpvoted = await kv.get(upvoteKey)

    return c.json({ hasUpvoted: !!hasUpvoted })
  } catch (error) {
    console.log(`Get upvote status error: ${error}`)
    return c.json({ hasUpvoted: false })
  }
})

// ============== FORUM ROUTES ==============

// Create a new forum thread
app.post('/make-server-3134d39c/forum/threads', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userInfo = await kv.get(`users:${user.id}`)
    const { title, category, content } = await c.req.json()

    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const thread = {
      id: threadId,
      title,
      category,
      content,
      authorId: user.id,
      authorName: userInfo?.name || 'Anonymous',
      verified: userInfo?.verified || false,
      timestamp: new Date().toISOString(),
      upvotes: 0,
      replyCount: 0,
      lastActivity: new Date().toISOString(),
      solved: false,
    }

    await kv.set(`threads:${threadId}`, thread)

    return c.json({ success: true, thread })
  } catch (error) {
    console.log(`Create thread error: ${error}`)
    return c.json({ error: 'Failed to create thread' }, 500)
  }
})

// Get all forum threads (with optional category filter)
app.get('/make-server-3134d39c/forum/threads', async (c) => {
  try {
    const category = c.req.query('category')
    // getByPrefix already returns an array of values directly
    let threads = await kv.getByPrefix('threads:') || []
    
    if (category && category !== 'all') {
      threads = threads.filter(thread => thread.category === category)
    }

    // Sort by last activity (most recent first)
    threads.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())

    return c.json({ threads })
  } catch (error) {
    console.log(`Get threads error: ${error}`)
    return c.json({ error: 'Failed to get threads' }, 500)
  }
})

// Get a single thread by ID
app.get('/make-server-3134d39c/forum/threads/:threadId', async (c) => {
  try {
    const threadId = c.req.param('threadId')
    const thread = await kv.get(`threads:${threadId}`)
    
    if (!thread) {
      return c.json({ error: 'Thread not found' }, 404)
    }

    return c.json({ thread })
  } catch (error) {
    console.log(`Get thread error: ${error}`)
    return c.json({ error: 'Failed to get thread' }, 500)
  }
})

// Add a reply to a thread
app.post('/make-server-3134d39c/forum/threads/:threadId/replies', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userInfo = await kv.get(`users:${user.id}`)
    const threadId = c.req.param('threadId')
    const { content } = await c.req.json()

    const replyId = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const reply = {
      id: replyId,
      threadId,
      authorId: user.id,
      authorName: userInfo?.name || 'Anonymous',
      verified: userInfo?.verified || false,
      content,
      timestamp: new Date().toISOString(),
      upvotes: 0,
      helpful: false,
    }

    await kv.set(`replies:${threadId}:${replyId}`, reply)

    // Update thread reply count and last activity
    const thread = await kv.get(`threads:${threadId}`)
    if (thread) {
      thread.replyCount = (thread.replyCount || 0) + 1
      thread.lastActivity = new Date().toISOString()
      await kv.set(`threads:${threadId}`, thread)
    }

    return c.json({ success: true, reply })
  } catch (error) {
    console.log(`Add reply error: ${error}`)
    return c.json({ error: 'Failed to add reply' }, 500)
  }
})

// Get replies for a thread
app.get('/make-server-3134d39c/forum/threads/:threadId/replies', async (c) => {
  try {
    const threadId = c.req.param('threadId')
    // getByPrefix already returns an array of values directly
    const replies = await kv.getByPrefix(`replies:${threadId}:`) || []
    replies.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return c.json({ replies })
  } catch (error) {
    console.log(`Get replies error: ${error}`)
    return c.json({ error: 'Failed to get replies' }, 500)
  }
})

// Upvote a thread
app.post('/make-server-3134d39c/forum/threads/:threadId/upvote', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const threadId = c.req.param('threadId')
    const upvoteKey = `thread-upvotes:${threadId}:${user.id}`
    
    const hasUpvoted = await kv.get(upvoteKey)
    
    const thread = await kv.get(`threads:${threadId}`)
    if (!thread) {
      return c.json({ error: 'Thread not found' }, 404)
    }

    if (hasUpvoted) {
      await kv.del(upvoteKey)
      thread.upvotes = Math.max(0, thread.upvotes - 1)
    } else {
      await kv.set(upvoteKey, true)
      thread.upvotes = (thread.upvotes || 0) + 1
    }

    await kv.set(`threads:${threadId}`, thread)

    return c.json({ success: true, upvotes: thread.upvotes, hasUpvoted: !hasUpvoted })
  } catch (error) {
    console.log(`Upvote thread error: ${error}`)
    return c.json({ error: 'Failed to upvote thread' }, 500)
  }
})

// Upvote a reply
app.post('/make-server-3134d39c/forum/replies/:replyId/upvote', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const replyId = c.req.param('replyId')
    const upvoteKey = `reply-upvotes:${replyId}:${user.id}`
    
    const hasUpvoted = await kv.get(upvoteKey)
    
    // Find the reply - search through all replies to find matching ID
    // Replies are stored as replies:${threadId}:${replyId}
    const allReplies = await kv.getByPrefix('replies:') || []
    const reply = allReplies.find(r => r && r.id === replyId)
    
    if (!reply) {
      return c.json({ error: 'Reply not found' }, 404)
    }

    // Reconstruct the key to update it
    const replyKey = `replies:${reply.threadId}:${replyId}`

    if (hasUpvoted) {
      await kv.del(upvoteKey)
      reply.upvotes = Math.max(0, reply.upvotes - 1)
    } else {
      await kv.set(upvoteKey, true)
      reply.upvotes = (reply.upvotes || 0) + 1
    }

    await kv.set(replyKey, reply)

    return c.json({ success: true, upvotes: reply.upvotes, hasUpvoted: !hasUpvoted })
  } catch (error) {
    console.log(`Upvote reply error: ${error}`)
    return c.json({ error: 'Failed to upvote reply' }, 500)
  }
})

// Mark reply as helpful
app.post('/make-server-3134d39c/forum/replies/:replyId/helpful', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const replyId = c.req.param('replyId')
    
    // Find the reply - search through all replies to find matching ID
    const allReplies = await kv.getByPrefix('replies:') || []
    const reply = allReplies.find(r => r && r.id === replyId)
    
    if (!reply) {
      return c.json({ error: 'Reply not found' }, 404)
    }
    
    // Check if user is the thread author
    const thread = await kv.get(`threads:${reply.threadId}`)
    if (!thread || thread.authorId !== user.id) {
      return c.json({ error: 'Only thread author can mark helpful' }, 403)
    }

    reply.helpful = !reply.helpful
    const replyKey = `replies:${reply.threadId}:${replyId}`
    await kv.set(replyKey, reply)

    // Update thread solved status
    if (reply.helpful) {
      thread.solved = true
      await kv.set(`threads:${reply.threadId}`, thread)
    }

    return c.json({ success: true, helpful: reply.helpful })
  } catch (error) {
    console.log(`Mark helpful error: ${error}`)
    return c.json({ error: 'Failed to mark as helpful' }, 500)
  }
})

// Get upvote status for thread
app.get('/make-server-3134d39c/forum/threads/:threadId/upvote-status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ hasUpvoted: false })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ hasUpvoted: false })
    }

    const threadId = c.req.param('threadId')
    const upvoteKey = `thread-upvotes:${threadId}:${user.id}`
    const hasUpvoted = await kv.get(upvoteKey)

    return c.json({ hasUpvoted: !!hasUpvoted })
  } catch (error) {
    console.log(`Get thread upvote status error: ${error}`)
    return c.json({ hasUpvoted: false })
  }
})

// Get upvote status for reply
app.get('/make-server-3134d39c/forum/replies/:replyId/upvote-status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ hasUpvoted: false })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ hasUpvoted: false })
    }

    const replyId = c.req.param('replyId')
    const upvoteKey = `reply-upvotes:${replyId}:${user.id}`
    const hasUpvoted = await kv.get(upvoteKey)

    return c.json({ hasUpvoted: !!hasUpvoted })
  } catch (error) {
    console.log(`Get reply upvote status error: ${error}`)
    return c.json({ hasUpvoted: false })
  }
})

// Delete a thread (admin or owner)
// Delete thread handler
const handleDeleteThread = async (c: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const threadId = c.req.param('threadId')
    const thread = await kv.get(`threads:${threadId}`)
    
    if (!thread) {
      return c.json({ error: 'Thread not found' }, 404)
    }

    const userIsAdmin = await isAdmin(user.id)
    const isOwner = thread.authorId === user.id

    if (!userIsAdmin && !isOwner) {
      return c.json({ error: 'Forbidden: You can only delete your own threads' }, 403)
    }

    // Delete thread
    await kv.del(`threads:${threadId}`)
    
    // Delete all replies for this thread
    const replies = await kv.getByPrefix(`replies:${threadId}:`) || []
    for (const reply of replies) {
      await kv.del(`replies:${threadId}:${reply.id}`)
    }
    
    // Delete all upvotes for this thread
    const upvotes = await kv.getByPrefix(`thread-upvotes:${threadId}:`) || []
    for (const upvote of upvotes) {
      // Upvotes are stored as thread-upvotes:${threadId}:${userId}
      // We'll need to delete them by pattern if needed
    }

    return c.json({ success: true })
  } catch (error) {
    console.log(`Delete thread error: ${error}`)
    return c.json({ error: 'Failed to delete thread' }, 500)
  }
}

// Delete thread - support both route patterns
app.delete('/forum/threads/:threadId', handleDeleteThread)
app.delete('/make-server-3134d39c/forum/threads/:threadId', handleDeleteThread)

// Delete reply handler
const handleDeleteReply = async (c: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const replyId = c.req.param('replyId')
    
    // Find the reply - search through all replies to find matching ID
    const allReplies = await kv.getByPrefix('replies:') || []
    const reply = allReplies.find(r => r && r.id === replyId)
    
    if (!reply) {
      return c.json({ error: 'Reply not found' }, 404)
    }

    const userIsAdmin = await isAdmin(user.id)
    const isOwner = reply.authorId === user.id

    if (!userIsAdmin && !isOwner) {
      return c.json({ error: 'Forbidden: You can only delete your own replies' }, 403)
    }

    // Delete reply
    const replyKey = `replies:${reply.threadId}:${replyId}`
    await kv.del(replyKey)

    // Update thread reply count
    const thread = await kv.get(`threads:${reply.threadId}`)
    if (thread) {
      thread.replyCount = Math.max(0, (thread.replyCount || 0) - 1)
      thread.lastActivity = new Date().toISOString()
      await kv.set(`threads:${reply.threadId}`, thread)
    }

    return c.json({ success: true })
  } catch (error) {
    console.log(`Delete reply error: ${error}`)
    return c.json({ error: 'Failed to delete reply' }, 500)
  }
}

// Delete reply - support both route patterns
app.delete('/forum/replies/:replyId', handleDeleteReply)
app.delete('/make-server-3134d39c/forum/replies/:replyId', handleDeleteReply)

// ============== ADMIN ROUTES ==============

// Handler for getting all users (admin only)
const handleGetAllUsers = async (c: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }

    // Get all users from Supabase Auth first (this is the source of truth)
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.log(`Get auth users error: ${authError}`)
      return c.json({ error: 'Failed to get auth users' }, 500)
    }

    // Get all users from KV store for additional metadata
    const { data: kvData, error: kvError } = await supabase
      .from('kv_store_3134d39c')
      .select('key, value')
      .like('key', 'users:%')

    // Create a map of KV store data for quick lookup
    const kvUserMap = new Map()
    if (kvData && !kvError) {
      kvData.forEach((item) => {
        const userId = item.key.replace('users:', '')
        kvUserMap.set(userId, item.value || {})
      })
    }

    // Combine Auth data with KV store data
    // Start with all auth users, then enrich with KV store data
    const users = authUsers.map((authUser) => {
      const userInfo = kvUserMap.get(authUser.id) || {}
      
      return {
        id: authUser.id,
        email: authUser.email || 'N/A',
        name: userInfo.name || authUser.user_metadata?.name || 'N/A',
        verified: userInfo.verified || authUser.user_metadata?.verified || false,
        admin: userInfo.admin || false,
        createdAt: authUser.created_at || null,
      }
    })

    // Sort by creation date (newest first)
    users.sort((a, b) => {
      if (!a.createdAt) return 1
      if (!b.createdAt) return -1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return c.json({ users })
  } catch (error) {
    console.log(`Get all users error: ${error}`)
    return c.json({ error: 'Failed to get users' }, 500)
  }
}

// Get all users (admin only) - support both route patterns
app.get('/make-server-3134d39c/admin/users', handleGetAllUsers)
app.get('/admin/users', handleGetAllUsers)

// Handler for deleting a user (admin only)
const handleDeleteUser = async (c: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }

    const userId = c.req.param('userId')

    // Prevent deleting yourself
    if (userId === user.id) {
      return c.json({ error: 'Cannot delete your own account' }, 400)
    }

    // Delete user from KV store
    await kv.del(`users:${userId}`)

    // Delete user's posts
    const posts = await kv.getByPrefix('posts:') || []
    const userPosts = posts.filter((post) => post.authorId === userId)
    for (const post of userPosts) {
      await kv.del(`posts:${post.id}`)
      // Delete comments for this post
      const comments = await kv.getByPrefix(`comments:${post.id}:`) || []
      for (const comment of comments) {
        await kv.del(`comments:${post.id}:${comment.id}`)
      }
      // Delete upvotes for this post
      const upvotes = await kv.getByPrefix(`upvotes:${post.id}:`) || []
      for (const upvote of upvotes) {
        // Extract user ID from upvote key if needed
        // For now, we'll just delete the post
      }
    }

    // Delete user's comments
    const allComments = await kv.getByPrefix('comments:') || []
    const userComments = allComments.filter((comment) => comment.authorId === userId)
    for (const comment of userComments) {
      await kv.del(`comments:${comment.postId}:${comment.id}`)
    }

    // Delete user's threads
    const threads = await kv.getByPrefix('threads:') || []
    const userThreads = threads.filter((thread) => thread.authorId === userId)
    for (const thread of userThreads) {
      await kv.del(`threads:${thread.id}`)
      // Delete replies for this thread
      const replies = await kv.getByPrefix(`replies:${thread.id}:`) || []
      for (const reply of replies) {
        await kv.del(`replies:${thread.id}:${reply.id}`)
      }
    }

    // Delete user's replies
    const allReplies = await kv.getByPrefix('replies:') || []
    const userReplies = allReplies.filter((reply) => reply.authorId === userId)
    for (const reply of userReplies) {
      await kv.del(`replies:${reply.threadId}:${reply.id}`)
    }

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.log(`Delete auth user error: ${deleteError}`)
      // Continue even if auth deletion fails, as KV data is already deleted
    }

    return c.json({ success: true })
  } catch (error) {
    console.log(`Delete user error: ${error}`)
    return c.json({ error: 'Failed to delete user' }, 500)
  }
}

// Delete a user (admin only) - support both route patterns
app.delete('/make-server-3134d39c/admin/users/:userId', handleDeleteUser)
app.delete('/admin/users/:userId', handleDeleteUser)

Deno.serve(app.fetch)
