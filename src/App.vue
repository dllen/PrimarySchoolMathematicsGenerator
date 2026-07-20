<template>
  <div class="container">
    <ToastContainer />
    <router-view />
  </div>
</template>

<script>
import ToastContainer from './components/ToastContainer.vue'

export default {
  name: 'App',
  components: {
    ToastContainer
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
}
</style>
