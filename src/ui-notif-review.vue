<style lang="scss">
  .notif-review {
    text-align: center;
  }
</style>

<template>
  <div class="notif-review">
    <p class="meta" v-if="displayReviewLink">
      <span class="pw2">Are you done for today?</span>
      <a class="link" @click.prevent="$emit('gotoreview')">Let's review!</a>
    </p>
  </div>
</template>

<script>
  const HOUR_PROPOSE_END_OF_DAY = 18 // hour of the 

  export default {
    data: () => ({
      interval: null,
      displayReviewLink: false,
    }),
    mounted() {
      this.setInterval(this.tick.bind(this), 30 * 1000)
    },
    unmounted() {
      this.setInterval()
    },
    destroyed() {
      this.setInterval()
    },
    methods: {
      setInterval(fct, ms) {
        if (this.interval) {
          clearInterval(this.interval)
          this.interval = null
        }
        if (fct && ms) {
          this.interval = setInterval(fct, ms)
          fct()
        }
      },
      tick() {
        const now = new Date()
        this.displayReviewLink = now.getHours() >= HOUR_PROPOSE_END_OF_DAY
        console.log('new day, tick')
      },
    },
  }
</script>
