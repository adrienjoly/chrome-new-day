<template>
  <div class="notif-review">
    <p v-if="displayReviewLink">
      Are you done for today?
      <router-link to="review">
      Let's review!
      </router-link>
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
