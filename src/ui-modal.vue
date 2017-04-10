<style lang="scss">
  
  @import "styles/variables.scss";
  @import "styles/basics.scss";
  @import "styles/buttons.scss";

  .modal-mask {
    position:           fixed;
    z-index:            9998;
    top:                0;
    left:               0;
    width:              100%;
    height:             100%;
    background-color:   rgba(0, 0, 0, .5);
    display:            table;
    transition:         opacity .3s ease;
  }

  .modal-wrapper {
    display:            table-cell;
    vertical-align:     middle;
    padding:            space(3);
  }

  .modal-container {
    overflow:           auto;
    width:              100%;
    max-width:          600px;
    margin:             0px auto;
    padding:            space(4);
    background-color:   white;
    border-radius:      $radius-small;
    box-shadow:         0 2px 8px rgba(0, 0, 0, .33);
    transition:         all .3s ease;
  }

  .modal-header {
    padding-bottom:     space(3);
    border-bottom:      1px solid color(gray,pale);
    margin-bottom:     space(4);
  }

  .modal-body {
    
  }

  .modal-default-button {
    float: right;
  }

  /*
  * The following styles are auto-applied to elements with
  * transition="modal" when their visibility is toggled
  * by Vue.js.
  *
  * You can easily play with the modal transition by editing
  * these styles.
  */

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>

<template>
  <transition name="modal">
    <div class="modal-mask" @click="$emit('close')" >
      <div class="modal-wrapper">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <slot name="header"></slot>
          </div>
          <div class="modal-body">
            <slot name="body"></slot>
          </div>
          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-default-button" @click="$emit('close')">OK</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import Vue from 'vue'
  
  // register modal component
  export default Vue.component('modal', {
    data: () => ({
      _keyHandler: null,
    }),
    created: function() {
      this._keyHandler = (e) => {
        if (e.keyCode == 27) {
          this.$emit('close')
        }
      }
      document.addEventListener('keydown', this._keyHandler)
    },
    destroyed: function() {
      document.removeEventListener('keydown', this._keyHandler)
    },
  })
</script>
