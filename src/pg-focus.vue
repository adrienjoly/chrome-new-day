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
      <h1>{{ currentTask.name }}</h1>
      <button class="button secondary btn-next" @click="onDone">It's done</button>
    </div>
    <div class="focus-notifs">
      <notif-done
        ref="notifDone"
        :db="db"
        :current-task="currentTask"
        @cancel="onDoneCancel"
      />
      <notif-review @gotoreview="onGoToReview" />
      <page-indicator :pages="tasks" :current="taskindex" @page-changed="goToTask" />
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
