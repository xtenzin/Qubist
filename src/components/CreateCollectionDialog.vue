<template>
  <el-dialog
    v-model="visible"
    :title="$t('collection.createTitle')"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="100px">
      <el-form-item :label="$t('collection.name')" required>
        <el-input v-model="formData.name" :placeholder="$t('collection.namePlaceholder')" />
      </el-form-item>
      <el-form-item :label="$t('collection.vectorSize')" required>
        <el-input-number v-model="formData.vectorSize" :min="1" :max="65535" :placeholder="$t('collection.vectorSizePlaceholder')" />
      </el-form-item>
      <el-form-item :label="$t('collection.distance')">
        <el-select v-model="formData.distance" :placeholder="$t('collection.selectDistance')">
          <el-option label="Cosine" value="Cosine" />
          <el-option label="Euclid" value="Euclid" />
          <el-option label="Dot" value="Dot" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleCreate">{{ $t('common.create') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 创建集合对话框组件
// Create collection dialog component
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  create: [name: string, vectorSize: number, distance: 'Cosine' | 'Euclid' | 'Dot']
  close: []
}>()

const visible = ref(props.modelValue)
const formData = ref({
  name: '',
  vectorSize: 128,
  distance: 'Cosine' as 'Cosine' | 'Euclid' | 'Dot'
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    formData.value = {
      name: '',
      vectorSize: 128,
      distance: 'Cosine'
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    emit('close')
  }
})

const handleCreate = () => {
  if (!formData.value.name.trim()) {
    ElMessage.error(t('collection.namePlaceholder'))
    return
  }
  if (!formData.value.vectorSize || formData.value.vectorSize < 1) {
    ElMessage.error(t('collection.vectorSizePlaceholder'))
    return
  }
  emit('create', formData.value.name, formData.value.vectorSize, formData.value.distance)
  handleClose()
}

const handleClose = () => {
  visible.value = false
}
</script>
