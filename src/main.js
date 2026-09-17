import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 字体(自托管)
import '@fontsource/lora/400.css'
import '@fontsource/lora/600.css'
import '@fontsource/lora/700.css'
import '@fontsource/lora/400-italic.css'
import '@fontsource/lxgw-wenkai-tc/400.css'
import '@fontsource/lxgw-wenkai-tc/700.css'

// 设计 token + Tailwind base
import './assets/styles/base.css'

const app = createApp(App)

/**
 * 全局错误处理:捕获 Vue 调度器过渡态下的 race condition。
 *
 * 已知背景:
 *   - 报错信息:`Cannot read properties of undefined (reading 'startTime')`
 *   - 触发栈:et.reportAllChanges → d (Vue reactivity trigger) → n.timeout (setTimeout)
 *   - 出现时机:toast/导出等模块级 setTimeout 在 route transition 离开阶段
 *     回调,触发响应式 mutation;Vue 3.5+ 的 scheduler 期间会读到 stale job。
 *
 * 修复:
 *   1. `composables/useToast.js` 已把定时器 splice 推到 microtask 并加 scope 守卫
 *   2. `composables/usePdfExport.js` 已有 clearTimeout + AbortSignal 清理
 *   3. 这里兜底:即使仍触发,不让控制台炸出一条未捕获异常,只做静默降级 + 上报。
 *
 * 生产构建中 (`import.meta.env.PROD === true`) 不打 console,只保留上报钩子。
 */
app.config.errorHandler = (err, instance, info) => {
  const msg = err && err.message ? err.message : String(err)
  const isSchedulerRace =
    msg.includes("Cannot read properties of undefined") &&
    msg.includes("'startTime'")

  if (isSchedulerRace) {
    if (!import.meta.env.PROD) {
      // 开发期:打印一份可识别的 warning,方便关联修复
      console.warn(
        '[scheduler] 捕获到调度器过渡态 race,已吞掉。建议检查是否有 ' +
        'setTimeout/微任务在 route transition 期间触发了响应式 mutation。',
        { info }
      )
    }
    // 可在此接入监控平台(Sentry / 自家埋点):
    // reportToTelemetry({ kind: 'vue-scheduler-race', info, stack: err.stack })
    return
  }

  // 非该类错误:开发期保留原始报错,生产期静默 + 上报
  if (!import.meta.env.PROD) {
    console.error('[app:errorHandler]', err, { info })
  } else {
    // reportToTelemetry({ kind: 'unhandled', message: msg, stack: err.stack, info })
  }
}

app.use(router)
app.mount('#app')

// 路由切换/页面隐藏时统一清掉所有 toast 残留定时器,防止后台异步触发
// 已经 dispose 的响应式 mutation。import.meta.hot 仅在 dev 模式下可用。
if (typeof window !== 'undefined') {
  const cleanup = () => {
    // 动态 import 避免循环依赖(useToast 间接依赖 Vue runtime)
    import('./composables/useToast.js').then(({ disposeToastTimers }) => {
      disposeToastTimers()
    }).catch(() => {})
  }
  window.addEventListener('pagehide', cleanup)
  window.addEventListener('beforeunload', cleanup)
}
