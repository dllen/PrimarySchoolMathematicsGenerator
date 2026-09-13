<template>
  <div class="container-content pt-12 pb-16">
    <div class="max-w-narrow mx-auto">
      <h1 class="font-serif text-2xl font-semibold mb-8 text-ink-deep">关于</h1>
      
      <section class="mb-10">
        <h2 class="text-eyebrow text-ink-faint mb-2">小学数学练习生成器</h2>
        <p class="text-base text-ink-muted leading-relaxed">
          为小学阶段的孩子定制数学练习题，支持加减乘除四则运算、难度分级、答案模式切换，以及 PDF/图片导出。
        </p>
      </section>

      <section class="mb-10">
        <h2 class="text-eyebrow text-ink-faint mb-3">主要功能</h2>
        <ul class="space-y-2">
          <li v-for="feature in features" :key="feature" class="flex items-start gap-2 text-sm text-ink-muted">
            <span class="text-ember mt-0.5">·</span>
            {{ feature }}
          </li>
        </ul>
      </section>

      <section>
        <h2 class="text-eyebrow text-ink-faint mb-3">版本</h2>
        <p class="text-sm text-ink-muted">v1.0.0</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
  setup() {
    const features = [
      '按年级和难度智能推荐练习配置',
      '支持加减乘除及括号优先级',
      '三种答案模式：隐藏、Inline、单独答案页',
      'PDF 三栏排版，适合打印',
      '题目历史记录，随时回顾',
      '自定义预设配置',
    ]
    return { features }
  },
}
</script>
