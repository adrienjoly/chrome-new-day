<template>
  <div id="app">
    Welcome
    <router-view></router-view>
  </div>
</template>

<script>
  console.log('loading app.vue')

  export default {
    name: 'app',
    created: () => console.log('created'),
    mounted: function() {
      console.log('mounted', this.$route.name)
    },
    /*
    data () {
      return {
        msg: 'Welcome to Your Vue.js App'
      }
    },
    */
  }

</script>

