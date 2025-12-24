<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Header -->
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th class="px-4 py-3 text-sm font-semibold text-gray-600 uppercase">S.No</th>
            <th class="px-4 py-3 text-sm font-semibold text-gray-600 uppercase">Site Name</th>
            <th class="px-4 py-3 text-sm font-semibold text-gray-600 uppercase">Project Value</th>
            <th class="px-4 py-3 text-sm font-semibold text-gray-600 uppercase">
              Completed Amount
            </th>
            <th class="px-4 py-3 text-sm font-semibold text-gray-600 uppercase">Completion %</th>
            <th class="px-4 py-3 text-sm font-semibold text-gray-600 uppercase">Line Items</th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="(site, index) in lineItems"
            :key="site.siteName"
            class="hover:bg-gray-50 transition"
          >
            <td class="px-4 py-3 text-sm text-center">{{ index + 1 }}</td>

            <td
              class="px-4 py-3 text-sm text-center font-medium text-blue-600 cursor-pointer hover:underline"
              @click="goToSite(site.siteName)"
            >
              {{ site.siteName }}
            </td>

            <td class="px-4 py-3 text-sm text-center text-blue-700 font-semibold">
              {{ formatCurrency(site.totalProjectValue) }}
            </td>

            <td class="px-4 py-3 text-sm text-center text-green-700 font-semibold">
              {{ formatCurrency(site.totalWorkCompletionAmount) }}
            </td>

            <td class="px-4 py-3 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full"
                    :class="progressColor(site.totalWorkCompletionPercentage)"
                    :style="{ width: site.totalWorkCompletionPercentage + '%' }"
                  ></div>
                </div>
                <span class="text-xs font-semibold">
                  {{ site.totalWorkCompletionPercentage }}%
                </span>
              </div>
            </td>

            <td class="px-4 py-3 text-sm text-center text-gray-700">
              {{ site.itemCount }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
defineProps({
  lineItems: {
    type: Array,
    required: true,
  },
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value)

const progressColor = (percentage) => {
  if (percentage >= 75) return 'bg-green-500'
  if (percentage >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

const goToSite = (siteName) => {
  router.push({
    name: 'site-line-items',
    params: { siteName },
  })
}
</script>
