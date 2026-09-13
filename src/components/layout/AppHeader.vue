<template>
  <header
    class="border-b border-rule-soft bg-paper sticky top-0 z-40 backdrop-blur-sm"
  >
    <div class="container-content flex items-center justify-between py-3.5">
      <router-link
        to="/"
        class="font-serif font-bold text-base text-ink-deep hover:text-ember transition-colors"
      >
        📐 数学习题
      </router-link>

      <!-- 桌面端导航 -->
      <nav class="hidden md:flex gap-6">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          data-test="nav-link"
          class="text-sm font-medium transition-colors"
          :class="isActive(link.to)
            ? 'text-ember'
            : 'text-ink-muted hover:text-ink-deep'"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <!-- 移动端汉堡按钮 -->
      <button
        class="md:hidden text-ink-deep p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="打开菜单"
        @click="$emit('open-menu')"
      >
        <span class="text-xl">☰</span>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  emits: ['open-menu'],
  data() {
    return {
      links: [
        { to: '/', label: '首页' },
        { to: '/workbench', label: '工作台' },
        { to: '/history', label: '历史' },
        { to: '/about', label: '关于' },
      ],
    }
  },
  methods: {
    isActive(path) {
      if (path === '/') return this.$route.path === '/'
      return this.$route.path.startsWith(path)
    },
  },
}
</script>
