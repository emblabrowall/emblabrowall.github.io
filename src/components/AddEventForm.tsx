import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { X } from 'lucide-react'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'
import { motion } from 'motion/react'

interface AddEventFormProps {
  user: any
  onSuccess: () => void
  onCancel: () => void
  onLoginRequired: () => void
}

export function AddEventForm({ user, onSuccess, onCancel, onLoginRequired }: AddEventFormProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      onLoginRequired()
      return
    }

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!date) {
      toast.error('Please select a date')
      return
    }

    // Validate date is not in the past
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      toast.error('Please select a date that is today or in the future')
      return
    }

    setLoading(true)
    try {
      await api.createEvent(title.trim(), date, info.trim())
      toast.success('Event created successfully! 🎉')
      onSuccess()
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast.error(error.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold">Create Event</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Welcome Party, Study Session, Trip to Bilbao"
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
            />
            <p className="text-xs text-muted-foreground">
              Select a date for this event
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="info">Event Information</Label>
            <Textarea
              id="info"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Add details about the event: location, time, what to bring, etc."
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {info.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

