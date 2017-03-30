<style scoped>
  h1 {
    font-weight: bold;
    text-align: center;
    position: relative;
    top: 50px;
  }
  .button-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  .icon {
    width: 92px;
    height: 92px;
    margin: 10px;
    display: inline-block;
  }
</style>

<template>
  <div class="pg-relax">
    <h1>Just relax until tomorrow!</h1>
    <div class="button-bar">
      <vector class="icon" :src="icon"></vector>
    </div>
  </div>
</template>

<script>
  import Vector from './ui-vector.vue';
  export default {
    components: {
      'vector': Vector
    },
    props: [
      'db',
    ],
    data: () => ({
      icon: require('./svg/mood-4.svg'),
    }),
    mounted() {
      this.db.fetchData('relax', ({ key, value }) => {
        const relax = value
        if (!relax || new Date() > new Date(relax.until)) {
          this.db.setData('relax', null, () => {
            this.$router.push('/') // plan the new day :-)
          })
        } else {
          console.log('relaxing until', new Date(relax.until), '...')
        }
      })
    },
  }
</script>
