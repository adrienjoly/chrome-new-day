<style>
</style>

<template>
  <div class="pg-focus">
    <h1>Focus #{{ taskindex }}</h1>
    <h2>{{ task.name }}</h2>
    <router-link :to="nextUrl">Done with this task!</router-link>
  </div>
</template>

<script>
  export default {
    props: [ 'db' ],
    data: function() {
      return {
        taskindex: null,
        task: {},
        nextUrl: '',
      }
    },
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
    },
    mounted: function() { this.fetchData() },
    updated: function() { this.fetchData(true) },
    methods: {
      fetchData: function(updateCurrentTask) {
        this.taskindex = parseInt(this.$route.params.taskindex)
        this.nextUrl = '/focus/' + (this.taskindex + 1)
        console.log('fetchData', this.taskindex)
        this.db.fetchData(null, ({ key, value }) => {
          console.log('fetched', value)
          const currentTask = value.currentTask
          const tasks = value.tasks || []
          this.task = tasks[this.taskindex]
          if (!tasks[this.taskindex + 1]) {
            this.nextUrl = '/review'
          }
          if (updateCurrentTask) {
            console.log('updating current task...')
            const now = new Date().getTime()
            if (currentTask) {
              const newMillisecs = now - currentTask.lastStart
              const updatedTasks = tasks.map((task) =>
                task.name !== currentTask.name ? task : Object.assign({}, task, {
                  elapsedMillisecs: (task.elapsedMillisecs || 0) + newMillisecs,
                }))
              this.db.setData('tasks', updatedTasks, () => console.log('saved tasks'))
            }
            const newTask = Object.assign({}, this.task, { lastStart: now })
            this.db.setData('currentTask', newTask, () =>
              console.log('saved currentTask', newTask))
          }
        })
      },
    }
  }
</script>
