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
    updated: function() { this.fetchData() },
    methods: {
      fetchData: function() {
        this.taskindex = parseInt(this.$route.params.taskindex)
        this.nextUrl = '/focus/' + (this.taskindex + 1)
        console.log('fetchData', this.taskindex)
        this.db.fetchData('tasks', ({ key, value }) => {
          const task = value[this.taskindex]
          console.log('fetched', task)
          this.task = value[this.taskindex]
          if (!value[this.taskindex + 1]) {
            this.nextUrl = '/review'
          }
        })
      },
    }
  }
</script>
