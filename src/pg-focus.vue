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
          :current-task="currentTask"
          @cancel="onDoneCancel"
        />
        <notif-review @gotoreview="onGoToReview" />
      </div>
    </div>
    <div class="centered pb5">
      <h1>{{ currentTask.name }}</h1>
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

  export default {
    components: {
      'notif-done': NotifDone,
      'notif-review': NotifReview,
      'page-indicator': PageIndicator,
      'vector': Vector,
    },
    props: [
      'taskindex', // route parameter
      'currentTask', // db subscription
      'tasks', // db subscription
      'db',
      'analytics',
      'setCurrentTask',
      'goToNextTask',
      'updateTaskByName',
    ],
    data: () => ({
      leftArrow: require('./svg/arrow-back.svg'),
      rightArrow: require('./svg/arrow-forward.svg'),
    }),
    methods: {
      skipToNext() {
        const index = (parseInt(this.taskindex) + 1) % this.tasks.length
        this.analytics.focus.moveForward({
          index: index,
          taskId: this.tasks[index].uuid,
        })
        this.setCurrentTask(this.tasks[index]) // will lead to that task's focus page
      },
      skipToPrev() {
        const index = (this.tasks.length + parseInt(this.taskindex) - 1) % this.tasks.length
        this.analytics.focus.moveBackward({
          index: index,
          taskId: this.tasks[index].uuid,
        })
        this.setCurrentTask(this.tasks[index]) // will lead to that task's focus page
      },
      goToTask(taskIndex) {
        this.analytics.focus.changePage({
          index: parseInt(this.taskindex),
          taskId: this.tasks[parseInt(this.taskindex)].uuid,
        }, {
          index: taskIndex,
          taskId: this.tasks[taskIndex].uuid,
        })
        this.setCurrentTask(this.tasks[taskIndex]) // will lead to that task's focus page
      },
      onDone() {
        this.$refs.notifDone.notifyDoneTask(this.currentTask)
        this.analytics.focus.finishTask(this.currentTask.uuid)
        // set current task as done
        this.updateTaskByName(this.currentTask.name, { done: true }, () => {
          this.goToNextTask()
        })
      },
      onDoneCancel(task) {
        console.log('cancelling task:', task)
        this.analytics.focus.undoFinishTask(task.uuid)
        // set previous task as not done
        this.updateTaskByName(task.name, { done: false }, () => {
          this.goToNextTask()
        })
      },
      onGoToReview() {
        this.db.setData('reasonForReview', this.analytics.review.startReason.MANUALLY, () => {
          this.$router.push('/mood') // TODO: do that in app.vue instead
        })
      },
    }
  }
</script>
