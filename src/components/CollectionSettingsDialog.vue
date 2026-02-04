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
            <el-input-number v-model="formData.optimizers_config.indexing_threshold" :min="0" />
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
    if (info.config?.optimizer_config) {
      formData.value.optimizers_config = {
        indexing_threshold: info.config.optimizer_config.indexed_threshold || 20000,
        flush_interval_sec: 5,
        max_optimization_threads: 0
      }
    }
    if (info.config?.hnsw_config) {
      formData.value.hnsw_config = {
        m: info.config.hnsw_config.m || 16,
        ef_construct: info.config.hnsw_config.ef_construct || 100
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
    await updateCollection(props.collectionName, {
      optimizers_config: {
        indexing_threshold: formData.value.optimizers_config.indexing_threshold
      },
      hnsw_config: formData.value.hnsw_config
    })
    ElMessage.success(t('collection.settingsSaved'))
    emit('saved')
    handleClose()
  } catch (error) {
    ElMessage.error(t('collection.settingsSaveFailed'))
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>
