<style lang="scss">
  
  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";

  .pg-review h1 {
    font-weight: 300;
    color: #333333;
    font-size: 32px;
  }
  .pg-review h2 {
    font-weight: 400;
    font-size: 15px;
    color: rgba(50,50,50, 0.5);
    margin-top: 0;
    margin-bottom: 50px;
  }

  .pg-review .header {
    z-index:  20;
    position: relative;
    padding:  space(5);
    background-color: lighten(color(gray,pale),4);
    @extend .clearfix;
  }

  .statistic-container {
    display: block;
    float: right;

    .statistic {
      position: relative;
      display: inline-block;
      padding: 0 space(2);
      text-align: center;
      margin-top: -10px;
      &:first-child { padding-left: 0; }
      &:last-child { padding-right: 0; }
    }

  }

  .statistic-label {
    @extend .meta;
  }

  .statistic-value {
    @extend   .font-medium;
    &.good {   color: color(green,medium); }
    &.bad {    color: color(orange,medium); }
  }


  .review-box {
    position: relative;
    border: 1px solid color(gray,light);
    
    textarea {
      display: block;
      resize: none;
      @extend .font-regular;
      border: none;
      line-height: 22px;
      height: 200px;
      width: 100%;
      padding: space(3) space(3) 0;
      
      outline: none;
      &:focus {
        border-color: color(orange, medium);
      }
    }

    .review-btn-wrapper {
      padding: space(3);
      background-color: white;
      text-align: right;
    }
    
    button {
      right: space(3);
      bottom: space(3);
    }
  }

</style>

<template>
  <div class="pg-review">
    <div class="header">
      <span class="meta">{{ today }}</span>
      <div class="statistic-container">
        <div v-for="statistic in statistics" class="statistic">
          <div :class="statistic.style">{{ statistic.value }}</div>
          <div class="statistic-label">{{ statistic.name }}</div>
        </div>
      </div>
    </div>
    <div class="main-wrapper">
      <h3 class="text-center mb4">Help us to build a good product ✍️</h3>
      <div class="review-box">
        <textarea
          v-model:value="reviewText"
          placeholder="What kind of issues did you have during your workday? What conditions enabled your productivity ?"
        />
        <div class="review-btn-wrapper">
          <button class="btn" @click="endOfDay">Send your feedback</button>
        </div>
      </div>
      <p class="font-small meta text-center mh4">* We will use this feedback to improve our product methodology</p>
    </div>
  </div>
</template>

<script>
  import common from './common.js'

  const renderMinutesStat = common.renderMinutesStat

  export default {
    props: [
      'db',
      'tasks',
      'analytics',
      'goToNextTask',
    ],
    data: () => ({
      reviewText: '',
    }),
    computed: {
      today: () => common.formatDate(new Date()),
      statistics() {
        let taskCount = this.tasks.length
        let doneCount = this.tasks.filter((t) => t.done).length
        let undoneCount = taskCount - doneCount
        let timeSpent = this.tasks.reduce((s, t) => s + t.elapsedMillisecs, 0) / 1000 / 60
        let timeEstimated = this.tasks.reduce((s, t) => s + t.minutes, 0)

        let baseStyle = { 'statistic-value': true }
        let doneStyle = Object.assign({}, baseStyle, { good: doneCount > undoneCount })
        let undoneStyle = Object.assign({}, baseStyle, { bad: undoneCount > doneCount })
        let timeSpentStyle = Object.assign({}, baseStyle, { good: timeSpent < timeEstimated })
        let timeUnspentStyle = Object.assign({}, baseStyle, { bad: timeEstimated < timeSpent })

        return [ 
          { value: doneCount, name: 'tasks done', style: doneStyle }, 
          { value: undoneCount, name: 'tasks undone', style: undoneStyle }, 
          { value: renderMinutesStat(timeSpent), name: 'time spent', style: timeSpentStyle },
          { value: renderMinutesStat(timeEstimated), name: 'time estimated', style: timeUnspentStyle }
        ]
      }
    },
    methods: {
      endOfDay() { // when: click on "submit" button
        this.analytics.review.comment(this.reviewText)
        this.db.setData('reasonForReview', null, () => {})
        this.db.setData('relax', true, () => {
          this.db.setData('mood', null, () => {
            this.db.setData('tasks', [], () => { // clear all tasks
              this.goToNextTask() // will lead to the /relax page
            })
          })
          //this.$router.push('/relax')
        })
      },
    },
    mounted() {
      this.db.fetchData('reasonForReview', ({key, value}) => {
        // transfer reasonForReview from local storage to back-end
        const reasonForReview = value || this.analytics.review.startReason.FINISHED
        this.analytics.review.start({
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
  }
</script>
