import { useState, useEffect } from 'react'
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
  initialCategory?: string
}

export function AddTipForm({ user, onSuccess, onLoginRequired, initialCategory }: AddTipFormProps) {
  const [category, setCategory] = useState(initialCategory || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Common fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [area, setArea] = useState('')

  // Courses fields
  const [courseName, setCourseName] = useState('')
  const [year, setYear] = useState('')
  const [semester, setSemester] = useState('')
  const [ects, setEcts] = useState('')
  const [onlineOrCampus, setOnlineOrCampus] = useState('')
  const [examinationTypes, setExaminationTypes] = useState<string[]>([])
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
const [tripDates, setTripDates] = useState<string[]>([])
const [tripDateInput, setTripDateInput] = useState('')

  const categories = [
    { value: 'courses', label: 'Courses' },
    { value: 'food', label: 'Food & Cafés' },
    { value: 'clubs', label: 'Nightlife' },
    { value: 'activities', label: 'Activities' },
    { value: 'trips', label: 'Trips' },
  ]

  // Update category when initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory)
    }
  }, [initialCategory])

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
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB. Please compress or choose a smaller image.')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.')
        return
      }
      
      setPhotoFile(file)
      setError('') // Clear any previous errors
      const reader = new FileReader()
      reader.onerror = () => {
        setError('Failed to read image file. Please try again.')
        setPhotoFile(null)
        setPhotoPreview(null)
      }
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoPreview(reader.result as string)
        } else {
          setError('Failed to process image. Please try again.')
          setPhotoFile(null)
        }
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
    setCourseName('')
    setYear('')
    setSemester('')
    setEcts('')
    setOnlineOrCampus('')
    setExaminationTypes([])
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
    setTripDates([])
    setTripDateInput('')
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

    if (category === 'trips' && tripDates.length === 0) {
      setError('Please add at least one date for your trip')
      return
    }

    setSubmitting(true)

    try {
      const postData: any = {
        // For courses, use courseName as title. For others, use the title field (required), fall back to name if empty
        title: category === 'courses' ? courseName : 
              (title && title.trim()) ? title.trim() :
              category === 'food' ? (restaurantName || 'Untitled') :
              category === 'clubs' ? (name || 'Untitled') :
              category === 'activities' ? (activityName || 'Untitled') :
              category === 'trips' ? (cityName || 'Untitled') : 
              (title && title.trim()) ? title.trim() : 'Untitled',
        category,
        content,
        photoData: photoPreview,
        area: area || null,
      }

      // Add category-specific fields
      if (category === 'courses') {
        postData.courseName = courseName || null
        postData.year = year || null
        postData.semester = semester || null
        postData.ects = ects || null
        postData.onlineOrCampus = onlineOrCampus || null
        postData.examinationType = examinationTypes.length > 0 ? examinationTypes : null
        postData.workload = workload || null
        postData.overallScore = overallScore || null
      } else if (category === 'food') {
        postData.restaurantName = restaurantName || null
        postData.price = price || null
        postData.foodCategory = foodCategory || null
        postData.atmosphereRating = atmosphereRating || null
        postData.foodRating = foodRating || null
      } else if (category === 'clubs') {
        postData.name = name || null
        postData.musicStyle = musicStyle || null
        postData.type = type || null
        postData.price = entrancePrice || null
        postData.overallRating = overallRating || null
      } else if (category === 'activities') {
        postData.activityName = activityName || null
        postData.price = activityPrice || null
        postData.location = location || null
        postData.overallRating = activityRating || null
      } else if (category === 'trips') {
        postData.cityName = cityName || null
        postData.travelType = travelType || null
        postData.travelTime = travelTime || null
        postData.price = tripPrice || null
        postData.overallRating = tripRating || null
        postData.tripDates = tripDates
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
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                placeholder="e.g., Introduction to Computer Science"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['seminars', 'written-assignments', 'exams'].map((type) => {
                  const displayName =
                    type === 'written-assignments'
                      ? 'Written Assignments'
                      : type === 'seminars'
                      ? 'Seminars'
                      : 'Exams'
                  const isChecked = examinationTypes.includes(type)
                  return (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        id={`exam-${type}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExaminationTypes([...examinationTypes, type])
                          } else {
                            setExaminationTypes(
                              examinationTypes.filter((t) => t !== type),
                            )
                          }
                        }}
                      />
                      <Label
                        htmlFor={`exam-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {displayName}
                      </Label>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                You can select multiple examination types, for example both exam and seminar.
              </p>
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
                <Select value={entrancePrice} onValueChange={setEntrancePrice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="cheap">€ (Cheap)</SelectItem>
                    <SelectItem value="moderate">€€ (Moderate)</SelectItem>
                    <SelectItem value="expensive">€€€ (Expensive)</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={activityPrice} onValueChange={setActivityPrice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="cheap">€ (Cheap)</SelectItem>
                    <SelectItem value="moderate">€€ (Moderate)</SelectItem>
                    <SelectItem value="expensive">€€€ (Expensive)</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={tripPrice} onValueChange={setTripPrice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="cheap">€ (Cheap)</SelectItem>
                    <SelectItem value="moderate">€€ (Moderate)</SelectItem>
                    <SelectItem value="expensive">€€€ (Expensive)</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="space-y-2">
              <Label htmlFor="tripDate">Trip Dates *</Label>
              <div className="flex gap-2">
                <Input
                  id="tripDate"
                  type="date"
                  value={tripDateInput}
                  onChange={(e) => setTripDateInput(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (tripDateInput && !tripDates.includes(tripDateInput)) {
                      setTripDates([...tripDates, tripDateInput])
                      setTripDateInput('')
                    }
                  }}
                >
                  Add date
                </Button>
              </div>
              {tripDates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {tripDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setTripDates(tripDates.filter((d) => d !== date))
                      }
                      className="text-xs px-2 py-1 rounded-full border border-border bg-accent hover:bg-accent/70"
                      title="Click to remove"
                    >
                      {date}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                You can add one or more dates – each date will appear as a separate entry in the calendar.
              </p>
            </div>
          </>
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
                  <p className="text-xs text-muted-foreground">
                    {title.length > 0 ? `${title.length} characters` : 'Enter a descriptive title'}
                  </p>
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

          <Button type="submit" className="w-full" disabled={submitting || !user || !category}>
            {submitting ? 'Posting...' : 'Post Tip'}
          </Button>
        </form>
      </div>
    </div>
  )
}
