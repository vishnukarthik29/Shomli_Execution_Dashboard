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
          Send Mail
        </button>
        <button
          class="flex-1 py-3 text-sm font-medium"
          :class="
            activeTab === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
          "
          @click="activeTab = 'list'"
        >
          History ({{ mailHistory.length }})
        </button>
      </div>

      <!-- MAIL TAB -->
      <div v-if="activeTab === 'mail'" class="p-6 space-y-4 overflow-y-auto flex-1">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Upload TDS Document <span class="text-red-500">*</span>
          </label>
          <input
            ref="fileInput"
            type="file"
            @change="onFileChange"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <!-- File Size Display -->
          <div v-if="form.file" class="mt-2">
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div>
                  <div class="text-sm font-medium text-gray-700">{{ form.file.name }}</div>
                  <div class="text-xs text-gray-500">{{ fileSizeMB }} MB</div>
                </div>
              </div>
              <button
                @click="clearFile"
                class="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>

            <!-- Size Warning -->
            <div
              v-if="fileSizeMB > 25"
              class="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded"
            >
              <div class="flex items-start gap-2">
                <svg
                  class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="flex-1">
                  <p class="font-semibold text-yellow-800 text-sm">File size exceeds 25 MB limit</p>
                  <p class="text-yellow-700 text-xs mt-1">
                    The email will be sent <strong>without the attachment</strong>. The recipient
                    will be notified about the large file. All email details will be logged in the
                    database.
                  </p>
                </div>
              </div>
            </div>

            <!-- Size OK -->
            <div v-else class="mt-2 p-2 bg-green-50 border-l-4 border-green-400 rounded">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-green-700 text-sm font-medium"
                  >File will be attached to email</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              To <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.to"
              type="email"
              placeholder="recipient@example.com"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">CC</label>
            <input
              v-model="form.cc"
              type="text"
              placeholder="cc1@example.com, cc2@example.com"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Subject <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.subject"
            placeholder="TDS Certificate Submission"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Mail Content <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.content"
            rows="6"
            placeholder="Enter your message here..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            :disabled="sending"
          >
            Cancel
          </button>
          <button
            @click="submit"
            :disabled="sending || !form.to || !form.subject || !form.content"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            <span
              v-if="sending"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {{ sending ? 'Sending...' : 'Send Mail' }}
          </button>
        </div>
      </div>

      <!-- LIST TAB -->
      <div v-if="activeTab === 'list'" class="p-6 overflow-y-auto flex-1">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date & Time
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Recipient
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Attachment
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(mail, i) in mailHistory" :key="i" class="hover:bg-gray-50">
                <!-- DATE -->
                <td class="px-3 py-3 text-xs">
                  <div class="font-medium text-gray-900">{{ formatDate(mail.sentAt) }}</div>
                  <div class="text-gray-500">{{ formatTime(mail.sentAt) }}</div>
                </td>

                <!-- TO -->
                <td class="px-3 py-3 text-xs">
                  <div class="font-medium text-gray-900">{{ mail.to }}</div>
                  <div v-if="mail.cc" class="text-gray-500">CC: {{ mail.cc }}</div>
                </td>

                <!-- SUBJECT -->
                <td class="px-3 py-3 text-xs">
                  <div class="max-w-xs truncate" :title="mail.subject">{{ mail.subject }}</div>
                </td>

                <!-- ATTACHMENT -->
                <td class="px-3 py-3 text-xs">
                  <div v-if="mail.attachmentName" class="space-y-1">
                    <div
                      class="font-medium text-gray-900 truncate max-w-xs"
                      :title="mail.attachmentName"
                    >
                      {{ mail.attachmentName }}
                    </div>
                    <div class="text-gray-500">{{ mail.attachmentSizeMB }} MB</div>
                  </div>
                  <span v-else class="text-gray-400">No attachment</span>
                </td>

                <!-- STATUS -->
                <td class="px-3 py-3 text-xs">
                  <span
                    v-if="mail.attachmentSent"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium"
                  >
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Sent
                  </span>
                  <div v-else-if="mail.attachmentSkippedReason" class="space-y-1">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      Skipped
                    </span>
                    <div
                      class="text-xs text-gray-600 max-w-xs"
                      :title="mail.attachmentSkippedReason"
                    >
                      {{ mail.attachmentSkippedReason }}
                    </div>
                  </div>
                  <span v-else-if="!mail.attachmentName" class="text-gray-400">No file</span>
                </td>

                <!-- ACTION -->
                <td class="px-3 py-3 text-center">
                  <a
                    v-if="mail.fileUrl && mail.attachmentSent"
                    :href="mail.fileUrl"
                    download
                    class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
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
                    v-else
                    @click="showMailDetails(mail)"
                    class="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800"
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
                  </button>
                </td>
              </tr>

              <!-- EMPTY STATE -->
              <tr v-if="mailHistory.length === 0">
                <td colspan="6" class="text-center py-12">
                  <svg
                    class="w-12 h-12 mx-auto text-gray-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p class="text-gray-500 font-medium">No TDS mails sent yet</p>
                  <p class="text-gray-400 text-sm mt-1">Send your first mail from the Mail tab</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
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

const activeTab = ref('mail')
const sending = ref(false)
const fileInput = ref(null)

const form = ref({
  to: '',
  cc: '',
  subject: '',
  content: '',
  file: null,
})

// Computed: File size in MB
const fileSizeMB = computed(() => {
  if (!form.value.file) return 0
  return parseFloat((form.value.file.size / (1024 * 1024)).toFixed(2))
})

// Computed: Mail history from material
const mailHistory = computed(() => {
  if (!props.material) return []
  return props.material.tdsMailHistory || []
})

// Reset form when modal opens
watch(
  () => props.show,
  (val) => {
    if (val && props.material) {
      activeTab.value = 'mail'
      form.value = {
        to: '',
        cc: '',
        subject: `TDS Certificate - ${props.material.materialName}`,
        content: `Dear Team,\n\nPlease find the TDS certificate for ${props.material.materialName} attached with this email.\n\nMaterial Details:\n- Name: ${props.material.materialName}\n- Total Quantity: ${props.material.quantity} ${props.material.unit}\n\nKindly review and acknowledge receipt.\n\nBest regards`,
        file: null,
      }
      sending.value = false
    }
  },
)

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.value.file = file
  }
}

const clearFile = () => {
  form.value.file = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const showMailDetails = (mail) => {
  const details = `
Email Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To: ${mail.to}
${mail.cc ? `CC: ${mail.cc}` : ''}
Subject: ${mail.subject}

Content:
${mail.content}

Attachment: ${mail.attachmentName || 'None'}
Size: ${mail.attachmentSizeMB || 0} MB
Status: ${mail.attachmentSent ? 'Sent' : 'Skipped'}
${mail.attachmentSkippedReason ? `Reason: ${mail.attachmentSkippedReason}` : ''}

Sent: ${formatDate(mail.sentAt)} at ${formatTime(mail.sentAt)}
  `.trim()

  alert(details)
}

const submit = async () => {
  // Validation
  if (!form.value.to || !form.value.subject || !form.value.content) {
    alert('Please fill all required fields (To, Subject, Content)')
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.to)) {
    alert('Please enter a valid email address in the "To" field')
    return
  }

  // Validate CC emails if provided
  if (form.value.cc) {
    const ccEmails = form.value.cc
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email)
    const invalidCcEmails = ccEmails.filter((email) => !emailRegex.test(email))
    if (invalidCcEmails.length > 0) {
      alert(`Invalid CC email address(es): ${invalidCcEmails.join(', ')}`)
      return
    }
  }

  // Confirm if file is too large
  if (form.value.file && fileSizeMB.value > 25) {
    const confirmed = confirm(
      `⚠️ ATTACHMENT SIZE WARNING\n\n` +
        `File: ${form.value.file.name}\n` +
        `Size: ${fileSizeMB.value} MB (exceeds 25 MB limit)\n\n` +
        `The email will be sent WITHOUT the attachment.\n` +
        `The recipient will be notified about the large file.\n` +
        `All email details will be logged in the database.\n\n` +
        `Do you want to proceed?`,
    )
    if (!confirmed) return
  }

  sending.value = true

  try {
    const formData = new FormData()
    formData.append('to', form.value.to)
    formData.append('cc', form.value.cc)
    formData.append('subject', form.value.subject)
    formData.append('content', form.value.content)
    formData.append('materialName', props.material.materialName)

    if (form.value.file) {
      formData.append('file', form.value.file)
    }

    const response = await axios.post(`${props.apiBaseUrl}/materials/send-tds-mail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Show success message with details
    const details = response.data.details
    let message = '✅ Email sent successfully!\n\n'

    if (details.attachmentSent) {
      message += `✓ Attachment included: ${details.attachmentSizeMB} MB\n`
    } else if (details.attachmentSkippedReason) {
      message += `⚠ ${details.attachmentSkippedReason}\n`
      message += `\nThe recipient has been notified in the email body.`
    }

    alert(message)

    emit('refresh')
    emit('close')
  } catch (error) {
    console.error('Email send error:', error)
    alert(
      '❌ Failed to send email\n\n' +
        (error.response?.data?.error ||
          error.response?.data?.details ||
          'An unexpected error occurred. Please try again.'),
    )
  } finally {
    sending.value = false
  }
}
</script>
