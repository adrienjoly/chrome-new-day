<style lang="scss">

  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";

  .centered {
    top: 0px;
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: center;
    text-align: center;
    align-items: center;
  }

</style>

<template>
  <div id="app">
    <!--
    <router-link to="/">[home]</router-link>
    <router-link to="/admin">[admin]</router-link>
    -->
    <router-view
      :db="db"
      :tasks="tasks"
      :currentTask="currentTask"
      :analytics="analytics"
      :setCurrentTask="setCurrentTask"
      :updateTaskByName="updateTaskByName"
      :goToNextTask="goToNextTask"
    ></router-view>
  </div>
</template>

<script>
  import dbChrome from './db.js'
  import dbFake from './db-fake.js'
  import Analytics from './analytics'

  const HOUR_END_OF_DAY = 21 // hour of the day when review screen is to be shown systematically
  // also look for constants: HOUR_PROPOSE_END_OF_DAY (ui-notif-review.vue), RESET_HOUR (pg-review.vue)

  const db = window.chrome && window.chrome.storage ? dbChrome : dbFake

  try {
    console.log('running "new day" chrome extension, version:', chrome.runtime.getManifest().version)
  } catch(e) {}

  export default {
    name: 'app',
    data: () => ({
      db: db,
      tasks: [],
      tasks_handler: null,
      currentTask: [],
      currentTask_handler: null,
      analytics: Analytics,
    }),
    created() {
      console.log('[app] created')
      this.tasks_handler = ({ key, value }) => { this.tasks = value || [] }
      this.db.subscribeToData('tasks', this.tasks_handler)
      this.currentTask_handler = ({ key, value }) => { this.currentTask = value }
      this.db.subscribeToData('currentTask', this.currentTask_handler)
    },
    destroyed() {
      this.db.unsubscribeToData('tasks', this.tasks_handler)
      this.db.unsubscribeToData('currentTask', this.currentTask_handler)
    },
    mounted() {
      console.log('[app] mounted')
      this._route()
    },
    updated() {
      console.log('[app] updated')
      //this._route()
    },
    methods: {
      _getRoute(callback){
        if (new Date().getHours() >= HOUR_END_OF_DAY) {
          this.db.setData('reasonForReview', this.analytics.review.startReason.OVERTIME, () => {
            callback(null, '/review')
          })
        } else {
          this.db.fetchData(null, ({ key, value }) => {
            value = value || {}
            // if user is supposed to be focusing on a task => redirect to focus page
            const currentTaskIndex = this.tasks.findIndex((t) => t.name === (value.currentTask || {}).name)
            const allTasksDone = this.tasks.length > 0 && this.tasks.filter((t) => !t.done).length === 0
            if (currentTaskIndex !== -1) {
              callback(null, '/focus/' + currentTaskIndex)
            } else if (value.relax) {
              callback(null, '/relax')
            } else if (allTasksDone) {
              callback(null, value.mood === null || value.mood === undefined ? '/mood' : '/review')
            } else {
              callback(null, '/plan')
            }
          })
        }
      },
      _route() {
        console.info('[app] _route() ...')
        this._getRoute((err, route) =>
          this.$router.push(route || '/plan')
        )
      },
      updateTaskByName(taskName, update, callback) {
        const updatedTasks = this.tasks.map((task) =>
          task.name !== taskName ? task : Object.assign({}, task, typeof update === 'function' ? update(task) : update))
        this.db.setData('tasks', updatedTasks, callback || (() =>
          console.log('[app] updated elapsed time of previous task')))
      },
      setCurrentTask(task, callback) {
        callback = callback || this._route
        const taskName = (task || {}).name
        console.log('[app] set current task:', taskName)
        const currentTask = this.currentTask
        if (taskName != (currentTask || {}).name) {
          const tasks = this.tasks || []
          const now = new Date().getTime()
          if (currentTask) {
            const newMillisecs = now - currentTask.lastStart
            this.updateTaskByName(currentTask.name, (task) => ({
              elapsedMillisecs: (task.elapsedMillisecs || 0) + newMillisecs,
            }))
          }
          if (task) {
            task.lastStart = now
          }
          this.db.setData('currentTask', task || null, callback || (() =>
            console.log('[app] updated currentTask')))
        } else {
          callback()
        }
      },
      goToNextTask() {
        const nextTask = this.tasks.find((task) => !task.done)
        console.log('[app] goToNextTask:', nextTask, this.tasks)
        this.setCurrentTask(nextTask || null) // will lead to another page
      },
    },
  }
</script>
