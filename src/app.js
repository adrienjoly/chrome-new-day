import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './app.vue'
import PgPlan from './pg-plan.vue'
import PgFocus from './pg-focus.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', name: 'plan', component: PgPlan },
    { path: '/focus/:taskindex', name: 'focus', component: PgFocus },
  ]
})

function init() {
  console.log('vue', document.getElementById('app'))
  new Vue({
    el: '#app',
    router,
    render: h => h(App)
  })
}

document.addEventListener('DOMContentLoaded', init, false);

console.log('newtab-script')

/*
chrome.storage.sync.get(null, function(items){
  console.log('got:', items) // e.g. [ { "yourBody": "myBody" } ]
})
*/
