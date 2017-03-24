<template>
  <div class="pg-admin">
    <h1>New Day - admin</h1>

    <h2>Current Task</h2>
    <p v-if="!currentTask || !currentTask.name">(none)</p>
    <div v-if="currentTask && currentTask.name">
      <p>name: {{ currentTask.name }}</p>
      <p>lastStart: {{ currentTask.lastStart }} ({{ new Date(currentTask.lastStart).toString() }})</p>
      <p> -> time since lastStart: {{ new Date().getTime() - currentTask.lastStart }}</p>
    </div>

    <h2>All Tasks</h2>
    <ol>
      <li v-for="task, i in tasks" :key="task">
        {{ task.name }}
        ({{ parseInt((task.elapsedMillisecs || 0) / 1000) / 60 }}
        / {{ task.minutes }} mn)
      </li>
    </ol>
  </div>
</template>

<script>
  export default {
    props: [ 'db' ],
    data: () => ({
      currentTask: {},
      tasks: [],
      tasksSubscriptionHandler: null,
    }),
    created() {
      this.tasksSubscriptionHandler = ({ key, value }) => {
        console.log('tasks:', value)
        this.tasks = value || []
      }
      this.db.subscribeToData('tasks', this.tasksSubscriptionHandler)
      this.db.subscribeToData('currentTask', ({ key, value }) => {
        console.log('currentTask:', value)
        this.currentTask = value || {}
      })
    },
    destroyed() {
      this.db.unsubscribeToData('tasks', this.tasksSubscriptionHandler)
    },
  }
</script>
