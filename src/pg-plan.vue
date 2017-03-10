<template>
  <div class="pg-plan">
    <h1>Plan your day</h1>
    <ul>
      <li v-for="task in tasks">
        {{ task }}
      </li>
    </ul>
    <input @change="onAddTask">
  </div>
</template>

<script>
  import db from './db.js'

  export default {
    data: () => ({
      tasks: [],
    }),
    created: function() {
      db.subscribeToData('tasks', ({ key, value }) => { this.tasks = value })
    },
    destroyed: function() {
      // TODO: db.unsubscribeToData('tasks')
    },
    methods: {
      onAddTask: function(evt) {
        const task = evt.target.value
        db.setData('tasks', this.tasks.concat([ task ]), () => console.log('added:', task))
        evt.target.value = ''
      },
    },
  }
</script>
