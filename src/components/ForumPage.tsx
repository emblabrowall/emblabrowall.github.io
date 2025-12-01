import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { MessageSquare, ThumbsUp, CheckCircle2, Search, PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface ForumPageProps {
  user: any
  onLoginRequired: () => void
  onCreateThread: () => void
  onViewThread: (threadId: string) => void
}

export function ForumPage({ user, onLoginRequired, onCreateThread, onViewThread }: ForumPageProps) {
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadThreads()
  }, [filterCategory])

  const loadThreads = async () => {
    setLoading(true)
    try {
      const { threads: fetchedThreads } = await api.getThreads(filterCategory === 'all' ? undefined : filterCategory)
      setThreads(fetchedThreads || [])
    } catch (error) {
      console.error('Error loading threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await api.deleteThread(threadId)
      if (error) {
        toast.error(error || 'Failed to delete thread')
        return
      }
      toast.success('Thread deleted successfully')
      loadThreads()
    } catch (error: any) {
      console.error('Error deleting thread:', error)
      toast.error('Failed to delete thread')
    }
  }

  const filteredThreads = threads.filter((thread) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        thread.title.toLowerCase().includes(query) ||
        thread.content.toLowerCase().includes(query) ||
        thread.authorName.toLowerCase().includes(query)
      )
    }
    return true
  })

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'questions', label: '❓ Questions' },
    { value: 'help', label: '🆘 Help Needed' },
    { value: 'general', label: '💬 General Discussion' },
    { value: 'events', label: '🎉 Events' },
    { value: 'housing', label: '🏠 Housing' },
    { value: 'meetup', label: '🤝 Meetups' },
  ]

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (hours < 48) return 'Yesterday'
    
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="mb-2">💬 Student Forum</h1>
            <p className="text-muted-foreground">Ask questions, share experiences, and help fellow students</p>
          </div>
          <Button onClick={user ? onCreateThread : onLoginRequired} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Thread
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Thread List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading threads...</p>
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {threads.length === 0
              ? 'No threads yet. Start the conversation!'
              : 'No threads match your search.'}
          </p>
          {user && threads.length === 0 && (
            <Button onClick={onCreateThread}>Create First Thread</Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className="w-full bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all hover:-translate-y-0.5 relative group"
            >
              <button
                onClick={() => onViewThread(thread.id)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  {/* Left side - Stats */}
                  <div className="flex flex-col items-center gap-2 text-center min-w-[60px]">
                    <div className="flex items-center gap-1 text-sm">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      <span>{thread.upvotes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{thread.replyCount || 0}</span>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="flex-1">{thread.title}</h3>
                      {thread.solved && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs shrink-0">
                          <CheckCircle2 className="h-3 w-3" />
                          Solved
                        </span>
                      )}
                    </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {thread.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent text-xs">
                      {getCategoryLabel(thread.category)}
                    </span>
                    <span className="flex items-center gap-1">
                      By {thread.authorName}
                      {thread.verified && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                          ✓
                        </span>
                      )}
                    </span>
                    <span>•</span>
                    <span>{formatDate(thread.timestamp)}</span>
                    {thread.lastActivity !== thread.timestamp && (
                      <>
                        <span>•</span>
                        <span className="text-xs">Last activity: {formatDate(thread.lastActivity)}</span>
                      </>
                    )}
                  </div>
                  </div>
                </div>
              </button>
              {/* Delete button for admin or owner */}
              {(user?.admin || user?.id === thread.authorId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteThread(thread.id, e)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete thread"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
