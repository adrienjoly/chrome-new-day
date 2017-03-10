<template>
  <modal @close="close">
    <p slot="header">Please estimate</p>
    <div slot="body">
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
  import Vue from 'vue'
  import modal from './ui-modal.vue'

  export default Vue.component('duration-picker', {
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
