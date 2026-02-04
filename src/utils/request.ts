// HTTP 请求工具
// HTTP request utility
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useConnectionStore } from '@/stores/connection'
import i18n from '@/i18n'

// 创建 axios 实例
// Create axios instance
const service: AxiosInstance = axios.create({
  timeout: 60000
})

// 请求拦截器
// Request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const connectionStore = useConnectionStore()
    // 添加 API KEY 到请求头
    // Add API KEY to request headers
    if (connectionStore.currentConfig?.apiKey) {
      config.headers['api-key'] = connectionStore.currentConfig.apiKey
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
// Response interceptor
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: any) => {
    let message = i18n.global.t('error.requestFailed')
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = error.response.data?.status?.error || i18n.global.t('error.parameterError')
          break
        case 401:
          message = i18n.global.t('error.unauthorized')
          break
        case 403:
          message = i18n.global.t('error.accessDenied')
          break
        case 404:
          message = i18n.global.t('error.notFound')
          break
        case 500:
          message = i18n.global.t('error.serverError')
          break
        default:
          message = error.response.data?.status?.error || i18n.global.t('error.requestFailed')
      }
    } else if (error.request) {
      message = i18n.global.t('error.networkError')
    } else {
      message = error.message
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
