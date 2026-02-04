<template>
  <el-dialog v-model="visible" :title="$t('collection.info')" width="900px" @close="$emit('close')">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('dashboard.basicInfo')" name="basic">
        <div v-if="collectionInfo" class="collection-info-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('dashboard.status')">
              {{ getStatusText(collectionInfo.status) }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('dashboard.optimizerStatus')">
              {{ getOptimizerStatusText(collectionInfo.optimizer_status) }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('dashboard.pointsCount')">{{ collectionInfo.points_count }}</el-descriptions-item>
            <el-descriptions-item :label="$t('dashboard.indexedVectorsCount')">{{ collectionInfo.indexed_vectors_count }}</el-descriptions-item>
            <el-descriptions-item :label="$t('dashboard.segmentsCount')">{{ collectionInfo.segments_count }}</el-descriptions-item>
            <el-descriptions-item :label="$t('dashboard.vectorConfig')" :span="2">
              {{ getVectorConfig(collectionInfo) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('dashboard.advancedInfo')" name="advanced">
        <div v-if="collectionInfo" class="json-highlighter">
          <el-button text :icon="DocumentCopy" @click="handleCopy(JSON.stringify(collectionInfo, null, 2))" class="copy-btn-float" />
          <VueJsonPretty :data="collectionInfo" :deep="5" theme="light" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
// 集合信息对话框组件
// Collection info dialog component
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DocumentCopy } from '@element-plus/icons-vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { copyToClipboard } from '@/utils/clipboard'
import type { CollectionInfo } from '@/api/types'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  collectionInfo: CollectionInfo | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const visible = ref(props.modelValue)
const activeTab = ref('basic')

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    activeTab.value = 'basic'
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    emit('close')
  }
})

// 获取状态文本
// Get status text
const getStatusText = (status: string | undefined): string => {
  if (!status) return '-'
  const statusMap: Record<string, string> = {
    green: t('collection.statusGreen'),
    yellow: t('collection.statusYellow'),
    red: t('collection.statusRed')
  }
  return statusMap[status.toLowerCase()] || status
}

// 获取优化器状态文本
// Get optimizer status text
const getOptimizerStatusText = (optimizerStatus: any): string => {
  if (!optimizerStatus) return '-'
  
  // 如果是字符串类型（如 "ok"）
  if (typeof optimizerStatus === 'string') {
    return optimizerStatus.toLowerCase() === 'ok' ? t('common.success') : optimizerStatus
  }
  
  // 如果是对象类型（如 { ok: true }）
  if (typeof optimizerStatus === 'object' && optimizerStatus !== null) {
    return optimizerStatus.ok ? t('common.success') : t('common.failed')
  }
  
  return '-'
}

// 获取向量配置信息
// Get vector configuration information
const getVectorConfig = (collectionInfo: CollectionInfo): string => {
  const config = collectionInfo.config?.params?.vectors

  if (!config) return t('dashboard.noConfig')

  // 检查是否是多向量配置
  // Check if it's a multi-vector configuration
  if (config.size !== undefined && config.distance !== undefined) {
    return `${t('collection.size')}: ${config.size}, ${t('collection.distanceShort')}: ${config.distance}`
  }

  // 多向量配置
  // Multi-vector configuration
  const vectorNames = Object.keys(config).filter(key => key !== 'size' && key !== 'distance')
  if (vectorNames.length > 0) {
    const configs = vectorNames.map(name => {
      const vec = config[name]
      return `${name}: ${t('collection.size')}=${vec.size}, ${t('collection.distanceShort')}=${vec.distance}`
    })
    return configs.join('; ')
  }

  return JSON.stringify(config)
}

// 复制到剪贴板
// Copy to clipboard
const handleCopy = (text: string) => {
  copyToClipboard(text)
}
</script>

<style scoped>
.collection-info-content {
  padding: 8px 0;
}

.json-highlighter {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  overflow: auto;
  max-height: 500px;
  position: relative;
}

.copy-btn-float {
  position: absolute;
  right: 16px;
  top: 16px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.json-highlighter:hover .copy-btn-float {
  opacity: 1;
}

/* vue-json-pretty 样式覆盖 */
/* vue-json-pretty style override */
.json-highlighter :deep(.vjs-tree) {
  background: transparent;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.json-highlighter :deep(.vjs-tree__key) {
  color: #005cc5 !important;
}

.json-highlighter :deep(.vjs-tree__value-string),
.json-highlighter :deep(.vjs-tree [class*="string"]) {
  color: #d73a49 !important;
}

.json-highlighter :deep(.vjs-tree__value-number),
.json-highlighter :deep(.vjs-tree [class*="number"]) {
  color: #22863a !important;
}

.json-highlighter :deep(.vjs-tree__value-boolean),
.json-highlighter :deep(.vjs-tree [class*="boolean"]) {
  color: #6f42c1 !important;
}

.json-highlighter :deep(.vjs-tree__value-null),
.json-highlighter :deep(.vjs-tree [class*="null"]) {
  color: #6a737d !important;
}

.json-highlighter :deep(.vjs-tree__brackets) {
  color: #24292e !important;
}
</style>
