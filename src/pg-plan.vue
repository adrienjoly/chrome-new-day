<style>
  li .task-delete {
    display: none;
  }
  li:hover .task-delete {
    display: inline;
    cursor: pointer;
    color: gray;
  }
  li:hover .task-delete:hover {
    color: black;
  }
</style>

<template>
  <div class="pg-plan">
    <h1>Plan your day</h1>
    <ul>
      <draggable v-model="tasks" @end="onDragEnd">
        <li v-for="task in tasks" :key="task" :data-name="task">
          {{ task }}
          <span class="task-delete" @click="onDeleteTask"> [delete]</span>
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
    props: [ 'db' ],
    components: {
      draggable,
    },
    data: () => ({
      tasks: [],
    }),
    created: function() {
      this.db.subscribeToData('tasks', ({ key, value }) => {
        console.log('subscribeToData', key, value)
        this.tasks = value || []
      })
    },
    destroyed: function() {
      // TODO: this.db.unsubscribeToData('tasks')
    },
    methods: {
      onDragEnd: function(evt) {
        console.log('onDragEnd', evt)
        this.db.setData('tasks', this.tasks, () => console.log('saved.'))
      },
      onDeleteTask: function(evt) {
        const delTaskName = evt.target.parentElement.getAttribute('data-name')
        const tasks = this.tasks.filter((taskName) => taskName !== delTaskName)
        this.db.setData('tasks', tasks, () => console.log('removed:', delTaskName))
      },
      onAddTask: function(evt) {
        const task = evt.target.value
        this.db.setData('tasks', this.tasks.concat([ task ]), () => console.log('added:', task))
        evt.target.value = ''
      },
    },
  }
</script>
