<template>
  <div id="app">
    <router-view :db="db"></router-view>
  </div>
</template>

<script>
  import dbChrome from './db.js'
  import dbFake from './db-fake.js'

  export default {
    name: 'app',
    mounted: function() {
      console.log('mounted', this.$route.name)
    },
    data: () => ({
      db: chrome && chrome.storage ? dbChrome : dbFake,
    }),
  }

</script>

