<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <!-- Material Not Delivered & Delayed Card (Red) -->
    <div class="bg-red-50 border-2 border-red-200 rounded-lg shadow-md p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center">
          <div class="bg-red-100 rounded-full p-2 mr-3">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-red-900">MATERIAL NOT DELIVERED & DELAYED</h3>
            <p class="text-sm text-red-700">Work stalled due to pending material delivery</p>
          </div>
        </div>
        <span class="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {{ alertData.materialNotDelivered.stats.count }}
        </span>
      </div>

      <!-- Summary Stats -->
      <div class="bg-white rounded-lg p-3 mb-3 border border-red-100">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-600">Total Value at Risk</p>
            <p class="text-lg font-bold text-red-600">
              ₹{{ formatNumber(alertData.materialNotDelivered.stats.totalAmount) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Total Delay Days</p>
            <p class="text-lg font-bold text-red-600">
              {{ alertData.materialNotDelivered.stats.totalDelayDays }}
            </p>
          </div>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div
          v-if="alertData.materialNotDelivered.items.length === 0"
          class="text-center py-4 text-red-600"
        >
          No delayed items with pending materials
        </div>
        <div
          v-else
          v-for="item in alertData.materialNotDelivered.items"
          :key="item._id"
          class="bg-white rounded-lg p-3 mb-2 hover:shadow-md transition-shadow border border-red-200 cursor-pointer"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="font-semibold text-gray-900">{{ item.siteName }}</p>
              <p class="text-sm text-gray-700 font-medium">
                {{ item.itemDescription }}
              </p>
              <p class="text-xs text-gray-600 mt-1">{{ item.category }}</p>
              <div class="flex gap-2 mt-1">
                <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  {{ item.materialStatus }}
                </span>
                <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {{ item.workCompletionPercentage }}% Complete
                </span>
              </div>
            </div>
            <div class="text-right ml-4">
              <p class="text-xs text-gray-600">Planned End Date</p>
              <p class="text-sm font-semibold text-red-600">
                {{ formatDate(item.endDate) }}
              </p>
              <p class="text-xs text-gray-600 mt-2">Delay</p>
              <p class="text-sm font-semibold text-red-600">
                {{ calculateDelayDays(item.endDate) }} days
              </p>
              <p class="text-xs text-gray-600 mt-2">Amount</p>
              <p class="text-sm font-semibold text-gray-900">₹{{ formatNumber(item.amount) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Material Delivered but Work Incomplete & Delayed Card (Orange) -->
    <div class="bg-orange-50 border-2 border-orange-200 rounded-lg shadow-md p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center">
          <div class="bg-orange-100 rounded-full p-2 mr-3">
            <svg
              class="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-orange-900">WORK INCOMPLETE & DELAYED</h3>
            <p class="text-sm text-orange-700">
              Materials delivered but work not completed on time
            </p>
          </div>
        </div>
        <span class="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {{ alertData.materialDeliveredButIncomplete.stats.count }}
        </span>
      </div>

      <!-- Summary Stats -->
      <div class="bg-white rounded-lg p-3 mb-3 border border-orange-100">
        <div class="grid grid-cols-3 gap-2">
          <div>
            <p class="text-xs text-gray-600">Remaining Work</p>
            <p class="text-sm font-bold text-orange-600">
              ₹{{
                formatNumber(alertData.materialDeliveredButIncomplete.stats.totalRemainingAmount)
              }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Avg. Progress</p>
            <p class="text-sm font-bold text-orange-600">
              {{ alertData.materialDeliveredButIncomplete.stats.averageCompletion }}%
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Delay Days</p>
            <p class="text-sm font-bold text-orange-600">
              {{ alertData.materialDeliveredButIncomplete.stats.totalDelayDays }}
            </p>
          </div>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div
          v-if="alertData.materialDeliveredButIncomplete.items.length === 0"
          class="text-center py-4 text-orange-600"
        >
          No execution delays
        </div>
        <div
          v-else
          v-for="item in alertData.materialDeliveredButIncomplete.items"
          :key="item._id"
          class="bg-white rounded-lg p-3 mb-2 hover:shadow-md transition-shadow border border-orange-200 cursor-pointer"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="font-semibold text-gray-900">{{ item.siteName }}</p>
              <p class="text-sm text-gray-700 font-medium">
                {{ item.itemDescription }}
              </p>
              <p class="text-xs text-gray-600 mt-1">{{ item.category }}</p>
              <div class="flex gap-2 mt-1">
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {{ item.materialStatus }}
                </span>
                <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  {{ item.workCompletionPercentage }}% Complete
                </span>
              </div>
              <div class="mt-2">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-orange-500 h-2 rounded-full transition-all"
                    :style="{
                      width: item.workCompletionPercentage + '%',
                    }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="text-right ml-4">
              <p class="text-xs text-gray-600">Planned End</p>
              <p class="text-sm font-semibold text-orange-600">
                {{ formatDate(item.endDate) }}
              </p>
              <p class="text-xs text-gray-600 mt-2">Delay</p>
              <p class="text-sm font-semibold text-orange-600">
                {{ calculateDelayDays(item.endDate) }} days
              </p>
              <p class="text-xs text-gray-600 mt-2">Remaining</p>
              <p class="text-sm font-semibold text-gray-900">
                ₹{{ formatNumber(item.amount - item.workCompletionAmount) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlertCard',
  props: {
    alertData: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatNumber(num) {
      return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(Math.round(num || 0))
    },
    formatDate(date) {
      if (!date) return 'N/A'
      const d = new Date(date)
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    },
    calculateDelayDays(endDate) {
      if (!endDate) return 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      const diffTime = today - end
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    },
  },
}
</script>
