<style>
  .pg-review > div {
    width: 400px;
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
    margin-bottom: 30px;
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
        <li v-for="task, i in tasks" :key="task">
          {{ task.name }} : 
          spent {{ renderElapsed(task) }} / {{ task.minutes }} mn (initially estimated)
        </li>
      </ol>

      <button class="button" @click="endOfDay">Let's relax</button>
    </div>
  </div>
</template>

<script>
  import common from './common.js'
  import PerformanceBar from './ui-performance-bar.vue'
  
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
    },
    props: [
      'db',
      'analytics',
      'setCurrentTask',
    ],
    data: () => ({
      tasks: [],
      tasksSubscriptionHandler: null,
    }),
    computed: {
      today: () => formatDate(new Date())
    },
    methods: {
      endOfDay() {
        console.log('end of day')
        this.db.setData('relax', { until: tomorrow() }, () => {
          this.$router.push('/relax')
          this.db.setData('tasks', [], () => {}) // clear all tasks
        })
      },
      renderElapsed(task) {
        var seconds = parseInt((task.elapsedMillisecs || 0) / 1000)
        const minutes = parseInt(seconds / 60)
        seconds = seconds % 60
        return (minutes ? minutes + ' minutes and ' : '') + seconds + ' seconds'
      }
    },
    created() {
      this.tasksSubscriptionHandler = ({ key, value }) => {
        this.tasks = value || []
      }
      this.db.subscribeToData('tasks', this.tasksSubscriptionHandler)
    },
    destroyed() {
      this.db.unsubscribeToData('tasks', this.tasksSubscriptionHandler)
    },
    mounted() {
      this.setCurrentTask(null, () => { // will update timer and clear currentTask
        this.db.fetchData(null, ({ key, value }) => {
          const mood = value.mood
          console.log('review data:', value)
          if (value.relax) {
            this.$router.push('/relax')
          } else if (mood === null || mood === undefined) {
            this.$router.push('/mood')
            // transfer reasonForReview from local storage to back-end
            const reasonForReview = value.reasonForReview || this.analytics.review.startReason.FINISHED
            this.db.setData('reasonForReview', null, () => {})
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
          } else { // mood was set => transfer to back-end, and stay on review page
            this.analytics.mood.rate(mood)
            this.db.setData('mood', null, () => {})
          }
        })
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
