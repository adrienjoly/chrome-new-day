<style lang="scss">

  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";

  .pg-mood .button-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .pg-mood .icon-mood {
    cursor: pointer;
    display: inline-block;
    margin: space(4);
    transition: .1s ease transform;
    .vector-container {
      width: 60px;
      height: 60px;
    }
    svg path {  fill: color(gray,medium); }
    &:hover {
      transform: scale(1.1);
      svg.icon-mood-bad path { fill: color(orange,medium); }
      svg.icon-mood-good path { fill: color(green,medium); }
    }
  }

</style>

<template>
  <div class="pg-mood main-wrapper">
    <h1 class="text-center">How did you feel today ?</h1>
    <div class="button-bar">
      <a v-for="(item, index) in icons"
        class="icon-mood"
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
          this.$emit('pickedMood')
        })
      }
    }
  }
</script>
