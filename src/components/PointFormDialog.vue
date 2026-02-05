<template>
  <el-dialog
    v-model="visible"
    :title="mode === 'add' ? $t('point.addTitle') : $t('point.editTitle')"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="80px">
      <el-form-item :label="$t('point.id')">
        <el-input v-model="formData.id" :disabled="mode === 'edit'" :placeholder="$t('point.idPlaceholder')" />
      </el-form-item>
      <el-form-item :label="$t('point.vector')">
        <el-input
          v-model="vectorRawInput"
          type="textarea"
          :rows="4"
          :placeholder="$t('point.vectorPlaceholder')"
        />
        <el-button v-if="mode === 'add'" text type="primary" size="small" @click="handleGenerateRandomVector">
          {{ $t('point.generateRandom') }}
        </el-button>
      </el-form-item>
      <el-form-item :label="$t('point.payload')">
        <el-input
          v-model="payloadRawInput"
          type="textarea"
          :rows="6"
          :placeholder="payloadPlaceholder"
        />
        <el-button v-if="mode === 'add'" text type="primary" size="small" @click="handleGenerateRandomPayload">
          {{ $t('point.generateRandomPayload') }}
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="mode === 'add'" @click="$emit('load-latest')">
          {{ $t('point.loadLatest') }}
        </el-button>
        <div class="footer-right">
          <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleSave">{{ $t('common.save') }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 点数据表单对话框组件
// Point data form dialog component
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getCollectionInfo } from '@/api/qdrant'
import type { Point } from '@/api/types'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  mode: 'add' | 'edit'
  pointData: Point | null
  collectionName?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [point: Point]
  'load-latest': []
  close: []
}>()

const visible = ref(props.modelValue)
const formData = ref<Point>({ id: '', vector: [], payload: {} })
// 原始输入值（用于允许无效 JSON 输入）
// Raw input values (to allow invalid JSON input)
const vectorRawInput = ref('')
const payloadRawInput = ref('')

// 初始化表单数据
// Initialize form data
const initFormData = () => {
  if (props.pointData) {
    formData.value = JSON.parse(JSON.stringify(props.pointData))
    // 添加模式下，如果 ID 为空，自动生成基于毫秒级时间戳的 ID（数字类型）
    // In add mode, if ID is empty, auto-generate ID based on millisecond timestamp (number type)
    if (props.mode === 'add' && (!formData.value.id || (typeof formData.value.id === 'string' && formData.value.id.trim() === ''))) {
      formData.value.id = new Date().getTime()
    }
    vectorRawInput.value = JSON.stringify(formData.value.vector, null, 2)
    payloadRawInput.value = JSON.stringify(formData.value.payload || {}, null, 2)
  } else if (props.mode === 'add') {
    // 添加模式：自动生成基于毫秒级时间戳的 ID
    // Add mode: Auto-generate ID based on millisecond timestamp
    formData.value = { 
      id: new Date().getTime().toString(), 
      vector: [], 
      payload: {} 
    }
    vectorRawInput.value = ''
    payloadRawInput.value = ''
  }
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    initFormData()
  }
}, { immediate: true })

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    emit('close')
  }
})

// 监听 pointData 变化（用于加载最新数据时更新输入）
// Watch pointData changes (for updating input when loading latest data)
watch(() => props.pointData, (newData) => {
  if (newData && visible.value) {
    // 保留当前 ID（添加模式下保持时间戳，编辑模式下保持原 ID）
    // Preserve current ID (keep timestamp in add mode, keep original ID in edit mode)
    const currentId = formData.value.id
    formData.value = JSON.parse(JSON.stringify(newData))
    if (props.mode === 'add') {
      // 添加模式下，如果新数据没有 ID 或 ID 为空，保持当前时间戳（数字类型）
      // In add mode, if new data has no ID or empty ID, keep current timestamp (number type)
      formData.value.id = currentId || new Date().getTime()
    }
    vectorRawInput.value = JSON.stringify(newData.vector, null, 2)
    payloadRawInput.value = JSON.stringify(newData.payload || {}, null, 2)
  }
}, { deep: true })

// 监听 mode 变化，确保添加模式下 ID 正确设置
// Watch mode changes to ensure ID is correctly set in add mode
watch(() => props.mode, () => {
  if (visible.value && props.mode === 'add' && (!formData.value.id || formData.value.id.trim() === '')) {
    formData.value.id = new Date().getTime().toString()
  }
})

// 计算属性：Payload 占位符文本（避免 i18n 解析花括号）
// Computed property: Payload placeholder text (avoid i18n parsing curly braces)
const payloadPlaceholder = computed(() => {
  const prefix = t('point.payloadPlaceholderPrefix')
  const example = '{"name": "test", "value": 123}'
  return `${prefix}${example}`
})

// 验证点数据格式
// Validate point data format
const validatePointData = (): boolean => {
  // 验证 ID
  if (!formData.value.id || (typeof formData.value.id === 'string' && formData.value.id.trim() === '')) {
    ElMessage.error(t('point.idRequired'))
    return false
  }
  
  // 确保 ID 是数字类型（Qdrant 要求 unsigned integer 或 UUID）
  // Ensure ID is number type (Qdrant requires unsigned integer or UUID)
  if (typeof formData.value.id === 'string') {
    // 如果是字符串，尝试转换为数字
    // If string, try to convert to number
    const numId = Number(formData.value.id)
    if (isNaN(numId) || numId < 0 || !Number.isInteger(numId)) {
      ElMessage.error('ID 必须是有效的无符号整数或 UUID')
      return false
    }
    formData.value.id = numId
  } else if (typeof formData.value.id === 'number') {
    // 确保是有效的无符号整数
    // Ensure it's a valid unsigned integer
    if (formData.value.id < 0 || !Number.isInteger(formData.value.id)) {
      ElMessage.error('ID 必须是有效的无符号整数')
      return false
    }
  }

  // 解析并验证向量
  if (!vectorRawInput.value || vectorRawInput.value.trim() === '') {
    ElMessage.error(t('point.vectorRequired'))
    return false
  }
  try {
    const parsedVector = JSON.parse(vectorRawInput.value.trim())
    if (!Array.isArray(parsedVector) || parsedVector.length === 0) {
      ElMessage.error(t('point.vectorRequired'))
      return false
    }
    const isValid = parsedVector.every((v) => typeof v === 'number')
    if (!isValid) {
      ElMessage.error(t('point.vectorMustBeNumbers'))
      return false
    }
    formData.value.vector = parsedVector
  } catch (e) {
    ElMessage.error(t('point.vectorRequired') + ' - ' + (e as Error).message)
    return false
  }

  // 解析 Payload（可选，允许为空对象）
  try {
    if (payloadRawInput.value && payloadRawInput.value.trim() !== '') {
      formData.value.payload = JSON.parse(payloadRawInput.value.trim())
    } else {
      formData.value.payload = {}
    }
  } catch (e) {
    ElMessage.error('Payload JSON 格式错误 - ' + (e as Error).message)
    return false
  }

  return true
}

const handleSave = () => {
  if (validatePointData()) {
    emit('save', formData.value)
  }
}

// 生成随机向量
// Generate random vector
const handleGenerateRandomVector = async () => {
  if (!props.collectionName) {
    ElMessage.warning('请先选择一个集合')
    return
  }

  try {
    // 获取集合信息以获取向量维度
    // Get collection info to get vector size
    const collectionInfo = await getCollectionInfo(props.collectionName)
    const vectorSize = collectionInfo.config?.params?.vectors?.size

    if (!vectorSize || vectorSize <= 0) {
      ElMessage.error('无法获取集合的向量维度')
      return
    }

    // 生成随机浮点数数组（范围 -1 到 1，保留 4 位小数）
    // Generate random float array (range -1 to 1, 4 decimal places)
    const randomVector = Array.from({ length: vectorSize }, () => {
      // 生成 -1 到 1 之间的随机数
      // Generate random number between -1 and 1
      const value = (Math.random() * 2 - 1)
      // 保留 4 位小数
      // Keep 4 decimal places
      return parseFloat(value.toFixed(4))
    })

    // 更新向量输入
    // Update vector input
    vectorRawInput.value = JSON.stringify(randomVector, null, 2)
    ElMessage.success(`已生成 ${vectorSize} 维随机向量`)
  } catch (error) {
    console.error('Failed to generate random vector:', error)
    ElMessage.error('生成随机向量失败：' + (error as Error).message)
  }
}

// 生成随机 Payload
// Generate random payload
const handleGenerateRandomPayload = () => {
  // 类型列表
  // Type list
  const types = ['office-document', 'code-file', 'markdown', 'xml', 'plain']
  
  // 随机选择类型
  // Randomly select type
  const randomType = types[Math.floor(Math.random() * types.length)]
  
  // 当前时间戳（ISO 8601 格式，Qdrant datetime 字段要求）
  // Current timestamp (ISO 8601 format, required by Qdrant datetime field)
  const timestamp = new Date().toISOString()
  
  // 生成随机字符串内容
  // Generate random string content
  const generateRandomString = (length: number = 20): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  // 生成随机长度的内容（10-50 个字符）
  // Generate random length content (10-50 characters)
  const contentLength = Math.floor(Math.random() * 41) + 10
  const content = generateRandomString(contentLength)
  
  // 构建 Payload 对象
  // Build payload object
  const randomPayload = {
    type: randomType,
    timestamp: timestamp,
    content: content
  }
  
  // 更新 Payload 输入
  // Update payload input
  payloadRawInput.value = JSON.stringify(randomPayload, null, 2)
  ElMessage.success('已生成随机 Payload')
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-right {
  display: flex;
  gap: 8px;
}
</style>
