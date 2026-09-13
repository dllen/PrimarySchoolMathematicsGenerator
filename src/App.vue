<template>
  <div class="min-h-screen bg-paper font-serif text-ink-deep">
    <AppHeader @open-menu="navOpen = true" />
    <MobileNav v-model="navOpen" />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <ToastContainer />
  </div>
</template>

<script>
import AppHeader from './components/layout/AppHeader.vue'
import MobileNav from './components/layout/MobileNav.vue'
import ToastContainer from './components/ToastContainer.vue'

export default {
  name: 'App',
  components: { AppHeader, MobileNav, ToastContainer },
  data() {
    return { navOpen: false }
  },
}
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
