<template>
  <div>
    <!-- Photo Manager Modal with Embedded Timeline -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 z-50"
    >
      <div class="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] flex flex-col overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-center p-2 border-b">
          <div>
            <h3 class="text-xl font-bold">Photo Manager</h3>
            <p class="text-xs text-gray-600 mt-1">{{ item?.itemDescription }}</p>
            <span class="text-sm">QTY: {{ item?.quantity }} {{ item?.units }}</span
            >|| <span>Start Date:{{ formatDateWithoutTime(item.startDate) }}</span
            >||
            <span>End Date:{{ formatDateWithoutTime(item.endDate) }}</span>
          </div>
          <button @click="close" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Timeline Section -->
        <div class="border-b p-2">
          <div :class="['mb-2 p-1 rounded-lg', timelineStatusClass]">
            <div class="flex items-center gap-2">
              <component :is="timelineStatusIcon" class="w-4 h-4" />
              <span class="text-sm font-medium">{{ timelineStatus.message }}</span>
            </div>
          </div>

          <!-- Timeline Milestones -->
          <div class="relative px-4">
            <div class="flex items-center justify-between relative">
              <template v-for="(milestone, idx) in timelineMilestones" :key="milestone.key">
                <div class="relative flex flex-col items-center z-10">
                  <div
                    :class="[
                      'w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-500 shadow-lg',
                      getMilestoneStyles(milestone.key).node,
                    ]"
                  >
                    <div :class="getMilestoneStyles(milestone.key).icon">
                      <component :is="milestone.icon" class="w-5 h-5" />
                    </div>
                  </div>
                  <div class="mt-3 text-center max-w-30">
                    <p class="text-xs font-semibold text-gray-700 mb-1">{{ milestone.label }}</p>
                    <span
                      :class="[
                        'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                        getMilestoneStyles(milestone.key).badge,
                      ]"
                    >
                      {{ milestone.count }} photo{{ milestone.count !== 1 ? 's' : '' }}
                    </span>
                    <p
                      v-if="timelineStatus[milestone.key] === 'delayed'"
                      class="text-xs text-red-600 font-medium mt-1"
                    >
                      {{ timelineStatus.delayDays }} days
                    </p>
                  </div>
                </div>

                <div v-if="idx < timelineMilestones.length - 1" class="flex-1 h-1 mx-3 relative">
                  <div
                    :class="[
                      'h-full transition-all duration-500 rounded-full',
                      getConnectingLineClass(idx),
                    ]"
                  ></div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Category Tabs -->
        <div class="flex border-b bg-gray-50">
          <button
            v-for="cat in photoCategories"
            :key="cat.key"
            @click="activeCategory = cat.key"
            :class="[
              'flex-1 px-6 py-2 text-sm font-medium transition-colors relative',
              activeCategory === cat.key
                ? 'text-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            <div class="flex items-center justify-center gap-2">
              <component :is="cat.icon" class="w-5 h-5" />
              <span>{{ cat.label }}</span>
              <span class="px-2 py-0.5 text-xs rounded-full bg-gray-200">{{
                item?.[cat.key]?.length || 0
              }}</span>
            </div>
            <div
              v-if="activeCategory === cat.key"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            ></div>
          </button>
        </div>

        <!-- Photo Grid Area -->
        <div class="flex-1 p-2">
          <div class="mb-6">
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handlePhotoUpload"
              class="hidden"
              :id="uploadInputId"
              ref="photoInput"
            />
            <label
              :for="uploadInputId"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload to {{ currentCategoryLabel }}
            </label>
          </div>

          <!-- Work Progress Photos Grouped by Week -->
          <div v-if="activeCategory === 'workCompletionPhoto'">
            <div v-for="(weekData, weekIndex) in groupedWorkPhotos" :key="weekIndex" class="mb-8">
              <!-- Week Header -->
              <div
                class="mb-4 p-3 bg-linear-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded"
              >
                <h4 class="text-lg font-bold text-blue-900">{{ weekData.weekLabel }}</h4>
                <p class="text-sm text-blue-700">{{ weekData.dateRange }}</p>
                <span class="text-xs text-blue-600">{{ weekData.photos.length }} photos</span>
              </div>

              <!-- Week Photos Grid -->
              <div
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6 border-b-2 border-dashed border-gray-300"
              >
                <div v-for="(photo, idx) in weekData.photos" :key="idx" class="relative group">
                  <img
                    :src="resolveImageUrl(photo.url)"
                    :alt="`Photo ${idx + 1}`"
                    loading="lazy"
                    class="w-full h-48 object-cover rounded-lg border shadow-sm cursor-pointer hover:shadow-md"
                    @click="openImageViewer(photo)"
                  />
                  <div
                    class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 p-2 rounded-b-lg"
                  >
                    <p class="text-xs text-white">{{ formatDate(photo.uploadedAt) }}</p>
                  </div>
                  <button
                    @click="deletePhoto(photo)"
                    class="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="groupedWorkPhotos.length === 0" class="text-center py-16 text-gray-400">
              <svg
                class="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p class="text-lg font-medium">No photos yet</p>
            </div>
          </div>

          <!-- Other Categories (Material & Finished) -->
          <div v-else>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div v-for="(photo, idx) in currentPhotos" :key="idx" class="relative group">
                <img
                  :src="resolveImageUrl(photo.url)"
                  :alt="`Photo ${idx + 1}`"
                  loading="lazy"
                  class="w-full h-48 object-cover rounded-lg border shadow-sm cursor-pointer hover:shadow-md"
                  @click="openImageViewer(photo)"
                />
                <div
                  class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 p-2 rounded-b-lg"
                >
                  <p class="text-xs text-white">{{ formatDate(photo.uploadedAt) }}</p>
                </div>
                <button
                  @click="deletePhoto(photo)"
                  class="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="currentPhotos.length === 0" class="text-center py-16 text-gray-400">
              <svg
                class="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p class="text-lg font-medium">No photos yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Viewer -->
    <div
      v-if="imageViewer.open"
      class="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-60"
      @click="imageViewer.open = false"
    >
      <button
        @click="imageViewer.open = false"
        class="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <img
        :src="resolveImageUrl(imageViewer.photo?.url)"
        class="max-w-full max-h-full object-contain"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  lineItemId: {
    type: String,
    required: true,
  },
  itemData: {
    type: Object,
    default: null,
  },
  assetBase: {
    type: String,
    default: 'http://192.168.29.237:7001',
  },
})

// Emits
const emit = defineEmits(['close', 'photos-updated', 'error'])

// State
const item = ref(null)
const activeCategory = ref('materialPhoto')
const photoInput = ref(null)
const imageViewer = ref({ open: false, photo: null })
const uploadInputId = `photo-upload-${Date.now()}`

// Photo categories
const photoCategories = [
  { key: 'materialPhoto', label: 'Material Photos', icon: 'MaterialIcon' },
  { key: 'workCompletionPhoto', label: 'Work Progress', icon: 'WorkIcon' },
  { key: 'finishedPhoto', label: 'Finished Photos', icon: 'FinishedIcon' },
]

// Icon components
const MaterialIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
}

const WorkIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>`,
}

const FinishedIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
}

// Helper function to get Monday of the week
const getMondayOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
  return new Date(d.setDate(diff))
}

// Helper function to get Saturday of the week
const getSaturdayOfWeek = (date) => {
  const monday = getMondayOfWeek(date)
  const saturday = new Date(monday)
  saturday.setDate(monday.getDate() + 5)
  return saturday
}

// Format week range
const formatWeekRange = (monday) => {
  const saturday = getSaturdayOfWeek(monday)

  const formatDate = (d) => {
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  }

  return `${formatDate(monday)} - ${formatDate(saturday)}`
}

// Group work photos by week
const groupedWorkPhotos = computed(() => {
  const workPhotos = item.value?.workCompletionPhoto || []

  if (workPhotos.length === 0) return []

  // Group photos by week
  const weekMap = new Map()

  workPhotos.forEach((photo) => {
    const photoDate = new Date(photo.uploadedAt)
    const monday = getMondayOfWeek(photoDate)
    const weekKey = monday.toISOString().split('T')[0]

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        monday: monday,
        photos: [],
      })
    }

    weekMap.get(weekKey).photos.push(photo)
  })

  // Convert to array and sort by week (newest first)
  const weeks = Array.from(weekMap.entries())
    .map(([key, data]) => ({
      weekKey: key,
      monday: data.monday,
      weekLabel: `Week of ${data.monday.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      dateRange: formatWeekRange(data.monday),
      photos: data.photos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)),
    }))
    .sort((a, b) => b.monday - a.monday)

  return weeks
})

// Timeline milestones
const timelineMilestones = computed(() => [
  {
    key: 'material',
    label: 'Material Delivered',
    icon: 'MaterialIcon',
    count: item.value?.materialPhoto?.length || 0,
  },
  {
    key: 'workProgress',
    label: 'Work Progress',
    icon: 'WorkIcon',
    count: item.value?.workCompletionPhoto?.length || 0,
  },
  {
    key: 'finished',
    label: 'Project Completed',
    icon: 'FinishedIcon',
    count: item.value?.finishedPhoto?.length || 0,
  },
])

// Timeline status
const timelineStatus = computed(() => {
  if (!item.value) {
    return {
      material: 'pending',
      workProgress: 'pending',
      finished: 'pending',
      message: 'No data available',
    }
  }

  const { materialPhoto, workCompletionPhoto, finishedPhoto } = item.value

  if (finishedPhoto?.length > 0) {
    return {
      material: 'complete',
      workProgress: 'complete',
      finished: 'complete',
      message: 'Project completed successfully!',
    }
  }

  const hasMaterial = materialPhoto?.length > 0
  const hasWork = workCompletionPhoto?.length > 0

  if (!hasMaterial) {
    return {
      material: 'pending',
      workProgress: 'pending',
      finished: 'pending',
      message: 'Waiting for material delivery photos',
    }
  }

  const firstMaterialDate = new Date(materialPhoto[0].uploadedAt)
  const today = new Date()
  const daysDiff = Math.floor((today - firstMaterialDate) / (1000 * 60 * 60 * 24))

  if (!hasWork && daysDiff > 7) {
    return {
      material: 'complete',
      workProgress: 'delayed',
      finished: 'pending',
      message: `Work progress delayed by ${daysDiff - 7} days`,
      delayDays: daysDiff,
    }
  }

  if (hasWork) {
    return {
      material: 'complete',
      workProgress: 'complete',
      finished: 'pending',
      message: 'Work in progress - awaiting completion photos',
    }
  }

  return {
    material: 'complete',
    workProgress: 'pending',
    finished: 'pending',
    message: 'Material delivered - work pending',
  }
})

// Current photos
const currentPhotos = computed(() => {
  return item.value?.[activeCategory.value] || []
})

// Current category label
const currentCategoryLabel = computed(() => {
  const category = photoCategories.find((c) => c.key === activeCategory.value)
  return category?.label || ''
})

// Timeline status class
const timelineStatusClass = computed(() => {
  if (timelineStatus.value.finished === 'complete') return 'bg-green-50 border border-green-200'
  if (timelineStatus.value.workProgress === 'delayed') return 'bg-red-50 border border-red-200'
  return 'bg-blue-50 border border-blue-200'
})

// Timeline status icon
const timelineStatusIcon = computed(() => {
  if (timelineStatus.value.workProgress === 'delayed') {
    return {
      template: `<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    }
  }
  if (timelineStatus.value.finished === 'complete') {
    return {
      template: `<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    }
  }
  return {
    template: `<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  }
})

// Methods
const resolveImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${props.assetBase}${url}`
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
const formatDateWithoutTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getMilestoneStyles = (key) => {
  const status = timelineStatus.value[key]
  const styles = {
    complete: {
      node: 'bg-green-500 border-green-600 shadow-green-200',
      icon: 'text-white',
      badge: 'bg-green-100 text-green-700',
    },
    delayed: {
      node: 'bg-red-500 border-red-600 shadow-red-200 animate-pulse',
      icon: 'text-white',
      badge: 'bg-red-100 text-red-700',
    },
    pending: {
      node: 'bg-gray-300 border-gray-400 shadow-gray-200',
      icon: 'text-gray-500',
      badge: 'bg-gray-100 text-gray-600',
    },
  }
  return styles[status] || styles.pending
}

const getConnectingLineClass = (index) => {
  const nextMilestone = timelineMilestones.value[index + 1]
  return timelineStatus.value[nextMilestone.key] === 'complete' ? 'bg-green-500' : 'bg-gray-300'
}

const loadPhotos = async () => {
  try {
    const [materialRes, workRes, finishedRes] = await Promise.all([
      axios.get(`/gateway/api/line-items/${props.lineItemId}/photos`, {
        params: { photoType: 'materialPhoto' },
      }),
      axios.get(`/gateway/api/line-items/${props.lineItemId}/photos`, {
        params: { photoType: 'workCompletionPhoto' },
      }),
      axios.get(`/gateway/api/line-items/${props.lineItemId}/photos`, {
        params: { photoType: 'finishedPhoto' },
      }),
    ])

    item.value = {
      ...props.itemData,
      materialPhoto: materialRes.data.photos,
      workCompletionPhoto: workRes.data.photos,
      finishedPhoto: finishedRes.data.photos,
    }
  } catch (err) {
    emit('error', err.response?.data?.error || 'Failed to load photos')
  }
}

const handlePhotoUpload = async (event) => {
  const files = event.target.files
  if (files.length === 0) return

  const formData = new FormData()
  formData.append('lineItemId', props.lineItemId)
  formData.append('photoType', activeCategory.value)

  for (let i = 0; i < files.length; i++) {
    formData.append('photos', files[i])
  }

  try {
    const response = await axios.post(`/gateway/api/upload/photos`, formData)
    if (response.status === 200) {
      const res = await axios.get(`/gateway/api/line-items/${props.lineItemId}/photos`, {
        params: { photoType: activeCategory.value },
      })
      item.value[activeCategory.value] = res.data.photos
      photoInput.value.value = ''
      emit('photos-updated')
    }
  } catch (err) {
    emit('error', err.response?.data?.error || 'Failed to upload photos')
  }
}

const deletePhoto = async (photo) => {
  if (!confirm('Delete this photo?')) return

  try {
    const response = await axios.delete(`/gateway/api/upload/photos`, {
      data: {
        lineItemId: props.lineItemId,
        photoType: activeCategory.value,
        photoUrl: photo.url,
      },
    })

    if (response.status === 200) {
      const res = await axios.get(`/gateway/api/line-items/${props.lineItemId}/photos`, {
        params: { photoType: activeCategory.value },
      })
      item.value[activeCategory.value] = res.data.photos
      emit('photos-updated')
    }
  } catch (err) {
    emit('error', err.response?.data?.error || 'Failed to delete photo')
  }
}

const openImageViewer = (photo) => {
  imageViewer.value = { open: true, photo }
}

const close = () => {
  emit('close')
}

// Watch for modal open
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.lineItemId) {
      loadPhotos()
      activeCategory.value = 'materialPhoto'
    }
  },
  { immediate: true },
)
</script>
