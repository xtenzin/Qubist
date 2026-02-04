<template>
  <div class="login-container">
    <!-- 语言切换器 -->
    <!-- Locale switcher -->
    <div class="locale-switcher-container">
      <LocaleSwitcher />
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="#42b883" stroke-width="8" />
            <circle cx="50" cy="50" r="25" fill="#42b883" />
            <circle cx="50" cy="50" r="10" fill="white" />
          </svg>
        </div>
        <h1>{{ $t('login.title') }}</h1>
        <p>{{ $t('login.subtitle') }}</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="login-form" label-position="top">
        <el-form-item :label="$t('login.history')" prop="history">
          <el-select
            v-model="selectedHistory"
            :placeholder="$t('login.selectHistory')"
            clearable
            style="width: 100%"
            @change="handleSelectHistory"
          >
            <el-option
              v-for="(item, index) in connectionStore.historyConfigs"
              :key="index"
              :label="formatHistoryLabel(item)"
              :value="index"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('login.server')" prop="server">
          <el-input
            v-model="form.server"
            :placeholder="$t('login.serverPlaceholder')"
            clearable
          >
            <template #prefix>
              <el-icon><Connection /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('login.port')" prop="port">
          <el-input v-model="form.port" :placeholder="$t('login.portPlaceholder')" clearable>
            <template #prefix>
              <el-icon><Position /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('login.apiKey')" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            :placeholder="$t('login.apiKeyPlaceholder')"
            show-password
            clearable
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            size="large"
            @click="handleLogin"
          >
            {{ loading ? $t('login.connectingButton') : $t('login.connectButton') }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部版权和版本信息 -->
      <!-- Footer copyright and version information -->
      <div class="login-footer">
        <div class="version-info">
          <el-text type="info" size="small">v{{ appVersion }}</el-text>
        </div>
        <div class="copyright-info">
          <el-text type="info" size="small">{{ $t('common.poweredBy') }} {{ author }} © {{ copyrightYear }}</el-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 登录页面
// Login page
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Connection, Position, Key } from '@element-plus/icons-vue'
import { useConnectionStore } from '@/stores/connection'
import { verifyConnection } from '@/api/qdrant'
import { APP_VERSION, COPYRIGHT_YEAR, AUTHOR } from '@/constants/version'
import LocaleSwitcher from '@/components/LocaleSwitcher.vue'

const router = useRouter()
const connectionStore = useConnectionStore()
const { t } = useI18n()

const formRef = ref<FormInstance>()
const loading = ref(false)
const selectedHistory = ref<number | null>(null)

// 版本和版权信息
// Version and copyright information
const appVersion = APP_VERSION
const copyrightYear = COPYRIGHT_YEAR
const author = AUTHOR

const form = reactive({
  server: 'localhost',
  port: '6333',
  apiKey: ''
})

// 表单验证规则（使用 i18n）
// Form validation rules (using i18n)
const rules = computed<FormRules>(() => ({
  server: [{ required: true, message: t('login.serverRequired'), trigger: 'blur' }],
  port: [
    { required: true, message: t('login.portRequired'), trigger: 'blur' },
    { pattern: /^\d+$/, message: t('login.portMustBeNumber'), trigger: 'blur' }
  ]
}))

// 格式化历史记录标签
// Format history record label
const formatHistoryLabel = (item: { server: string; port: string; apiKey: string; timestamp: number }) => {
  const date = new Date(item.timestamp)
  const locale = connectionStore.currentConfig ? 'zh-CN' : (navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US')
  const timeStr = date.toLocaleString(locale)
  const hasKey = item.apiKey ? (locale === 'zh-CN' ? ' [已配置 KEY]' : ' [KEY configured]') : ''
  return `${item.server}:${item.port} - ${timeStr}${hasKey}`
}

// 选择历史记录
// Select history record
const handleSelectHistory = (index: number | null) => {
  if (index !== null && connectionStore.historyConfigs[index]) {
    const config = connectionStore.historyConfigs[index]
    form.server = config.server
    form.port = config.port
    form.apiKey = config.apiKey
  }
}

// 登录处理
// Login handler
const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // 设置当前配置用于验证
      // Set current configuration for verification
      connectionStore.currentConfig = {
        server: form.server,
        port: form.port,
        apiKey: form.apiKey,
        timestamp: Date.now()
      }

      // 验证连接
      // Verify connection
      const isValid = await verifyConnection()

      if (isValid) {
        // 连接成功，保存配置
        // Connection successful, save configuration
        connectionStore.connect({
          server: form.server,
          port: form.port,
          apiKey: form.apiKey
        })
        ElMessage.success(t('login.connectSuccess'))
        router.push('/dashboard')
      } else {
        ElMessage.error(t('login.connectFailed'))
        connectionStore.currentConfig = null
      }
    } catch (error) {
      ElMessage.error(t('login.networkError'))
      connectionStore.currentConfig = null
    } finally {
      loading.value = false
    }
  })
}

// 组件挂载时加载历史配置
// Load history configurations when component is mounted
onMounted(() => {
  connectionStore.loadHistoryConfigs()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.locale-switcher-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.locale-switcher-container :deep(.locale-switcher) {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 6px 12px;
  color: #333;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.locale-switcher-container :deep(.locale-switcher:hover) {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.login-card {
  width: 100%;
  max-width: 480px;
  padding: 48px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.logo svg {
  width: 100%;
  height: 100%;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #666;
}

.login-form {
  margin-top: 32px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-button--primary:hover) {
  opacity: 0.9;
}

.login-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.version-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.copyright-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-footer :deep(.el-text) {
  color: #909399;
  font-size: 12px;
}
</style>
