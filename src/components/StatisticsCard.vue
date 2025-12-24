<!-- components/StatisticsCards.vue -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-sm font-medium text-gray-600 mb-2">Total Project Value</h3>
      <p class="text-3xl font-bold text-gray-900">
        {{ formatCurrency(summary.totalProjectValue) }}
      </p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-sm font-medium text-gray-600 mb-2">Work Completion %</h3>
      <p class="text-3xl font-bold text-green-600">{{ summary.totalWorkCompletionPercentage }}%</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-sm font-medium text-gray-600 mb-2">Work Completion Amount</h3>
      <p class="text-3xl font-bold text-blue-600">
        {{ formatCurrency(summary.totalWorkCompletionAmount) }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatisticsCards',
  props: {
    summary: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      }).format(value)
    },
  },
}
</script>
