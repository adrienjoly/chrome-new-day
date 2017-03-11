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
  .pg-focus {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: center;
    text-align: center;
    align-items: center;
  }
  h1 {
    font-size: 64px;
  }
  a {
    background-color: orange;
    padding: 10px 40px;
    color: white;
    text-decoration: none;
    cursor: pointer;
  }
</style>

<template>
  <div class="pg-focus">
    <h1>{{ task.name }}</h1>
    <router-link :to="nextUrl">It's done</router-link>
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
