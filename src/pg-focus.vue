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
    props: [ 'db', 'setCurrentTask' ],
    data: () => ({
      taskindex: null,
      task: {},
      nextUrl: '',
    }),
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
    },
    mounted() { this.fetchData() },
    //updated() { this.fetchData(true) },
    methods: {
      fetchData() {
        this.db.fetchData('tasks', ({ key, value }) => {
          const tasks = value || []
          // 1. update view data based on route parameter
          this.taskindex = parseInt(this.$route.params.taskindex)
          this.nextUrl = tasks[this.taskindex + 1]
            ? '/focus/' + (this.taskindex + 1) : '/review'
          // 2. update current task (based on route parameter)
          const now = new Date().getTime()
          this.task = Object.assign({}, tasks[this.taskindex], { lastStart: now })
          this.setCurrentTask(this.task) // will update timer and persist in db
        })
      },
    }
  }
</script>
