<style lang="scss">

  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";

  // .duration-picker .modal-body {}
  // .duration-picker-task-name {}
  // .duration-buttons input {}

</style>

<template>
  <modal class="duration-picker" @close="close">
    <p class="meta" slot="header">How much do you think you need?</p>
    <div class="text-center" slot="body">
      <p class="font-medium pb4">{{ taskName }}</p>
      <form v-on:submit.prevent="setDuration" class="duration-buttons">
        <input class="btn btn-outline m1" type="button" value="≤ 15 min" data-minutes="15" @click="setDuration">
        <input class="btn btn-outline m1" type="button" value="30 min" data-minutes="30" @click="setDuration">
        <input class="btn btn-outline m1" type="button" value="1 hour" data-minutes="60" @click="setDuration">
        <input class="btn btn-outline m1" type="button" value="2 hours" data-minutes="120" @click="setDuration">
        <input class="btn btn-outline m1" type="button" value="3 hours" data-minutes="180" @click="setDuration">
        <input class="btn btn-outline m1" type="button" value="4 hours" data-minutes="240" @click="setDuration">
        <input class="btn btn-outline m1" type="button" value="8 hours" data-minutes="480" @click="setDuration">
      </form>
    </div>
    <div slot="footer"></div>
  </modal>
</template>

<script>
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
