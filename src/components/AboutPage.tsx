import { useEffect, useState } from 'react'
import { Mail, Users, FileText, TrendingUp, MessageCircle, Facebook, Map } from 'lucide-react'
import { Button, buttonVariants } from './ui/button'
import { api } from '../utils/api'
import { cn } from './ui/utils'

export function AboutPage() {
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const { analytics: data } = await api.getAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const topSearches = analytics?.topSearches 
    ? Object.entries(analytics.topSearches)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
    : []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* About Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="mb-6">About Donosti Exchange Guide</h1>
        
        <div className="space-y-4 text-muted-foreground">
          <p>
            Welcome to the <strong>Donosti Exchange Guide</strong> — your go-to resource for making the most of your exchange experience in San Sebastián (Donostia)!
          </p>
          
          <p>
            This platform was created by exchange students, for exchange students. We know what it's like to arrive in a new city, unsure of where to eat, which courses to take, or how to make the most of your time here. That's why we built this guide — to share the collective wisdom of students who've been in your shoes.
          </p>

          <p>
            Whether you're looking for the best pintxos in the Old Town, want to know which courses are worth your time, or need tips on day trips to Biarritz or Bilbao, you'll find trusted recommendations from fellow students right here.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-border">
        <h2 className="mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-4">
          To create a <strong>sustainable, community-driven resource</strong> that grows with each exchange cohort, ensuring that future students benefit from the experiences and insights of those who came before them.
        </p>
        <p className="text-muted-foreground">
          Our new <strong>forum section</strong> makes it even easier to connect with other students in real-time, ask questions, find roommates, organize events, and build lasting friendships during your exchange!
        </p>
      </div>

      {/* Find Your Classroom */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Map className="h-5 w-5 text-orange-600" />
          </div>
          <h2>Find Your Classroom</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Need help finding your classroom on campus? Use the interactive classroom map to locate your classes quickly and easily.
        </p>
        <a
          href="https://www.canva.com/design/DAG5hq9yBeQ/gwWV1Dsmnd97I0Aq3XUCbg/view?utm_content=DAG5hq9yBeQ&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h7775a7c116"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
        >
          <Map className="h-4 w-4" />
          Open Classroom Map
        </a>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl">{analytics.totalPosts || 0}</div>
                <p className="text-sm text-muted-foreground">Total Tips Shared</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-3xl">{analytics.verifiedUsers || 0}</div>
                <p className="text-sm text-muted-foreground">Verified Students</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Searches */}
      {topSearches.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5" />
            <h2>Top Searches</h2>
          </div>
          <div className="space-y-3">
            {topSearches.map(([query, count]: any, index) => (
              <div key={query} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{index + 1}.</span>
                  <span>{query}</span>
                </div>
                <span className="text-sm text-muted-foreground">{count} searches</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Become a Moderator */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
        <h2 className="mb-4">Become Site Owner</h2>
        <p className="text-muted-foreground mb-6">
          Interested in developing the website?
        </p>
        <p className="text-muted-foreground mb-6">
          If you're passionate about helping future exchange students and want to give back to the community, we'd love to hear from you!
        </p>
        <a
          href="mailto:incoming.donostia@deusto.es"
          className={cn(buttonVariants())}
        >
          <Mail className="h-4 w-4 mr-2" />
          Contact Us if Interested!
        </a>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
        <h2 className="mb-4">Contact</h2>
        <p className="text-muted-foreground mb-4">
          Have questions or thoughts about the exchange? Get in touch with the University:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            incoming.donostia@deusto.es
          </Button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-border text-center">
        <p className="text-sm text-muted-foreground">
          🌟 This project is maintained by exchange students and handed over to each new cohort. <br />
          <strong>Data from Exchange 2024/2025</strong>
        </p>
      </div>
    </div>
  )
}
