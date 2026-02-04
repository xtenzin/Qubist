<template>
  <el-dialog v-model="visible" :title="$t('point.view')" width="900px" @close="$emit('close')">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('point.info')" name="info">
        <div v-if="pointData" class="point-info-content">
          <div class="info-section">
            <div class="info-label">{{ $t('point.id') }}</div>
            <div class="info-value id-value">
              <code>{{ pointData.id }}</code>
            </div>
            <el-button text :icon="DocumentCopy" @click="handleCopy(String(pointData.id))" class="copy-btn label-right" />
          </div>
          <div class="info-section">
            <div class="info-label">{{ $t('point.vector') }}</div>
            <div class="info-value vector-value">
              <code>{{ JSON.stringify(pointData.vector) }}</code>
            </div>
            <el-button text :icon="DocumentCopy" @click="handleCopy(JSON.stringify(pointData.vector))" class="copy-btn label-right" />
          </div>
          <div class="info-section">
            <div class="info-label">{{ $t('point.payload') }}</div>
            <div class="info-value payload-value">
              <VueJsonPretty :data="pointData.payload" :deep="3" theme="light" />
            </div>
            <el-button text :icon="DocumentCopy" @click="handleCopy(JSON.stringify(pointData.payload, null, 2))" class="copy-btn label-right" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('point.data')" name="data">
        <div v-if="pointData" class="json-highlighter">
          <el-button text :icon="DocumentCopy" @click="handleCopy(JSON.stringify(pointData, null, 2))" class="copy-btn-float" />
          <VueJsonPretty :data="pointData" :deep="5" theme="light" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
// 点数据查看对话框组件
// Point data view dialog component
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DocumentCopy } from '@element-plus/icons-vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { copyToClipboard } from '@/utils/clipboard'
import type { Point } from '@/api/types'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  pointData: Point | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const visible = ref(props.modelValue)
const activeTab = ref('info')

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    activeTab.value = 'info'
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    emit('close')
  }
})

const handleCopy = (text: string) => {
  copyToClipboard(text)
}
</script>

<style scoped>
.point-info-content {
  padding: 8px 0;
}

.info-section {
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section:hover .copy-btn {
  opacity: 1;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  min-width: 80px;
  margin-top: 0;
}

.info-value {
  position: relative;
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  flex: 1;
  min-width: 0;
}

.id-value {
  max-height: 60px;
  overflow-y: auto;
}

.vector-value {
  max-height: 100px;
  overflow-y: auto;
}

.payload-value {
  max-height: 400px;
  overflow-y: auto;
}

.info-value code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  margin: 0;
}

.copy-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.label-right {
  position: relative;
  top: 0;
  right: 0;
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
.payload-value :deep(.vjs-tree),
.json-highlighter :deep(.vjs-tree) {
  background: transparent;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.payload-value :deep(.vjs-tree__key),
.json-highlighter :deep(.vjs-tree__key) {
  color: #005cc5 !important;
}

.payload-value :deep(.vjs-tree__value-string),
.json-highlighter :deep(.vjs-tree__value-string),
.payload-value :deep(.vjs-tree [class*="string"]),
.json-highlighter :deep(.vjs-tree [class*="string"]) {
  color: #d73a49 !important;
}

.payload-value :deep(.vjs-tree__value-number),
.json-highlighter :deep(.vjs-tree__value-number),
.payload-value :deep(.vjs-tree [class*="number"]),
.json-highlighter :deep(.vjs-tree [class*="number"]) {
  color: #22863a !important;
}

.payload-value :deep(.vjs-tree__value-boolean),
.json-highlighter :deep(.vjs-tree__value-boolean),
.payload-value :deep(.vjs-tree [class*="boolean"]),
.json-highlighter :deep(.vjs-tree [class*="boolean"]) {
  color: #6f42c1 !important;
}

.payload-value :deep(.vjs-tree__value-null),
.json-highlighter :deep(.vjs-tree__value-null),
.payload-value :deep(.vjs-tree [class*="null"]),
.json-highlighter :deep(.vjs-tree [class*="null"]) {
  color: #6a737d !important;
}

.payload-value :deep(.vjs-tree__brackets),
.json-highlighter :deep(.vjs-tree__brackets) {
  color: #24292e !important;
}
</style>
