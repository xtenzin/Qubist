<template>
  <el-dialog
    v-model="visible"
    :title="$t('collection.settings')"
    width="700px"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="200px" v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane :label="$t('optimizer.config')" name="optimizer">
          <el-form-item :label="$t('optimizer.indexingThreshold')">
            <el-input-number 
              v-model="formData.optimizers_config.indexing_threshold" 
              :min="0" 
              :max="1000000"
              :step="1000"
            />
          </el-form-item>
          <el-form-item :label="$t('optimizer.flushInterval')">
            <el-input-number v-model="formData.optimizers_config.flush_interval_sec" :min="1" />
          </el-form-item>
          <el-form-item :label="$t('optimizer.maxThreads')">
            <el-input-number v-model="formData.optimizers_config.max_optimization_threads" :min="1" />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane :label="$t('hnsw.config')" name="hnsw">
          <el-form-item :label="$t('hnsw.m')">
            <el-input-number v-model="formData.hnsw_config.m" :min="4" :max="64" />
          </el-form-item>
          <el-form-item :label="$t('hnsw.efConstruct')">
            <el-input-number v-model="formData.hnsw_config.ef_construct" :min="4" />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">{{ $t('common.save') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 集合设置对话框组件
// Collection settings dialog component
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getCollectionInfo, updateCollection } from '@/api/qdrant'
import type { CollectionInfo } from '@/api/types'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  collectionName: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  saved: []
}>()

const visible = ref(props.modelValue)
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('optimizer')
const formData = ref({
  optimizers_config: {
    indexing_threshold: 20000,
    flush_interval_sec: 5,
    max_optimization_threads: 0
  },
  hnsw_config: {
    m: 16,
    ef_construct: 100
  }
})

watch(() => props.modelValue, async (val) => {
  visible.value = val
  if (val && props.collectionName) {
    await loadCollectionInfo()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    emit('close')
  }
})

// 加载集合信息
// Load collection info
const loadCollectionInfo = async () => {
  if (!props.collectionName) return

  loading.value = true
  try {
    const info = await getCollectionInfo(props.collectionName)
    
    // 加载优化器配置（从 optimizer_config 读取）
    // Load optimizer config (read from optimizer_config)
    // 尝试多个可能的路径
    // Try multiple possible paths
    const optimizerConfig = info.config?.optimizer_config || info.config?.params?.optimizer_config
    if (optimizerConfig) {
      const loadedThreshold = optimizerConfig.indexed_threshold ?? optimizerConfig.indexing_threshold ?? 20000
      formData.value.optimizers_config = {
        indexing_threshold: loadedThreshold,
        flush_interval_sec: optimizerConfig.flush_interval_sec ?? 5,
        max_optimization_threads: optimizerConfig.max_optimization_threads ?? 0
      }
    }
    
    // 加载 HNSW 配置（从 config.hnsw_config 或 config.params.hnsw_config 读取）
    // Load HNSW config (read from config.hnsw_config or config.params.hnsw_config)
    const hnswConfig = info.config?.hnsw_config || info.config?.params?.hnsw_config
    if (hnswConfig) {
      formData.value.hnsw_config = {
        m: hnswConfig.m ?? 16,
        ef_construct: hnswConfig.ef_construct ?? 100
      }
    }
  } catch (error) {
    ElMessage.error(t('collection.loadInfoFailed'))
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!props.collectionName) return

  saving.value = true
  try {
    // 构建更新参数，只包含需要更新的字段
    // Build update parameters, only include fields that need to be updated
    const updateParams: any = {}
    
    // 更新优化器配置（只传递有值的字段）
    // Update optimizer config (only pass fields with values)
    if (formData.value.optimizers_config) {
      updateParams.optimizers_config = {}
      
      // Qdrant API 更新时使用 indexing_threshold
      // Qdrant API uses indexing_threshold when updating
      // 注意：读取时返回的是 indexed_threshold，但更新时必须使用 indexing_threshold
      // Note: Reading returns indexed_threshold, but updating must use indexing_threshold
      if (formData.value.optimizers_config.indexing_threshold !== undefined && formData.value.optimizers_config.indexing_threshold !== null) {
        // 确保值是整数（Qdrant 要求整数）
        // Ensure value is integer (Qdrant requires integer)
        const thresholdValue = Math.floor(formData.value.optimizers_config.indexing_threshold)
        updateParams.optimizers_config.indexing_threshold = thresholdValue
        console.log('Sending indexing_threshold:', thresholdValue)
      }
      
      // 只有在值存在时才添加其他字段
      // Only add other fields if values exist
      if (formData.value.optimizers_config.flush_interval_sec !== undefined && formData.value.optimizers_config.flush_interval_sec !== null) {
        updateParams.optimizers_config.flush_interval_sec = formData.value.optimizers_config.flush_interval_sec
      }
      if (formData.value.optimizers_config.max_optimization_threads !== undefined && formData.value.optimizers_config.max_optimization_threads !== null) {
        updateParams.optimizers_config.max_optimization_threads = formData.value.optimizers_config.max_optimization_threads
      }
      
      // 如果 optimizers_config 为空对象，则不传递
      // If optimizers_config is empty object, don't pass it
      if (Object.keys(updateParams.optimizers_config).length === 0) {
        delete updateParams.optimizers_config
      }
    }
    
    // 更新 HNSW 配置
    // Update HNSW config
    if (formData.value.hnsw_config) {
      updateParams.hnsw_config = {
        m: formData.value.hnsw_config.m,
        ef_construct: formData.value.hnsw_config.ef_construct
      }
    }
    
    await updateCollection(props.collectionName, updateParams)
    ElMessage.success(t('collection.settingsSaved'))
    // 等待更长时间让 Qdrant 处理更新（优化器更新可能需要时间）
    // Wait longer for Qdrant to process the update (optimizer updates may take time)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 重新加载集合信息以显示最新值
    // Reload collection info to show latest values
    await loadCollectionInfo()
    emit('saved')
    handleClose()
  } catch (error: any) {
    console.error('Failed to update collection:', error)
    const errorMessage = error?.response?.data?.status?.error || error?.message || t('collection.settingsSaveFailed')
    ElMessage.error(errorMessage)
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>
