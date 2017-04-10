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
      :setBreak="setBreak"
      :updateTaskById="updateTaskById"
      :goToNextTask="goToNextTask"
      :startDay="startDay"
      @pickedMood="pickedMood"
    ></router-view>
  </div>
</template>

<script>
  import dbChrome from './db.js'
  import dbFake from './db-fake.js'
  import Analytics from './analytics'
  import common from './common.js'

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
        this.db.fetchData(null, ({ key, value }) => {
          value = value || {}
          const now = new Date()
          const startDate = new Date(value.startDate || 'invalid date')

          var isMoodPicked = value.mood !== null && value.mood !== undefined
          
          //console.log('startDate', startDate)
          //console.log('tomorrow', common.getNextDay(startDate))

          if (value.startDate && now > common.getNextDay(startDate)) {
            this.db.clear() // resets the state of the app
            callback(null, '/plan')
            return
          }

          // console.log('getEndHour', common.getEndHour(startDate))

          if (value.startDate && now > common.getEndHour(startDate)) {
            if (this.currentTask) {
              this.setCurrentTask(null)
            }
            if (!value.relax) {
              this.db.setData('reasonForReview', this.analytics.review.startReason.OVERTIME, () => {
                callback(null, isMoodPicked ? '/review' : '/mood')
              })
              return
            }
          }

          // console.log('today')

          // if user is supposed to be focusing on a task => redirect to focus page
          const currentTaskIndex = this.tasks.findIndex((t) => t.uuid === (value.currentTask || {}).uuid)
          const allTasksDone = this.tasks.length > 0 && this.tasks.filter((t) => !t.done).length === 0
          if (value.relax) {
            callback(null, '/relax')
          } else if (isMoodPicked) {
            callback(null, '/review')
          } else if (allTasksDone) {
            callback(null, '/mood')
          } else if (currentTaskIndex !== -1) {
            callback(null, '/focus/' + currentTaskIndex)
          } else if (value.currentTask && value.currentTask.isBreak) {
            callback(null, '/break')
          } else {
            callback(null, '/plan')
          }
        })
      },
      _route() {
        console.info('[app] _route() ...')
        this._getRoute((err, route) =>
          this.$router.push(route || '/plan')
        )
      },
      updateTaskById(taskId, update, callback) {
        const updatedTasks = this.tasks.map((task) =>
          task.uuid !== taskId ? task : Object.assign({}, task, typeof update === 'function' ? update(task) : update))
        this.db.setData('tasks', updatedTasks, callback || (() =>
          console.log('[app] updated elapsed time of previous task')))
      },
      setBreak(started, callback) {
        callback = callback || this._route
        console.log('[app] set break:', started)
        if (started === !!this.currentTask.isBreak) {
          callback()
        } else {
          let nextTask
          if (started) {
            const breakTask = {
              isBreak: true,
              pendingTask: null,
            }
            breakTask.pendingTask = this._updateTaskElapsedTime(this.currentTask)
            nextTask = breakTask
          } else { // this.currentTask is a breakTask
            nextTask = this._updateTaskStartTime(this.currentTask.pendingTask)
          }
          this.db.setData('currentTask', nextTask, callback || (() =>
            console.log('[app] updated currentTask')))
        }
      },
      _updateTaskElapsedTime(task) {
        // to be called when ending focus on task
        if (!task) return null;
        const now = new Date().getTime()
        const newMillisecs = now - task.lastStart
        let diff = {
          elapsedMillisecs: (task.elapsedMillisecs || 0) + newMillisecs,
        }
        this.updateTaskById(task.uuid, diff)
        return Object.assign({}, task, diff)
      },
      _updateTaskStartTime(task) {
        // to be called when starting focus on task
        if (!task) return null;
        const now = new Date().getTime()
        let diff = { lastStart: now }
        this.updateTaskById(task.uuid, diff)
        return Object.assign({}, task, diff)
      },
      setCurrentTask(task, callback) {
        callback = callback || this._route
        const taskName = (task || {}).name
        console.log('[app] set current task:', taskName)
        this._updateTaskElapsedTime(this.currentTask)
        task = this._updateTaskStartTime(task)
        this.db.setData('currentTask', task, callback || (() =>
          console.log('[app] updated currentTask')))
      },
      pickedMood() {
        this.setCurrentTask() // => should go to /review
      },
      goToNextTask() {
        const nextTask = this.tasks.find((task) => !task.done)
        console.log('[app] goToNextTask:', nextTask, this.tasks)
        this.setCurrentTask(nextTask || null) // will lead to another page
      },
      startDay(callback) {
        this.db.setData('startDate', new Date().toISOString(), callback || (() =>
          console.log('[app] updated startDate')))
      },
    },
  }
</script>
