<template>
  <el-dialog
    v-model="visible"
    :title="$t('point.selectExportFormat')"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="format-selection">
      <div class="format-options">
        <div class="format-option" @click="handleSelectFormat('json')">
          <div class="format-icon json-icon">
            <el-icon :size="64"><Document /></el-icon>
          </div>
          <div class="format-label">JSON</div>
          <div class="format-desc">{{ $t('point.jsonFormatDesc') }}</div>
        </div>
        <div class="format-option" @click="handleSelectFormat('csv')">
          <div class="format-icon csv-icon">
            <el-icon :size="64"><List /></el-icon>
          </div>
          <div class="format-label">CSV</div>
          <div class="format-desc">{{ $t('point.csvFormatDesc') }}</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
// 导出格式选择对话框组件
// Export format selection dialog component
import { ref, watch } from 'vue'
import { Document, List } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [format: 'json' | 'csv']
}>()

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 选择格式
// Select format
const handleSelectFormat = (format: 'json' | 'csv') => {
  emit('select', format)
  handleClose()
}

// 关闭对话框
// Close dialog
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.format-selection {
  padding: 20px 0;
}

.format-options {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.format-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 40px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 160px;
  background: #fff;
}

.format-option:hover {
  border-color: #42b883;
  background: #f0f9ff;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.15);
}

.format-icon {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.json-icon {
  color: #42b883;
}

.csv-icon {
  color: #409eff;
}

.format-label {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.format-desc {
  font-size: 14px;
  color: #909399;
  text-align: center;
}
</style>
