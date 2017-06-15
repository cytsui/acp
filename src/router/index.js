import Vue from 'vue'
import Router from 'vue-router'
import Share from '@/page/Share'
import VuxDemo from '@/page/Vux'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Share',
      component: Share
    },
    {
      path: '/VuxDemo',
      name: 'Vux',
      component: VuxDemo
    }
  ]
})
