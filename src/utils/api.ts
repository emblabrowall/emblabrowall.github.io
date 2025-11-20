import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './supabase/info'

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3134d39c`

export const api = {
  async signup(email: string, password: string, name: string, verificationCode: string) {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name, verificationCode }),
    })
    return response.json()
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  async getCurrentUser() {
    const session = await this.getSession()
    if (!session) return null

    const response = await fetch(`${API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    const data = await response.json()
    return data.user || null
  },

  async verifyUser(code: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ code }),
    })
    return response.json()
  },

  async createPost(postData: any) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(postData),
    })
    return response.json()
  },

  async getPosts(category?: string) {
    const url = category ? `${API_URL}/posts?category=${category}` : `${API_URL}/posts`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    })
    return response.json()
  },

  async upvotePost(postId: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/posts/${postId}/upvote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },

  async reportPost(postId: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/posts/${postId}/report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },

  async addComment(postId: string, content: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ content }),
    })
    return response.json()
  },

  async getComments(postId: string) {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    })
    return response.json()
  },

  async getUpvoteStatus(postId: string) {
    const session = await this.getSession()
    if (!session) return { hasUpvoted: false }

    const response = await fetch(`${API_URL}/posts/${postId}/upvote-status`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },

  async getAnalytics() {
    const response = await fetch(`${API_URL}/analytics`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    })
    return response.json()
  },

  async trackSearch(query: string) {
    await fetch(`${API_URL}/track-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ query }),
    })
  },

  // Forum APIs
  async createThread(threadData: any) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/forum/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(threadData),
    })
    return response.json()
  },

  async getThreads(category?: string) {
    const url = category ? `${API_URL}/forum/threads?category=${category}` : `${API_URL}/forum/threads`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    })
    return response.json()
  },

  async getThread(threadId: string) {
    const response = await fetch(`${API_URL}/forum/threads/${threadId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    })
    return response.json()
  },

  async addReply(threadId: string, content: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/forum/threads/${threadId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ content }),
    })
    return response.json()
  },

  async getReplies(threadId: string) {
    const response = await fetch(`${API_URL}/forum/threads/${threadId}/replies`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    })
    return response.json()
  },

  async upvoteThread(threadId: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/forum/threads/${threadId}/upvote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },

  async upvoteReply(replyId: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/forum/replies/${replyId}/upvote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },

  async markReplyHelpful(replyId: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/forum/replies/${replyId}/helpful`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },

  async getThreadUpvoteStatus(threadId: string) {
    const session = await this.getSession()
    if (!session) return { hasUpvoted: false }

    const response = await fetch(`${API_URL}/forum/threads/${threadId}/upvote-status`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },

  async getReplyUpvoteStatus(replyId: string) {
    const session = await this.getSession()
    if (!session) return { hasUpvoted: false }

    const response = await fetch(`${API_URL}/forum/replies/${replyId}/upvote-status`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },

  async deletePost(postId: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },

  async deleteComment(postId: string, commentId: string) {
    const session = await this.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })
    return response.json()
  },
}
