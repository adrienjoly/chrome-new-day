import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './app.vue'
import PgPlan from './pg-plan.vue'
import db from './db.js'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', name: 'plan', component: PgPlan },
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

/*
db.fetchData('tasks', ({ key, value }) => {
  console.log('fetch:', key, value)
  const newTask = 'task ' + new Date().getTime()
  const tasks = (value || []).concat([ newTask ])
  db.setData('tasks', tasks, () => console.log('added:', newTask))
})
*/
