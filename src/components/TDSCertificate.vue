<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center px-6 py-4 border-b">
        <div>
          <h2 class="text-lg font-bold text-gray-800">TDS Certificate</h2>
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
            activeTab === 'mail' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
          "
          @click="activeTab = 'mail'"
        >
          Mail
        </button>
        <button
          class="flex-1 py-3 text-sm font-medium"
          :class="
            activeTab === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
          "
          @click="activeTab = 'list'"
        >
          List
        </button>
      </div>

      <!-- MAIL TAB -->
      <div v-if="activeTab === 'mail'" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Upload TDS Document </label>
          <input type="file" @change="onFileChange" class="w-full border rounded-lg px-3 py-2" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium">To</label>
            <input
              v-model="form.to"
              placeholder="email@example.com"
              class="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label class="text-sm font-medium">CC</label>
            <input
              v-model="form.cc"
              placeholder="cc@example.com"
              class="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label class="text-sm font-medium">Subject</label>
          <input
            v-model="form.subject"
            placeholder="TDS Certificate Submission"
            class="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label class="text-sm font-medium">Mail Content</label>
          <textarea
            v-model="form.content"
            rows="5"
            placeholder="Dear Team, Please find the TDS certificate attached..."
            class="w-full border rounded-lg px-3 py-2"
          ></textarea>
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
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Mail
          </button>
        </div>
      </div>

      <!-- LIST TAB -->
      <div v-if="activeTab === 'list'" class="p-6">
        <p class="text-sm text-gray-600 mb-3">Used in following items:</p>

        <div
          v-for="(usage, i) in material?.usedInItems || []"
          :key="i"
          class="text-sm bg-gray-100 rounded-lg px-3 py-2 mb-2"
        >
          <span class="font-medium">{{ usage.itemDescription }}</span>
          — Qty: {{ usage.quantity }}
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

const emit = defineEmits(['close', 'send'])

const activeTab = ref('mail')

const form = ref({
  to: '',
  cc: '',
  subject: '',
  content: '',
  file: null,
})

// Reset form when modal opens
watch(
  () => props.show,
  (val) => {
    if (val) {
      activeTab.value = 'mail'
      form.value = {
        to: '',
        cc: '',
        subject: '',
        content: '',
        file: null,
      }
    }
  },
)

const onFileChange = (e) => {
  form.value.file = e.target.files[0]
}

const submit = () => {
  emit('send', {
    ...form.value,
    material: props.material,
  })
}
</script>
