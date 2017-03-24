<style>
  .pg-focus h1 {
    font-size: 64px;
  }
  .focus-notifs {
    position: absolute;
    top: 0;
  }
  
  /* navigation */

  .arrow-container {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0px);
    bottom: 50px;
  }

  .arrow {
    margin: 0px 10px;
    display: inline-block;
    width: 64px;
    height: 64px;
    cursor: pointer;
  }

  .arrow:hover circle {
    fill: rgba(175,175,175,0.05);
  }

  .arrow:active circle {
    fill: rgba(100,100,100,0.1);
  }

</style>

<template>
  <div class="pg-focus centered">
    <div class="centered">
      <h1>{{ task.name }}</h1>
      <button class="button secondary btn-next" @click="onDone">It's done</button>
    </div>
    <div class="focus-notifs">
      <notif-done
        ref="notifDone"
        :db="db"
        :current-task="task"
        @cancel="onDoneCancel"
      />
      <notif-review />
      <page-indicator :pages="tasks" @page-changed="goToTask" />
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
        })
      },
      skipToPrev() {
        this.db.fetchData('tasks', ({ key, value }) => {
          const tasks = value || []
          const index = (tasks.length + this.taskindex - 1) % tasks.length
          console.log('skipToPrev', index)
          this.$router.push('/focus/' + index)
        })
      },
      goToTask(taskIndex) {
        this.$router.push('/focus/' + taskIndex)        
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
        // 1.set current task as done
        this.updateTaskByName(this.task.name, { done: true }, () => {
          console.log('=> goToNextTask')
          // 2. go to next task to be done (or review page)
          this.goToNextTask()
        })
      },
      onDoneCancel(task) {
        console.log('cancelling task:', task)
        // 1. set previous task as not done
        this.updateTaskByName(task.name, { done: false }, () => {
          console.log('=> goToNextTask')
          // 2. go to next task to be done (or review page)
          this.goToNextTask()
        })
      },
    }
  }
</script>
