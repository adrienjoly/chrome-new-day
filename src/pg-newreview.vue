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
  .pg-review {
    .header {
      padding: 50px 20px;
      background-color: gray;
    }

    ol {
      border: 1px solid lightgray;
      padding:            space(2);
      margin:             space(4) 0;
      text-align:         left;
      list-style:         none;
      border-radius: 5px;
    }
    li {
      position: relative;
      border-bottom:      1px solid color(gray,pale);
      padding:            space(2) 0;
      margin-left:        32px;
      margin-right:        12px;
    }
    ol > li:last-child() {
      border-bottom:      0 none;
    }
    .icon {
      position:               absolute;
      margin-top:             2px;
      left:                   -26px;
      display:                block;
      width:                  space(3);
    }
    .task-name {
      @extend           .font-regular;
      overflow:         hidden;
      white-space:      nowrap;
      text-overflow:    ellipsis;
      display:          block;
      padding-right:    60px;
      width:            100%;
      font-size:        12px;
    }
    li[data-undone] .task-name {
      color: gray;
      font-style: italic;
    }
    .task-duration {
      @extend           .font-small;
      display:          block;
      position:         absolute;
      right:            0;
      top:              space(1);
      text-align:       right;
      width:            50px;
      padding:          space(1) 0;
      color:            color(green,medium);
    }
    li[data-extra] .task-duration {
      color: red;
    }
    li[data-undone] .task-duration {
      display: none;
    }
    .review-box {
      position: relative;
      p {
        text-align: left;
        margin-bottom: 12px;
      }
      textarea {
        display: block;
        resize: none;
        border: 1px solid lightgray;
        background-color: #fafafa;
        padding: space(2);
        font-size: 15px;
        height: 160px;
        width: 100%;
        border-radius: 5px;
      }
      button {
        position: absolute;
        right: 8px;
        bottom: 8px;
      }
    }

    .statistic-container {
      display: inline-block;
      float: right;
    }

    .statistic {
      display: inline-block;
    }

    .statistic .good {
      color: green;
    }

    .statistic .bad {
      color: red;
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
          <div>{{ statistic.name }}</div>
        </div>
      </div>
    </div>
    <div class="centered">
      <h1>Give us your feedback</h1>
      <div class="review-box">
        <textarea
          v-model:value="reviewText"
          placeholder="Type something..."
        />
        <button class="button" @click="endOfDay">Submit</button>
      </div>
    </div>
  </div>
</template>

<script>
  import common from './common.js'

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
        return [ 
          { value: 3, name: 'tasks done', style: { good: true } }, 
          { value: 1, name: 'tasks undone' }, 
          { value: '4.50', name: 'time spent', style: { bad: true } },
          { value: '5.50', name: 'time estimated' },
          { value: '0.30', name: 'break time' },
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
