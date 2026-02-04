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
          v-model="vectorInput"
          type="textarea"
          :rows="4"
          :placeholder="$t('point.vectorPlaceholder')"
        />
        <el-button v-if="mode === 'add'" text type="primary" size="small" @click="$emit('load-latest')">
          {{ $t('point.loadLatest') }}
        </el-button>
      </el-form-item>
      <el-form-item :label="$t('point.payload')">
        <el-input
          v-model="payloadInput"
          type="textarea"
          :rows="6"
          :placeholder="$t('point.payloadPlaceholder')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSave">{{ $t('common.save') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 点数据表单对话框组件
// Point data form dialog component
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { Point } from '@/api/types'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  mode: 'add' | 'edit'
  pointData: Point | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [point: Point]
  'load-latest': []
  close: []
}>()

const visible = ref(props.modelValue)
const formData = ref<Point>({ id: '', vector: [], payload: {} })

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.pointData) {
    formData.value = JSON.parse(JSON.stringify(props.pointData))
  } else if (val) {
    formData.value = { id: '', vector: [], payload: {} }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    emit('close')
  }
})

// 计算属性：向量输入
// Computed property: vector input
const vectorInput = computed({
  get: () => JSON.stringify(formData.value.vector, null, 2),
  set: (value: string) => {
    try {
      formData.value.vector = JSON.parse(value)
    } catch (e) {
      // 解析失败时不更新
      // Don't update on parse failure
    }
  }
})

// 计算属性：Payload 输入
// Computed property: Payload input
const payloadInput = computed({
  get: () => JSON.stringify(formData.value.payload || {}, null, 2),
  set: (value: string) => {
    try {
      formData.value.payload = JSON.parse(value)
    } catch (e) {
      // 解析失败时不更新
      // Don't update on parse failure
    }
  }
})

// 验证点数据格式
// Validate point data format
const validatePointData = (point: Point): boolean => {
  if (!point.id) {
    ElMessage.error(t('point.idRequired'))
    return false
  }
  if (!point.vector || (Array.isArray(point.vector) && point.vector.length === 0)) {
    ElMessage.error(t('point.vectorRequired'))
    return false
  }
  if (Array.isArray(point.vector)) {
    const isValid = point.vector.every((v) => typeof v === 'number')
    if (!isValid) {
      ElMessage.error(t('point.vectorMustBeNumbers'))
      return false
    }
  }
  return true
}

const handleSave = () => {
  if (validatePointData(formData.value)) {
    emit('save', formData.value)
  }
}

const handleClose = () => {
  visible.value = false
}
</script>
