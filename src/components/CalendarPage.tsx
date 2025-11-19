import React, { useEffect, useState } from 'react'
import { Calendar } from './ui/calendar'
import { Button } from './ui/button'
import { Plus, MapPin, Clock } from 'lucide-react'
import { api } from '../utils/api'
import { motion } from 'motion/react'
// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  place?: string
  activityType?: string
  content?: string
  authorName: string
}

interface CalendarPageProps {
  user: any
  onLoginRequired: () => void
  onAddEvent: () => void
}

export function CalendarPage({ user, onLoginRequired, onAddEvent }: CalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { posts } = await api.getPosts('calendar')
      // Transform posts to calendar events
      const calendarEvents: CalendarEvent[] = (posts || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        date: post.time || post.timestamp,
        time: post.time,
        place: post.place,
        activityType: post.activityType,
        content: post.content,
        authorName: post.authorName,
      }))
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateKey(date)
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return formatDateKey(eventDate) === dateStr
    })
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  const getDatesWithEvents = () => {
    return events.map(event => {
      const eventDate = new Date(event.date)
      return new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="relative bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8 overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="mb-3">📅 Calendar</h1>
            <p className="text-muted-foreground">
              View upcoming trips, activities, and important dates
            </p>
          </div>
          {user && (
            <Button
              onClick={onAddEvent}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-border p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={{
              hasEvents: getDatesWithEvents(),
            }}
            modifiersClassNames={{
              hasEvents: 'bg-blue-100 text-blue-700 font-semibold',
            }}
            className="rounded-md"
          />
        </motion.div>

        {/* Events for selected date */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="mb-4">
            {formatDate(selectedDate)}
          </h3>
          
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading events...</p>
          ) : selectedDateEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No events scheduled for this date
              </p>
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddEvent}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className="p-4 rounded-lg border border-border bg-gradient-to-r from-blue-50/50 to-purple-50/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="font-semibold mb-2">{event.title}</h4>
                  {event.time && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                  )}
                  {event.place && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      {event.place}
                    </div>
                  )}
                  {event.content && (
                    <p className="text-sm text-muted-foreground mt-2">{event.content}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    By {event.authorName}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-border p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="mb-4">Upcoming Events</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events
              .filter(event => new Date(event.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 6)
              .map((event) => (
                <motion.div
                  key={event.id}
                  className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDateShort(new Date(event.date))}
                    </span>
                  </div>
                  {event.place && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.place}
                    </p>
                  )}
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

