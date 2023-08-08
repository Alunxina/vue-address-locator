import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/:province?/:municipality?',
    component: () => import('./components/locator-form.vue'), 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
