<template>
  <div class="dashboard-header">
    <div class="header-left">
      <div class="logo">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="#42b883" stroke-width="8" />
          <circle cx="50" cy="50" r="25" fill="#42b883" />
          <circle cx="50" cy="50" r="10" fill="white" />
        </svg>
      </div>
      <div class="title-group">
        <h1>{{ $t('dashboard.title') }}</h1>
        <el-tag type="info" size="small" class="version-tag">v{{ appVersion }}</el-tag>
      </div>
    </div>
    <div class="header-right">
      <div class="connection-info">
        <el-tag type="success" size="large" class="connection-tag">
          <el-icon><SuccessFilled /></el-icon>
          <span class="connection-text">{{ connectionStore.currentConfig?.server }}:{{ connectionStore.currentConfig?.port }}</span>
        </el-tag>
      </div>
      <el-button type="danger" @click="handleDisconnect" class="disconnect-btn">
        <el-icon><SwitchButton /></el-icon>
        {{ $t('common.disconnect') }}
      </el-button>
      <LocaleSwitcher />
    </div>
  </div>
</template>

<script setup lang="ts">
// 顶部导航栏组件
// Top navigation bar component
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { SuccessFilled, SwitchButton } from '@element-plus/icons-vue'
import { useConnectionStore } from '@/stores/connection'
import { APP_VERSION } from '@/constants/version'
import LocaleSwitcher from './LocaleSwitcher.vue'

const router = useRouter()
const connectionStore = useConnectionStore()
const { t } = useI18n()

const appVersion = APP_VERSION

// 断开连接
// Disconnect
const handleDisconnect = () => {
  ElMessageBox.confirm(t('dashboard.disconnectConfirm'), t('dashboard.disconnectTitle'), {
    type: 'warning'
  })
    .then(() => {
      connectionStore.disconnect()
      router.push('/login')
    })
    .catch(() => {})
}
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 40px;
  height: 40px;
}

.logo svg {
  width: 100%;
  height: 100%;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.version-tag {
  font-size: 11px;
  padding: 2px 6px;
  height: auto;
  line-height: 1.4;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.disconnect-btn :deep(.el-icon) {
  margin-right: 6px;
}

.connection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.connection-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-width: 0;
  flex-shrink: 1;
}

.connection-tag :deep(.el-tag__content) {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.connection-tag :deep(.el-icon) {
  flex-shrink: 0;
}

.connection-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>
