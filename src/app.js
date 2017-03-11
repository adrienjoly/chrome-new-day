import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './app.vue'
import PgPlan from './pg-plan.vue'
import PgFocus from './pg-focus.vue'
import PgReview from './pg-review.vue'
import PgAdmin from './pg-admin.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', name: 'plan', component: PgPlan },
    { path: '/focus/:taskindex', name: 'focus', component: PgFocus },
    { path: '/review', name: 'review', component: PgReview },
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
