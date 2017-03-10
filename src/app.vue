<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'app',
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

