<template>
  <div id="app">
    <!--
    <router-link to="/">[home]</router-link>
    <router-link to="/admin">[admin]</router-link>
    -->
    <router-view
      :db="db"
      :setCurrentTask="setCurrentTask"
    ></router-view>
  </div>
</template>

<script>
  import dbChrome from './db.js'
  import dbFake from './db-fake.js'

  const db = chrome && chrome.storage ? dbChrome : dbFake

  export default {
    name: 'app',
    data: () => ({
      db: db,
    }),
    methods: {
      setCurrentTask(task) {
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
              const updatedTasks = tasks.map((task) =>
                task.name !== currentTask.name ? task : Object.assign({}, task, {
                  elapsedMillisecs: (task.elapsedMillisecs || 0) + newMillisecs,
                }))
              this.db.setData('tasks', updatedTasks, () =>
                console.log('[app] updated elapsed time of previous task'))
            }
            this.db.setData('currentTask', task || null, () =>
              console.log('[app] updated currentTask'))
          }
        })
      },
    },
  }


</script>
