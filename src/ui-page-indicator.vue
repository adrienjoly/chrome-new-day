<style lang="scss">

  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";

  .page-indicator {
    display:              block;
    padding:              space(2) 0;
    line-height:          0;
  }

  .page-indicator .item {
    display:              inline-block;
    cursor:               pointer;
    vertical-align:       middle;
    width:                10px;
    height:               10px;
    border-radius:        50%;
    border:               1px solid white;
    margin:               0px space(1);
    background-color:     color(gray,light);
    transition:           all 0.2s ease-in-out;
    &:first-child {       margin-left: 0; }
    &:last-child {        margin-right: 0; }
  }

  .page-indicator .item.current {
    // border-color:         color(green,medium);
    background-color:     white;
    box-shadow: 0 0 0 1px color(green,medium);
  }

  .page-indicator .item.done {
    background-color:     color(green,medium);
  }
</style>

<template>
  <div class="page-indicator">
    <div v-for="(page, index) in pages" 
      class="item"
      :class="{ current: index == current, done: !!page.done }"
      @click.prevent="selectPage(index)"
       />
  </div>
</template>

<script>
  export default {
    props: [ 'pages', 'current' ],
    methods: {
      selectPage: function(index) {
        this.$emit('page-changed', index);
      }
    }
  }
</script>
