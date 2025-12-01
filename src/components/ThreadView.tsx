import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ThumbsUp, ArrowLeft, CheckCircle2, Award, Trash2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface ThreadViewProps {
  threadId: string
  user: any
  onBack: () => void
  onLoginRequired: () => void
  onThreadDeleted?: () => void
}

interface Reply {
  id: string
  authorId?: string
  authorName: string
  verified: boolean
  content: string
  timestamp: string
  upvotes: number
  helpful: boolean
}

export function ThreadView({ threadId, user, onBack, onLoginRequired, onThreadDeleted }: ThreadViewProps) {
  const [thread, setThread] = useState<any>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReply, setNewReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hasUpvotedThread, setHasUpvotedThread] = useState(false)
  const [upvotedReplies, setUpvotedReplies] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadThread()
    loadReplies()
  }, [threadId])

  useEffect(() => {
    if (user && thread) {
      checkUpvoteStatus()
    }
  }, [user, thread])

  const loadThread = async () => {
    setLoading(true)
    try {
      const { thread: fetchedThread } = await api.getThread(threadId)
      setThread(fetchedThread)
    } catch (error) {
      console.error('Error loading thread:', error)
      toast.error('Failed to load thread')
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async () => {
    try {
      const { replies: fetchedReplies } = await api.getReplies(threadId)
      setReplies(fetchedReplies || [])
      
      // Check upvote status for all replies if user is logged in
      if (user && fetchedReplies) {
        const upvoted = new Set<string>()
        for (const reply of fetchedReplies) {
          const { hasUpvoted } = await api.getReplyUpvoteStatus(reply.id)
          if (hasUpvoted) {
            upvoted.add(reply.id)
          }
        }
        setUpvotedReplies(upvoted)
      }
    } catch (error) {
      console.error('Error loading replies:', error)
    }
  }

  const checkUpvoteStatus = async () => {
    try {
      const { hasUpvoted } = await api.getThreadUpvoteStatus(threadId)
      setHasUpvotedThread(hasUpvoted)
    } catch (error) {
      console.error('Error checking upvote status:', error)
    }
  }

  const handleUpvoteThread = async () => {
    if (!user) {
      onLoginRequired()
      return
    }

    try {
      const result = await api.upvoteThread(threadId)
      setHasUpvotedThread(result.hasUpvoted)
      setThread({ ...thread, upvotes: result.upvotes })
    } catch (error) {
      console.error('Error upvoting thread:', error)
      toast.error('Failed to upvote')
    }
  }

  const handleUpvoteReply = async (replyId: string) => {
    if (!user) {
      onLoginRequired()
      return
    }

    try {
      const result = await api.upvoteReply(replyId)
      
      // Update upvoted set
      const newUpvoted = new Set(upvotedReplies)
      if (result.hasUpvoted) {
        newUpvoted.add(replyId)
      } else {
        newUpvoted.delete(replyId)
      }
      setUpvotedReplies(newUpvoted)

      // Update reply upvotes
      setReplies(replies.map(r => 
        r.id === replyId ? { ...r, upvotes: result.upvotes } : r
      ))
    } catch (error) {
      console.error('Error upvoting reply:', error)
      toast.error('Failed to upvote')
    }
  }

  const handleMarkHelpful = async (replyId: string) => {
    if (!user) {
      onLoginRequired()
      return
    }

    try {
      const result = await api.markReplyHelpful(replyId)
      
      // Update reply
      setReplies(replies.map(r => 
        r.id === replyId ? { ...r, helpful: result.helpful } : r
      ))

      // Update thread solved status
      if (result.helpful) {
        setThread({ ...thread, solved: true })
        toast.success('Marked as helpful answer!')
      } else {
        toast.success('Unmarked as helpful')
      }
    } catch (error: any) {
      console.error('Error marking helpful:', error)
      toast.error(error.error || 'Failed to mark as helpful')
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      onLoginRequired()
      return
    }

    if (!newReply.trim()) return

    setSubmitting(true)
    try {
      const { reply } = await api.addReply(threadId, newReply)
      setReplies([...replies, reply])
      setNewReply('')
      toast.success('Reply posted!')
      
      // Reload thread to update reply count
      loadThread()
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return
    }

    try {
      const result = await api.deleteThread(threadId)
      if (result.error) {
        toast.error(result.error || 'Failed to delete thread')
        console.error('Delete thread error:', result.error)
        return
      }
      toast.success('Thread deleted successfully')
      if (onThreadDeleted) {
        onThreadDeleted()
      } else {
        onBack()
      }
    } catch (error: any) {
      console.error('Error deleting thread:', error)
      toast.error(error?.message || error?.error || 'Failed to delete thread')
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) {
      return
    }

    try {
      const result = await api.deleteReply(replyId)
      if (result.error) {
        toast.error(result.error || 'Failed to delete reply')
        console.error('Delete reply error:', result.error)
        return
      }
      toast.success('Reply deleted successfully')
      setReplies(replies.filter(r => r.id !== replyId))
      loadThread() // Reload to update reply count
    } catch (error: any) {
      console.error('Error deleting reply:', error)
      toast.error(error?.message || error?.error || 'Failed to delete reply')
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || !thread) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading thread...</p>
      </div>
    )
  }

  // Sort replies: helpful first, then by upvotes
  const sortedReplies = [...replies].sort((a, b) => {
    if (a.helpful && !b.helpful) return -1
    if (!a.helpful && b.helpful) return 1
    return b.upvotes - a.upvotes
  })

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Forum
      </Button>

      {/* Thread Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-3">
              <h1 className="flex-1">{thread.title}</h1>
              {thread.solved && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                  Solved
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent">
                {thread.category}
              </span>
              <span className="flex items-center gap-1">
                By {thread.authorName}
                {thread.verified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                    ✓ Verified
                  </span>
                )}
              </span>
              <span>•</span>
              <span>{formatDate(thread.timestamp)}</span>
            </div>

            <p className="text-foreground whitespace-pre-wrap mb-6">{thread.content}</p>

            {/* Thread Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={hasUpvotedThread ? 'default' : 'outline'}
                size="sm"
                onClick={handleUpvoteThread}
                className="gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                {thread.upvotes || 0}
              </Button>
              {(user?.admin || user?.id === thread.authorId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteThread}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Thread
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <h2 className="mb-6">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h2>

        {/* Reply List */}
        <div className="space-y-6 mb-8">
          {sortedReplies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No replies yet. Be the first to help!
            </p>
          ) : (
            sortedReplies.map((reply) => (
              <div
                key={reply.id}
                className={`p-4 rounded-xl border-2 ${
                  reply.helpful
                    ? 'bg-green-50 border-green-200'
                    : 'bg-accent/30 border-border'
                }`}
              >
                {reply.helpful && (
                  <div className="flex items-center gap-2 text-green-700 mb-3">
                    <Award className="h-5 w-5" />
                    <span className="text-sm">Marked as helpful by thread author</span>
                  </div>
                )}

                <div className="flex items-start gap-2 mb-3">
                  <span>{reply.authorName}</span>
                  {reply.verified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                      ✓ Verified
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDate(reply.timestamp)}
                  </span>
                  {(user?.admin || user?.id === reply.authorId) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReply(reply.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete reply"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <p className="text-foreground whitespace-pre-wrap mb-4">{reply.content}</p>

                <div className="flex items-center gap-2">
                  <Button
                    variant={upvotedReplies.has(reply.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpvoteReply(reply.id)}
                    className="gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {reply.upvotes || 0}
                  </Button>

                  {user && thread.authorId === user.id && !thread.solved && (
                    <Button
                      variant={reply.helpful ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkHelpful(reply.id)}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {reply.helpful ? 'Helpful' : 'Mark as Helpful'}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Form */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              You need to be logged in to reply.{' '}
              <button
                onClick={onLoginRequired}
                className="underline hover:no-underline"
              >
                Log in here
              </button>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmitReply} className="space-y-4">
          <Textarea
            placeholder={user ? "Share your thoughts or help..." : "Login to reply"}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            className="min-h-[120px]"
            disabled={!user}
          />
          <Button type="submit" disabled={submitting || !user || !newReply.trim()}>
            {submitting ? 'Posting...' : 'Post Reply'}
          </Button>
        </form>
      </div>
    </div>
  )
}
