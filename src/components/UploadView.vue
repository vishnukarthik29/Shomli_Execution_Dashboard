<!-- components/UploadView.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Upload Excel File</h2>

    <div class="space-y-6">
      <!-- Site Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Site Name * </label>
        <div class="space-y-3">
          <div class="flex items-center">
            <input type="radio" id="existing" value="existing" v-model="uploadMode" class="mr-2" />
            <label for="existing" class="text-sm">Select Existing Site</label>
          </div>

          <select
            v-if="uploadMode === 'existing'"
            v-model="uploadSiteName"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a site...</option>
            <option v-for="site in sites" :key="site" :value="site">
              {{ site }}
            </option>
          </select>

          <div class="flex items-center">
            <input type="radio" id="new" value="new" v-model="uploadMode" class="mr-2" />
            <label for="new" class="text-sm">Enter New Site</label>
          </div>

          <input
            v-if="uploadMode === 'new'"
            type="text"
            v-model="uploadNewSite"
            placeholder="Enter new site name"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- File Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Excel File * </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <svg
            class="mx-auto h-12 w-12 text-gray-400 mb-3"
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
          <input
            type="file"
            accept=".xlsx,.xls"
            @change="handleFileChange"
            class="hidden"
            id="file-upload"
            ref="fileInput"
          />
          <label
            for="file-upload"
            class="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
          >
            Click to upload
          </label>
          <p class="text-sm text-gray-500 mt-1">or drag and drop</p>
          <p class="text-xs text-gray-400 mt-2">Excel files only (.xlsx, .xls)</p>

          <div v-if="uploadFile" class="mt-4 text-sm text-gray-700">
            Selected: <strong>{{ uploadFile.name }}</strong>
          </div>
        </div>
      </div>

      <!-- Expected Headers Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-medium text-blue-900 mb-2">Expected Excel Headers:</h4>
        <p class="text-sm text-blue-800">
          S.NO, Project Name, Category, Item Description, Quantity, Units, Rate, Amount, Material
          Status, Work Status in Units, Work Completion %
        </p>
      </div>

      <!-- Submit Button -->
      <button
        @click="handleExcelUpload"
        :disabled="loading || !uploadFile"
        class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {{ loading ? 'Uploading...' : 'Upload Excel File' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UploadView',
  // props: {
  //   apiBaseUrl: {
  //     type: String,
  //     required: true,
  //   },
  // },
  // emits: ['error', 'upload-success'],
  data() {
    return {
      loading: false,
      uploadFile: null,
      uploadSiteName: '',
      uploadNewSite: '',
      uploadMode: 'existing',
      sites: [],
    }
  },
  mounted() {
    this.fetchSites()
  },
  methods: {
    async fetchSites() {
      try {
        const response = await fetch(`/gateway/api/sites`)
        this.sites = await response.json()
      } catch (err) {
        console.error('Failed to fetch sites:', err)
      }
    },

    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          this.uploadFile = file
          this.$emit('error', '')
        } else {
          this.$emit('error', 'Please upload an Excel file (.xlsx or .xls)')
          this.uploadFile = null
        }
      }
    },

    async handleExcelUpload() {
      const siteName = this.uploadMode === 'existing' ? this.uploadSiteName : this.uploadNewSite

      if (!this.uploadFile || !siteName) {
        this.$emit('error', 'Please select a file and enter site name')
        return
      }

      this.loading = true
      this.$emit('error', '')

      const formData = new FormData()
      formData.append('file', this.uploadFile)
      formData.append('siteName', siteName)

      try {
        const response = await fetch(`/gateway/api/upload/excel`, {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (response.ok) {
          alert(`${data.message}${data.errors ? '\n\nWarnings:\n' + data.errors.join('\n') : ''}`)
          this.uploadFile = null
          this.uploadSiteName = ''
          this.uploadNewSite = ''
          this.$refs.fileInput.value = ''
          await this.fetchSites()
          this.$emit('upload-success')
        } else {
          this.$emit('error', data.error || 'Upload failed')
        }
      } catch (err) {
        this.$emit('error', 'Failed to upload file: ' + err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
