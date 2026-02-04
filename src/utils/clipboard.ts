// 剪贴板操作工具
// Clipboard operation utility
import { ElMessage } from 'element-plus'
import i18n from '@/i18n'

/**
 * 复制文本到剪贴板
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 优先使用现代 API
    // Prefer modern API
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      ElMessage.success(i18n.global.t('common.copySuccess'))
      return true
    }

    // 降级方案：使用传统的复制方法
    // Fallback: use traditional copy method
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    textArea.style.opacity = '0'
    textArea.style.pointerEvents = 'none'
    document.body.appendChild(textArea)

    try {
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('execCommand copy failed')
      }

      ElMessage.success(i18n.global.t('common.copySuccess'))
      return true
    } finally {
      document.body.removeChild(textArea)
    }
  } catch (error) {
    console.error('Copy failed:', error)
    ElMessage.error(i18n.global.t('common.copyFailed') + ': ' + (error as Error).message)
    return false
  }
}
