// Vue 应用入口文件
// Vue application entry file
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useLocaleStore } from './stores/locale'

const app = createApp(App)

// 注册所有图标
// Register all icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(i18n)

// 配置 Element Plus 语言
// Configure Element Plus locale
const localeStore = useLocaleStore()
const elementPlusLocale = localeStore.currentLocale === 'zh-CN' ? zhCn : en
app.use(ElementPlus, {
  locale: elementPlusLocale
})

app.mount('#app')
