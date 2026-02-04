// i18n 配置
// i18n configuration
import { createI18n } from 'vue-i18n'
import zhCN from '@/locales/zh-CN'
import enUS from '@/locales/en-US'

// 获取初始语言（从 localStorage 或浏览器语言）
// Get initial locale (from localStorage or browser language)
function getInitialLocale(): 'zh-CN' | 'en-US' {
  const saved = localStorage.getItem('qubist-locale')
  if (saved && (saved === 'zh-CN' || saved === 'en-US')) {
    return saved as 'zh-CN' | 'en-US'
  }

  // 根据浏览器语言自动检测
  // Auto-detect based on browser language
  const browserLang = navigator.language || (navigator as any).userLanguage
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  } else {
    return 'en-US'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n
