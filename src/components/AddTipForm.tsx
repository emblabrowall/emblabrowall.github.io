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
  onSuccess: (category: string) => void
  onLoginRequired: () => void
}

export function AddTipForm({ user, onSuccess, onLoginRequired }: AddTipFormProps) {
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Common fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [area, setArea] = useState('')

  // Courses fields
  const [year, setYear] = useState('')
  const [semester, setSemester] = useState('')
  const [ects, setEcts] = useState('')
  const [onlineOrCampus, setOnlineOrCampus] = useState('')
  const [examinationType, setExaminationType] = useState('')
  const [workload, setWorkload] = useState('')
  const [overallScore, setOverallScore] = useState('')

  // Food fields
  const [restaurantName, setRestaurantName] = useState('')
  const [price, setPrice] = useState('')
  const [foodCategory, setFoodCategory] = useState('')
  const [atmosphereRating, setAtmosphereRating] = useState('')
  const [foodRating, setFoodRating] = useState('')

  // Nightlife/Clubs fields
  const [name, setName] = useState('')
  const [musicStyle, setMusicStyle] = useState('')
  const [type, setType] = useState('')
  const [entrancePrice, setEntrancePrice] = useState('')
  const [overallRating, setOverallRating] = useState('')

  // Activities fields
  const [activityName, setActivityName] = useState('')
  const [activityPrice, setActivityPrice] = useState('')
  const [location, setLocation] = useState('')
  const [activityRating, setActivityRating] = useState('')

  // Trips fields
  const [cityName, setCityName] = useState('')
  const [travelType, setTravelType] = useState('')
  const [travelTime, setTravelTime] = useState('')
  const [tripPrice, setTripPrice] = useState('')
  const [tripRating, setTripRating] = useState('')

  // Calendar fields (will be added later if needed)
  const [calendarData, setCalendarData] = useState('')

  const categories = [
    { value: 'courses', label: 'Courses' },
    { value: 'food', label: 'Food & Cafés' },
    { value: 'clubs', label: 'Nightlife' },
    { value: 'activities', label: 'Activities' },
    { value: 'trips', label: 'Trips' },
    { value: 'calendar', label: 'Calendar' },
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

  const resetForm = () => {
    setTitle('')
    setContent('')
    setArea('')
    setYear('')
    setSemester('')
    setEcts('')
    setOnlineOrCampus('')
    setExaminationType('')
    setWorkload('')
    setOverallScore('')
    setRestaurantName('')
    setPrice('')
    setFoodCategory('')
    setAtmosphereRating('')
    setFoodRating('')
    setName('')
    setMusicStyle('')
    setType('')
    setEntrancePrice('')
    setOverallRating('')
    setActivityName('')
    setActivityPrice('')
    setLocation('')
    setActivityRating('')
    setCityName('')
    setTravelType('')
    setTravelTime('')
    setTripPrice('')
    setTripRating('')
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
        title: category === 'courses' ? title : 
              category === 'food' ? restaurantName :
              category === 'clubs' ? name :
              category === 'activities' ? activityName :
              category === 'trips' ? cityName : title,
        category,
        content,
        photoData: photoPreview,
        area: area || null,
      }

      // Add category-specific fields
      if (category === 'courses') {
        postData.year = year || null
        postData.semester = semester || null
        postData.ects = ects || null
        postData.onlineOrCampus = onlineOrCampus || null
        postData.examinationType = examinationType || null
        postData.workload = workload || null
        postData.overallScore = overallScore || null
      } else if (category === 'food') {
        postData.price = price || null
        postData.foodCategory = foodCategory || null
        postData.atmosphereRating = atmosphereRating || null
        postData.foodRating = foodRating || null
      } else if (category === 'clubs') {
        postData.musicStyle = musicStyle || null
        postData.type = type || null
        postData.entrancePrice = entrancePrice || null
        postData.overallRating = overallRating || null
      } else if (category === 'activities') {
        postData.price = activityPrice || null
        postData.location = location || null
        postData.overallRating = activityRating || null
      } else if (category === 'trips') {
        postData.travelType = travelType || null
        postData.travelTime = travelTime || null
        postData.price = tripPrice || null
        postData.overallRating = tripRating || null
      }

      await api.createPost(postData)
      
      const submittedCategory = category
      resetForm()
      setCategory('')
      
      onSuccess(submittedCategory)
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  const renderCategoryFields = () => {
    switch (category) {
      case 'courses':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  placeholder="e.g., Year 1, 2, 3, 4, 5, 6..."
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select value={semester} onValueChange={setSemester} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ects">ECTS</Label>
                <Input
                  id="ects"
                  type="number"
                  placeholder="e.g., 6"
                  value={ects}
                  onChange={(e) => setEcts(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onlineOrCampus">Online or On Campus *</Label>
                <Select value={onlineOrCampus} onValueChange={setOnlineOrCampus} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="campus">On Campus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="examinationType">Examination Type *</Label>
              <Select value={examinationType} onValueChange={setExaminationType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select examination type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seminars">Seminars</SelectItem>
                  <SelectItem value="written-assignments">Written Assignments</SelectItem>
                  <SelectItem value="exams">Exams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workload">Workload (1-5) *</Label>
                <Select value={workload} onValueChange={setWorkload} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workload" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Light</SelectItem>
                    <SelectItem value="2">2 - Light</SelectItem>
                    <SelectItem value="3">3 - Moderate</SelectItem>
                    <SelectItem value="4">4 - Heavy</SelectItem>
                    <SelectItem value="5">5 - Very Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="overallScore">Overall Score (1-5) *</Label>
                <Select value={overallScore} onValueChange={setOverallScore} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select score" />
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
          </>
        )

      case 'food':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Name of Restaurant/Café *</Label>
              <Input
                id="restaurantName"
                placeholder="e.g., La Cuchara de San Telmo"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
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
                <Label htmlFor="area">Area</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="foodCategory">Food Category *</Label>
              <Select value={foodCategory} onValueChange={setFoodCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select food category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="seafood">Seafood</SelectItem>
                  <SelectItem value="pintxos">Pintxos</SelectItem>
                  <SelectItem value="brunch">Brunch</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="burgers">Burgers</SelectItem>
                  <SelectItem value="grill">Grill</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="study-spot">Study Spot</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="atmosphereRating">Atmosphere Rating (1-5) *</Label>
                <Select value={atmosphereRating} onValueChange={setAtmosphereRating} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
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
              <div className="space-y-2">
                <Label htmlFor="foodRating">Food Rating (1-5) *</Label>
                <Select value={foodRating} onValueChange={setFoodRating} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
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
          </>
        )

      case 'clubs':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Bataplan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
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
                <Label htmlFor="musicStyle">Music Style</Label>
                <Input
                  id="musicStyle"
                  placeholder="e.g., Electronic, Pop, Rock"
                  value={musicStyle}
                  onChange={(e) => setMusicStyle(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entrancePrice">Entrance Price</Label>
                <Input
                  id="entrancePrice"
                  type="number"
                  placeholder="e.g., 10"
                  value={entrancePrice}
                  onChange={(e) => setEntrancePrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="overallRating">Overall Rating (1-5) *</Label>
              <Select value={overallRating} onValueChange={setOverallRating} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
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
          </>
        )

      case 'activities':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="activityName">Name / Type of Activity *</Label>
              <Input
                id="activityName"
                placeholder="e.g., Hiking, Padel, Surfing"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activityPrice">Price</Label>
                <Input
                  id="activityPrice"
                  type="number"
                  placeholder="e.g., 15"
                  value={activityPrice}
                  onChange={(e) => setActivityPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location/Area</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {neighborhoods.map((neighborhood) => (
                      <SelectItem key={neighborhood} value={neighborhood}>
                        {neighborhood}
                      </SelectItem>
                    ))}
                    <SelectItem value="outside-donosti">Outside Donosti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityRating">Overall Rating (1-5) *</Label>
              <Select value={activityRating} onValueChange={setActivityRating} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
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
          </>
        )

      case 'trips':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="cityName">Name of the City *</Label>
              <Input
                id="cityName"
                placeholder="e.g., Bilbao, Biarritz, San Sebastián"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="travelType">Travel Type *</Label>
                <Select value={travelType} onValueChange={setTravelType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="plane">Plane</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="travelTime">Travel Time</Label>
                <Input
                  id="travelTime"
                  placeholder="e.g., 2 hours, 45 minutes"
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tripPrice">Price</Label>
                <Input
                  id="tripPrice"
                  type="number"
                  placeholder="e.g., 25"
                  value={tripPrice}
                  onChange={(e) => setTripPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tripRating">Overall Rating (1-5) *</Label>
                <Select value={tripRating} onValueChange={setTripRating} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
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
          </>
        )

      case 'calendar':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Calendar functionality coming soon! This will allow you to share important dates and events.
            </p>
          </div>
        )

      default:
        return null
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

          {category && (
            <>
              {category !== 'courses' && (
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder={
                      category === 'food' ? 'e.g., Best pintxos in Old Town' :
                      category === 'clubs' ? 'e.g., Bataplan Nightclub' :
                      category === 'activities' ? 'e.g., Hiking in Monte Igueldo' :
                      category === 'trips' ? 'e.g., Day trip to Bilbao' :
                      'Enter a title'
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              )}

              {renderCategoryFields()}

              <div className="space-y-2">
                <Label htmlFor="content">Comment *</Label>
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
            </>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting || !user || !category || category === 'calendar'}>
            {submitting ? 'Posting...' : 'Post Tip'}
          </Button>
        </form>
      </div>
    </div>
  )
}
