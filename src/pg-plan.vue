<style>
  .pg-plan h1 {
    font-weight: normal;
  }
  .pg-plan h2 {
    font-weight: normal;
    font-size: 14px;
    color: gray;
    margin-top: 0;
    margin-bottom: 30px;
  }
  .plan-tasks {
    border: 1px solid lightgray;
    padding: 30px 50px;
    text-align: left;
    list-style: none;
  }
  .plan-tasks li {
    position: relative;
  }
  .plan-tasks li span {
    vertical-align: middle;
  }
  .plan-tasks li .task-number {
    display: inline-block;
    text-align: right;
    width: 20px;
    margin-right: 20px;
    font-size: 18px;
  }
  .plan-tasks li .task {
    display: inline-block;
    border-bottom: 1px solid lightgray;
  }
  .plan-tasks li .task.task-entry {
    display: inline-block;
    border-bottom: 0px none;
  }
  .plan-tasks .task.task-entry .task-name {
    border: 0 none;
    outline: none;
  }
  .plan-tasks .task-name {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    width: 300px;
    text-overflow: ellipsis;
    padding: 10px 0;
    font-size: 18px;
  }
  .plan-tasks .task-duration {
    display: inline-block;
    width: 80px;
    text-align: right;
    font-size: 10px;
    color: lightgray;
  }
  li .task-delete {
    display: none;
  }
  li:hover .task-duration {
    display: none;
  }
  li:hover .task-delete {
    display: inline-block;
    width: 80px;
    text-align: right;
    cursor: pointer;
    font-size: 10px;
    color: lightgray;
  }
  li:hover .task-delete:hover {
    color: red;
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
    <h1>Today is a New Day</h1>
    <h2>What do you want to get done?</h2>
    <ol class="plan-tasks">
      <draggable v-model="tasks" @end="onDragEnd">
        <li v-for="task, i in tasks" :key="task" :data-name="task">
          <span class="task-number">{{ i + 1 }}.</span>
          <span class="task">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-duration">{{ task.minutes }} mn</span>
            <span class="task-delete" :data-index="i" @click="onDeleteTask">delete</span>
          </span>
        </li>
      </draggable>
      <li>
        <span class="task-number">&nbsp;</span>
        <span class="task task-entry">
          <input class="task-name"
                 ref="input"
                @change="onAddTask"
                placeholder="New task" />
          <span class="task-duration"></span>
          <span class="task-delete"></span>
        </span>
      </li>
    </ol>
    <router-link class="button" to="/focus/0">Start my day</router-link>
  </div>
</template>

<script>
  const HOUR_END_OF_DAY = 21 // hour of the day when review screen is to be shown systematically

  // TODO: (styling) improve integration of drag&drop
  
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
      if (new Date().getHours() >= HOUR_END_OF_DAY) {
        this.$router.push('/review')
        return
      }
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
        this.$refs.input.focus()
      },
      onDeleteTask(evt) {
        const delTaskIndex = evt.target.getAttribute('data-index')
        const tasks = this.tasks.slice().filter((taskName, i) => i != delTaskIndex)
        this.db.setData('tasks', tasks, () => console.log('[plan] removed:', delTaskIndex))
        this.$refs.input.focus()
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
        this.$refs.input.focus()
      },
    },
  }
</script>
