<style>
  * {
    font-family: sans-serif;
  }
  html {
    height: 100%;
  }
  body {
    position: relative;
    height: 100%;
    padding: 0;
    margin: 0;
  }
  .centered {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: center;
    text-align: center;
    align-items: center;
  }
  .button {
    border: 0 none;
    background-color: orange;
    padding: 10px 40px;
    color: white;
    text-decoration: none;
    cursor: pointer;
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
      :setCurrentTask="setCurrentTask"
      :updateTaskByName="updateTaskByName"
      :goToNextTask="goToNextTask"
    ></router-view>
  </div>
</template>

<script>
  import dbChrome from './db.js'
  import dbFake from './db-fake.js'

  const db = window.chrome && window.chrome.storage ? dbChrome : dbFake

  export default {
    name: 'app',
    data: () => ({
      db: db,
    }),
    methods: {
      updateTaskByName(taskName, update, callback) {
        this.db.fetchData('tasks', ({ key, value }) => {
          const tasks = value || []
          const updatedTasks = tasks.map((task) =>
            task.name !== taskName ? task : Object.assign({}, task, typeof update === 'function' ? update(task) : update))
          this.db.setData('tasks', updatedTasks, callback || (() =>
            console.log('[app] updated elapsed time of previous task')))
        })
      },
      setCurrentTask(task, callback) {
        const taskName = (task || {}).name
        console.log('[app] set current task:', taskName)
        this.db.fetchData(null, ({ key, value }) => {
          //console.log('fetched', value)
          value = value || {}
          const currentTask = value.currentTask
          if (taskName != (currentTask || {}).name) {
            const tasks = value.tasks || []
            const now = new Date().getTime()
            if (currentTask) {
              const newMillisecs = now - currentTask.lastStart
              this.updateTaskByName(currentTask.name, (task) => ({
                elapsedMillisecs: (task.elapsedMillisecs || 0) + newMillisecs,
              }), callback)
            }
            this.db.setData('currentTask', task || null, callback && !currentTask ? callback : (() =>
              console.log('[app] updated currentTask')))
          } else if (callback) {
            callback()
          }
        })
      },
      goToNextTask() {
        this.db.fetchData('tasks', ({ key, value }) => {
          const tasks = value || []
          const nextIndex = tasks.findIndex((task) => !task.done)
          console.log('goToNextTask:', nextIndex, tasks)
          if (nextIndex !== -1) {
            this.$router.push('/focus/' + nextIndex)
          } else {
            this.$router.push('/review')
          }
        })
      },
    },
  }
</script>
