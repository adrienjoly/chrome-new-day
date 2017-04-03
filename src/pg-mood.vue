<style>
  .pg-mood h1 {
    font-weight: bold;
    text-align: center;
    position: relative;
    top: 50px;
  }
  .pg-mood .button-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .pg-mood .icon {
    width: 92px;
    height: 92px;
    margin: 10px;
    display: inline-block;
  }

  .pg-mood .icon:hover {
    cursor: pointer;
  }

  .pg-mood .icon path {
    fill: #B2B2B2;
    transition: fill 0.2s ease-in-out;
  }

  .pg-mood .icon:hover path {
    fill: #F3A536;
  }

</style>

<template>
  <div class="pg-mood">
    <h1>How did you feel today ?</h1>
    <div class="button-bar">
      <a v-for="(item, index) in icons"
        class="icon"
        @click.prevent="pickMood(index)">
        <vector :src="item"></vector>
      </a>
    </div>
  </div>
  
</template>

<script>
  import Vector from './ui-vector.vue';
  import common from './common.js'

  export default {
    props: [
      'db',
      'tasks',
      'analytics',
      'goToNextTask',
    ],
    data: () => ({
      icons: [
        require('./svg/mood-0.svg'),
        require('./svg/mood-1.svg'),
        require('./svg/mood-2.svg'),
        require('./svg/mood-3.svg'),
        require('./svg/mood-4.svg')
      ]
    }),
    components: {
      'vector': Vector
    },
    mounted() {
      this.db.fetchData('reasonForReview', ({key, value}) => {
        // transfer reasonForReview from local storage to back-end
        const reasonForReview = value || this.analytics.review.startReason.FINISHED
        this.analytics.mood.start({
          reason: reasonForReview,
          totalTime: common.sumElapsedSecondsWithBreaks(this.tasks),
          breaks: [], // TODO
          tasks: this.tasks.map((task) => ({
            id: task.uuid,
            name: task.name,
            estimation: task.minutes * 60,
            done: task.done,
            timeSpent: task.elapsedMillisecs / 1000,
          })),
        })
      })
    },
    methods: {
      pickMood: function(mood) {
        console.log("mood> " + mood);
        this.analytics.mood.rate(mood)
        this.db.setData('mood', mood, () => {
          this.goToNextTask(); // will lead to /review
        })
      }
    }
  }
</script>
