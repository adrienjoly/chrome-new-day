<style>
  .vector-container {
    height: 100%;
    width: 100%;
    display: inline-block;
  }
</style>

<template>
  <div class="vector-container" v-once v-html="src">
  </div>
</template>

<script>
  export default {
    props: [ 'src' ]
  }
</script>
