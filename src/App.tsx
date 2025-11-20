import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Navigation } from './components/Navigation'
import { AuthModal } from './components/AuthModal'
import { HomePage } from './components/HomePage'
import { PostListPage } from './components/PostListPage'
import { AddTipForm } from './components/AddTipForm'
import { AboutPage } from './components/AboutPage'
import { ForumPage } from './components/ForumPage'
import { ThreadView } from './components/ThreadView'
import { CreateThreadForm } from './components/CreateThreadForm'
import { CalendarPage } from './components/CalendarPage'
import { CursorTrail } from './components/CursorTrail'
import { SoundEffects } from './components/SoundEffects'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { api } from './utils/api'
import { toast, Toaster } from 'sonner@2.0.3'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState<any>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await api.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    setAuthModalOpen(true)
  }

  const handleLogout = async () => {
    try {
      await api.logout()
      setUser(null)
      toast.success('Logged out successfully')
      setCurrentPage('home')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to log out')
    }
  }

  const handleAuthSuccess = async () => {
    await checkAuth()
    toast.success('Welcome to Donosti Exchange Guide! 🎉')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage('search')
  }

  const handleAddTipSuccess = (category: string) => {
    toast.success('Tip posted successfully! Thank you for contributing! 🙌')
    // Navigate to the category page to see the newly added tip
    setCurrentPage(category)
  }

  const handleViewThread = (threadId: string) => {
    setCurrentThreadId(threadId)
    setCurrentPage('thread-view')
  }

  const handleCreateThread = () => {
    setCurrentPage('create-thread')
  }

  const handleThreadCreated = () => {
    setCurrentPage('forum')
    setCurrentThreadId(null)
  }

  const handleBackToForum = () => {
    setCurrentPage('forum')
    setCurrentThreadId(null)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} onSearch={handleSearch} />
      
      case 'forum':
        return (
          <ForumPage
            user={user}
            onLoginRequired={handleLogin}
            onCreateThread={handleCreateThread}
            onViewThread={handleViewThread}
          />
        )
      
      case 'thread-view':
        return currentThreadId ? (
          <ThreadView
            threadId={currentThreadId}
            user={user}
            onBack={handleBackToForum}
            onLoginRequired={handleLogin}
          />
        ) : (
          <ForumPage
            user={user}
            onLoginRequired={handleLogin}
            onCreateThread={handleCreateThread}
            onViewThread={handleViewThread}
          />
        )
      
      case 'create-thread':
        return (
          <CreateThreadForm
            user={user}
            onSuccess={handleThreadCreated}
            onCancel={handleBackToForum}
            onLoginRequired={handleLogin}
          />
        )
      
      case 'courses':
        return (
          <PostListPage
            category="courses"
            title="📚 Courses"
            description="Course reviews, ECTS credits, workload insights, and grading information from fellow exchange students"
            user={user}
            onLoginRequired={handleLogin}
          />
        )
      
      case 'food':
        return (
          <PostListPage
            category="food"
            title="🍽️ Food & Cafés"
            description="Discover the best pintxos, restaurants, cafés, and student-friendly spots across Donosti"
            user={user}
            onLoginRequired={handleLogin}
          />
        )
      
      case 'clubs':
        return (
          <PostListPage
            category="clubs"
            title="🎉 Nightlife"
            description="Navigate Donosti's nightlife — clubs, bars, opening hours, entry fees, music styles, and pro tips"
            user={user}
            onLoginRequired={handleLogin}
          />
        )
      
      case 'activities':
        return (
          <PostListPage
            category="activities"
            title="🏔️ Activities"
            description="Padel courts, hiking trails, pintxo-pote routes, and outdoor activities in and around Donosti"
            user={user}
            onLoginRequired={handleLogin}
          />
        )
      
      case 'trips':
        return (
          <PostListPage
            category="trips"
            title="✈️ Trips"
            description="Day trips and travel recommendations to Biarritz, Bilbao, and other nearby destinations"
            user={user}
            onLoginRequired={handleLogin}
          />
        )
      
      case 'calendar':
        return (
          <CalendarPage
            user={user}
            onLoginRequired={handleLogin}
            onAddEvent={() => {
              setCurrentPage('add-tip')
              // Pre-select calendar category if possible
            }}
          />
        )
      
      case 'search':
        return (
          <PostListPage
            category="all"
            title="🔍 Search Results"
            description={`Showing results for "${searchQuery}"`}
            user={user}
            onLoginRequired={handleLogin}
            searchQuery={searchQuery}
          />
        )
      
      case 'add-tip':
        return (
          <AddTipForm
            user={user}
            onSuccess={handleAddTipSuccess}
            onLoginRequired={handleLogin}
          />
        )
      
      case 'about':
        return <AboutPage />
      
      default:
        return <HomePage onNavigate={setCurrentPage} onSearch={handleSearch} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        <div className="text-center relative z-10">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 10px 40px rgba(99, 102, 241, 0.4)',
                '0 10px 60px rgba(139, 92, 246, 0.6)',
                '0 10px 40px rgba(99, 102, 241, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="text-white text-3xl">D</span>
          </motion.div>
          <motion.p
            className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading your experience...
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* High-tech effects (cursor trail disabled to use default cursor) */}
      {/* <CursorTrail /> */}
      <SoundEffects enabled={soundEnabled} />
      <KeyboardShortcuts onNavigate={setCurrentPage} />
      
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        user={user}
        onLoginClick={handleLogin}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <Toaster position="top-center" />
      
      {/* Sound toggle button */}
      <motion.button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50 group"
        title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl">{soundEnabled ? '🔊' : '🔇'}</span>
        <span className="absolute bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {soundEnabled ? 'Sounds ON' : 'Sounds OFF'}
        </span>
      </motion.button>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">D</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Donosti Exchange Guide — By students, for students
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button
                onClick={() => setCurrentPage('forum')}
                className="hover:text-foreground transition-colors"
              >
                Forum
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentPage('about')}
                className="hover:text-foreground transition-colors"
              >
                About
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentPage('add-tip')}
                className="hover:text-foreground transition-colors"
              >
                Add a Tip
              </button>
              <span>•</span>
              <span>© 2024/2025</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
