<!-- components/DashboardView.vue -->
<template>
  <div>
    <!-- Site Filter -->
    <div class="mb-6 flex items-center gap-4">
      <label class="font-medium text-gray-700">Filter by Site:</label>
      <select
        v-model="selectedSite"
        @change="fetchData"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Sites</option>
        <option v-for="site in sites" :key="site" :value="site">
          {{ site }}
        </option>
      </select>
    </div>

    <!-- Statistics Cards -->
    <StatisticsCards v-if="summary" :summary="summary" />

    <!-- Data Table -->
    <SummaryTable :line-items="lineItems" :loading="loading" />
  </div>
</template>

<script>
import StatisticsCards from '@/components/StatisticsCard.vue'
import SummaryTable from '@/components/summaryTable.vue'

export default {
  name: 'DashboardView',
  components: {
    StatisticsCards,
    SummaryTable,
  },

  data() {
    return {
      loading: false,
      summary: null,
      lineItems: [],
      sites: [],
      selectedSite: '',
    }
  },
  mounted() {
    this.fetchSites()
    this.fetchData()
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

    async fetchData() {
      await this.fetchSummary()
      await this.fetchLineItems()
    },

    async fetchSummary() {
      this.loading = true
      try {
        const url = this.selectedSite
          ? `/gateway/api/dashboard/summary?siteName=${encodeURIComponent(this.selectedSite)}`
          : `/gateway/api/dashboard/summary`
        const response = await fetch(url)
        this.summary = await response.json()
      } catch (err) {
        this.$emit('error', 'Failed to fetch summary')
      } finally {
        this.loading = false
      }
    },

    async fetchLineItems() {
      this.loading = true
      try {
        const url = this.selectedSite
          ? `/gateway/api/line-items?siteName=${encodeURIComponent(this.selectedSite)}`
          : `/gateway/api/line-items`
        const response = await fetch(url)
        this.lineItems = await response.json()
      } catch (err) {
        this.$emit('error', 'Failed to fetch line items')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
