<style>
  .pg-plan h1 {
    font-weight: 300;
    color: #333333;
    font-size: 32px;
  }
  .pg-plan h2 {
    font-weight: 400;
    font-size: 15px;
    color: rgba(50,50,50, 0.5);
    margin-top: 0;
    margin-bottom: 30px;
  }
  .plan-tasks {
    padding: 30px 50px;
    text-align: left;
    list-style: none;
  }
  .plan-tasks li {
    position: relative;
    border-bottom: 1px solid #EBEBEB;
  }
  .plan-tasks li span {
    vertical-align: middle;
  }
  .plan-tasks li .task-number {
    display: inline-block;
    text-align: right;
    width: 20px;
    margin-right: 20px;
    font-size: 15px;
    font-weight: 400;
    color: rgba(50,50,50, 0.5);
  }
  .plan-tasks li .task {
    display: inline-block;
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
    font-size: 15px;
    font-weight: 400;
    color: #333333;
  }
  .plan-tasks .task-duration,
  .plan-tasks .task-estimate {
    display: inline-block;
    width: 50px;
    text-align: center;
    font-size: 10px;
    line-height: 30px;
    color: lightgray;
  }
  li .task-delete {
    display: none;
  }
  li:hover .task-duration,
  li:hover .task-estimate {
    display: inline-block;
    background-color: lightgray;
    color: gray;
    cursor: pointer;
  }
  li:hover .task-delete {
    display: block;
    position: absolute;
    top: 6px;
    right: -30px;
    width: 30px;
    text-align: center;
    cursor: pointer;
    font-size: 20px;
    line-height: 30px;
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
    <h1>{{ today }}</h1>
    <h2>Today is a New Day. What's your plan ?</h2>
    <ol class="plan-tasks">
      <draggable v-model="tasks" @end="onDragEnd">
        <li v-for="task, i in tasks" :key="task" :data-index="i" :data-name="task.name">
          <span class="task-number">{{ i + 1 }}.</span>
          <span class="task">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-duration" v-if="task.minutes" @click="estimateTask">{{ renderMinutes(parseInt(task.minutes)) }}</span>
            <span class="task-estimate" v-if="!task.minutes" @click="estimateTask">Estimate</span>
            <span class="task-delete" @click="onDeleteTask">×</span>
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
    <button class="button outline" @click="onStart">Start my day</button>
  </div>
</template>

<script>
  // TODO: (styling) improve integration of drag&drop
  
  import common from './common.js'
  import draggable from 'vuedraggable'
  import NotifDone from './ui-notif-done.vue'
  import durationPicker from './ui-duration-picker.vue'

  const formatDate = common.formatDate
  const renderMinutes = common.renderMinutes

  export default {
    props: [
      'db',
      'tasks',
      'analytics',
      'goToNextTask',
      'updateTaskByName',
    ],
    components: {
      draggable,
      durationPicker,
    },
    data: () => ({
      askDurationFor: null,
      afterDurationFct: null, // function to call after setting a task's duration
    }),
    mounted() {
      NotifDone.reset(this.db) // clears the "task done / undo" notification
      this.analytics.plan.start()
    },
    computed: {
      today: function() { return formatDate(new Date()); }
    },
    methods: {
      renderMinutes,
      onStart() {
        const nonEstimatedTasks = this.tasks.filter((task) => !task.minutes)
        if (nonEstimatedTasks.length) {
          // estimate next non-estimated task
          this.askDurationFor = nonEstimatedTasks[0].name // => pickDuration() will be called
          this.afterDurationFct = this.onStart.bind(this)
        } else {
          this.goToNextTask()
          this.analytics.focus.start(this.tasks.map((task) => ({
            id: task.uuid,
            name: task.name,
            estimation: task.minutes * 60, // in seconds
          })))
        }
      },
      onDragEnd(evt) {
        this.db.setData('tasks', this.tasks, () => console.log('[plan] saved.'))
        this.$refs.input.focus()
      },
      onDeleteTask(evt) {
        const delTaskIndex = evt.target.closest('[data-index]').getAttribute('data-index')
        const task = this.tasks[delTaskIndex]
        const tasks = this.tasks.slice().filter((taskName, i) => i != delTaskIndex)
        this.db.setData('tasks', tasks, () => console.log('[plan] removed:', delTaskIndex))
        this.$refs.input.focus()
        this.analytics.plan.removeTask(task.uuid)
      },
      onAddTask(evt) {
        const task = {
          uuid: common.uuid(),
          name: this.$refs.input.value,
        }
        this.db.setData('tasks', this.tasks.concat([ task ]), () =>
          console.log('[plan] added:', task))
        this.$refs.input.value = ''
        this.$refs.input.focus()
        this.analytics.plan.addTask({
          id: task.uuid,
          name: task.name,
          estimation: null, // in seconds
        })
      },
      estimateTask(evt) {
        const taskName = evt.target.closest('[data-name]').getAttribute('data-name')
        console.log('estimating task:', taskName)
        this.askDurationFor = taskName // => pickDuration() will be called
        this.analytics.estimate.start()
      },
      pickDuration(minutes) {
        const taskName = this.askDurationFor
        const task = this.tasks.find((task) => task.name === taskName)
        this.updateTaskByName(taskName, { minutes: parseInt(minutes) }, this.afterDurationFct)
        this.askDurationFor = null
        this.analytics.estimate.estimate(task.uuid, parseInt(minutes) * 60)
      },
    },
  }
</script>
