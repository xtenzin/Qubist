<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <!-- Top navigation bar -->
    <DashboardHeader />

    <!-- 主内容区域 -->
    <!-- Main content area -->
    <div class="dashboard-content">
      <!-- 左侧集合列表 -->
      <!-- Left sidebar collection list -->
      <CollectionList
        :collections="collections"
        :selected-collection="selectedCollection"
        @create="handleCreateCollection"
        @select="handleSelectCollection"
        @show-info="handleShowCollectionInfo"
        @show-settings="handleShowCollectionSettings"
        @delete="handleDeleteCollection"
      />

      <!-- 右侧数据展示 -->
      <!-- Right side data display -->
      <div class="main-content">
        <div v-if="selectedCollection" class="data-panel">
          <div class="panel-header">
            <h2>{{ selectedCollection }}</h2>
            <div class="panel-actions">
              <el-button @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                {{ $t('common.refresh') }}
              </el-button>
              <el-button v-if="selectedPoints.length > 0" type="danger" @click="handleBatchDelete">
                <el-icon><Delete /></el-icon>
                {{ $t('common.batchDelete') }} ({{ selectedPoints.length }})
              </el-button>
              <el-dropdown @command="handleExportTypeSelect" trigger="click">
                <el-button>
                  <el-icon><Download /></el-icon>
                  {{ $t('common.export') }}
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="current-page">
                      {{ $t('point.exportCurrentPage') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="selected" :disabled="selectedPoints.length === 0">
                      {{ $t('point.exportSelected') }} ({{ selectedPoints.length }})
                    </el-dropdown-item>
                    <el-dropdown-item command="query">
                      {{ $t('point.exportQuery') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="all">
                      {{ $t('point.exportAll') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button @click="handleImport">
                <el-icon><Upload /></el-icon>
                {{ $t('common.import') }}
              </el-button>
              <el-button type="primary" @click="handleAddPoint">
                <el-icon><Plus /></el-icon>
                {{ $t('point.add') }}
              </el-button>
            </div>
          </div>
          <div class="panel-content">
            <!-- 排序选择器 -->
            <!-- Sort selector -->
            <div class="sort-controls">
              <el-select
                v-model="sortField"
                :placeholder="$t('point.sortBy')"
                class="sort-field-select"
                clearable
                @change="handleSortChange"
              >
                <el-option :label="$t('point.noSort')" value="" />
                <el-option
                  v-for="field in availableSortFields"
                  :key="field"
                  :label="field"
                  :value="field"
                />
              </el-select>
              <el-select
                v-if="sortField"
                v-model="sortDirection"
                class="sort-direction-select"
                @change="handleSortChange"
              >
                <el-option :label="$t('point.sortAsc')" value="asc" />
                <el-option :label="$t('point.sortDesc')" value="desc" />
              </el-select>
            </div>
            <PointsTable
              :points="pointsData.points"
              :loading="pointsData.loading"
              :total-points="pointsData.totalPoints"
              :current-page="pointsData.currentPage"
              :page-size="pointsData.pageSize"
              :page-size-options="pointsData.pageSizeOptions"
              @view="handleViewPoint"
              @edit="handleEditPoint"
              @delete="handleDeletePoint"
              @page-change="handlePageChange"
              @selection-change="handleSelectionChange"
            />
          </div>
        </div>
        <div v-else class="welcome-panel">
          <el-empty :description="$t('dashboard.selectCollection')" :image-size="120">
            <template #image>
              <el-icon :size="120" color="#909399"><Coin /></el-icon>
            </template>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 集合信息对话框 -->
    <!-- Collection info dialog -->
    <CollectionInfoDialog
      v-model="collectionInfoVisible"
      :collection-info="collectionInfoData"
    />

    <!-- 集合设置对话框 -->
    <!-- Collection settings dialog -->
    <CollectionSettingsDialog
      v-model="collectionSettingsVisible"
      :collection-name="selectedCollectionForSettings"
      @saved="handleCollectionSettingsSaved"
    />

    <!-- 创建集合对话框 -->
    <!-- Create collection dialog -->
    <CreateCollectionDialog
      v-model="createCollectionVisible"
      @create="handleCreateCollectionConfirm"
    />

    <!-- 点数据查看对话框 -->
    <!-- Point data view dialog -->
    <PointViewDialog
      v-model="pointViewVisible"
      :point-data="pointViewData"
    />

    <!-- 点数据表单对话框 -->
    <!-- Point data form dialog -->
    <PointFormDialog
      v-model="pointFormVisible"
      :mode="pointFormMode"
      :point-data="pointFormData"
      :collection-name="selectedCollection"
      @save="handleSavePoint"
      @load-latest="handleLoadLatestPoint"
    />

    <!-- 导入对话框 -->
    <!-- Import dialog -->
    <ImportDialog v-model="importVisible" @import="handleImportConfirm" />

    <!-- 导出格式选择对话框 -->
    <!-- Export format selection dialog -->
    <ExportFormatDialog v-model="exportFormatVisible" @select="handleExportFormatSelect" />

    <!-- 底部版权信息 -->
    <!-- Footer copyright information -->
    <div class="dashboard-footer">
      <el-text type="info" size="small">{{ $t('common.poweredBy') }} {{ author }} © {{ copyrightYear }}</el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
// 主界面组件
// Main dashboard component
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, Coin, Delete, Download, Upload, ArrowDown } from '@element-plus/icons-vue'
import { getPoints, getCollectionInfo } from '@/api/qdrant'
import { useCollections } from '@/composables/useCollections'
import { useConnectionStore } from '@/stores/connection'
import DashboardHeader from '@/components/DashboardHeader.vue'
import CollectionList from '@/components/CollectionList.vue'
import PointsTable from '@/components/PointsTable.vue'
import CollectionInfoDialog from '@/components/CollectionInfoDialog.vue'
import CollectionSettingsDialog from '@/components/CollectionSettingsDialog.vue'
import CreateCollectionDialog from '@/components/CreateCollectionDialog.vue'
import PointViewDialog from '@/components/PointViewDialog.vue'
import PointFormDialog from '@/components/PointFormDialog.vue'
import ImportDialog from '@/components/ImportDialog.vue'
import ExportFormatDialog from '@/components/ExportFormatDialog.vue'
import { COPYRIGHT_YEAR, AUTHOR } from '@/constants/version'
import { exportToJSON, exportToCSV } from '@/utils/importExport'
import type { Point, CollectionInfo } from '@/api/types'

const { t } = useI18n()

// 版权信息
// Copyright information
const copyrightYear = COPYRIGHT_YEAR
const author = AUTHOR

const { collections, loadCollections, handleCreateCollection: createCollection } = useCollections()

const selectedCollection = ref<string | null>(null)
const pointsData = ref({
  points: [] as Point[],
  loading: false,
  totalPoints: 0,
  currentPage: 1,
  pageSize: 15,
  pageSizeOptions: [15, 30, 45, 75, 90, 100, 150, 200, 300, 500],
  pageOffsets: new Map<number, any>()
})

// 对话框状态
// Dialog state
const collectionInfoVisible = ref(false)
const collectionInfoData = ref<CollectionInfo | null>(null)
const collectionSettingsVisible = ref(false)
const selectedCollectionForSettings = ref<string | null>(null)
const createCollectionVisible = ref(false)
const pointViewVisible = ref(false)
const pointViewData = ref<Point | null>(null)
const pointFormVisible = ref(false)
const pointFormMode = ref<'add' | 'edit'>('add')
const pointFormData = ref<Point | null>(null)
const importVisible = ref(false)
const selectedPoints = ref<Point[]>([])
const exportFormatVisible = ref(false)
const pendingExportType = ref<string>('')

// 排序相关状态
// Sort related state
const sortField = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const availableSortFields = ref<string[]>([])

// 加载点数据
// Load points data
const loadPoints = async () => {
  if (!selectedCollection.value) return

  pointsData.value.loading = true
  try {
    const offset = pointsData.value.pageOffsets.get(pointsData.value.currentPage) || null
    
    // 构建排序参数
    // Build sort parameter
    // 只支持 payload 字段的 Range index 排序
    // Only support Range index sorting for payload fields
    let orderBy: { key: string; direction?: 'asc' | 'desc' } | null = null
    if (sortField.value) {
      orderBy = {
        key: sortField.value,
        direction: sortDirection.value
      }
    }
    
    const result = await getPoints(
      selectedCollection.value,
      pointsData.value.pageSize,
      offset,
      true,
      true,
      orderBy
    )
    pointsData.value.points = result.points

    // 保存下一页的 offset
    // Save next page offset
    if (result.points.length === pointsData.value.pageSize && result.next_page_offset) {
      pointsData.value.pageOffsets.set(pointsData.value.currentPage + 1, result.next_page_offset)
    }

    // 从集合信息获取总点数
    // Get total points count from collection info
    try {
      const collectionInfo = await getCollectionInfo(selectedCollection.value)
      pointsData.value.totalPoints = collectionInfo.points_count
    } catch (error) {
      console.error('Failed to get collection info for points count:', error)
    }
    
    // 加载可用排序字段（如果还没有加载）
    // Load available sort fields (if not loaded yet)
    if (availableSortFields.value.length === 0) {
      await loadAvailableSortFields()
    }
  } catch (error) {
    console.error('Failed to load points:', error)
    ElMessage.error(t('point.loadFailed'))
  } finally {
    pointsData.value.loading = false
  }
}

// 选择集合
// Select collection
const handleSelectCollection = async (collectionName: string) => {
  selectedCollection.value = collectionName
  pointsData.value.currentPage = 1
  pointsData.value.pageOffsets.clear()
  pointsData.value.pageOffsets.set(1, null)
  // 重置排序
  // Reset sorting
  sortField.value = ''
  sortDirection.value = 'asc'
  await loadPoints()
  // 加载可用排序字段
  // Load available sort fields
  await loadAvailableSortFields()
}

// 加载可用排序字段
// Load available sort fields
const loadAvailableSortFields = async () => {
  if (!selectedCollection.value) return
  
  try {
    const collectionInfo = await getCollectionInfo(selectedCollection.value)
    const fields: string[] = []
    
    // 只从 payload_schema 中获取支持排序的字段（Range index）
    // Only get fields from payload_schema that support sorting (Range index)
    // 只有 integer, float, datetime 类型支持排序（Range index）
    // Only integer, float, datetime types support sorting (Range index)
    const payloadSchema = (collectionInfo as any).payload_schema || {}
    Object.keys(payloadSchema).forEach(fieldName => {
      const fieldInfo = payloadSchema[fieldName]
      const dataType = fieldInfo.data_type || fieldInfo.type || ''
      
      // 检查是否为支持排序的类型（Range index）
      // Check if it's a type that supports sorting (Range index)
      if (dataType === 'integer' || dataType === 'float' || dataType === 'datetime') {
        fields.push(fieldName)
      }
    })
    
    availableSortFields.value = fields.sort()
  } catch (error) {
    console.error('Failed to load available sort fields:', error)
    // 如果加载失败，设置为空数组
    // If loading fails, set to empty array
    availableSortFields.value = []
  }
}

// 排序变化处理
// Handle sort change
const handleSortChange = () => {
  // 重置分页
  // Reset pagination
  pointsData.value.currentPage = 1
  pointsData.value.pageOffsets.clear()
  pointsData.value.pageOffsets.set(1, null)
  // 重新加载数据
  // Reload data
  loadPoints()
}

// 刷新
// Refresh
const handleRefresh = async () => {
  await loadCollections()
  if (selectedCollection.value) {
    await loadPoints()
  }
  ElMessage.success(t('point.refreshSuccess'))
}

// 新建集合
// Create collection
const handleCreateCollection = () => {
  createCollectionVisible.value = true
}

// 确认创建集合
// Confirm create collection
const handleCreateCollectionConfirm = async (
  name: string,
  vectorSize: number,
  distance: 'Cosine' | 'Euclid' | 'Dot'
) => {
  await createCollection(name, vectorSize, distance)
  await loadCollections()
}

// 显示集合信息
// Show collection info
const handleShowCollectionInfo = async (collectionName: string) => {
  try {
    const info = await getCollectionInfo(collectionName)
    collectionInfoData.value = info
    collectionInfoVisible.value = true
  } catch (error) {
    ElMessage.error(t('collection.getInfoFailed'))
  }
}

// 显示集合设置
// Show collection settings
const handleShowCollectionSettings = (collectionName: string) => {
  selectedCollectionForSettings.value = collectionName
  collectionSettingsVisible.value = true
}

// 删除集合
// Delete collection
const handleDeleteCollection = async (collectionName: string) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(
      t('collection.deleteConfirm') + '\n\n' + t('collection.deleteWarning'),
      t('collection.deleteTitle'),
      {
        type: 'warning',
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    const { deleteCollection } = await import('@/api/qdrant')
    await deleteCollection(collectionName)
    ElMessage.success(t('collection.deleteSuccess'))
    
    // 如果删除的是当前选中的集合，清除选中状态
    // If deleted collection is currently selected, clear selection
    if (selectedCollection.value === collectionName) {
      selectedCollection.value = null
      pointsData.value.currentPage = 1
      pointsData.value.pageOffsets.clear()
      pointsData.value.pageOffsets.set(1, null)
    }
    
    await loadCollections()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('collection.deleteFailed'))
    }
  }
}

// 集合设置保存后
// After collection settings saved
const handleCollectionSettingsSaved = () => {
  if (selectedCollection.value) {
    loadPoints()
  }
  loadCollections()
}

// 查看点数据
// View point data
const handleViewPoint = (point: Point) => {
  pointViewData.value = point
  pointViewVisible.value = true
}

// 添加点
// Add point
const handleAddPoint = () => {
  pointFormMode.value = 'add'
  pointFormData.value = { id: '', vector: [], payload: {} }
  pointFormVisible.value = true
}

// 编辑点
// Edit point
const handleEditPoint = (point: Point) => {
  pointFormMode.value = 'edit'
  pointFormData.value = JSON.parse(JSON.stringify(point))
  pointFormVisible.value = true
}

// 删除点
// Delete point
const handleDeletePoint = async (point: Point) => {
  if (!selectedCollection.value) return

  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(t('point.deleteConfirm'), t('point.deleteTitle'), {
      type: 'warning'
    })
    
    const { deletePoints } = await import('@/api/qdrant')
    await deletePoints(selectedCollection.value, [point.id])
    ElMessage.success(t('point.deleteSuccess'))
    pointsData.value.currentPage = 1
    pointsData.value.pageOffsets.clear()
    pointsData.value.pageOffsets.set(1, null)
    pointsData.value.totalPoints -= 1
    await loadPoints()
    await loadCollections()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('point.deleteFailed'))
    }
  }
}

// 读取最新点数据填充
// Load latest point data as template
const handleLoadLatestPoint = async () => {
  if (!selectedCollection.value) return

  try {
    const result = await getPoints(selectedCollection.value, 1, null, true, true)
    if (result.points && result.points.length > 0) {
      const latestPoint = result.points[0]
      pointFormData.value = {
        id: '',
        vector: latestPoint.vector,
        payload: latestPoint.payload
      }
      ElMessage.success('已加载最新数据作为模板')
      // Latest data loaded as template
    } else {
      ElMessage.warning('集合中没有数据')
      // No data in collection
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
    // Failed to load data
  }
}

// 保存点数据
// Save point data
const handleSavePoint = async (point: Point) => {
  if (!selectedCollection.value) return

  try {
    const { upsertPoints } = await import('@/api/qdrant')
    await upsertPoints(selectedCollection.value, [point])
    ElMessage.success(t('point.saveSuccess'))
    pointFormVisible.value = false
    pointsData.value.currentPage = 1
    pointsData.value.pageOffsets.clear()
    pointsData.value.pageOffsets.set(1, null)
    pointsData.value.totalPoints += pointFormMode.value === 'add' ? 1 : 0
    await loadPoints()
    await loadCollections()
  } catch (error) {
    ElMessage.error(t('point.saveFailed'))
  }
}

// 组件挂载时加载数据
// Load data when component is mounted
onMounted(() => {
  const connectionStore = useConnectionStore()
  // 只有在已连接时才加载集合
  // Only load collections when connected
  if (connectionStore.isConnected && connectionStore.currentConfig) {
    loadCollections()
  }
})

// 监听分页变化
// Watch pagination changes
const handlePageChange = () => {
  loadPoints()
}


// 选择变化处理
// Handle selection change
const handleSelectionChange = (points: Point[]) => {
  selectedPoints.value = points
}

// 批量删除
// Batch delete
const handleBatchDelete = async () => {
  if (!selectedCollection.value || selectedPoints.value.length === 0) return

  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(
      t('point.batchDeleteConfirm', { count: selectedPoints.value.length }),
      t('point.batchDeleteTitle'),
      {
        type: 'warning',
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        confirmButtonClass: 'el-button--danger'
      }
    )

    const { deletePoints } = await import('@/api/qdrant')
    const pointIds = selectedPoints.value.map((p) => p.id)
    await deletePoints(selectedCollection.value, pointIds)
    ElMessage.success(t('point.batchDeleteSuccess', { count: selectedPoints.value.length }))
    selectedPoints.value = []
    pointsData.value.currentPage = 1
    pointsData.value.pageOffsets.clear()
    pointsData.value.pageOffsets.set(1, null)
    pointsData.value.totalPoints -= pointIds.length
    await loadPoints()
    await loadCollections()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('point.batchDeleteFailed'))
    }
  }
}

// 选择导出类型
// Select export type
const handleExportTypeSelect = (exportType: string) => {
  if (!selectedCollection.value) {
    ElMessage.warning(t('dashboard.selectCollection'))
    return
  }

  // 保存导出类型，显示格式选择对话框
  // Save export type and show format selection dialog
  pendingExportType.value = exportType
  exportFormatVisible.value = true
}

// 选择导出格式后执行导出
// Execute export after format selection
const handleExportFormatSelect = async (format: 'json' | 'csv') => {
  if (!selectedCollection.value) {
    ElMessage.warning(t('dashboard.selectCollection'))
    return
  }

  try {
    let pointsToExport: Point[] = []
    const exportType = pendingExportType.value

    // 根据导出类型获取数据
    // Get data based on export type
    switch (exportType) {
      case 'current-page':
        // 导出当前页
        // Export current page
        if (pointsData.value.points.length === 0) {
          ElMessage.warning(t('point.noDataInCollection'))
          return
        }
        pointsToExport = pointsData.value.points
        break

      case 'selected':
        // 导出选中
        // Export selected
        if (selectedPoints.value.length === 0) {
          ElMessage.warning(t('point.noPointsSelected'))
          return
        }
        pointsToExport = selectedPoints.value
        break

      case 'query':
        // 导出查询结果（当前集合的所有数据）
        // Export query results (all data in current collection)
        ElMessage.info(t('point.exportLoading', { type: t('point.exportQuery') }))
        pointsToExport = await loadAllPoints()
        break

      case 'all':
        // 导出全部（当前集合的所有数据）
        // Export all (all data in current collection)
        ElMessage.info(t('point.exportLoading', { type: t('point.exportAll') }))
        pointsToExport = await loadAllPoints()
        break

      default:
        return
    }

    if (pointsToExport.length === 0) {
      ElMessage.warning(t('point.noDataInCollection'))
      return
    }

    // 根据格式导出数据
    // Export data based on format
    const fileName = `${selectedCollection.value}_${exportType}_${new Date().getTime()}`
    if (format === 'json') {
      exportToJSON(pointsToExport, fileName)
    } else if (format === 'csv') {
      exportToCSV(pointsToExport, fileName)
    } else {
      ElMessage.error(t('point.exportFailed'))
      return
    }

    ElMessage.success(t('point.exportSuccessWithCount', { count: pointsToExport.length }))
  } catch (error) {
    ElMessage.error(t('point.exportFailed'))
    console.error('Export failed:', error)
  }
}

// 加载所有点数据（用于导出全部）
// Load all points data (for export all)
const loadAllPoints = async (): Promise<Point[]> => {
  if (!selectedCollection.value) return []

  const allPoints: Point[] = []
  let offset: string | number | null = null
  const pageSize = 500 // 每次获取 500 条，避免单次请求过大
  let hasMore = true
  let pageCount = 0

  // 构建排序参数（与当前排序设置一致）
  // Build sort parameter (consistent with current sort settings)
  // 只支持 payload 字段的 Range index 排序
  // Only support Range index sorting for payload fields
  let orderBy: { key: string; direction?: 'asc' | 'desc' } | null = null
  if (sortField.value) {
    orderBy = {
      key: sortField.value,
      direction: sortDirection.value
    }
  }

  // 显示加载提示
  // Show loading message
  let loadingMessage: any = null

  try {
    while (hasMore) {
      try {
        // 添加小延迟，避免请求过快
        // Add small delay to avoid requests too fast
        if (pageCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        const result = await getPoints(
          selectedCollection.value,
          pageSize,
          offset,
          true,
          true,
          orderBy
        )

        allPoints.push(...result.points)
        pageCount++

        // 更新进度提示
        // Update progress message
        if (loadingMessage) {
          loadingMessage.close()
        }
        loadingMessage = ElMessage({
          message: t('point.exportLoadingProgress', {
            current: allPoints.length,
            total: pointsData.value.totalPoints > 0 ? pointsData.value.totalPoints : '...'
          }),
          type: 'info',
          duration: 0, // 不自动关闭
          showClose: false
        })

        // 检查是否还有更多数据
        // Check if there's more data
        if (result.points.length < pageSize || !result.next_page_offset) {
          hasMore = false
        } else {
          offset = result.next_page_offset
        }
      } catch (error) {
        if (loadingMessage) {
          loadingMessage.close()
        }
        console.error('Failed to load points for export:', error)
        throw error
      }
    }

    // 关闭加载提示
    // Close loading message
    if (loadingMessage) {
      loadingMessage.close()
    }

    return allPoints
  } catch (error) {
    if (loadingMessage) {
      loadingMessage.close()
    }
    throw error
  }
}

// 导入数据
// Import data
const handleImport = () => {
  if (!selectedCollection.value) {
    ElMessage.warning(t('dashboard.selectCollection'))
    return
  }
  importVisible.value = true
}

// 确认导入
// Confirm import
const handleImportConfirm = async (points: Point[]) => {
  if (!selectedCollection.value || points.length === 0) return

  try {
    const { upsertPoints } = await import('@/api/qdrant')
    await upsertPoints(selectedCollection.value, points)
    ElMessage.success(t('point.importSuccess', { count: points.length }))
    importVisible.value = false
    pointsData.value.currentPage = 1
    pointsData.value.pageOffsets.clear()
    pointsData.value.pageOffsets.set(1, null)
    pointsData.value.totalPoints += points.length
    await loadPoints()
    await loadCollections()
  } catch (error) {
    ElMessage.error(t('point.importFailed'))
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40px; /* 为底部版权信息留出空间 */
  /* Reserve space for footer copyright information */
}

.dashboard-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.data-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  margin: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.sort-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
  gap: 8px;
}

.sort-field-select {
  width: fit-content;
  min-width: 150px;
}

.sort-direction-select {
  width: fit-content;
  min-width: 100px;
}

.welcome-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px;
  background: white;
  border-radius: 8px;
}

.dashboard-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-top: 1px solid #e4e7ed;
  z-index: 100;
}

.dashboard-footer :deep(.el-text) {
  color: #909399;
  font-size: 12px;
}
</style>
