<style lang="scss">

  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";

  .pg-focus h1 {
    @extend .font-large;
    padding: space(4) 0; 
  }

  .pg-focus .header {
    z-index:  20;
    position: relative;
    padding:  space(5);
  }

  .focus-notifs {
    position:     absolute;
    z-index:      30;
    top:          space(5);
    left:         0;
    right:        0;
    width:        100%;
  }
  
  /* navigation */

  .arrow-container {
    position:     absolute;
    left:         50%;
    transform:    translate(-50%, 0px);
    bottom:       space(5);
  }

  .arrow {
    cursor:       pointer;
    margin:       0px space(2);
    display:      inline-block;
    width:        space(6);
    height:       space(6);
  }

  .arrow:hover circle {
    fill: color(gray,pale);
  }

  .arrow:active circle {
    fill: color(gray,light);
  }

</style>

<template>
  <div class="pg-focus">
    <div class="header">
      <span class="meta">Today</span>
      <page-indicator :pages="tasks" @page-changed="goToTask" />
      <div class="focus-notifs">
        <notif-done
          ref="notifDone"
          :db="db"
          :current-task="task"
          @cancel="onDoneCancel"
        />
        <notif-review @gotoreview="onGoToReview" />
      </div>
    </div>
    <div class="centered pb5">
      <h1>{{ task.name }}</h1>
      <button class="btn btn-secondary btn-next" @click="onDone">It's done</button>
    </div>
    <div class="arrow-container">
      <div class="arrow" @click.prevent="skipToPrev">
        <vector :src="leftArrow"/>
      </div>
      <div class="arrow" @click.prevent="skipToNext">
        <vector :src="rightArrow"/>
      </div>
    </div>
  </div>
</template>

<script>
  import NotifDone from './ui-notif-done.vue'
  import NotifReview from './ui-notif-review.vue'
  import PageIndicator from './ui-page-indicator.vue';
  import Vector from './ui-vector.vue';

  // TODO: polish
  // TODO: integrate "Snooze" button on top-right corner
  export default {
    components: {
      'notif-done': NotifDone,
      'notif-review': NotifReview,
      'page-indicator': PageIndicator,
      'vector': Vector,
    },
    props: [
      'db',
      //'tasks', // TODO: add this line, and remove fetchData() calls
      'analytics',
      'setCurrentTask',
      'goToNextTask',
      'updateTaskByName',
    ],
    data: () => ({
      taskindex: null,
      task: {},
      tasks: [],
      leftArrow: require('./svg/arrow-back.svg'),
      rightArrow: require('./svg/arrow-forward.svg'),
    }),
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
    },
    mounted() { this.fetchData() },
    //updated() { this.fetchData(true) },
    methods: {
      skipToNext() {
        this.db.fetchData('tasks', ({ key, value }) => {
          const tasks = value || []
          const index = (this.taskindex + 1) % tasks.length
          console.log('skipToNext', index)
          this.$router.push('/focus/' + index)
          this.analytics.focus.moveForward({
            index: index,
            taskId: tasks[index].uuid,
          })
        })
      },
      skipToPrev() {
        this.db.fetchData('tasks', ({ key, value }) => {
          const tasks = value || []
          const index = (tasks.length + this.taskindex - 1) % tasks.length
          console.log('skipToPrev', index)
          this.$router.push('/focus/' + index)
          this.analytics.focus.moveBackward({
            index: index,
            taskId: tasks[index].uuid,
          })
        })
      },
      goToTask(taskIndex) {
        this.db.fetchData('tasks', ({ key, value }) => {
          const tasks = value || []
          this.analytics.focus.changePage({
            index: this.taskindex,
            taskId: tasks[this.taskindex].uuid,
          }, {
            index: taskIndex,
            taskId: tasks[taskIndex].uuid,
          })
          this.$router.push('/focus/' + taskIndex)
        })
      },
      fetchData() {
        this.db.fetchData('tasks', ({ key, value }) => {
          const tasks = value || []
          // 1. update view data based on route parameter
          this.taskindex = parseInt(this.$route.params.taskindex)
          this.tasks = tasks.map((task, i) => ({
            title: task.name,
            done: task.done,
            current: i === this.taskindex,
          }))
          // 2. update current task (based on route parameter)
          const now = new Date().getTime()
          this.task = Object.assign({}, tasks[this.taskindex], { lastStart: now })
          this.setCurrentTask(this.task) // will update timer and persist in db
        })
      },
      onDone() {
        console.log('onDone')
        this.$refs.notifDone.notifyDoneTask(this.task)
        this.analytics.focus.finishTask(this.task.uuid)
        // 1.set current task as done
        this.updateTaskByName(this.task.name, { done: true }, () => {
          console.log('=> goToNextTask')
          // 2. go to next task to be done (or review page)
          this.goToNextTask()
        })
      },
      onDoneCancel(task) {
        console.log('cancelling task:', task)
        this.analytics.focus.undoFinishTask(task.uuid)
        // 1. set previous task as not done
        this.updateTaskByName(task.name, { done: false }, () => {
          console.log('=> goToNextTask')
          // 2. go to next task to be done (or review page)
          this.goToNextTask()
        })
      },
      onGoToReview() {
        this.db.setData('reasonForReview', this.analytics.review.startReason.MANUALLY, () => {
          this.$router.push('/review')
        })
      },
    }
  }
</script>
