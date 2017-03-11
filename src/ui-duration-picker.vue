<style>
  .duration-picker-header {
    font-size: 14px;
    margin-bottom: 0;
  }
  .duration-picker .modal-body {
    margin-top: 0;
  }
  .duration-picker-task-name {
    margin-top: 10px;
    font-size: 18px;
    margin-bottom: 30px;
  }
  .duration-buttons input {
    color: orange;
    border: 1px solid orange;
    padding: 5px;
    width: 70px;
    margin: 5px;
    background-color: white;
    cursor: pointer;
    font-size: 14px;
  }
  .duration-buttons input:hover {
    background-color: orange;
    color: white;
  }
</style>

<template>
  <modal class="duration-picker" @close="close">
    <p class="duration-picker-header" slot="header">Please estimate</p>
    <div class="duration-picker-body" slot="body">
      <p class="duration-picker-task-name">{{ taskName }}</p>
      <form v-on:submit.prevent="setDuration" class="duration-buttons">
        <input type="button" value="≤ 15 mn" data-minutes="15" @click="setDuration">
        <input type="button" value="30 mn" data-minutes="30" @click="setDuration">
        <input type="button" value="1 hour" data-minutes="60" @click="setDuration">
        <input type="button" value="2 hours" data-minutes="120" @click="setDuration">
        <input type="button" value="4 hours" data-minutes="240" @click="setDuration">
        <input type="button" value="1 day" data-minutes="360" @click="setDuration">
      </form>
    </div>
    <div slot="footer"></div>
  </modal>
</template>

<script>
  // TODO: (styling) fix positionning/alignment of second line of buttons
  import Vue from 'vue'
  import modal from './ui-modal.vue'

  export default Vue.component('duration-picker', {
    props: [ 'taskName' ],
    components: {
      modal: modal,
    },
    methods: {
      close: function(evt) {
        this.$emit('close', evt)
      },
      setDuration: function(evt) {
        this.$emit('pick', evt.target.getAttribute('data-minutes'))
      },
    },
  })
</script>
