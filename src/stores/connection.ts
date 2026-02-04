// 连接状态管理
// Connection state management
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ConnectionConfig {
  server: string
  port: string
  apiKey: string
  timestamp: number
}

export const useConnectionStore = defineStore(
  'connection',
  () => {
    const isConnected = ref(false)
    const currentConfig = ref<ConnectionConfig | null>(null)
    const historyConfigs = ref<ConnectionConfig[]>([])

    // 从 localStorage 加载历史配置
    // Load history configurations from localStorage
    const loadHistoryConfigs = () => {
      const saved = localStorage.getItem('qdrant-connection-history')
      if (saved) {
        try {
          historyConfigs.value = JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse connection history:', e)
          historyConfigs.value = []
        }
      }
    }

    // 保存历史配置到 localStorage
    // Save history configurations to localStorage
    const saveHistoryConfigs = () => {
      localStorage.setItem('qdrant-connection-history', JSON.stringify(historyConfigs.value))
    }

    // 添加新的历史配置
    // Add new history configuration
    const addHistoryConfig = (config: Omit<ConnectionConfig, 'timestamp'>) => {
      const newConfig: ConnectionConfig = {
        ...config,
        timestamp: Date.now()
      }

      // 检查是否已存在相同的配置
      // Check if the same configuration already exists
      const existingIndex = historyConfigs.value.findIndex(
        (c) => c.server === newConfig.server && c.port === newConfig.port && c.apiKey === newConfig.apiKey
      )

      if (existingIndex !== -1) {
        // 更新时间戳
        // Update timestamp
        historyConfigs.value[existingIndex].timestamp = newConfig.timestamp
      } else {
        // 添加新配置
        // Add new configuration
        historyConfigs.value.unshift(newConfig)
      }

      // 按时间戳降序排序
      // Sort by timestamp in descending order
      historyConfigs.value.sort((a, b) => b.timestamp - a.timestamp)

      // 最多保留 10 条历史记录
      // Keep at most 10 history records
      if (historyConfigs.value.length > 10) {
        historyConfigs.value = historyConfigs.value.slice(0, 10)
      }

      saveHistoryConfigs()
    }

    // 连接成功
    // Connection successful
    const connect = (config: Omit<ConnectionConfig, 'timestamp'>) => {
      isConnected.value = true
      currentConfig.value = {
        ...config,
        timestamp: Date.now()
      }
      addHistoryConfig(config)
    }

    // 断开连接
    // Disconnect
    const disconnect = () => {
      isConnected.value = false
      currentConfig.value = null
    }

    // 获取 API 基础 URL
    // Get API base URL
    const apiUrl = computed(() => {
      if (!currentConfig.value) return ''
      const protocol = window.location.protocol
      return `${protocol}//${currentConfig.value.server}:${currentConfig.value.port}`
    })

    // 初始化时加载历史配置
    // Load history configurations on initialization
    loadHistoryConfigs()

    return {
      isConnected,
      currentConfig,
      historyConfigs,
      apiUrl,
      connect,
      disconnect,
      loadHistoryConfigs
    }
  },
  {
    persist: {
      key: 'qdrant-connection-store',
      storage: localStorage,
      pick: ['historyConfigs']
    }
  }
)
