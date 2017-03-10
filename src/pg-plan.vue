<template>
  <div class="pg-plan">
    <h1>Plan your day</h1>
    <ul>
      <draggable v-model="tasks" @end="onDragEnd">
        <li v-for="task in tasks">
          {{ task }}
        </li>
      </draggable>
    </ul>
    <input @change="onAddTask">
  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  import db from './db.js'

  export default {
    components: {
      draggable,
    },
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
      onDragEnd: function(evt) {
        console.log('onDragEnd', evt)
        db.setData('tasks', this.tasks, () => console.log('saved.'))
      },
      onAddTask: function(evt) {
        const task = evt.target.value
        db.setData('tasks', this.tasks.concat([ task ]), () => console.log('added:', task))
        evt.target.value = ''
      },
    },
  }
</script>
