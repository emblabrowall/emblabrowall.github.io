import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors())
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
    await storageSupabase.storage.createBucket(bucketName, { public: false })
    console.log(`Created bucket: ${bucketName}`)
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

    // Store user info in KV
    await kv.set(`users:${data.user.id}`, {
      email,
      name,
      verified: isVerified,
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
    const { title, category, area, price, rating, content, photoData } = await c.req.json()

    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    let photoUrl = null
    if (photoData) {
      // Upload photo to Supabase Storage
      const photoBuffer = Uint8Array.from(atob(photoData.split(',')[1]), c => c.charCodeAt(0))
      const photoPath = `${postId}.jpg`
      
      const { error: uploadError } = await storageSupabase.storage
        .from(bucketName)
        .upload(photoPath, photoBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (!uploadError) {
        const { data: signedUrlData } = await storageSupabase.storage
          .from(bucketName)
          .createSignedUrl(photoPath, 60 * 60 * 24 * 365) // 1 year
        photoUrl = signedUrlData?.signedUrl
      }
    }

    const post = {
      id: postId,
      title,
      category,
      area,
      price,
      rating: parseFloat(rating),
      content,
      authorId: user.id,
      authorName: userInfo?.name || 'Anonymous',
      verified: userInfo?.verified || false,
      timestamp: new Date().toISOString(),
      photoUrl,
      upvotes: 0,
      reportCount: 0,
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
    const allPosts = await kv.getByPrefix('posts:')
    
    let posts = allPosts.map(item => item.value)
    
    if (category && category !== 'all') {
      posts = posts.filter(post => post.category === category)
    }

    // Sort by timestamp (newest first)
    posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return c.json({ posts })
  } catch (error) {
    console.log(`Get posts error: ${error}`)
    return c.json({ error: 'Failed to get posts' }, 500)
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
    const allComments = await kv.getByPrefix(`comments:${postId}:`)
    
    const comments = allComments.map(item => item.value)
    comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return c.json({ comments })
  } catch (error) {
    console.log(`Get comments error: ${error}`)
    return c.json({ error: 'Failed to get comments' }, 500)
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
    const allThreads = await kv.getByPrefix('threads:')
    
    let threads = allThreads.map(item => item.value)
    
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
    const allReplies = await kv.getByPrefix(`replies:${threadId}:`)
    
    const replies = allReplies.map(item => item.value)
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
    
    // Find the reply
    const allReplies = await kv.getByPrefix('replies:')
    const replyItem = allReplies.find(item => item.value.id === replyId)
    
    if (!replyItem) {
      return c.json({ error: 'Reply not found' }, 404)
    }

    const reply = replyItem.value
    const replyKey = replyItem.key

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
    
    // Find the reply
    const allReplies = await kv.getByPrefix('replies:')
    const replyItem = allReplies.find(item => item.value.id === replyId)
    
    if (!replyItem) {
      return c.json({ error: 'Reply not found' }, 404)
    }

    const reply = replyItem.value
    
    // Check if user is the thread author
    const thread = await kv.get(`threads:${reply.threadId}`)
    if (!thread || thread.authorId !== user.id) {
      return c.json({ error: 'Only thread author can mark helpful' }, 403)
    }

    reply.helpful = !reply.helpful
    await kv.set(replyItem.key, reply)

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

Deno.serve(app.fetch)
