import { Search, BookOpen, Coffee, Music, Plane, PlusCircle, MessageSquare, Sparkles, Trophy, Star, Crown, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { motion } from 'motion/react'
import { ParallaxSection } from './ParallaxSection'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

interface HomePageProps {
  onNavigate: (page: string) => void
  onSearch: (query: string) => void
}

interface Contributor {
  userId: string
  name: string
  verified: boolean
  posts: number
  comments: number
  threads: number
  replies: number
  upvotesReceived: number
  totalScore: number
}

export function HomePage({ onNavigate, onSearch }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loadingContributors, setLoadingContributors] = useState(true)
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null)
  const [expandedContributor, setExpandedContributor] = useState<string | null>(null)

  useEffect(() => {
    loadContributors()
  }, [])

  const loadContributors = async () => {
    setLoadingContributors(true)
    try {
      const { contributors } = await api.getContributors(5)
      setContributors(contributors || [])
    } catch (error) {
      console.error('Error loading contributors:', error)
    } finally {
      setLoadingContributors(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      api.trackSearch(searchQuery)
      onSearch(searchQuery)
    }
  }

  const quickLinks = [
    {
      id: 'forum',
      title: 'Forum',
      description: 'Ask questions and connect with students',
      icon: MessageSquare,
      color: 'from-pink-400 to-rose-400',
    },
    {
      id: 'courses',
      title: 'Courses',
      description: 'Course reviews, ECTS, and workload',
      icon: BookOpen,
      color: 'from-blue-400 to-cyan-400',
    },
    {
      id: 'food',
      title: 'Food & Cafés',
      description: 'Best pintxos, restaurants & coffee spots',
      icon: Coffee,
      color: 'from-orange-400 to-pink-400',
    },
    {
      id: 'clubs',
      title: 'Nightlife',
      description: 'Clubs, bars, music, and student favorites',
      icon: Music,
      color: 'from-purple-400 to-indigo-400',
    },
    {
      id: 'activities',
      title: 'Activities',
      description: 'Padel, hiking, and outdoor activities',
      icon: Plane,
      color: 'from-green-400 to-teal-400',
    },
    {
      id: 'trips',
      title: 'Trips',
      description: 'Day trips to Biarritz, Bilbao, and beyond',
      icon: Plane,
      color: 'from-emerald-400 to-cyan-400',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <ParallaxSection speed={-0.3}>
        <div className="relative rounded-3xl overflow-hidden">
        <div className="relative px-6 py-16 md:px-12 md:py-24 text-center overflow-hidden min-h-[500px]">
          {/* Background Image */}
          <div 
            className="absolute inset-0 w-full h-full object-cover z-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1594305548608-df04461f1b28?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2212)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-[1]"></div>
          
          {/* Animated gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 z-[2]"></div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 z-[3] pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(99, 102, 241, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.4)',
                    '0 0 20px rgba(99, 102, 241, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm text-white/90">Powered by Exchange Students</span>
              </motion.div>
              
              <h1 className="mb-4 text-white drop-shadow-lg">Welcome to Donosti Exchange Guide</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90 drop-shadow-md">
                Your trusted guide to San Sebastián, by exchange students for exchange students
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex gap-2 bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-2xl border border-white/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300">
                <div className="flex-1 flex items-center px-4">
                  <Search className="h-5 w-5 text-gray-400 mr-2" />
                  <Input
                    type="text"
                    placeholder="Search for courses, restaurants, activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button type="submit" className="rounded-full px-8 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Search
                </Button>
              </div>
            </motion.form>
          </div>
        </div>
        </div>
      </ParallaxSection>

      {/* Quick Links */}
      <ParallaxSection speed={0.2}>
        <div>
          <motion.h2
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Explore by Category
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <motion.button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className="group relative bg-white rounded-2xl shadow-sm border border-border p-6 hover:shadow-xl transition-all text-left overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Animated gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
              
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 relative z-10`}
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <link.icon className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="mb-2 relative z-10">{link.title}</h3>
              <p className="text-sm text-muted-foreground relative z-10">{link.description}</p>
              
              {/* Glowing corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-full"></div>
            </motion.button>
          ))}
          </div>
        </div>
      </ParallaxSection>

      {/* CTA Section */}
      <ParallaxSection speed={0.1}>
        <motion.div
          className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 text-center border border-border overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
        </div>
        
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            animate={{
              boxShadow: [
                '0 10px 30px rgba(99, 102, 241, 0.3)',
                '0 10px 40px rgba(139, 92, 246, 0.4)',
                '0 10px 30px rgba(99, 102, 241, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            whileHover={{ rotate: 360, scale: 1.1 }}
          >
            <PlusCircle className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="mb-4">Got a tip to share?</h2>
          <p className="text-muted-foreground mb-6">
            Help future exchange students by sharing your experiences, favorite spots, and insider knowledge
          </p>
          <Button
            size="lg"
            onClick={() => onNavigate('add-tip')}
            className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          >
            Add a Tip
          </Button>
        </div>
        </motion.div>
      </ParallaxSection>

      {/* Highest Contributors */}
      <ParallaxSection speed={0.15}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center">
              <Trophy className="h-5 w-5 text-black" />
            </div>
            <h2>Highest Contributors</h2>
          </div>
          
          {loadingContributors ? (
            <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
              <p className="text-muted-foreground">Loading contributors...</p>
            </div>
          ) : contributors.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
              <p className="text-muted-foreground">No contributors yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {contributors.map((contributor, index) => (
                  <Collapsible
                    key={contributor.userId}
                    open={expandedContributor === contributor.userId}
                    onOpenChange={(open) => setExpandedContributor(open ? contributor.userId : null)}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <CollapsibleTrigger asChild>
                        <motion.div
                          className={`relative flex items-center gap-4 p-4 transition-all cursor-pointer ${
                            index === 0 
                              ? 'bg-gradient-to-r from-yellow-50 via-yellow-100 to-orange-50 border-l-4 border-yellow-500 shadow-md' 
                              : index === 1 
                              ? 'bg-gradient-to-r from-gray-50 via-gray-100 to-slate-50 border-l-4 border-gray-400'
                              : index === 2
                              ? 'bg-gradient-to-r from-orange-50 via-orange-100 to-amber-50 border-l-4 border-orange-400'
                              : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-300'
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          {/* Rank number - Special styling for #1 */}
                          <div 
                            className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${
                              index === 0 
                                ? 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-700 shadow-lg shadow-yellow-500/50 ring-2 ring-yellow-300' 
                                : index === 1
                                ? 'bg-gradient-to-br from-gray-200 to-gray-300 shadow-md border-2 border-gray-400'
                                : index === 2
                                ? 'bg-gradient-to-br from-orange-200 to-orange-300 shadow-md border-2 border-orange-400'
                                : 'bg-gray-200 border-2 border-gray-300'
                            }`}
                          >
                            <span className="text-black text-3xl font-black leading-none">
                              {index + 1}
                            </span>
                          </div>
                          
                          {/* Name and info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-lg ${
                                index === 0 ? 'text-yellow-900' : index === 1 ? 'text-gray-800' : index === 2 ? 'text-orange-900' : 'text-gray-800'
                              }`}>
                                {contributor.name}
                                {index === 0 && (
                                  <span className="ml-2 text-yellow-600">⭐</span>
                                )}
                              </span>
                              {contributor.verified && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-300">
                                  <Star className="h-3 w-3 mr-1 fill-blue-600" />
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Score - Nintendo style */}
                          <div className="flex-shrink-0 text-right mr-2">
                            <div className={`text-2xl font-black ${
                              index === 0 
                                ? 'text-yellow-700' 
                                : index === 1 
                                ? 'text-gray-700'
                                : index === 2
                                ? 'text-orange-700'
                                : 'text-gray-700'
                            }`}>
                              {contributor.totalScore}
                            </div>
                            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                              PTS
                            </div>
                          </div>
                          
                          {/* Dropdown indicator */}
                          <div className="flex-shrink-0">
                            {expandedContributor === contributor.userId ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </motion.div>
                      </CollapsibleTrigger>
                      
                      {/* Expanded content */}
                      <CollapsibleContent>
                        <div className={`px-4 pb-4 pt-2 ${
                          index === 0 
                            ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50' 
                            : index === 1 
                            ? 'bg-gray-50/50'
                            : index === 2
                            ? 'bg-orange-50/50'
                            : 'bg-gray-50/30'
                        }`}>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <span className="font-medium text-sm">Posts:</span>
                              <span className="text-lg font-bold text-blue-600">{contributor.posts}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <span className="font-medium text-sm">Comments:</span>
                              <span className="text-lg font-bold text-purple-600">{contributor.comments}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <span className="font-medium text-sm">Threads:</span>
                              <span className="text-lg font-bold text-pink-600">{contributor.threads}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <span className="font-medium text-sm">Replies:</span>
                              <span className="text-lg font-bold text-indigo-600">{contributor.replies}</span>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </motion.div>
                  </Collapsible>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </ParallaxSection>

      {/* Info Cards */}
      <ParallaxSection speed={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            emoji: '🎓',
            title: 'By Students',
            description: 'All tips come from real exchange students who have experienced Donosti firsthand',
          },
          {
            emoji: '💬',
            title: 'Active Forum',
            description: 'Ask questions, find roommates, and get help from fellow students in real-time',
          },
          {
            emoji: '✓',
            title: 'Verified Content',
            description: 'Look for the verified badge to see content from confirmed students',
          },
        ].map((card, index) => (
          <motion.div
            key={card.title}
            className="relative bg-white rounded-2xl shadow-sm border border-border p-6 overflow-hidden group hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            <h3 className="mb-3">{card.emoji} {card.title}</h3>
            <p className="text-sm text-muted-foreground">
              {card.description}
            </p>
          </motion.div>
        ))}
        </div>
      </ParallaxSection>

      {/* Contributor Details Dialog */}
      <Dialog open={!!selectedContributor} onOpenChange={(open) => !open && setSelectedContributor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedContributor && (
                <>
                  {contributors.findIndex(c => c.userId === selectedContributor.userId) === 0 && (
                    <Crown className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  )}
                  {selectedContributor.name}
                  {selectedContributor.verified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedContributor && (
            <div className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Posts:</span>
                  <span className="text-lg font-semibold">{selectedContributor.posts}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Comments:</span>
                  <span className="text-lg font-semibold">{selectedContributor.comments}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <span className="font-medium">Threads:</span>
                  <span className="text-lg font-semibold">{selectedContributor.threads}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <span className="font-medium">Replies:</span>
                  <span className="text-lg font-semibold">{selectedContributor.replies}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <span className="text-lg font-semibold">Total Score</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {selectedContributor.totalScore}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
