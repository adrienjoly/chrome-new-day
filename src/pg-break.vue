<style lang="scss">

  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";

  .pg-break h1 {
    @extend .font-large;
    padding: space(4) 0; 
  }

  .pg-break .header {
    z-index:  20;
    position: relative;
    padding:  space(5);
  }

  .break-notifs {
    position:     absolute;
    z-index:      30;
    top:          space(5);
    left:         0;
    right:        0;
    width:        100%;
  }

</style>

<template>
  <div class="pg-break">
    <div class="header">
      <span class="meta">Today</span>
      <div class="break-notifs">
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
      <h1>(Break)</h1>
      <button class="btn btn-secondary btn-next" @click="onDone">Back to work!</button>
    </div>
  </div>
</template>

<script>
  import NotifDone from './ui-notif-done.vue'
  import NotifReview from './ui-notif-review.vue'

  export default {
    components: {
      'notif-done': NotifDone,
      'notif-review': NotifReview,
    },
    props: [
      'currentTask', // db subscription
      'db',
      'analytics',
      'setBreak',
      'goToNextTask',
      'updateTaskByName',
    ],
    methods: {
      onDone() {
        this.setBreak(false)
        // TODO: analytics
      },
      onDoneCancel(task) {
        console.log('cancelling task:', task)
        this.analytics.break.undoFinishTask(task.uuid)
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
