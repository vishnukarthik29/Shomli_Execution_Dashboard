<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center px-6 py-4 border-b">
        <div>
          <h2 class="text-lg font-bold text-gray-800">Sample Submission</h2>
          <p class="text-sm text-gray-500">
            {{ material?.materialName }}
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-800">✕</button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b">
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
          List
        </button>
      </div>

      <!-- UPLOAD TAB -->
      <div v-if="activeTab === 'upload'" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1"> Upload Sample Document / Image </label>
          <input type="file" @change="onFileChange" class="w-full border rounded-lg px-3 py-2" />
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            @click="submit"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit Sample
          </button>
        </div>
      </div>

      <!-- LIST TAB -->
      <div v-if="activeTab === 'list'" class="p-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr class="text-left text-xs font-medium text-gray-500 uppercase">
                <th class="px-4 py-2">Date</th>
                <th class="px-4 py-2 text-center">File</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(sample, i) in material?.sampleHistory || []"
                :key="i"
                class="text-sm hover:bg-gray-50"
              >
                <td class="px-4 py-2 border">
                  {{ formatDate(sample.date) }}
                </td>

                <td class="px-4 py-2 border text-center">
                  <a
                    :href="sample.fileUrl"
                    download
                    class="inline-flex items-center gap-2 text-green-600 hover:text-green-800"
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
                </td>
              </tr>

              <!-- EMPTY STATE -->
              <tr v-if="!material?.sampleHistory || material.sampleHistory.length === 0">
                <td colspan="3" class="text-center py-6 text-gray-500">No samples uploaded yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  material: Object,
})

const emit = defineEmits(['close', 'submit'])

const activeTab = ref('upload')
const file = ref(null)
const remarks = ref('')

watch(
  () => props.show,
  (val) => {
    if (val) {
      activeTab.value = 'upload'
      file.value = null
      remarks.value = ''
    }
  },
)

const onFileChange = (e) => {
  file.value = e.target.files[0]
}

const submit = () => {
  if (!file.value) {
    alert('Please upload a file first')
    return
  }

  emit('submit', {
    file: file.value,
    remarks: remarks.value,
    material: props.material,
  })
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}
</script>
