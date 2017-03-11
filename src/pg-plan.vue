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
  <div class="pg-plan centered">
    <duration-picker
      v-if="askDurationFor"
      :taskName="askDurationFor"
      @pick="pickDuration"
      @close="askDurationFor = null"
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
      askDurationFor: null,
      tasks: [],
    }),
    created() {
      this.db.subscribeToData('tasks', ({ key, value }) => {
        this.tasks = value || []
      })
    },
    destroyed() {
      this.db.unsubscribeToData('tasks')
    },
    mounted() {
      this.db.fetchData(null, ({ key, value }) => {
        // if user is supposed to be focusing on a task => redirect to focus page
        if (value && value.currentTask) {
          const index = value.tasks.findIndex((t) => t.name === value.currentTask.name)
          this.$router.push('/focus/' + index)
        }
        // TODO: redirect to /review if all tasks of the day are done
      })
    },
    methods: {
      onDragEnd(evt) {
        this.db.setData('tasks', this.tasks, () => console.log('[plan] saved.'))
      },
      onDeleteTask(evt) {
        const delTaskIndex = evt.target.parentElement.getAttribute('data-index')
        const tasks = this.tasks.slice().filter((taskName, i) => i != delTaskIndex)
        this.db.setData('tasks', tasks, () => console.log('[plan] removed:', delTaskIndex))
      },
      onAddTask(evt) {
        this.askDurationFor = this.$refs.input.value // => pickDuration() will be called
      },
      pickDuration: function(minutes) {
        const task = {
          name: this.$refs.input.value,
          minutes: minutes,
        }
        this.db.setData('tasks', this.tasks.concat([ task ]), () =>
          console.log('[plan] added:', task))
        this.$refs.input.value = ''
        this.askDurationFor = null
      },
    },
  }
</script>
