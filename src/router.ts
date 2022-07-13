import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/record',
    component: () => import('./presentation/Record/index.vue'),
    children: [
      {
        path: 'list',
        component: () => import('./presentation/Record/RecordList.vue'),
      },
      {
        path: 'input',
        component: () => import('./presentation/Record/RecordToday.vue'),
      },
    ],
  },
  {path: '/:notFound(.*)', redirect: '/record/list'},
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
