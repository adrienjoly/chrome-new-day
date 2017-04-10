<style lang="scss">

  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";
  
  .plan-tasks {
    padding:            space(3);
    margin:             0 0 space(5);
    text-align:         left;
    list-style:         none;
  }

  .plan-tasks li {
    position:           relative;
    display:            block;
    padding-left:       space(5);
    padding-right:      space(5);
    width:              100%;
    
    &:first-child {
      .task {           border-top: 1px solid color(gray,pale); }
    }

    &:hover {
      cursor:           pointer;
      .task-estimate,
      .task-duration {  opacity: 1; }
      .task-delete {    display: block; }
    }
  }

  .task {
    position:           relative;
    display:            block;
    border-bottom:      1px solid color(gray,pale);
    padding:            space(2) 0;

    .task-name {
      @extend           .font-regular;
      overflow:         hidden;
      white-space:      nowrap;
      text-overflow:    ellipsis;
      display:          block;
      padding-right:    80px;
      width:            100%;
    }

    .task-estimate, 
    .task-duration {
      @extend           .font-small;
      display:          block;
      position:         absolute;
      right:            0;
      top:              space(1);
      text-align:       center;
      width:            70px;
      padding:          space(1) 0;
      color:            color(gray,medium);
      border-radius:    $radius-small;
      &:hover {
        background-color: color(gray,pale);
        color:            color(gray,dark);
        cursor:           pointer;
      }
    }

    .task-estimate {  opacity: 0; }

  }
 
  .task.task-entry {
    border-bottom:        1px solid white;
    &:hover {             border-bottom: 1px solid color(gray,pale); }
    .task-name {
      border:             none;
      outline:            none;
      &:hover {           color: color(gray,dark); }
    }
    .task-duration {
      display:            none;
    }
  }

  .task-number {
    position:               absolute;
    display:                block;
    left:                   0;
    text-align:             right;
    width:                  space(4);
    margin:                 space(2) 0;
    color:                  color(gray,medium);
  }

  .task-delete {
    position:               absolute;
    display:                none;
    top:                    0;
    right:                  0;
    width:                  30px;
    text-align:             center;
    cursor:                 pointer;
    font-size:              20px;
    line-height:            30px;
    color:                  color(gray,medium);
    margin:                 space(1);
    border-radius:          50%;
    &:hover { 
      color:                black; 
      background-color:     color(gray,pale);
    }
  }

</style>

<template>
  <div class="main-wrapper">
    <duration-picker
      v-if="askDurationFor"
      :taskName="askDurationFor"
      @pick="pickDuration"
      @close="askDurationFor = null"
    ></duration-picker>
    <div class="head-wrapper">
      <h1>{{ today }}</h1>
      <h2>Today is a New Day. What's your plan ?</h2>
    </div>
    <ol class="plan-tasks">
      <draggable v-model="tasks" @end="onDragEnd">
        <li v-for="task, i in tasks" :key="task" :data-index="i" :data-name="task.name">
          <span class="task-number">{{ i + 1 }}.</span>
          <span class="task">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-duration" v-if="task.minutes" @click="estimateTask">{{ renderMinutes(parseInt(task.minutes)) }}</span>
            <span class="task-estimate" v-if="!task.minutes" @click="estimateTask">Estimate</span>
            <!-- <span class="task-delete" @click="onDeleteTask">×</span> -->
          </span>
          <span class="task-delete" @click="onDeleteTask">×</span>
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
    <button class="button btn-outline btn-centered" @click="onStart">Start my day</button>
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
      'startDay',
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
          this.startDay()
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
        if (this.$refs.input.value.trim() === '') return;
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
