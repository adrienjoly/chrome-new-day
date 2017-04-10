<style lang="scss">
  .vector-container {
    position: relative;
    top: -1px;
    text-align: center;
    width: 20px;
    height: 20px;
    // background-color: rgba(100,100,100,0.25);
  }
  .icon {
    display: inline-block;
    vertical-align: middle;
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
