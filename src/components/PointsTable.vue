<template>
  <div class="points-table-container">
    <el-table
      :data="points"
      stripe
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" :label="$t('point.id')" width="120">
        <template #default="{ row }">
          <div class="table-cell-with-copy">
            <span>{{ row.id }}</span>
            <el-button text :icon="DocumentCopy" @click="handleCopy(String(row.id))" class="copy-icon" />
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('point.vector')" min-width="200">
        <template #default="{ row }">
          <div class="table-cell-with-copy">
            <el-tag v-if="row.vector" size="small">[{{ Array.isArray(row.vector) ? row.vector.slice(0, 5).join(', ') : $t('point.multiVector') }}...]</el-tag>
            <el-tag v-else type="info" size="small">{{ $t('point.noVector') }}</el-tag>
            <el-button v-if="row.vector" text :icon="DocumentCopy" @click="handleCopy(JSON.stringify(row.vector))" class="copy-icon" />
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('point.payload')" min-width="300">
        <template #default="{ row }">
          <div class="table-cell-with-copy">
            <el-text v-if="row.payload" type="info" class="truncate-text">{{ JSON.stringify(row.payload) }}</el-text>
            <el-text v-else type="info">{{ $t('point.noPayload') }}</el-text>
            <el-button v-if="row.payload" text :icon="DocumentCopy" @click="handleCopy(JSON.stringify(row.payload))" class="copy-icon" />
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" :icon="View" @click="$emit('view', row)">{{ $t('common.view') }}</el-button>
          <el-button type="primary" link size="small" @click="$emit('edit', row)">{{ $t('common.edit') }}</el-button>
          <el-button type="danger" link size="small" :icon="Delete" @click="$emit('delete', row)" />
        </template>
      </el-table-column>
    </el-table>
    <div v-if="points.length === 0" class="empty-state">
      <el-empty :description="$t('common.noData')" />
    </div>
    <div v-else class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPageModel"
        v-model:page-size="pageSizeModel"
        :page-sizes="pageSizeOptions"
        :total="totalPoints"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 点数据表格组件
// Points data table component
import { ref, watch } from 'vue'
import { DocumentCopy, View, Delete } from '@element-plus/icons-vue'
import { copyToClipboard } from '@/utils/clipboard'
import type { Point } from '@/api/types'

const props = defineProps<{
  points: Point[]
  loading: boolean
  totalPoints: number
  currentPage: number
  pageSize: number
  pageSizeOptions: number[]
}>()

const emit = defineEmits<{
  view: [point: Point]
  edit: [point: Point]
  delete: [point: Point]
  'page-change': [currentPage: number, pageSize: number]
  'selection-change': [points: Point[]]
}>()

const currentPageModel = ref(props.currentPage)
const pageSizeModel = ref(props.pageSize)

watch(() => props.currentPage, (val) => {
  currentPageModel.value = val
})

watch(() => props.pageSize, (val) => {
  pageSizeModel.value = val
})

const handleSizeChange = (val: number) => {
  pageSizeModel.value = val
  emit('page-change', currentPageModel.value, val)
}

const handleCurrentChange = (val: number) => {
  currentPageModel.value = val
  emit('page-change', val, pageSizeModel.value)
}

// 复制文本
// Copy text
const handleCopy = (text: string) => {
  copyToClipboard(text)
}

// 选择变化处理
// Handle selection change
const handleSelectionChange = (selectedPoints: Point[]) => {
  emit('selection-change', selectedPoints)
}
</script>

<style scoped>
.points-table-container {
  width: 100%;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.truncate-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-cell-with-copy {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  width: 100%;
  min-width: 0;
}

.table-cell-with-copy > span,
.table-cell-with-copy > .el-tag,
.table-cell-with-copy > .el-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-icon {
  opacity: 0;
  transition: opacity 0.2s;
  padding: 4px;
  flex-shrink: 0;
}

.table-cell-with-copy:hover .copy-icon {
  opacity: 1;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
}
</style>
