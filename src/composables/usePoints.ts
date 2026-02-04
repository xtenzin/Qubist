// 点数据相关逻辑 Composables
// Points data related logic Composables
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getPoints, upsertPoints, deletePoints, getCollectionInfo } from '@/api/qdrant'
import type { Point } from '@/api/types'

export function usePoints(collectionName: string) {
  const { t } = useI18n()
  const points = ref<Point[]>([])
  const loading = ref(false)
  const totalPoints = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(15)
  const pageSizeOptions = [15, 30, 45, 75, 90, 100, 150, 200, 300, 500]
  const pageOffsets = ref<Map<number, any>>(new Map())

  // 加载点数据
  // Load points data
  const loadPoints = async () => {
    if (!collectionName) return

    loading.value = true
    try {
      const offset = pageOffsets.value.get(currentPage.value) || null
      const result = await getPoints(collectionName, pageSize.value, offset, true, true)
      points.value = result.points

      // 保存下一页的 offset
      // Save next page offset
      if (result.points.length === pageSize.value) {
        const lastPoint = result.points[result.points.length - 1]
        pageOffsets.value.set(currentPage.value + 1, lastPoint.id)
      }

      // 从集合信息获取总点数
      // Get total points count from collection info
      try {
        const collectionInfo = await getCollectionInfo(collectionName)
        totalPoints.value = collectionInfo.points_count
      } catch (error) {
        console.error('Failed to get collection info for points count:', error)
        // 如果获取失败，使用当前返回的点数作为估算
        // If failed, use current returned points count as estimate
        totalPoints.value = result.points_count
      }
    } catch (error) {
      console.error('Failed to load points:', error)
      ElMessage.error(t('point.loadFailed'))
    } finally {
      loading.value = false
    }
  }

  // 添加点
  // Add point
  const addPoint = async (point: Point) => {
    try {
      await upsertPoints(collectionName, [point])
      ElMessage.success(t('point.saveSuccess'))
      currentPage.value = 1
      pageOffsets.value.clear()
      pageOffsets.value.set(1, null)
      totalPoints.value += 1
      await loadPoints()
      return true
    } catch (error) {
      ElMessage.error(t('point.saveFailed'))
      return false
    }
  }

  // 更新点
  // Update point
  const updatePoint = async (point: Point) => {
    try {
      await upsertPoints(collectionName, [point])
      ElMessage.success(t('point.saveSuccess'))
      await loadPoints()
      return true
    } catch (error) {
      ElMessage.error(t('point.saveFailed'))
      return false
    }
  }

  // 删除点
  // Delete point
  const removePoint = async (pointId: string | number) => {
    try {
      await deletePoints(collectionName, [pointId])
      ElMessage.success(t('point.deleteSuccess'))
      currentPage.value = 1
      pageOffsets.value.clear()
      pageOffsets.value.set(1, null)
      totalPoints.value -= 1
      await loadPoints()
      return true
    } catch (error) {
      ElMessage.error(t('point.deleteFailed'))
      return false
    }
  }

  // 重置分页
  // Reset pagination
  const resetPagination = () => {
    currentPage.value = 1
    pageOffsets.value.clear()
    pageOffsets.value.set(1, null)
  }

  return {
    points,
    loading,
    totalPoints,
    currentPage,
    pageSize,
    pageSizeOptions,
    loadPoints,
    addPoint,
    updatePoint,
    removePoint,
    resetPagination
  }
}
