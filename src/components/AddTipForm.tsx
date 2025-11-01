import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { api } from '../utils/api'
import { Upload, X } from 'lucide-react'

interface AddTipFormProps {
  user: any
  onSuccess: () => void
  onLoginRequired: () => void
}

export function AddTipForm({ user, onSuccess, onLoginRequired }: AddTipFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [area, setArea] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState('')
  const [content, setContent] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    { value: 'courses', label: 'Courses' },
    { value: 'food', label: 'Food & Cafés' },
    { value: 'clubs', label: 'Clubs & Bars' },
    { value: 'activities', label: 'Activities & Trips' },
    { value: 'other', label: 'Other' },
  ]

  const neighborhoods = [
    'Centro / Old Town',
    'Gros',
    'Amara',
    'Antiguo',
    'Egia',
    'Other',
  ]

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

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

    setSubmitting(true)

    try {
      const postData: any = {
        title,
        category,
        area: area || null,
        price: price || null,
        rating: rating || null,
        content,
        photoData: photoPreview,
      }

      await api.createPost(postData)
      
      // Reset form
      setTitle('')
      setCategory('')
      setArea('')
      setPrice('')
      setRating('')
      setContent('')
      setPhotoFile(null)
      setPhotoPreview(null)
      
      onSuccess()
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
        <h2 className="mb-6">Add a Tip</h2>

        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              You need to be logged in to add a tip.{' '}
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
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Best pintxos in Old Town"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Neighborhood</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price Range</Label>
              <Select value={price} onValueChange={setPrice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="1">€ (Cheap)</SelectItem>
                  <SelectItem value="2">€€ (Moderate)</SelectItem>
                  <SelectItem value="3">€€€ (Expensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Rate it" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">⭐ 1</SelectItem>
                  <SelectItem value="2">⭐⭐ 2</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description *</Label>
            <Textarea
              id="content"
              placeholder="Share your experience, tips, and recommendations..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo (Optional)</Label>
            {photoPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="photo"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload a photo</span>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting || !user}>
            {submitting ? 'Posting...' : 'Post Tip'}
          </Button>
        </form>
      </div>
    </div>
  )
}
