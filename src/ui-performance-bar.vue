<style scoped>
  .performance-bar {
    overflow: auto;
  }
  .bar {
    position: relative;
    width: 100%;
    height: 8px;
  }
  [data-mode="over"] .bar {
    background-color: red;
  }
  [data-mode="under"] .bar {
    background-color: lightgray;
  }
  .done {
    height: 100%;
    background-color: green;
  }
  .estimated {
    float: left;
  }
  [data-mode="over"] .estimated {
    color: green;
  }
  [data-mode="under"] .estimated {
    color: gray;
  }
  .difference {
    float: right;
  }
  [data-mode="over"] .difference {
    color: red;
  }
  [data-mode="under"] .difference {
    color: green;
  }
  p {
    font-size: 12px;
  }
</style>

<template>
  <div class="performance-bar" :data-mode="elapsed > estimated ? 'over' : 'under'">
    <div class="bar">
      <div class="done" :style="({ width: barPct + '%' })" />
    </div>
    <p class="difference">{{ difference }}</p>
    <p class="estimated">Estimated: {{ renderSeconds(estimated) }}</p>
  </div>
</template>

<script>
  import common from './common.js'
  
  const renderSeconds = common.renderSeconds
  const renderMinutes = common.renderMinutes

  export default {
    props: [
      'tasks',
    ],
    computed: {
      // note: in this component, durations are given in seconds
      elapsed() {
        return 35 * 60;
        return this.tasks.reduce((acc, task) => acc + task.elapsedMillisecs / 1000, 0)
        // TODO: don't take breaks into account
      },
      estimated() {
        return this.tasks.reduce((acc, task) => acc + task.minutes * 60, 0)
        // TODO: don't take breaks into account
      },
      barPct() {
        return 100 * ( this.elapsed > this.estimated
          ? this.estimated / this.elapsed
          : this.elapsed / this.estimated )
      },
      difference() {
        return ( this.elapsed > this.estimated
          ? '+ ' + renderSeconds(this.elapsed - this.estimated) + ' overload'
          : (
            Math.abs(this.estimated - this.elapsed === 0)
              ? 'perfect timing! :-O'
              : renderSeconds(this.estimated - this.elapsed) + ' saved! :-)')
          )
      },
    },
    mounted() {
      console.log('perf bar mounted', this.elapsed, this.estimated, this.barPct)
    },
    updated() {
      console.log('perf bar updated', this.elapsed, this.estimated, this.barPct)
    },
    methods: {
      renderSeconds,
    },
  }
</script>
