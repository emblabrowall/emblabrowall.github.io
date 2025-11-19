import { Button } from './ui/button'
import { Menu, X, LogOut, User, Zap, Calendar } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  user: any
  onLoginClick: () => void
  onLogout: () => void
}

export function Navigation({ currentPage, onPageChange, user, onLoginClick, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'forum', label: 'Forum' },
    { id: 'courses', label: 'Courses' },
    { id: 'food', label: 'Food & Cafés' },
    { id: 'clubs', label: 'Nightlife' },
    { id: 'activities', label: 'Activities' },
    { id: 'trips', label: 'Trips' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'about', label: 'About' },
  ]

  const handleNavClick = (page: string) => {
    onPageChange(page)
    setMobileMenuOpen(false)
  }

  return (
    <motion.nav
      className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg"
              animate={{
                boxShadow: [
                  '0 4px 15px rgba(99, 102, 241, 0.3)',
                  '0 4px 20px rgba(139, 92, 246, 0.4)',
                  '0 4px 15px rgba(99, 102, 241, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="h-4 w-4 text-white" />
            </motion.div>
            <span className="hidden sm:inline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Donosti Exchange
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3 py-2 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'text-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  {item.label}
                  {currentPage === item.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      layoutId="activeNav"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Calendar Icon */}
            <motion.button
              onClick={() => onPageChange('calendar')}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 'calendar'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'hover:bg-accent/50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Calendar"
            >
              <Calendar className="h-5 w-5" />
            </motion.button>
            {user ? (
              <>
                <motion.div
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{user.name}</span>
                  {user.verified && (
                    <motion.span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 border border-blue-300"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      ✓ Verified
                    </motion.span>
                  )}
                </motion.div>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Button
                  onClick={onLoginClick}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                >
                  Log In
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden py-4 border-t border-border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-1">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
                <motion.button
                  onClick={() => handleNavClick('calendar')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-2 ${
                    currentPage === 'calendar'
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </div>
                </motion.button>
                <motion.div
                  className="pt-4 border-t border-border mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg mb-2">
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                        {user.verified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <Button variant="outline" className="w-full" onClick={onLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={onLoginClick}>
                      Log In
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
