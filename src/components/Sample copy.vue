<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
    >
      <!-- Header -->
      <div class="flex justify-between items-center px-6 py-4 border-b flex-shrink-0">
        <div>
          <h2 class="text-lg font-bold text-gray-800">Sample Submission</h2>
          <p class="text-sm text-gray-500">{{ material?.materialName }}</p>
        </div>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-800">✕</button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b flex-shrink-0">
        <button
          class="flex-1 py-3 text-sm font-medium"
          :class="
            activeTab === 'upload' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'
          "
          @click="activeTab = 'upload'"
        >
          Upload
        </button>
        <button
          class="flex-1 py-3 text-sm font-medium"
          :class="
            activeTab === 'list' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'
          "
          @click="activeTab = 'list'"
        >
          List ({{ material?.sampleHistory?.length || 0 }})
        </button>
      </div>

      <!-- Content Area with Scroll -->
      <div class="flex-1 overflow-y-auto">
        <!-- UPLOAD TAB -->
        <div v-if="activeTab === 'upload'" class="p-6 space-y-4">
          <!-- File Upload Section -->
          <div>
            <label class="block text-sm font-medium mb-2">
              Upload Sample Documents / Images (Max 10 files)
            </label>

            <!-- Drop Zone -->
            <div
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              :class="[
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300',
              ]"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                @change="onFileChange"
                class="hidden"
              />

              <div class="space-y-2">
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>

                <div class="text-sm text-gray-600">
                  <span class="text-green-600 hover:text-green-700 font-medium"
                    >Click to upload</span
                  >
                  or drag and drop
                </div>

                <p class="text-xs text-gray-500">Images (JPG, PNG, GIF) or PDF up to 50MB each</p>
              </div>
            </div>
          </div>

          <!-- Selected Files Preview -->
          <div v-if="selectedFiles.length > 0" class="space-y-2">
            <label class="block text-sm font-medium">
              Selected Files ({{ selectedFiles.length }})
            </label>

            <div class="space-y-2 max-h-60 overflow-y-auto">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <!-- File Type Icon -->
                  <div class="flex-shrink-0">
                    <svg
                      v-if="file.type.startsWith('image/')"
                      class="w-8 h-8 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-8 h-8 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>

                  <!-- File Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                  </div>

                  <!-- Remove Button -->
                  <button
                    @click="removeFile(index)"
                    class="flex-shrink-0 text-red-500 hover:text-red-700"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Uploading...</span>
              <span class="text-gray-600">{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="$emit('close')"
              :disabled="uploading"
              class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              @click="submit"
              :disabled="selectedFiles.length === 0 || uploading"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)` }}
            </button>
          </div>
        </div>

        <!-- LIST TAB -->
        <div v-if="activeTab === 'list'" class="p-6">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr class="text-left text-xs font-medium text-gray-500 uppercase">
                  <th class="px-4 py-3">Preview</th>
                  <th class="px-4 py-3">File Name</th>
                  <th class="px-4 py-3">Date</th>
                  <th class="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="(sample, i) in sampleHistory"
                  :key="sample._id || i"
                  class="hover:bg-gray-50"
                >
                  <!-- Preview -->
                  <td class="px-4 py-3">
                    <div class="w-16 h-16 flex items-center justify-center">
                      <img
                        v-if="isImage(sample.fileType)"
                        :src="getFileUrl(sample.fileUrl)"
                        :alt="sample.fileName"
                        class="w-full h-full object-cover rounded cursor-pointer hover:opacity-80"
                        @click="previewFile(sample)"
                      />
                      <div
                        v-else
                        class="w-12 h-12 flex items-center justify-center bg-red-100 rounded"
                      >
                        <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </td>

                  <!-- File Name -->
                  <td class="px-4 py-3">
                    <p class="text-sm font-medium text-gray-900">{{ sample.fileName }}</p>
                    <p class="text-xs text-gray-500">{{ sample.fileType }}</p>
                  </td>

                  <!-- Date -->
                  <td class="px-4 py-3 text-sm text-gray-600">
                    {{ formatDate(sample.uploadedAt) }}
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <a
                        :href="getFileUrl(sample.fileUrl)"
                        target="_blank"
                        class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </a>

                      <a
                        :href="getFileUrl(sample.fileUrl)"
                        download
                        class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                          />
                        </svg>
                        Download
                      </a>

                      <button
                        @click="deleteSample(sample)"
                        class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- EMPTY STATE -->
                <tr v-if="!material?.sampleHistory || material.sampleHistory.length === 0">
                  <td colspan="4" class="text-center py-12">
                    <svg
                      class="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">No samples uploaded yet</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div
      v-if="previewImage"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
      @click="previewImage = null"
    >
      <div class="max-w-4xl max-h-[90vh] relative">
        <button
          @click="previewImage = null"
          class="absolute -top-10 right-0 text-white hover:text-gray-300"
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
        <img :src="previewImage" class="max-w-full max-h-[90vh] object-contain rounded" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  show: Boolean,
  material: Object,
  lineItemId: String,
  apiBaseUrl: {
    type: String,
    default: '/gateway/api',
  },
})

const emit = defineEmits(['close', 'refresh'])

const activeTab = ref('upload')
const selectedFiles = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const isDragging = ref(false)
const previewImage = ref(null)

watch(
  () => props.show,
  (val) => {
    if (val) {
      activeTab.value = 'upload'
      selectedFiles.value = []
      uploading.value = false
      uploadProgress.value = 0
      fetchSamples()
    }
  },
)
watch(activeTab, (tab) => {
  if (tab === 'list') {
    fetchSamples()
  }
})

const onFileChange = (e) => {
  const files = Array.from(e.target.files)
  addFiles(files)
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  const validFiles = files.filter((file) => {
    const isValid = file.type.startsWith('image/') || file.type === 'application/pdf'
    const isUnderLimit = file.size <= 50 * 1024 * 1024 // 50MB
    return isValid && isUnderLimit
  })

  const remainingSlots = 10 - selectedFiles.value.length
  const filesToAdd = validFiles.slice(0, remainingSlots)

  selectedFiles.value = [...selectedFiles.value, ...filesToAdd]

  if (filesToAdd.length < validFiles.length) {
    alert('Maximum 10 files allowed')
  }
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}
const fetchSamples = async () => {
  if (!props.material?.materialId) return

  loadingSamples.value = true
  try {
    const res = await axios.get(
      `${props.apiBaseUrl}/materials/${props.material.materialId}/samples-global`,
    )

    sampleHistory.value = res.data.sampleHistory || []
  } catch (err) {
    console.error('Fetch samples failed:', err)
  } finally {
    loadingSamples.value = false
  }
}
const submit = async () => {
  if (selectedFiles.value.length === 0) {
    alert('Please select at least one file')
    return
  }

  if (!props.material?.materialId) {
    alert('Material ID is missing')
    console.error('material.materialId is required but not provided')
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  console.log('SUBMIT DEBUG:', {
    material: props.material,
    materialId: props.material?.materialId,
    lineItemId: props.lineItemId,
  })

  try {
    const formData = new FormData()

    // Append material ID (required)
    formData.append('materialId', String(props.material?.materialId))

    // Append line item ID (optional - for tracking relationships)
    if (props.lineItemId) {
      formData.append('lineItemId', String(props.lineItemId))
    }

    // Append all files
    selectedFiles.value.forEach((file) => {
      formData.append('files', file)
    })

    console.log('Uploading with:', {
      materialId: props.material._id,
      lineItemId: props.lineItemId,
      fileCount: selectedFiles.value.length,
    })

    await axios.post(`${props.apiBaseUrl}/materials/upload-samples`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      },
    })

    alert(`Successfully uploaded ${selectedFiles.value.length} file(s)`)
    selectedFiles.value = []
    await fetchSamples() // Refresh samples list
    emit('refresh')
    activeTab.value = 'list'
  } catch (error) {
    console.error('Upload error:', error)
    alert(error.response?.data?.message || 'Failed to upload files')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const deleteSample = async (sample) => {
  if (!confirm('Are you sure you want to delete this sample?')) return

  try {
    await axios.delete(
      `${props.apiBaseUrl}/projects/materials/${props.lineItemId}/${props.material._id}/samples/${sample._id}`,
    )

    alert('Sample deleted successfully')
    emit('refresh')
  } catch (error) {
    console.error('Delete error:', error)
    alert(error.response?.data?.message || 'Failed to delete sample')
  }
}

const isImage = (fileType) => {
  return fileType?.startsWith('image/')
}

const getFileUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${props.apiBaseUrl.replace('/api', '')}${url}`
}

const previewFile = (sample) => {
  if (isImage(sample.fileType)) {
    previewImage.value = getFileUrl(sample.fileUrl)
  } else {
    window.open(getFileUrl(sample.fileUrl), '_blank')
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>
