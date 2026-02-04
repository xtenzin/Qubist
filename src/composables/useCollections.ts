// 集合相关逻辑 Composables
// Collections related logic Composables
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getCollections, getCollectionInfo, createCollection, deleteCollection } from '@/api/qdrant'
import { useConnectionStore } from '@/stores/connection'
import type { CollectionInfo } from '@/api/types'

export function useCollections() {
  const { t } = useI18n()
  const collections = ref<any[]>([])
  const loading = ref(false)

  // 加载集合列表
  // Load collections list
  const loadCollections = async () => {
    // 检查连接状态
    // Check connection status
    const connectionStore = useConnectionStore()
    if (!connectionStore.isConnected || !connectionStore.currentConfig) {
      console.warn('Cannot load collections: not connected')
      return
    }

    loading.value = true
    try {
      const result = await getCollections()

      // 为每个集合获取详细信息，以获取 points_count
      // Get detailed information for each collection to get points_count
      const collectionsWithDetails = await Promise.all(
        result.map(async (collection: any) => {
          try {
            const info = await getCollectionInfo(collection.name)
            return {
              ...collection,
              points_count: info.points_count
            }
          } catch (error) {
            console.error(`Failed to get info for collection ${collection.name}:`, error)
            return collection
          }
        })
      )

      collections.value = collectionsWithDetails
    } catch (error) {
      console.error('Failed to load collections:', error)
      ElMessage.error(t('collection.loadFailed'))
    } finally {
      loading.value = false
    }
  }

  // 创建集合
  // Create collection
  const handleCreateCollection = async (
    collectionName: string,
    vectorSize: number,
    distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine'
  ) => {
    try {
      await createCollection(collectionName, vectorSize, distance)
      ElMessage.success(t('collection.createSuccess'))
      await loadCollections()
      return true
    } catch (error) {
      ElMessage.error(t('collection.createFailed'))
      return false
    }
  }

  // 删除集合
  // Delete collection
  const handleDeleteCollection = async (collectionName: string) => {
    try {
      await deleteCollection(collectionName)
      ElMessage.success(t('collection.deleteSuccess'))
      await loadCollections()
      return true
    } catch (error) {
      ElMessage.error(t('collection.deleteFailed'))
      return false
    }
  }

  // 获取集合信息
  // Get collection info
  const getCollectionInfoData = async (collectionName: string): Promise<CollectionInfo | null> => {
    try {
      return await getCollectionInfo(collectionName)
    } catch (error) {
      ElMessage.error(t('collection.getInfoFailed'))
      return null
    }
  }

  return {
    collections,
    loading,
    loadCollections,
    handleCreateCollection,
    handleDeleteCollection,
    getCollectionInfoData
  }
}
