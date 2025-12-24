<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Upload Excel</h2>
        <button @click="$emit('close')">✕</button>
      </div>

      <input type="file" accept=".xlsx,.xls" @change="onFile" />
      <input
        v-model="siteName"
        placeholder="Site Name"
        class="w-full mt-4 px-3 py-2 border rounded"
      />

      <button @click="upload" class="mt-6 w-full bg-blue-600 text-white py-2 rounded">
        Upload
      </button>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['close', 'uploaded'],
  data() {
    return {
      file: null,
      siteName: '',
    }
  },
  methods: {
    onFile(e) {
      this.file = e.target.files[0]
    },
    async upload() {
      const fd = new FormData()
      fd.append('file', this.file)
      fd.append('siteName', this.siteName)

      const res = await fetch('/gateway/api/upload/excel', {
        method: 'POST',
        body: fd,
      })

      if (res.ok) {
        this.$emit('uploaded')
      }
    },
  },
}
</script>
