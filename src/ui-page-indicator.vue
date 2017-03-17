<style>
  .page-indicator {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 32px;
  }

  .page-indicator .item {
    box-sizing: border-box;
    margin: 0px 6px;
    
    width: 20px;
    height: 20px;
    border: 2px solid white;
    border-radius: 10px;

    cursor: pointer;

    background-color: #E0E0E0;

    transition: all 0.2s ease-in-out;
  }

  .page-indicator .item.current {
    border-color: #23B09B;
  }

  .page-indicator .item.done {
    background-color: #48D8C3;
  }
</style>

<template>
  <div class="page-indicator">
    <div v-for="(page, index) in pages" 
      class="item"
      :class="{ current: !!page.current, done: !!page.done }"
      @click.prevent="selectPage(index)"
       />
  </div>
</template>

<script>
  export default {
    props: [ 'pages' ],
    methods: {
      selectPage: function(index) {
        this.$emit('page-changed', index);
      }
    }
  }
</script>
