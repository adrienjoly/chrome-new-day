<style lang="scss">

  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";

  .pg-relax .button-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    svg path {
      fill: color(gray,medium);
    }
  }
  .pg-relax .icon {
    width: 92px;
    height: 92px;
    margin: 10px;
    display: inline-block;
  }
  .pg-relax footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    padding-bottom: 50px;
    .meta {
      text-decoration: none;
    }
    .meta:hover {
      text-decoration: underline;
    }
  }
</style>

<template>
  <div class="pg-relax main-wrapper text-center">
    <h1>Just relax until tomorrow !</h1>
    <div class="button-bar">
      <vector class="icon" :src="icon"></vector>
    </div>
    <footer>
      <span class="meta" @click="planTomorrow">...or plan your tasks for tomorrow.</span>
    </footer>
  </div>
</template>

<script>
  import Vector from './ui-vector.vue';
  export default {
    props: [
      'planTomorrow',
    ],
    components: {
      'vector': Vector
    },
    data: () => ({
      icon: require('./svg/mood-4.svg'),
    }),
  }
</script>
