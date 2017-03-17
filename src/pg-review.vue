<style>
</style>

<template>
  <div class="pg-review">
    <h1>Review</h1>

    <h2>Performance on your tasks</h2>
    <ol>
      <li v-for="task, i in tasks" :key="task">
        {{ task.name }} : 
        spent {{ renderElapsed(task) }} / {{ task.minutes }} mn (initially estimated)
      </li>
    </ol>

    <button class="button" @click="endOfDay">Plan tomorrow's tasks</button>
  </div>
</template>

<script>
  export default {
    props: [ 'db', 'setCurrentTask' ],
    data: () => ({
      tasks: [],
    }),
    methods: {
      endOfDay() {
        console.log('end of day')
        this.db.setData('mood', null, () => {
          this.$router.push('/')
        })
      },
      renderElapsed(task) {
        var seconds = parseInt((task.elapsedMillisecs || 0) / 1000)
        const minutes = parseInt(seconds / 60)
        seconds = seconds % 60
        return (minutes ? minutes + ' minutes and ' : '') + seconds + ' seconds'
      }
    },
    created() {
      this.db.subscribeToData('tasks', ({ key, value }) => {
        this.tasks = value || []
      })
    },
    destroyed() {
      this.db.unsubscribeToData('tasks')
    },
    mounted() {
      this.setCurrentTask() // will update timer and clear currentTask
      this.db.fetchData('mood', ({ key, value }) => {
        if (value === null || value === undefined) {
          this.$router.push('/mood')
        }
      })
    },
  }
</script>
