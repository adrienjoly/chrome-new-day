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
      :planTomorrow="planTomorrow"
      @pickedMood="pickedMood"
    ></router-view>
  </div>
</template>

<script>
  import dbChrome from './db.js' // TODO: import db.js OR db-fake.js, depending on environment (prod / dev)
  import dbFake from './db-fake.js'
  import Analytics from './analytics'
  import common from './common.js'

  const db = window.chrome && window.chrome.storage ? dbChrome : dbFake

  function makeTaskElapsedTimeUpd(task) {
    // to be called when ending focus on task
    if (!task) return null;
    console.log('makeTaskElapsedTimeUpd', task)
    const now = new Date().getTime()
    const newMillisecs = now - task.lastStart
    return {
      elapsedMillisecs: (task.elapsedMillisecs || 0) + newMillisecs,
      lastStart: null,
    }
  }
  
  function makeTaskStartTimeUpd(task) {
    // to be called when starting focus on task
    if (!task) return null;
    const now = new Date().getTime()
    return { lastStart: now }
  }

  function applyTaskUpdate(tasks, taskId, update) {
    console.log('[app] applyTaskUpdate:', (tasks.find((t) => t.uuid === taskId) || {}).name, '<-', update)
    return tasks.map((task) =>
      task.uuid !== taskId ? task : Object.assign({}, task, typeof update === 'function' ? update(task) : update))
  }

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
      _keyHandler: null,
    }),
    created() {
      console.log('[app] created')
      this.tasks_handler = ({ key, value }) => { this.tasks = value || [] }
      this.db.subscribeToData('tasks', this.tasks_handler)
      this.currentTask_handler = ({ key, value }) => { this.currentTask = value }
      this.db.subscribeToData('currentTask', this.currentTask_handler)
      // keyboard shortcut for debugging/diagnostics
      this._keyHandler = (e) => e.ctrlKey && e.shiftKey && e.key === 'P' && this.$router.push('/diag')
      document.addEventListener('keydown', this._keyHandler)
    },
    destroyed() {
      this.db.unsubscribeToData('tasks', this.tasks_handler)
      this.db.unsubscribeToData('currentTask', this.currentTask_handler)
      document.removeEventListener('keydown', this._keyHandler)
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

          // a new day begins? => clear state data and plan the day
          if (value.startDate && now > common.getNextDay(startDate)) {
            this.db.clear() // resets the state of the app
            callback(null, '/plan')
            return
          }

          // console.log('getEndHour', common.getEndHour(startDate))

          // it's late, and you had planned your day earlier? => force user to review
          if (value.startDate && now > common.getEndHour(startDate) && !value.relax) {
            this.db.setData('reasonForReview', this.analytics.review.startReason.OVERTIME, () => {})
            value.reasonForReview = this.analytics.review.startReason.OVERTIME // to use routing logic below
          }

          const currentTaskIndex = this.tasks.findIndex((t) => t.uuid === (value.currentTask || {}).uuid)
          const allTasksDone = this.tasks.length > 0 && this.tasks.filter((t) => !t.done).length === 0

          if (value.relax) {
            callback(null, '/relax')
          } else if (value.reasonForReview || isMoodPicked || allTasksDone) {
            this.setCurrentTask(null, () => {
              callback(null, isMoodPicked ? '/review' : '/mood')
            })
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
        const updatedTasks = applyTaskUpdate(this.tasks, taskId, update)
        this.db.setData('tasks', updatedTasks, callback || (() =>
          console.log('[app] updated tasks')))
      },
      setBreak(started, callback) {
        callback = callback || this._route
        console.log('[app] set break:', started)
        if (started === !!this.currentTask.isBreak) {
          callback()
          return
        }
        let nextTask
        let updatedTasks = this.tasks
        if (started) {
          // this.currentTask is not a breakTask
          const diff = makeTaskElapsedTimeUpd(this.currentTask)
          nextTask /*const breakTask*/ = {
            isBreak: true,
            pendingTask: Object.assign({}, this.currentTask, diff),
          }
          updatedTasks = applyTaskUpdate(updatedTasks, this.currentTask.uuid, diff)
        } else {
          // this.currentTask is a breakTask
          const diff = makeTaskStartTimeUpd(this.currentTask.pendingTask)
          nextTask = Object.assign({}, this.currentTask.pendingTask, diff)
          updatedTasks = applyTaskUpdate(updatedTasks, this.currentTask.pendingTask.uuid, diff)
        }
        this.db.setData('tasks', updatedTasks, () => {
          console.log('[app] setBreak: updated tasks')
          this.db.setData('currentTask', nextTask, callback || (() =>
            console.log('[app] setBreak: updated currentTask')))
        })
      },
      setCurrentTask(task, callback) {
        callback = callback || this._route
        console.log('[app] setCurrentTask:', (this.currentTask || {}).name, '->', (task || {}).name)
        let updatedTasks = this.tasks
        //this._updateTaskElapsedTime(this.currentTask)
        if (this.currentTask) {
          const diff = makeTaskElapsedTimeUpd(this.currentTask)
          updatedTasks = applyTaskUpdate(updatedTasks, this.currentTask.uuid, diff)
        }
        //task = this._updateTaskStartTime(task)
        if (task) {
          const diff = makeTaskStartTimeUpd(task)
          task = Object.assign({}, task, diff)
          updatedTasks = applyTaskUpdate(updatedTasks, task.uuid, diff)
        }
        this.db.setData('tasks', updatedTasks, () => {
          console.log('[app] setCurrentTask: updated tasks')
          this.db.setData('currentTask', task, callback || (() =>
            console.log('[app] setCurrentTask: updated currentTask')))
        })
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
      planTomorrow() {
        this.db.clear()
        //this.db.setData('startDate', common.getNextDay().toISOString(), this._route.bind(this))
        this._route()
      },
    },
  }
</script>
