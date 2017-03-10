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
    <duration-picker
      v-if="modalDuration"
      @pick="pickDuration"
      @close="modalDuration = false"
    ></duration-picker>
    <h1>Plan your day</h1>
    <p>Tasks: (you can drag &amp; drop)</p>
    <ol>
      <draggable v-model="tasks" @end="onDragEnd">
        <li v-for="task, i in tasks" :key="task" :data-index="i" :data-name="task">
          {{ task.name }} ({{ task.minutes }} mn)
          <span class="task-delete" @click="onDeleteTask"> [delete]</span>
        </li>
      </draggable>
    </ol>
    <p>
      add: <input ref="input" @change="onAddTask" placeholder="enter a new task">
    </p>
    <router-link to="/focus/0">I'm ready to work!</router-link>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  import durationPicker from './ui-duration-picker.vue'

  export default {
    props: [ 'db' ],
    components: {
      draggable,
      durationPicker,
    },
    data: () => ({
      modalDuration: false,
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
        const delTaskIndex = evt.target.parentElement.getAttribute('data-index')
        const tasks = this.tasks.slice().filter((taskName, i) => i != delTaskIndex)
        this.db.setData('tasks', tasks, () => console.log('removed:', delTaskIndex))
      },
      onAddTask: function(evt) {
        this.modalDuration = true // => pickDuration() will be called
      },
      pickDuration: function(minutes) {
        console.log('setDuration', minutes)
        const task = {
          name: this.$refs.input.value,
          minutes: minutes,
        }
        this.db.setData('tasks', this.tasks.concat([ task ]), () =>
          console.log('added:', task))
        this.$refs.input.value = ''
        this.modalDuration = false
      },
    },
  }
</script>
