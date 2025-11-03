import { Search, BookOpen, Coffee, Music, Plane, PlusCircle, MessageSquare, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState } from 'react'
import { api } from '../utils/api'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { motion } from 'motion/react'
import { ParallaxSection } from './ParallaxSection'

interface HomePageProps {
  onNavigate: (page: string) => void
  onSearch: (query: string) => void
}

export function HomePage({ onNavigate, onSearch }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('')

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
      title: 'Clubs & Bars',
      description: 'Nightlife, music, and student favorites',
      icon: Music,
      color: 'from-purple-400 to-indigo-400',
    },
    {
      id: 'activities',
      title: 'Activities & Trips',
      description: 'Padel, hiking, day trips to Biarritz',
      icon: Plane,
      color: 'from-green-400 to-teal-400',
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
    </div>
  )
}
