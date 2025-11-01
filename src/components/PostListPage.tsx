import { useEffect, useState } from 'react'
import { PostCard } from './PostCard'
import { api } from '../utils/api'
import { Filter, Search, Sparkles } from 'lucide-react'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { motion } from 'motion/react'

interface PostListPageProps {
  category: string
  title: string
  description: string
  user: any
  onLoginRequired: () => void
  searchQuery?: string
}

export function PostListPage({ 
  category, 
  title, 
  description, 
  user, 
  onLoginRequired,
  searchQuery = '' 
}: PostListPageProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterArea, setFilterArea] = useState('all')
  const [filterPrice, setFilterPrice] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  useEffect(() => {
    loadPosts()
  }, [category])

  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const { posts: fetchedPosts } = await api.getPosts(category)
      setPosts(fetchedPosts || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter((post) => {
    // Search filter
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase()
      const matchesSearch = 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.area && post.area.toLowerCase().includes(query))
      
      if (!matchesSearch) return false
    }

    // Area filter
    if (filterArea !== 'all' && post.area !== filterArea) {
      return false
    }

    // Price filter
    if (filterPrice !== 'all') {
      if (filterPrice === 'free' && post.price !== 'free') return false
      if (filterPrice !== 'free' && post.price !== filterPrice) return false
    }

    // Rating filter
    if (filterRating !== 'all') {
      const minRating = parseInt(filterRating)
      if (!post.rating || post.rating < minRating) return false
    }

    return true
  })

  const neighborhoods = [
    'Centro / Old Town',
    'Gros',
    'Amara',
    'Antiguo',
    'Egia',
    'Other',
  ]

  const semesterOptions = category === 'courses' ? [
    { value: 'all', label: 'All Semesters' },
    { value: 'Fall', label: 'Fall Semester' },
    { value: 'Spring', label: 'Spring Semester' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="relative bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8 overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-full px-3 py-1 mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">{category}</span>
          </motion.div>
          <h1 className="mb-3">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-border p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Filter className="h-5 w-5 text-blue-600" />
          </motion.div>
          <h3>Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search within category */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-9 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </motion.div>

          {/* Area filter */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20 transition-all">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {neighborhoods.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Dynamic filter based on category */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {category === 'food' || category === 'clubs' ? (
              <Select value={filterPrice} onValueChange={setFilterPrice}>
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20 transition-all">
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="1">€ (Cheap)</SelectItem>
                  <SelectItem value="2">€€ (Moderate)</SelectItem>
                  <SelectItem value="3">€€€ (Expensive)</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20 transition-all">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
            )}
          </motion.div>
        </div>

        {/* Active filters count */}
        {(filterArea !== 'all' || filterPrice !== 'all' || filterRating !== 'all' || localSearchQuery) && (
          <motion.div
            className="mt-4 flex items-center gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-muted-foreground">
              Showing {filteredPosts.length} of {posts.length} results
            </p>
            <button
              onClick={() => {
                setFilterArea('all')
                setFilterPrice('all')
                setFilterRating('all')
                setLocalSearchQuery('')
              }}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Posts Grid */}
      {loading ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-flex items-center gap-3">
            <motion.div
              className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            ></motion.div>
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        </motion.div>
      ) : filteredPosts.length === 0 ? (
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-muted-foreground mb-4">
            {posts.length === 0 
              ? 'No posts yet in this category. Be the first to share!'
              : 'No posts match your filters. Try adjusting them.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <PostCard
                post={post}
                user={user}
                onLoginRequired={onLoginRequired}
                onPostUpdate={loadPosts}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
