import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { api } from '../utils/api'
import { motion, AnimatePresence } from 'motion/react'
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

const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const getMonthMatrix = (month: Date): Date[][] => {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  const firstOfMonth = new Date(year, monthIndex, 1)
  const firstDayOfWeek = firstOfMonth.getDay() // 0 (Sun) - 6 (Sat)

  const matrix: Date[][] = []
  let current = new Date(year, monthIndex, 1 - firstDayOfWeek)

  for (let week = 0; week < 6; week++) {
    const weekRow: Date[] = []
    for (let day = 0; day < 7; day++) {
      weekRow.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    matrix.push(weekRow)
  }

  return matrix
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  info?: string
  authorName: string
  authorId: string
  verified: boolean
  timestamp: string
}

interface CalendarPageProps {
  user: any
  onLoginRequired: () => void
  onAddEvent: () => void
  onDeleteEvent?: (eventId: string) => void
}

export function CalendarPage({ user, onLoginRequired, onAddEvent, onDeleteEvent }: CalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { events: fetchedEvents } = await api.getEvents()
      setEvents(fetchedEvents || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) {
      onLoginRequired()
      return
    }

    try {
      const result = await api.deleteEvent(eventId)
      if (result.error) {
        console.error('Error deleting event:', result.error)
        return
      }
      // Reload events after deletion
      await loadEvents()
      setExpandedEvent(null)
      if (onDeleteEvent) {
        onDeleteEvent(eventId)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
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

  const datesWithEventsSet = new Set(
    getDatesWithEvents().map((date) => formatDateKey(date))
  )

  const monthMatrix = getMonthMatrix(currentMonth)

  const handleMonthChange = (delta: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1)
    )
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
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
                View upcoming events and important dates
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-muted-foreground">
                Tap a day to see events
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleMonthChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleMonthChange(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Custom month grid */}
          <div className="rounded-xl border border-border p-4 bg-white">
            <div className="flex text-xs font-medium text-muted-foreground mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex-1 text-center tracking-wide">
                  {day}
                </div>
              ))}
            </div>
            <div className="space-y-px bg-border rounded-lg overflow-hidden text-xs">
              {monthMatrix.map((week, weekIndex) => (
                <div key={weekIndex} className="flex bg-white">
                  {week.map((date, dayIndex) => {
                    const key = `${weekIndex}-${dayIndex}`
                    const isCurrentMonth =
                      date.getMonth() === currentMonth.getMonth() &&
                      date.getFullYear() === currentMonth.getFullYear()
                    const dateKey = formatDateKey(date)
                    const isSelected = dateKey === formatDateKey(selectedDate)
                    const hasEvents = datesWithEventsSet.has(dateKey)

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectDate(date)}
                        className={[
                          'flex-1 h-16 flex flex-col items-center justify-start px-1 pt-1',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                          'transition-colors',
                          !isCurrentMonth ? 'text-muted-foreground/40' : '',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{
                          borderRight:
                            dayIndex < week.length - 1
                              ? '1px solid var(--border)'
                              : 'none',
                        }}
                      >
                        <span className="text-xs font-medium">
                          {date.getDate()}
                        </span>
                        {hasEvents && (
                          <div className="mt-auto mb-1 flex items-center justify-center gap-0.5">
                            {getEventsForDate(date).slice(0, 3).map((_, idx) => (
                              <span
                                key={idx}
                                className={`block h-1.5 w-1.5 rounded-full ${
                                  isSelected ? 'bg-primary-foreground' : 'bg-blue-500'
                                }`}
                              />
                            ))}
                            {getEventsForDate(date).length > 3 && (
                              <span className={`text-[8px] font-medium ${
                                isSelected ? 'text-primary-foreground' : 'text-blue-500'
                              }`}>
                                +{getEventsForDate(date).length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Events for selected date */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-border p-6 flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="mb-1 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {formatDateShort(selectedDate)}
          </h3>
          <p className="mb-4 text-base font-semibold">
            {formatDate(selectedDate)}
          </p>
          
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading events...</p>
          ) : selectedDateEvents.length === 0 ? (
            <div className="text-center py-8 flex-1 flex flex-col justify-center">
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
            <div className="space-y-3 overflow-y-auto">
              <AnimatePresence>
                {selectedDateEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="rounded-xl border border-border bg-white shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <button
                      onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                      className="w-full text-left p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1 text-sm truncate">{event.title}</h4>
                          {event.info && (
                            <p className={`text-xs text-muted-foreground ${expandedEvent === event.id ? '' : 'line-clamp-2'}`}>
                              {event.info}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-2">
                            By {event.authorName}
                            {event.verified && (
                              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700">
                                ✓ Verified
                              </span>
                            )}
                          </p>
                        </div>
                        {(user?.id === event.authorId || user?.admin) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Are you sure you want to delete this event?')) {
                                handleDeleteEvent(event.id)
                              }
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </button>
                    {expandedEvent === event.id && event.info && (
                      <motion.div
                        className="px-4 pb-4 border-t border-border bg-accent/30"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="pt-3">
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {event.info}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
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
                  {event.info && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.info}
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

