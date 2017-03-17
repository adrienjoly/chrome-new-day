<style>
  .pg-focus h1 {
    font-size: 64px;
  }
  .focus-notifs {
    position: absolute;
    top: 0;
  }
  
  /* navigation */

  .prev-task,
  .next-task {
    position: absolute;
    top: 50%;
    cursor: pointer;
    text-decoration: none;
    background-color: gray;
    color: white;
    border-radius: 20px;
    width: 20px;
    height: 20px;
    text-align: center;
  }

  .prev-task {
    left: 10px;
  }

  .next-task {
    right: 10px;
  }
</style>

<template>
  <div class="pg-focus centered">
    <div class="focus-notifs">
      <notif-review />
      <page-indicator :pages="pages" />
    </div>
    <div class="centered">
      <h1>{{ task.name }}</h1>
      <button class="button btn-next" @click="onDone">It's done</button>
    </div>
    <div class="prev-task" @click="skipToPrev">&lt;</div>
    <div class="next-task" @click="skipToNext">&gt;</div>
  </div>
</template>

<script>
  import NotifReview from './ui-notif-review.vue'
  import PageIndicator from './ui-page-indicator.vue';

  // TODO: polish
  // TODO: integrate task progress on top
  // TODO: integrate "Snooze" button on top-right corner
  export default {
    components: {
      'notif-review': NotifReview,
      'page-indicator': PageIndicator
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
      pages: [
        { title: "page1", done: true }, 
        { title: "page2", current: true, done: true }, 
        { title: "page3", } 
      ]
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
      fetchData() {
        this.db.fetchData('tasks', ({ key, value }) => {
          const tasks = value || []
          // 1. update view data based on route parameter
          this.taskindex = parseInt(this.$route.params.taskindex)
          // 2. update current task (based on route parameter)
          const now = new Date().getTime()
          this.task = Object.assign({}, tasks[this.taskindex], { lastStart: now })
          this.setCurrentTask(this.task) // will update timer and persist in db
        })
      },
      onDone() {
        console.log('onDone')
        // 1.set current task as done
        this.updateTaskByName(this.task.name, { done: true }, () => {
          console.log('=> goToNextTask')
          // 2. go to next task to be done (or review page)
          this.goToNextTask()
        })
      }
    }
  }
</script>
