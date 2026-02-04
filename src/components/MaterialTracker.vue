<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Back Button -->
    <div class="mb-4">
      <button
        @click="$router.back()"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-800"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4"
    >
      {{ successMessage }}
    </div>

    <!-- Header -->
    <div class="mb-6 flex items-center justify-between" v-if="!loading">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ $route.params.siteName || 'All Sites' }} - Line Items
        </h1>
        <p class="text-gray-600 mt-1">Total Items: {{ filteredLineItems.length }}</p>
      </div>
      <button
        @click="showMessageModal = true"
        class="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition flex items-center gap-2"
      >
        Send All Shop Drawings
      </button>

      <!-- Material Tracker Button -->
      <router-link
        :to="{
          name: 'MaterialItems',
          params: { siteName: $route.params.siteName },
        }"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-cyan-700 transition flex items-center gap-2"
      >
        Materials Items
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6" v-if="!loading">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Search description..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            v-model="filters.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="clearFilters"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden" v-if="!loading">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.NO</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Item Description
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quantity
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in filteredLineItems" :key="item._id">
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.sno }}</td>
              <td class="px-3 py-4 text-sm">{{ item.category }}</td>
              <td class="px-3 py-4 text-sm">{{ item.itemDescription }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.quantity }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.units }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ formatCurrency(item.rate) }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
                {{ formatCurrency(item.amount) }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(item)"
                    class="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="openShopDrawingModal(item)"
                    class="text-purple-600 hover:text-purple-800"
                    title="Shop Drawing"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="deleteItem(item._id)"
                    class="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="filteredLineItems.length === 0 && !loading"
        class="text-center py-12 text-gray-500"
      >
        No line items found matching your filters.
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="editingItem"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="closeEditModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">Edit Line Item - Materials</h3>

          <div class="flex gap-3">
            <button
              @click="closeEditModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              @click="updateLineItem"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Material Selector Dropdown -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Add Material</label>
          <div class="relative" ref="dropdownRef">
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input
                  type="text"
                  v-model="materialSearch"
                  @focus="showDropdown = true"
                  @input="handleSearchInput"
                  placeholder="Search materials..."
                  class="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <button
                @click="openAddMaterialModal"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                title="Add new material"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>New</span>
              </button>
            </div>

            <!-- Dropdown List -->
            <div
              v-if="showDropdown && filteredMaterials.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="material in filteredMaterials"
                :key="material._id"
                @click="selectMaterial(material)"
                class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div class="font-medium text-gray-900">{{ material.name }}</div>
                <div class="text-sm text-gray-500">
                  {{ material.unit || 'No unit' }} • {{ material.category }}
                </div>
              </div>
            </div>

            <div
              v-if="showDropdown && filteredMaterials.length === 0 && materialSearch"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500"
            >
              No materials found. Click "New" to add one.
            </div>
          </div>
        </div>

        <!-- Shop Drawing (Common for all materials) -->
        <div class="mb-6">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Shop Drawing (Common for all materials)
            </label>
            <div class="flex gap-6">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="editingItem.shopDrawing"
                  value="Internal"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Internal</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="editingItem.shopDrawing"
                  value="External"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">External</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="editingItem.shopDrawing"
                  :value="null"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Not Required</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Materials Table -->
        <div class="w-full mb-6">
          <div class="border rounded-lg overflow-hidden">
            <table class="w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Material Name
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    TDS
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Samples
                  </th>
                  <th
                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="!editingItem.materials || editingItem.materials.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                    No materials added yet. Search and select a material above.
                  </td>
                </tr>

                <tr v-for="(material, index) in editingItem.materials" :key="index">
                  <td class="px-4 py-4">
                    <div class="font-medium text-gray-900">{{ material.materialName }}</div>
                  </td>
                  <td class="px-4 py-4">
                    <span class="text-sm text-gray-600">{{ material.unit || '-' }}</span>
                  </td>
                  <td class="px-4 py-4">
                    <input
                      type="number"
                      v-model.number="material.quantity"
                      placeholder="0"
                      step="0.01"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex gap-3">
                      <label class="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          :name="`tds-${index}`"
                          v-model="material.TDS"
                          value="yes"
                          class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span class="ml-1 text-sm text-gray-700">Yes</span>
                      </label>
                      <label class="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          :name="`tds-${index}`"
                          v-model="material.TDS"
                          value="no"
                          class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span class="ml-1 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex gap-3">
                      <label class="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          :name="`samples-${index}`"
                          v-model="material.Samples"
                          value="yes"
                          class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span class="ml-1 text-sm text-gray-700">Yes</span>
                      </label>
                      <label class="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          :name="`samples-${index}`"
                          v-model="material.Samples"
                          value="no"
                          class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span class="ml-1 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <button
                      @click="removeMaterialRow(index)"
                      class="inline-flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove material"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Material Modal -->
    <div
      v-if="showAddMaterialModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-60"
      @click.self="closeAddMaterialModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Add New Material</h3>
          <button @click="closeAddMaterialModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Material Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="newMaterial.name"
              placeholder="e.g., Cement Portland"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              v-model="newMaterial.unit"
              placeholder="e.g., Bags, Tonnes, CFT"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              v-model="newMaterial.category"
              placeholder="e.g., Cement, Steel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="newMaterial.description"
              placeholder="Optional description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="closeAddMaterialModal"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="createNewMaterial"
            :disabled="!newMaterial.name.trim() || creatingMaterial"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ creatingMaterial ? 'Creating...' : 'Create Material' }}
          </button>
        </div>
      </div>
    </div>
    <ShopDrawing
      :show="showShopDrawingModal"
      :material="selectedMaterialForShopDrawing"
      @close="closeShopDrawingModal"
      @send="handleShopDrawingSend"
    />
    <!-- Message Modal -->
    <div
      v-if="showMessageModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <h3 class="text-xl font-bold mb-4 text-gray-800">Send Shop Drawing Messages</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Internal Team Message
            </label>
            <textarea
              v-model="internalMessage"
              rows="3"
              placeholder="Message for internal team..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              External Vendor Message
            </label>
            <textarea
              v-model="externalMessage"
              rows="3"
              placeholder="Message for external team/vendor..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showMessageModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            @click="sendBulkShopDrawings"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Send Emails
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ShopDrawing from './ShopDrawing.vue'

const route = useRoute()
const lineItems = ref([])
const allMaterials = ref([])
const loading = ref(false)
const saving = ref(false)
const creatingMaterial = ref(false)
const error = ref(null)
const successMessage = ref(null)
const editingItem = ref(null)
const showDropdown = ref(false)
const showAddMaterialModal = ref(false)
const materialSearch = ref('')
const dropdownRef = ref(null)
const showShopDrawingModal = ref(false)
const selectedMaterialForShopDrawing = ref(null)
const showMessageModal = ref(false)
const internalMessage = ref('')
const externalMessage = ref('')

const filters = ref({
  search: '',
  category: '',
})

const newMaterial = ref({
  name: '',
  unit: '',
  category: 'General',
  description: '',
})

const props = defineProps({
  apiBaseUrl: {
    type: String,
    default: '/gateway/api',
  },
})

// Computed: Unique categories
const uniqueCategories = computed(() => {
  const categories = lineItems.value.map((item) => item.category)
  return [...new Set(categories)].sort()
})

// Computed: Filtered line items
const filteredLineItems = computed(() => {
  let filtered = [...lineItems.value]

  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.itemDescription?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.siteName?.toLowerCase().includes(searchLower),
    )
  }

  if (filters.value.category) {
    filtered = filtered.filter((item) => item.category === filters.value.category)
  }

  return filtered
})

// Computed: Filtered materials for dropdown
const filteredMaterials = computed(() => {
  if (!materialSearch.value) {
    return allMaterials.value
  }

  const searchLower = materialSearch.value.toLowerCase()
  return allMaterials.value.filter(
    (material) =>
      material.name.toLowerCase().includes(searchLower) ||
      material.category.toLowerCase().includes(searchLower),
  )
})

const openShopDrawingModal = (item) => {
  selectedMaterialForShopDrawing.value = item
  showShopDrawingModal.value = true
}

const closeShopDrawingModal = () => {
  showShopDrawingModal.value = false
  selectedMaterialForShopDrawing.value = null
}

const handleShopDrawingSend = async (data) => {
  try {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('to', data.to)
    formData.append('cc', data.cc)
    formData.append('subject', data.subject)
    formData.append('content', data.content)
    formData.append('materialId', data.material.materialId)
    formData.append('lineItemId', selectedMaterialForShopDrawing.value._id)

    await axios.post(`${props.apiBaseUrl}/shop-drawing/send-mail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    showSuccess('Shop drawing mail sent successfully!')
    closeShopDrawingModal()
    await fetchLineItems()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to send shop drawing mail'
  }
}

// Auto-hide success message
const showSuccess = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}

// Fetch all materials
const fetchMaterials = async () => {
  try {
    const response = await axios.get(`${props.apiBaseUrl}/materials`)
    allMaterials.value = response.data
  } catch (err) {
    console.error('Error fetching materials:', err)
  }
}

// Fetch line items
const fetchLineItems = async () => {
  loading.value = true
  error.value = null

  try {
    const siteName = route.params.siteName
    const params = siteName ? { siteName } : {}
    const response = await axios.get(`${props.apiBaseUrl}/line-items/site`, { params })
    lineItems.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to fetch line items'
    console.error('Error fetching line items:', err)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value || 0)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
  }
}

const openEditModal = (item) => {
  editingItem.value = {
    ...item,
    materials: item.materials && item.materials.length > 0 ? [...item.materials] : [],
    shopDrawing: item.shopDrawing || null,
  }
}

const closeEditModal = () => {
  editingItem.value = null
  materialSearch.value = ''
  showDropdown.value = false
}

const handleSearchInput = () => {
  showDropdown.value = true
}

const selectMaterial = (material) => {
  // Check if material already exists
  const exists = editingItem.value.materials.some(
    (m) => m.materialId === material._id || m.materialName === material.name,
  )

  if (exists) {
    error.value = 'This material has already been added'
    setTimeout(() => {
      error.value = null
    }, 3000)
    return
  }

  // Add material to the list
  if (!editingItem.value.materials) {
    editingItem.value.materials = []
  }

  editingItem.value.materials.push({
    materialId: material._id,
    materialName: material.name,
    quantity: 0,
    unit: material.unit,
    TDS: null,
    Samples: null,
  })

  // Reset search
  materialSearch.value = ''
  showDropdown.value = false
}

const removeMaterialRow = (index) => {
  if (confirm('Are you sure you want to remove this material?')) {
    editingItem.value.materials.splice(index, 1)
  }
}

const openAddMaterialModal = () => {
  showAddMaterialModal.value = true
  newMaterial.value = {
    name: materialSearch.value || '',
    unit: '',
    category: 'General',
    description: '',
  }
}

const closeAddMaterialModal = () => {
  showAddMaterialModal.value = false
  newMaterial.value = {
    name: '',
    unit: '',
    category: 'General',
    description: '',
  }
}

const createNewMaterial = async () => {
  if (!newMaterial.value.name.trim()) {
    error.value = 'Material name is required'
    return
  }

  creatingMaterial.value = true
  error.value = null

  try {
    const response = await axios.post(`${props.apiBaseUrl}/materials`, {
      name: newMaterial.value.name.trim(),
      unit: newMaterial.value.unit.trim(),
      category: newMaterial.value.category || 'General',
      description: newMaterial.value.description.trim(),
    })

    // Add to materials list
    allMaterials.value.push(response.data)

    // Automatically select the newly created material
    selectMaterial(response.data)

    showSuccess('Material created successfully!')
    closeAddMaterialModal()
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.material) {
      // Material already exists, use the existing one
      selectMaterial(err.response.data.material)
      showSuccess('Material already exists. Added to line item.')
      closeAddMaterialModal()
    } else {
      error.value = err.response?.data?.error || 'Failed to create material'
    }
  } finally {
    creatingMaterial.value = false
  }
}

const updateLineItem = async () => {
  saving.value = true
  error.value = null

  try {
    const payload = {
      materials: editingItem.value.materials || [],
      shopDrawing: editingItem.value.shopDrawing,
    }

    const response = await axios.put(
      `${props.apiBaseUrl}/line-items/${editingItem.value._id}`,
      payload,
    )

    if (response.status === 200) {
      await fetchLineItems()
      showSuccess('Line item updated successfully!')
      closeEditModal()
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to update line item'
    console.error('Error updating line item:', err)
  } finally {
    saving.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('Are you sure you want to delete this item?')) return

  try {
    await axios.delete(`${props.apiBaseUrl}/line-items/${id}`)
    await fetchLineItems()
    showSuccess('Item deleted successfully!')
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete item'
  }
}
// const sendBulkShopDrawings = async () => {
//   if (!confirm('Send shop drawing emails for all eligible line items?')) return

//   try {
//     loading.value = true

//     await axios.post(`${props.apiBaseUrl}/shop-drawing/send-bulk`, {
//       siteName: route.params.siteName,
//     })

//     showSuccess('Shop drawings sent successfully!')
//     await fetchLineItems()
//   } catch (err) {
//     error.value = err.response?.data?.error || 'Failed to send shop drawings'
//   } finally {
//     loading.value = false
//   }
// }
const sendBulkShopDrawings = async () => {
  try {
    loading.value = true
    showMessageModal.value = false

    await axios.post(`${props.apiBaseUrl}/shop-drawing/send-bulk`, {
      siteName: route.params.siteName,
      internalMessage: internalMessage.value,
      externalMessage: externalMessage.value,
    })

    showSuccess('Shop drawings sent successfully!')
    internalMessage.value = ''
    externalMessage.value = ''
    await fetchLineItems()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to send shop drawings'
  } finally {
    loading.value = false
  }
}

// Click outside handler for dropdown
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  fetchLineItems()
  fetchMaterials()
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>
