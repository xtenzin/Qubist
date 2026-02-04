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
              <el-button type="primary" @click="handleAddPoint">
                <el-icon><Plus /></el-icon>
                {{ $t('point.add') }}
              </el-button>
            </div>
          </div>
          <div class="panel-content">
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, Coin } from '@element-plus/icons-vue'
import { getPoints, getCollectionInfo } from '@/api/qdrant'
import { useCollections } from '@/composables/useCollections'
import DashboardHeader from '@/components/DashboardHeader.vue'
import CollectionList from '@/components/CollectionList.vue'
import PointsTable from '@/components/PointsTable.vue'
import CollectionInfoDialog from '@/components/CollectionInfoDialog.vue'
import CollectionSettingsDialog from '@/components/CollectionSettingsDialog.vue'
import CreateCollectionDialog from '@/components/CreateCollectionDialog.vue'
import PointViewDialog from '@/components/PointViewDialog.vue'
import PointFormDialog from '@/components/PointFormDialog.vue'
import { COPYRIGHT_YEAR, AUTHOR } from '@/constants/version'
import type { Point, CollectionInfo } from '@/api/types'

const { t } = useI18n()

// 版权信息
// Copyright information
const copyrightYear = COPYRIGHT_YEAR
const author = AUTHOR

const { collections, loading: collectionsLoading, loadCollections, handleCreateCollection: createCollection } = useCollections()

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

// 加载点数据
// Load points data
const loadPoints = async () => {
  if (!selectedCollection.value) return

  pointsData.value.loading = true
  try {
    const offset = pointsData.value.pageOffsets.get(pointsData.value.currentPage) || null
    const result = await getPoints(
      selectedCollection.value,
      pointsData.value.pageSize,
      offset,
      true,
      true
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
  await loadPoints()
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
  loadCollections()
})

// 监听分页变化
// Watch pagination changes
const handlePageChange = () => {
  loadPoints()
}

// 更新分页数据
// Update pagination data
const updatePagination = (currentPage: number, pageSize: number) => {
  pointsData.value.currentPage = currentPage
  pointsData.value.pageSize = pageSize
  loadPoints()
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
