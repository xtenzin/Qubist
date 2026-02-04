// 语言设置状态管理
// Locale settings state management
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Locale = 'zh-CN' | 'en-US'

// 获取初始语言
// Get initial locale
function getInitialLocale(): Locale {
  const saved = localStorage.getItem('qubist-locale')
  if (saved && (saved === 'zh-CN' || saved === 'en-US')) {
    return saved as Locale
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

export const useLocaleStore = defineStore(
  'locale',
  () => {
    const currentLocale = ref<Locale>(getInitialLocale())

    // 保存语言设置到 localStorage
    // Save locale settings to localStorage
    const saveLocale = () => {
      localStorage.setItem('qubist-locale', currentLocale.value)
    }

    // 切换语言
    // Switch locale
    const setLocale = (locale: Locale) => {
      currentLocale.value = locale
      saveLocale()
    }

    return {
      currentLocale,
      setLocale
    }
  },
  {
    persist: {
      key: 'qubist-locale-store',
      storage: localStorage,
      pick: ['currentLocale']
    }
  }
)
