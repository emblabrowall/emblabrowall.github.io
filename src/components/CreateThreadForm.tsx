import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'
import { ArrowLeft } from 'lucide-react'

interface CreateThreadFormProps {
  user: any
  onSuccess: () => void
  onCancel: () => void
  onLoginRequired: () => void
}

export function CreateThreadForm({ user, onSuccess, onCancel, onLoginRequired }: CreateThreadFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    { value: 'questions', label: '❓ Questions' },
    { value: 'help', label: '🆘 Help Needed' },
    { value: 'general', label: '💬 General Discussion' },
    { value: 'events', label: '🎉 Events' },
    { value: 'housing', label: '🏠 Housing' },
    { value: 'meetup', label: '🤝 Meetups' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      onLoginRequired()
      return
    }

    if (!category) {
      setError('Please select a category')
      return
    }

    if (title.length < 10) {
      setError('Title must be at least 10 characters')
      return
    }

    if (content.length < 20) {
      setError('Description must be at least 20 characters')
      return
    }

    setSubmitting(true)

    try {
      await api.createThread({
        title,
        category,
        content,
      })
      
      toast.success('Thread created successfully! 🎉')
      onSuccess()
    } catch (error: any) {
      console.error('Error creating thread:', error)
      setError(error.message || 'Failed to create thread')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Button variant="outline" onClick={onCancel} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Forum
      </Button>

      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <h1 className="mb-6">Create New Thread</h1>

        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              You need to be logged in to create a thread.{' '}
              <button
                onClick={onLoginRequired}
                className="underline hover:no-underline"
              >
                Log in here
              </button>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Thread Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Looking for roommate in Gros area"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/150 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description *</Label>
            <Textarea
              id="content"
              placeholder="Provide details about your question, request, or discussion topic..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              Be clear and descriptive. Include relevant details to help others understand and respond.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={submitting || !user}>
              {submitting ? 'Creating...' : 'Create Thread'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 pt-8 border-t border-border">
          <h3 className="mb-4">💡 Tips for a great thread</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use a clear, descriptive title that summarizes your question or topic</li>
            <li>• Choose the most appropriate category to help others find your thread</li>
            <li>• Provide enough context and details in your description</li>
            <li>• Be respectful and friendly — we're all here to help each other!</li>
            <li>• If someone helps you, mark their reply as helpful to show appreciation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
