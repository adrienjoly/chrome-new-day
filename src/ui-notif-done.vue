<template>
  <div class="notif-done">
    <p v-if="visible">
      Well done! 🎉 continue to stay focused
      <a @click.prevent="onCancel">Undo</a>
      <a @click.prevent="reset">Close</a>
    </p>
  </div>
</template>

<script>
  const DB_KEY = 'notifDoneTask'
  const DURATION = 4 * 1000 // notif will disappear after 30 seconds
  function reset(db) {
    // static function (so that it can be called from pg-plan, without instanciating the component)
    db.setData(DB_KEY, null, () => {})
  }
  export default {
    reset,
    props: [
      'db',
    ],
    data: () => ({
      timeout: null,
      visible: false,
      subscriptionHandler: null,
    }),
    created() {
      this.subscriptionHandler = ({ key, value }) => {
        console.log('notif done subscription handler:', value, typeof value)
        if (value) {
          this.show()
        } else {
          this.hide()
        }
      }
      this.db.subscribeToData(DB_KEY, this.subscriptionHandler)
    },
    unmounted() {
      this._setTimeout()
    },
    destroyed() {
      this._setTimeout()
      this.db.unsubscribeToData(DB_KEY, this.subscriptionHandler)
    },
    methods: {
      _setTimeout(fct, ms) {
        if (this.timeout) {
          clearTimeout(this.timeout)
          this.timeout = null
        }
        if (fct && ms) {
          this.timeout = setTimeout(fct, ms)
        }
      },
      show() {
        console.log('SHOW')
        this.visible = true
        this._setTimeout(this.hide.bind(this), DURATION)
      },
      hide(callback) {
        console.log('HIDE')
        this.visible = false
        this._setTimeout()
        //this.db.setData(DB_KEY, null, () => {})
      },
      notifyDoneTask(doneTask) {
        this.db.setData(DB_KEY, doneTask, () => {})
        // => host component will display another task, and this component will update() => show()
      },
      reset() {
        this.db.setData(DB_KEY, null, () => {})
      },
      onCancel() {
        this.hide()
        this.db.fetchData(DB_KEY, ({ key, value }) => {
          this.$emit('cancel', value)
        })
      },
    },
  }
</script>
