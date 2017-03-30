import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './app.vue'
import PgPlan from './pg-plan.vue'
import PgFocus from './pg-focus.vue'
import PgReview from './pg-review.vue'
import PgAdmin from './pg-admin.vue'
import PgMood from './pg-mood.vue'
import PgRelax from './pg-relax.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', name: 'home' },
    { path: '/plan', name: 'plan', component: PgPlan },
    { path: '/focus/:taskindex', name: 'focus', component: PgFocus, props: true },
    { path: '/mood', name: 'mood', component: PgMood },
    { path: '/review', name: 'review', component: PgReview },
    { path: '/relax', name: 'relax', component: PgRelax },
    { path: '/admin', name: 'admin', component: PgAdmin },
  ]
})

function init() {
  new Vue({
    el: '#app',
    router,
    render: h => h(App) // render webpack-compiled template
  })
}

document.addEventListener('DOMContentLoaded', init, false);
