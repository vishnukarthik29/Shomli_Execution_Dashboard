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
          List ({{ sampleHistory.length }})
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- UPLOAD TAB -->
        <div v-if="activeTab === 'upload'" class="p-6 space-y-4">
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

              <p class="text-sm text-gray-600">
                <span class="text-green-600 font-medium">Click to upload</span>
                or drag and drop
              </p>
              <p class="text-xs text-gray-500">Images, PDF, DOC up to 50MB each</p>
            </div>
          </div>

          <!-- Selected Files -->
          <div v-if="selectedFiles.length" class="space-y-2">
            <p class="text-sm font-medium">Selected Files ({{ selectedFiles.length }})</p>

            <div class="space-y-2 max-h-60 overflow-y-auto">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ formatFileSize(file.size) }}
                  </p>
                </div>

                <button @click="removeFile(index)" class="text-red-500 hover:text-red-700">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full transition-all"
                :style="{ width: uploadProgress + '%' }"
              />
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="$emit('close')"
              :disabled="uploading"
              class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              @click="submit"
              :disabled="!selectedFiles.length || uploading"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {{ uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)` }}
            </button>
          </div>
        </div>

        <!-- LIST TAB -->
        <div v-if="activeTab === 'list'" class="p-6">
          <div v-if="loadingSamples" class="text-center py-6 text-gray-500">Loading samples...</div>

          <div v-else class="overflow-x-auto">
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
                  <td class="px-4 py-3">
                    <img
                      v-if="isImage(sample.fileType)"
                      :src="getFileUrl(sample.fileUrl)"
                      class="w-16 h-16 object-cover rounded cursor-pointer"
                      @click="previewFile(sample)"
                    />
                    <div
                      v-else
                      class="w-16 h-16 flex items-center justify-center bg-red-100 rounded"
                    >
                      PDF
                    </div>
                  </td>

                  <td class="px-4 py-3">
                    <p class="text-sm font-medium">{{ sample.fileName }}</p>
                    <p class="text-xs text-gray-500">{{ sample.fileType }}</p>
                  </td>

                  <td class="px-4 py-3 text-sm text-gray-600">
                    {{ formatDate(sample.uploadedAt) }}
                  </td>

                  <td class="px-4 py-3 text-center">
                    <button
                      @click="deleteSample(sample)"
                      class="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>

                <tr v-if="!sampleHistory.length">
                  <td colspan="4" class="text-center py-12 text-gray-500">
                    No samples uploaded yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="previewImage"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]"
      @click="previewImage = null"
    >
      <img :src="previewImage" class="max-w-full max-h-[90vh] object-contain rounded" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  show: Boolean,
  material: Object,
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

const sampleHistory = ref([])
const loadingSamples = ref(false)

watch(
  () => props.show,
  (val) => {
    if (val) {
      activeTab.value = 'upload'
      selectedFiles.value = []
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

const onFileChange = (e) => {
  addFiles(Array.from(e.target.files))
}

const handleDrop = (e) => {
  isDragging.value = false
  addFiles(Array.from(e.dataTransfer.files))
}

const addFiles = (files) => {
  const validFiles = files.filter((file) => {
    const isValid =
      file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx')

    return isValid && file.size <= 50 * 1024 * 1024
  })

  const remainingSlots = 10 - selectedFiles.value.length
  selectedFiles.value.push(...validFiles.slice(0, remainingSlots))
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const submit = async () => {
  if (!selectedFiles.value.length) return

  if (!props.material?.materialId) {
    alert('Material ID missing')
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('materialId', props.material.materialId)

    selectedFiles.value.forEach((file) => {
      formData.append('files', file)
    })

    await axios.post(`${props.apiBaseUrl}/materials/upload-samples`, formData, {
      onUploadProgress: (e) => {
        uploadProgress.value = Math.round((e.loaded * 100) / e.total)
      },
    })

    selectedFiles.value = []
    await fetchSamples()
    emit('refresh')
    activeTab.value = 'list'
  } catch (err) {
    alert(err.response?.data?.message || 'Upload failed')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const deleteSample = async (sample) => {
  if (!confirm('Delete this sample everywhere?')) return

  try {
    await axios.delete(
      `${props.apiBaseUrl}/materials/${props.material.materialId}/samples/${sample._id}`,
    )
    await fetchSamples()
    emit('refresh')
  } catch (err) {
    alert('Delete failed')
  }
}

const isImage = (type) => type?.startsWith('image/')

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
  return new Date(date).toLocaleString()
}

const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (!bytes) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}
</script>
