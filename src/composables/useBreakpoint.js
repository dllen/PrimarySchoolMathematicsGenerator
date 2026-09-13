import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'

// 断点常量(与 src/assets/styles/tokens.css --bp-* 对齐)
//   mobile : <= 639px (phone)
//   tablet : 640-1023px (small tablet / large phone landscape)
//   desktop: >= 1024px
const MOBILE_MAX = 639
const TABLET_MAX = 1023

export function useBreakpoint() {
  // SSR-safe 初始值;在浏览器中取真实 innerWidth,在 jsdom / Node 中回落到 1024(desktop 默认)
  const windowWidth = ref(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  function update() {
    windowWidth.value = window.innerWidth
  }

  // 仅当在组件 setup() 上下文内调用时才注册生命周期钩子,
  // 避免在 composable 被普通函数调用时(如测试 / 工具脚本)产生
  // "onMounted is called when there is no active component instance" 警告。
  const instance = getCurrentInstance()

  if (instance) {
    onMounted(() => {
      window.addEventListener('resize', update)
      update() // 进入页面后再校准一次,避免 SSR 与 CSR 初始值不一致
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', update)
    })
  }

  // computed refs — 调用方访问 .value,例如 const { isMobile } = useBreakpoint(); isMobile.value
  return {
    windowWidth,
    isMobile: computed(() => windowWidth.value <= MOBILE_MAX),
    isTablet: computed(
      () => windowWidth.value > MOBILE_MAX && windowWidth.value <= TABLET_MAX
    ),
    isDesktop: computed(() => windowWidth.value > TABLET_MAX),
  }
}
