<template>
  <div class="container-content pt-16 md:pt-24 pb-16">
    <div class="max-w-narrow mx-auto text-center">
      <h1 class="font-serif text-2xl md:text-2xl font-semibold mb-4 leading-tight">
        为你的孩子，定制一份数学练习
      </h1>
      <p class="text-base text-ink-muted mb-10 leading-base">
        从年级开始，几次点击就能拿到一张可打印的练习题。
      </p>
      <BaseButton variant="ember" size="lg" @click="goStart">
        开始 →
      </BaseButton>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { BaseButton } from './base'

export default {
  name: 'HomePage',
  components: { BaseButton },
  setup() {
    const router = useRouter()
    function goStart() {
      // Task 9 会统一把 /generator 重命名为 /workbench;
      // 这里跳当前可用的 /generator,避免破坏现有 QuickStart 流程。
      router.push('/generator')
    }
    return { goStart }
  },
}
</script>
