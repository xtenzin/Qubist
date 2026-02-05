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
        <el-tab-pane :label="$t('index.management')" name="index">
          <div class="index-management">
            <div class="index-list">
              <div class="index-list-header">
                <h4>{{ $t('index.currentIndexes') }}</h4>
                <el-button type="primary" size="small" @click="showCreateIndexDialog = true">
                  {{ $t('index.createIndex') }}
                </el-button>
              </div>
              <el-table :data="indexList" stripe style="width: 100%" v-loading="indexLoading">
                <el-table-column prop="field_name" :label="$t('index.fieldName')" />
                <el-table-column prop="field_schema" :label="$t('index.fieldSchema')">
                  <template #default="{ row }">
                    <el-tag>{{ formatFieldSchema(row.field_schema) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="points_count" :label="$t('index.pointsCount')" width="120">
                  <template #default="{ row }">
                    <span v-if="row.points_count !== null && row.points_count !== undefined">{{ row.points_count }}</span>
                    <span v-else class="loading-text">-</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('common.actions')" width="100">
                  <template #default="{ row }">
                    <el-button
                      type="danger"
                      link
                      size="small"
                      @click="handleDeleteIndex(row.field_name)"
                      :loading="deletingIndex === row.field_name"
                    >
                      {{ $t('common.delete') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="indexList.length === 0 && !indexLoading" :description="$t('index.noIndexes')" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <!-- 创建索引对话框 -->
      <!-- Create index dialog -->
      <el-dialog
        v-model="showCreateIndexDialog"
        :title="$t('index.createIndex')"
        width="500px"
        @close="resetCreateIndexForm"
      >
        <el-form :model="createIndexForm" label-width="120px">
          <el-form-item :label="$t('index.fieldName')" required>
            <el-input
              v-model="createIndexForm.field_name"
              :placeholder="$t('index.fieldNamePlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="$t('index.fieldSchema')">
            <el-select v-model="createIndexForm.field_schema_type" :placeholder="$t('index.selectSchemaType')">
              <el-option label="keyword" value="keyword" />
              <el-option label="integer" value="integer" />
              <el-option label="float" value="float" />
              <el-option label="uuid" value="uuid" />
              <el-option label="datetime" value="datetime" />
              <el-option label="text" value="text" />
              <el-option label="geo" value="geo" />
              <el-option label="bool" value="bool" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCreateIndexDialog = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleCreateIndex" :loading="creatingIndex">
            {{ $t('common.create') }}
          </el-button>
        </template>
      </el-dialog>
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
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCollectionInfo, updateCollection, createPayloadIndex, deletePayloadIndex } from '@/api/qdrant'
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

// 索引管理相关状态
// Index management related state
const indexLoading = ref(false)
const indexList = ref<Array<{ field_name: string; field_schema: any }>>([])
const showCreateIndexDialog = ref(false)
const creatingIndex = ref(false)
const deletingIndex = ref<string | null>(null)
const createIndexForm = ref({
  field_name: '',
  field_schema_type: 'keyword'
})
const collectionInfoData = ref<CollectionInfo | null>(null)

watch(() => props.modelValue, async (val) => {
  visible.value = val
  if (val && props.collectionName) {
    await loadCollectionInfo()
  } else {
    // 关闭对话框时重置状态
    // Reset state when closing dialog
    indexList.value = []
    resetCreateIndexForm()
  }
})

// 监听 TAB 切换，切换到索引管理时重新加载索引列表
// Watch TAB switch, reload index list when switching to index management
watch(activeTab, (newTab) => {
  if (newTab === 'index' && props.collectionName) {
    loadIndexList()
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
    collectionInfoData.value = info
    
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
    
    // 加载索引列表
    // Load index list
    await loadIndexList()
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

// 加载索引列表
// Load index list
const loadIndexList = async () => {
  if (!props.collectionName) return
  
  indexLoading.value = true
  try {
    const info = collectionInfoData.value || await getCollectionInfo(props.collectionName)
    collectionInfoData.value = info
    
    // 从 payload_schema 中提取索引信息
    // Extract index information from payload_schema
    // Qdrant API 返回的集合信息中，payload_schema 可能在 result.payload_schema 或直接作为属性
    // In Qdrant API response, payload_schema may be in result.payload_schema or as a direct property
    // payload_schema 中每个字段都包含 points 字段，表示该索引字段命中的点数
    // Each field in payload_schema contains a points field indicating the number of points indexed
    const payloadSchema = (info as any).payload_schema || (info as any).result?.payload_schema || {}
    indexList.value = Object.keys(payloadSchema).map(fieldName => {
      const fieldInfo = payloadSchema[fieldName]
      return {
        field_name: fieldName,
        field_schema: fieldInfo,
        points_count: fieldInfo.points !== undefined ? fieldInfo.points : null
      }
    })
  } catch (error) {
    console.error('Failed to load index list:', error)
    ElMessage.error(t('index.loadFailed'))
    indexList.value = []
  } finally {
    indexLoading.value = false
  }
}

// 格式化字段模式
// Format field schema
const formatFieldSchema = (schema: any): string => {
  if (!schema) return '-'
  if (typeof schema === 'string') return schema
  if (schema.type) return schema.type
  if (schema.data_type) return schema.data_type
  return JSON.stringify(schema)
}

// 创建索引
// Create index
const handleCreateIndex = async () => {
  if (!props.collectionName) return
  
  if (!createIndexForm.value.field_name.trim()) {
    ElMessage.error(t('index.fieldNameRequired'))
    return
  }
  
  creatingIndex.value = true
  try {
    const fieldSchema = createIndexForm.value.field_schema_type 
      ? { type: createIndexForm.value.field_schema_type }
      : undefined
    
    await createPayloadIndex(props.collectionName, createIndexForm.value.field_name.trim(), fieldSchema)
    ElMessage.success(t('index.createSuccess'))
    showCreateIndexDialog.value = false
    resetCreateIndexForm()
    await loadIndexList()
    // 重新加载集合信息以更新索引列表
    // Reload collection info to update index list
    await loadCollectionInfo()
  } catch (error: any) {
    console.error('Failed to create index:', error)
    const errorMessage = error?.response?.data?.status?.error || error?.message || t('index.createFailed')
    ElMessage.error(errorMessage)
  } finally {
    creatingIndex.value = false
  }
}

// 删除索引
// Delete index
const handleDeleteIndex = async (fieldName: string) => {
  if (!props.collectionName) return
  
  try {
    await ElMessageBox.confirm(
      t('index.deleteConfirm', { field: fieldName }),
      t('index.deleteTitle'),
      {
        type: 'warning',
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    deletingIndex.value = fieldName
    await deletePayloadIndex(props.collectionName, fieldName)
    ElMessage.success(t('index.deleteSuccess'))
    await loadIndexList()
    // 重新加载集合信息以更新索引列表
    // Reload collection info to update index list
    await loadCollectionInfo()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete index:', error)
      const errorMessage = error?.response?.data?.status?.error || error?.message || t('index.deleteFailed')
      ElMessage.error(errorMessage)
    }
  } finally {
    deletingIndex.value = null
  }
}

// 重置创建索引表单
// Reset create index form
const resetCreateIndexForm = () => {
  createIndexForm.value = {
    field_name: '',
    field_schema_type: 'keyword'
  }
}

const handleClose = () => {
  visible.value = false
  resetCreateIndexForm()
}
</script>

<style scoped>
.index-management {
  padding: 16px 0;
}

.index-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.index-list-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.loading-text {
  color: #909399;
}
</style>
