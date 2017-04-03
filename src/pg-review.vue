<style lang="scss">
  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";
  
  .pg-review > div {
    width: 480px;
  }
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
    ol {
      border: 1px solid lightgray;
      padding:            space(2);
      margin:             space(4) 0;
      text-align:         left;
      list-style:         none;
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
  }
</style>

<template>
  <div class="pg-review centered">
    <div>
      <h1>{{ today }}</h1>
      <h2>Let's review your workday</h2>
      <performance-bar
        :tasks="tasks"
      />
      <ol>
        <li v-for="task, i in tasks"
            :key="task"
            :data-extra="getExtra(task) > 0"
            :data-undone="!task.done">
          <vector
            class="icon"
            :src="icons[task.done ? 'done' : 'undone']"
          />
          <span class="task-name">{{ task.name }}</span>
          <!-- {{ renderElapsed(task) }} / {{ task.minutes }} mn-->
          <span class="task-duration">{{ renderDiff(task) }}</span>
        </li>

      </ol>

      <button class="button" @click="endOfDay">Let's relax</button>
    </div>
  </div>
</template>

<script>
  import common from './common.js'
  import PerformanceBar from './ui-performance-bar.vue'
  import Vector from './ui-vector.vue'

  const formatDate = common.formatDate
  const renderMinutes = common.renderMinutes
  const sumElapsedSecondsWithBreaks = common.sumElapsedSecondsWithBreaks

  const RESET_HOUR = 5 // a new day starts at 5 am

  const tomorrow = () => {
    var d = new Date()
    if (d.getHours() >= RESET_HOUR) {
      d.setDate(d.getDate() + 1)
    }
    d.setHours(RESET_HOUR)
    d.setMinutes(0)
    d.setSeconds(0)
    d.setMilliseconds(0)
    return d
  }

  export default {
    components: {
      'performance-bar': PerformanceBar,
      'vector': Vector,
    },
    props: [
      'db',
      'tasks',
      'analytics',
      'goToNextTask',
    ],
    data: () => ({
      icons: {
        done: require('./svg/icon-done.svg'),
        undone: require('./svg/icon-undone.svg'),
      },
    }),
    computed: {
      today: () => formatDate(new Date())
    },
    methods: {
      endOfDay() {
        this.db.setData('relax', { until: tomorrow().getTime() }, () => {
          this.db.setData('mood', null, () => {
            this.db.setData('tasks', [], () => { // clear all tasks
              this.goToNextTask() // will lead to the /relax page
            })
          })
          //this.$router.push('/relax')
        })
      },
      getExtra(task) {
        var elapsed = parseInt((task.elapsedMillisecs || 0) / 1000)
        var estimated = task.minutes * 60
        return 100 * (elapsed - estimated) / estimated
      },
      renderDiff(task) {
        var extra = this.getExtra(task)
        //return this.renderElapsed(task) + ' / ' + task.minutes + ' mn';
        return extra > 0
          ? '+ ' + parseInt(extra) + ' %'
          : '- ' + parseInt(Math.abs(extra)) + ' %'
      },
      /*
      renderElapsed(task) {
        var seconds = parseInt((task.elapsedMillisecs || 0) / 1000)
        const minutes = parseInt(seconds / 60)
        seconds = seconds % 60
        return (minutes ? minutes + ' minutes and ' : '') + seconds + ' seconds'
      }
      */
    },
    mounted() {
      this.db.fetchData('reasonForReview', ({key, value}) => {
        // transfer reasonForReview from local storage to back-end
        const reasonForReview = value || this.analytics.review.startReason.FINISHED
        this.analytics.mood.start({
          reason: reasonForReview,
          totalTime: sumElapsedSecondsWithBreaks(this.tasks),
          breaks: [], // TODO
          tasks: this.tasks.map((task) => ({
            id: task.uuid,
            name: task.name,
            estimation: task.minutes * 60,
            done: task.done,
            timeSpent: task.elapsedMillisecs / 1000,
          })),
        })
        this.db.setData('reasonForReview', null, () => {})
      })
    },
  }

  /*
  // TODO: track review analytic events:
    startReason()
    start()
    comment()
  */
</script>
