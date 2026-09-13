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
app.use(router)
app.mount('#app')
