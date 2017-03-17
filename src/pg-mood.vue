<style>
  .pg-mood h1 {
    font-weight: bold;
    text-align: center;
    position: relative;
    top: 50px;
  }
  .pg-mood .button-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .pg-mood .icon {
    width: 92px;
    height: 92px;
    margin: 10px;
    display: inline-block;
  }

  .pg-mood .icon:hover {
    cursor: pointer;
  }

  .pg-mood .icon path {
    fill: #B2B2B2;
    transition: fill 0.2s ease-in-out;
  }

  .pg-mood .icon:hover path {
    fill: #F3A536;
  }

</style>

<template>
  <div class="pg-mood">
    <h1>How did you feel today ?</h1>
    <div class="button-bar">
      <a v-for="(item, index) in icons"
        class="icon"
        @click.prevent="pickMood(index)">
        <vector :src="item"></vector>
      </a>
    </div>
  </div>
  
</template>

<script>
  import Vector from './ui-vector.vue';

  export default {
    props: [ 'db' ],
    data: () => ({
      icons: [
        require('./svg/icon-mood-0.svg'),
        require('./svg/icon-mood-1.svg'),
        require('./svg/icon-mood-2.svg'),
        require('./svg/icon-mood-3.svg'),
        require('./svg/icon-mood-4.svg')
      ]
    }),
    components: {
      'vector': Vector
    },
    methods: {
      pickMood: function(mood) {
        console.log("mood> " + mood);
        this.$router.push('review');
      }
    }
  }
</script>
