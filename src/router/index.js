import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'video-compress',
      component: () => import('../views/VideoCompress.vue')
    },
    {
      path: '/video-cut',
      name: 'video-cut',
      component: () => import('../views/VideoCut.vue')
    },
    {
      path: '/video-merge',
      name: 'video-merge',
      component: () => import('../views/VideoMerge.vue')
    },
    {
      path: '/video-format-conversion',
      name: 'video-format-conversion',
      component: () => import('../views/VideoFormatConversion.vue')
    },
    {
      path: '/video-add-watermark',
      name: 'video-add-watermark',
      component: () => import('../views/VideoAddWatermark.vue')
    },
    // {
    //   path: '/video-add-dubbing',
    //   name: 'video-add-dubbing',
    //   component: () => import('../views/VideoAddDubbing.vue')
    // },
    // {
    //   path: '/video-add-subtitles',
    //   name: 'video-add-subtitles',
    //   component: () => import('../views/VideoAddSubtitles.vue')
    // },
    // {
    //   path: '/video-create-gif',
    //   name: 'video-create-gif',
    //   component: () => import('../views/VideoCreateGif.vue')
    // }
  ]
})

export default router
