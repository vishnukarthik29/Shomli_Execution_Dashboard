import { createRouter, createWebHistory } from 'vue-router'
import dashboard from '@/pages/dashboard.vue'
import siteWiseLineItem from '@/components/siteWiseLineItem.vue'
import siteWiseLineItemUpload from '@/components/siteWiseLineItemUpload.vue'
import UploadView from '@/components/UploadView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: dashboard,
    },
    {
      path: '/uploadsite',
      name: 'UploadView',
      component: UploadView,
    },
    {
      path: '/site/:siteName',
      name: 'site-line-items',
      component: siteWiseLineItem,
      props: true,
    },
    {
      path: '/siteupload/:siteName',
      name: 'site-line-items-upload',
      component: siteWiseLineItemUpload,
    },
  ],
})

export default router
