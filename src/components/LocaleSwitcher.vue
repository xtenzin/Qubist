<template>
  <el-dropdown @command="handleLocaleChange" trigger="click">
    <el-button text class="locale-switcher">
      <span class="locale-icon">🌐</span>
      <span>{{ currentLocaleLabel }}</span>
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN" :class="{ 'is-active': currentLocale === 'zh-CN' }">
          简体中文
        </el-dropdown-item>
        <el-dropdown-item command="en-US" :class="{ 'is-active': currentLocale === 'en-US' }">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
// 语言切换器组件
// Locale switcher component
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown } from '@element-plus/icons-vue'
import { useLocaleStore } from '@/stores/locale'
import type { Locale } from '@/stores/locale'

const { locale } = useI18n()
const localeStore = useLocaleStore()

const currentLocale = computed(() => localeStore.currentLocale)

const currentLocaleLabel = computed(() => {
  return currentLocale.value === 'zh-CN' ? '简体中文' : 'English'
})

// 切换语言
// Switch locale
const handleLocaleChange = (command: Locale) => {
  localeStore.setLocale(command)
  locale.value = command
  
  // Element Plus 语言切换需要页面刷新才能生效
  // Element Plus locale change requires page refresh to take effect
  // 为了更好的用户体验，我们重新加载页面
  // For better user experience, we reload the page
  window.location.reload()
}
</script>

<style scoped>
.locale-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
}

.locale-icon {
  font-size: 16px;
  margin-right: 4px;
}

.locale-switcher :deep(.el-icon) {
  font-size: 16px;
}

:deep(.is-active) {
  color: #409eff;
  font-weight: 500;
}
</style>
