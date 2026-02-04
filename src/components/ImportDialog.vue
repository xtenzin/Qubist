<template>
  <el-dialog v-model="visible" :title="$t('point.importData')" width="600px" @close="handleClose">
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      :limit="1"
      accept=".json,.csv"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        {{ $t('point.selectFile') }} <em>(JSON/CSV)</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ $t('point.importFileFormatTip') }}
        </div>
      </template>
    </el-upload>

    <div v-if="selectedFile" class="file-info">
      <el-text type="info">{{ selectedFile.name }}</el-text>
      <el-text type="info" size="small">({{ formatFileSize(selectedFile.size) }})</el-text>
    </div>

    <div v-if="previewData.length > 0" class="preview-section">
      <el-text type="info" size="small">
        {{ $t('point.importPreview') }}: {{ previewData.length }} {{ $t('point.importPreviewPoints') }}
      </el-text>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="loading" :disabled="!selectedFile" @click="handleImport">
          {{ $t('point.import') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 导入对话框组件
// Import dialog component
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UploadFilled } from '@element-plus/icons-vue'
import { importFromFile } from '@/utils/importExport'
import type { Point } from '@/api/types'
import type { UploadFile, UploadFiles } from 'element-plus'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  import: [points: Point[]]
}>()

const visible = ref(props.modelValue)
const uploadRef = ref()
const selectedFile = ref<File | null>(null)
const previewData = ref<Point[]>([])
const loading = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (!val) {
    // 重置状态
    // Reset state
    selectedFile.value = null
    previewData.value = []
    uploadRef.value?.clearFiles()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 文件变化处理
// Handle file change
const handleFileChange = async (file: UploadFile, files: UploadFiles) => {
  if (file.raw) {
    selectedFile.value = file.raw
    try {
      // 预览数据
      // Preview data
      previewData.value = await importFromFile(file.raw)
    } catch (error) {
      previewData.value = []
      const { ElMessage } = await import('element-plus')
      ElMessage.error(error instanceof Error ? error.message : String(error))
      uploadRef.value?.clearFiles()
      selectedFile.value = null
    }
  }
}

// 文件移除处理
// Handle file remove
const handleFileRemove = () => {
  selectedFile.value = null
  previewData.value = []
}

// 格式化文件大小
// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 导入处理
// Handle import
const handleImport = async () => {
  if (!selectedFile.value || previewData.value.length === 0) return

  loading.value = true
  try {
    emit('import', previewData.value)
    handleClose()
  } catch (error) {
    const { ElMessage } = await import('element-plus')
    ElMessage.error(error instanceof Error ? error.message : String(error))
  } finally {
    loading.value = false
  }
}

// 关闭对话框
// Close dialog
const handleClose = () => {
  visible.value = false
  selectedFile.value = null
  previewData.value = []
  uploadRef.value?.clearFiles()
}
</script>

<style scoped>
.file-info {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-section {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
