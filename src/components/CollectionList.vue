<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>{{ $t('dashboard.collectionList') }}</h2>
      <el-button type="primary" size="small" @click="$emit('create')">
        <el-icon><Plus /></el-icon>
        {{ $t('dashboard.createCollection') }}
      </el-button>
    </div>
    <div class="collection-list">
      <CollectionItem
        v-for="collection in collections"
        :key="collection.name"
        :collection="collection"
        :is-active="selectedCollection === collection.name"
        @select="$emit('select', $event)"
        @show-info="$emit('show-info', $event)"
        @show-settings="$emit('show-settings', $event)"
      />
      <el-empty v-if="collections.length === 0" :description="$t('collection.noCollections')" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 集合列表组件
// Collection list component
import { useI18n } from 'vue-i18n'
import { Plus } from '@element-plus/icons-vue'
import CollectionItem from './CollectionItem.vue'

const { t } = useI18n()

defineProps<{
  collections: Array<{
    name: string
    points_count?: number
  }>
  selectedCollection: string | null
}>()

defineEmits<{
  create: []
  select: [name: string]
  'show-info': [name: string]
  'show-settings': [name: string]
}>()
</script>

<style scoped>
.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.collection-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
</style>
