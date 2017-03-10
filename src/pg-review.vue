<style>
</style>

<template>
  <div class="pg-review">
    <h1>Review</h1>
    <router-link to="/">Plan tomorrow's tasks</router-link>
  </div>
</template>

<script>
  export default {
    props: [ 'db' ],
    data: function() {
      return {
        taskindex: null,
        task: '',
        nextUrl: '',
      }
    },
  }
</script>
