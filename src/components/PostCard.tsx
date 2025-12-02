import { useState, useEffect } from 'react'
import { ThumbsUp, Flag, MessageCircle, MapPin, Sparkle, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { api } from '../utils/api'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { motion, AnimatePresence } from 'motion/react'

interface Comment {
  id: string
  authorId?: string
  authorName: string
  verified: boolean
  content: string
  timestamp: string
}

interface PostCardProps {
  post: any
  user: any
  onLoginRequired: () => void
  onPostUpdate: () => void
}

export function PostCard({ post, user, onLoginRequired, onPostUpdate }: PostCardProps) {
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [upvotes, setUpvotes] = useState(post.upvotes || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState<number | null>(null)
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (user && post.id) {
      checkUpvoteStatus()
    }
    // Load comment count on mount
    loadCommentCount()
  }, [user, post.id])

  const loadCommentCount = async () => {
    try {
      const { count } = await api.getCommentCount(post.id)
      setCommentCount(count)
    } catch (error) {
      console.error('Error loading comment count:', error)
    }
  }

  const checkUpvoteStatus = async () => {
    try {
      const { hasUpvoted } = await api.getUpvoteStatus(post.id)
      setHasUpvoted(hasUpvoted)
    } catch (error) {
      console.error('Error checking upvote status:', error)
    }
  }

  const handleUpvote = async () => {
    if (!user) {
      onLoginRequired()
      return
    }

    try {
      const result = await api.upvotePost(post.id)
      setHasUpvoted(result.hasUpvoted)
      setUpvotes(result.upvotes)
    } catch (error) {
      console.error('Error upvoting post:', error)
    }
  }

  const handleReport = async () => {
    if (!user) {
      onLoginRequired()
      return
    }

    if (confirm('Are you sure you want to report this post?')) {
      try {
        await api.reportPost(post.id)
        alert('Post reported. Moderators will review it.')
      } catch (error: any) {
        alert(error.error || 'Failed to report post')
      }
    }
  }

  const handleDeletePost = async () => {
    if (!user) {
      onLoginRequired()
      return
    }

    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await api.deletePost(post.id)
        onPostUpdate()
      } catch (error: any) {
        alert(error.error || 'Failed to delete post')
      }
    }
  }


  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments)
      return
    }

    setLoadingComments(true)
    try {
      const { comments: fetchedComments } = await api.getComments(post.id)
      setComments(fetchedComments)
      setCommentCount(fetchedComments.length)
      setShowComments(true)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      onLoginRequired()
      return
    }

    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const { comment } = await api.addComment(post.id, newComment)
      setComments([...comments, comment])
      setCommentCount((commentCount || 0) + 1)
      setNewComment('')
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      onLoginRequired()
      return
    }

    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.deleteComment(post.id, commentId)
        setComments(comments.filter(c => c.id !== commentId))
        setCommentCount(Math.max(0, (commentCount || 0) - 1))
      } catch (error: any) {
        alert(error.error || 'Failed to delete comment')
      }
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getPriceSymbol = (price: string) => {
    if (!price || price === 'free') return 'Free'
    if (price === 'cheap') return 'Cheap'
    if (price === 'moderate') return 'Moderate'
    if (price === 'expensive') return 'Expensive'
    // Fallback for old numeric values - convert to text
    const numPrice = parseInt(price)
    if (numPrice === 0 || isNaN(numPrice)) return 'Free'
    if (numPrice === 1) return 'Cheap'
    if (numPrice === 2) return 'Moderate'
    if (numPrice >= 3) return 'Expensive'
    return 'Moderate'
  }

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating))
  }

  return (
    <motion.div
      className="group relative bg-white rounded-2xl shadow-sm border border-border p-6 hover:shadow-xl transition-all overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      
      {/* Glowing corner on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/0 via-purple-400/0 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full blur-2xl"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <h3 className="mb-2">{post.title}</h3>
          {/* Show name separately if it exists (for food, activities, trips, clubs) */}
          {post.restaurantName && (
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {post.restaurantName}
            </p>
          )}
          {post.activityName && (
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {post.activityName}
            </p>
          )}
          {post.cityName && (
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {post.cityName}
            </p>
          )}
          {post.name && post.category === 'clubs' && (
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {post.name}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <motion.span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50"
              whileHover={{ scale: 1.05 }}
            >
              {post.category === 'food' && post.foodCategory ? post.foodCategory : post.category}
            </motion.span>
            {post.area && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {post.area}
              </span>
            )}
            {post.price && (
              <span className="flex items-center gap-1">
                {getPriceSymbol(post.price)}
              </span>
            )}
            {(post.rating || post.foodRating || post.atmosphereRating || post.overallRating || post.overallScore) && (
              <span>
                {getRatingStars(
                  post.rating || 
                  post.foodRating || 
                  post.atmosphereRating || 
                  post.overallRating || 
                  post.overallScore || 
                  0
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Photo */}
      {post.photoUrl && (
        <motion.div
          className="mb-4 rounded-xl overflow-hidden relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <ImageWithFallback
            src={post.photoUrl}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.div>
      )}

      {/* Content */}
      <p className="text-foreground mb-4 whitespace-pre-wrap relative z-10">{post.content}</p>

      {/* Category-specific Details */}
      {post.category === 'courses' && (
        <div className="mb-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100 relative z-10">
          <h4 className="font-semibold text-sm mb-2 text-blue-900">Course Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {post.year && <div><span className="font-medium">Year:</span> {post.year}</div>}
            {post.semester && <div><span className="font-medium">Semester:</span> {post.semester}</div>}
            {post.ects && <div><span className="font-medium">ECTS:</span> {post.ects}</div>}
            {post.onlineOrCampus && <div><span className="font-medium">Format:</span> {post.onlineOrCampus === 'online' ? 'Online' : 'On Campus'}</div>}
            {post.examinationType && Array.isArray(post.examinationType) && post.examinationType.length > 0 && (
              <div className="col-span-2"><span className="font-medium">Examination:</span> {post.examinationType.map((t: string) => t === 'written-assignments' ? 'Written Assignments' : t === 'seminars' ? 'Seminars' : 'Exams').join(', ')}</div>
            )}
            {post.workload && <div><span className="font-medium">Workload:</span> {post.workload}/5</div>}
            {post.overallScore && <div><span className="font-medium">Overall Score:</span> {getRatingStars(parseFloat(post.overallScore))}</div>}
          </div>
        </div>
      )}

      {post.category === 'food' && (
        <div className="mb-4 p-4 bg-orange-50/50 rounded-lg border border-orange-100 relative z-10">
          <h4 className="font-semibold text-sm mb-2 text-orange-900">Restaurant Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {post.foodCategory && <div><span className="font-medium">Type:</span> {post.foodCategory.charAt(0).toUpperCase() + post.foodCategory.slice(1)}</div>}
            {post.atmosphereRating && <div><span className="font-medium">Atmosphere:</span> {getRatingStars(parseFloat(post.atmosphereRating))}</div>}
            {post.foodRating && <div><span className="font-medium">Food Rating:</span> {getRatingStars(parseFloat(post.foodRating))}</div>}
          </div>
        </div>
      )}

      {post.category === 'clubs' && (
        <div className="mb-4 p-4 bg-purple-50/50 rounded-lg border border-purple-100 relative z-10">
          <h4 className="font-semibold text-sm mb-2 text-purple-900">Venue Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {post.type && <div><span className="font-medium">Type:</span> {post.type.charAt(0).toUpperCase() + post.type.slice(1)}</div>}
            {post.musicStyle && <div><span className="font-medium">Music:</span> {post.musicStyle}</div>}
            {post.price && <div><span className="font-medium">Entrance:</span> {getPriceSymbol(post.price)}</div>}
            {post.overallRating && <div><span className="font-medium">Rating:</span> {getRatingStars(parseFloat(post.overallRating))}</div>}
          </div>
        </div>
      )}

      {post.category === 'activities' && (
        <div className="mb-4 p-4 bg-green-50/50 rounded-lg border border-green-100 relative z-10">
          <h4 className="font-semibold text-sm mb-2 text-green-900">Activity Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {post.location && <div><span className="font-medium">Location:</span> {post.location}</div>}
            {post.price && <div><span className="font-medium">Price:</span> {getPriceSymbol(post.price)}</div>}
            {post.overallRating && <div><span className="font-medium">Rating:</span> {getRatingStars(parseFloat(post.overallRating))}</div>}
          </div>
        </div>
      )}

      {post.category === 'trips' && (
        <div className="mb-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 relative z-10">
          <h4 className="font-semibold text-sm mb-2 text-emerald-900">Trip Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {post.travelType && <div><span className="font-medium">Transport:</span> {post.travelType.charAt(0).toUpperCase() + post.travelType.slice(1)}</div>}
            {post.travelTime && <div><span className="font-medium">Travel Time:</span> {post.travelTime}</div>}
            {post.price && <div><span className="font-medium">Price:</span> {getPriceSymbol(post.price)}</div>}
            {post.overallRating && <div><span className="font-medium">Rating:</span> {getRatingStars(parseFloat(post.overallRating))}</div>}
            {post.tripDates && Array.isArray(post.tripDates) && post.tripDates.length > 0 && (
              <div className="col-span-2"><span className="font-medium">Dates:</span> {post.tripDates.join(', ')}</div>
            )}
          </div>
        </div>
      )}

      {/* Author & Date */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 pb-4 border-b border-border relative z-10">
        <div className="flex items-center gap-2">
          <span>By {post.authorName}</span>
          {post.verified && (
            <motion.span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-300"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Sparkle className="h-3 w-3 mr-1" />
              Verified
            </motion.span>
          )}
        </div>
        <span>{formatDate(post.timestamp)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 relative z-10">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={hasUpvoted ? 'default' : 'outline'}
            size="sm"
            onClick={handleUpvote}
            className={`gap-2 ${hasUpvoted ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}
          >
            <ThumbsUp className="h-4 w-4" />
            {upvotes}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={loadComments}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {commentCount !== null && commentCount > 0 ? commentCount : comments.length > 0 ? comments.length : 'Comment'}
          </Button>
        </motion.div>
        {(user?.id === post.authorId || user?.admin) && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeletePost}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </motion.div>
        )}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={user?.id === post.authorId || user?.admin ? '' : 'ml-auto'}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            Report
          </Button>
        </motion.div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            className="mt-6 pt-6 border-t border-border space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loadingComments ? (
              <p className="text-sm text-muted-foreground">Loading comments...</p>
            ) : (
              <>
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg p-4 border border-blue-100/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{comment.authorName}</span>
                      {comment.verified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                          ✓
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDate(comment.timestamp)}
                      </span>
                      {(user?.id === comment.authorId || user?.admin) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </motion.div>
                ))}

                {/* Add Comment Form */}
                <motion.form
                  onSubmit={handleSubmitComment}
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </motion.form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
