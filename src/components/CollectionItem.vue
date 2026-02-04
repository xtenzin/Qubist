<template>
  <div
    class="collection-item"
    :class="{ active: isActive }"
    @click="$emit('select', collection.name)"
  >
    <div class="collection-icon">
      <el-icon><Coin /></el-icon>
    </div>
            <div class="collection-info">
              <div class="collection-name">{{ collection.name }}</div>
              <div class="collection-meta">
                <span>{{ collection.points_count ?? 0 }}{{ $t('collection.points') }}</span>
              </div>
            </div>
    <div class="collection-actions" @click.stop>
      <el-button text :icon="InfoFilled" @click="$emit('show-info', collection.name)" class="action-button" />
      <el-button text :icon="Setting" @click="$emit('show-settings', collection.name)" class="action-button" />
      <el-button text :icon="Delete" @click="$emit('delete', collection.name)" class="action-button delete-button" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 集合项组件
// Collection item component
import { useI18n } from 'vue-i18n'
import { Coin, InfoFilled, Setting, Delete } from '@element-plus/icons-vue'

const { t } = useI18n()

defineProps<{
  collection: {
    name: string
    points_count?: number
  }
  isActive: boolean
}>()

defineEmits<{
  select: [name: string]
  'show-info': [name: string]
  'show-settings': [name: string]
  delete: [name: string]
}>()
</script>

<style scoped>
.collection-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
  justify-content: flex-start;
}

.collection-item:hover {
  background: #f5f7fa;
}

.collection-item.active {
  background: #e6f7ff;
  border: 1px solid #1890ff;
}

.collection-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #1890ff;
  flex-shrink: 0;
}

.collection-item.active .collection-icon {
  background: #e6f7ff;
}

.collection-info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.collection-name {
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
  text-align: left;
}

.collection-meta {
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.collection-actions {
  display: flex;
  gap: 0;
  opacity: 0;
  transition: opacity 0.2s;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
}

.collection-item:hover .collection-actions {
  opacity: 1;
}

.action-button {
  background: transparent !important;
  padding: 4px !important;
  margin: 0 !important;
  min-width: auto !important;
  width: auto !important;
}

.action-button:hover {
  color: #409eff !important;
}

.delete-button:hover {
  color: #f56c6c !important;
}
</style>
