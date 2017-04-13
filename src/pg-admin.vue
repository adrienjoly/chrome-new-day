<style scoped>
  .pg-admin {
    padding: 10px;
  }
  h2 {
    color: white;
    background-color: black;
    margin: 10px 0;
    padding: 5px;
  }
</style>

<template>
  <div class="pg-admin">
    <h1>New Day - diagnostics</h1>
    <p> ℹ️ In case of bug, please select all the text of this page, and copy-paste it in an email to the "New Day" team. Thanks for your help and understanding! 🙌</p>

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

    <h2>Raw state</h2>
    <xmp>{{ raw }}</xmp>
  </div>
</template>

<script>
  export default {
    props: [
      'db',
      'tasks',
      'currentTask',
    ],
    data: () => ({
      raw: null,
    }),
    created() {
      this.db.fetchData(null, ({key, value}) => this.raw = JSON.stringify(value, null, 2))
    },
  }
</script>
