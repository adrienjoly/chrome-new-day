import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './app.vue'
import PgPlan from './pg-plan.vue'

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
  console.log('got:', items && items.tasks) // e.g. [ { "yourBody": "myBody" } ]
  const newTask = 'task ' + new Date().getTime()
  const tasks = (items.tasks || []).concat([ newTask ])
  chrome.storage.sync.set({ 'tasks': tasks }, function(){
    console.log('added:', newTask)
  })
})
*/
