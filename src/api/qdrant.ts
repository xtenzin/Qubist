// Qdrant API 封装
// Qdrant API encapsulation
import request from '@/utils/request'
import { useConnectionStore } from '@/stores/connection'
import type {
  CollectionInfo,
  Point,
  SearchResult,
  CollectionsResponse,
  PointsResponse,
  ClusterInfoResponse
} from './types'

/**
 * 验证 Qdrant 连接
 * Verify Qdrant connection
 */
export async function verifyConnection(): Promise<boolean> {
  const connectionStore = useConnectionStore()
  try {
    const response = await request.get<ClusterInfoResponse>(`${connectionStore.apiUrl}/cluster`)
    return response.data.status === 'ok'
  } catch (error) {
    return false
  }
}

/**
 * 获取所有集合列表
 * Get all collections list
 */
export async function getCollections(): Promise<CollectionsResponse['result']['collections']> {
  const connectionStore = useConnectionStore()
  const response = await request.get<CollectionsResponse>(`${connectionStore.apiUrl}/collections`)
  return response.data.result?.collections || []
}

/**
 * 获取指定集合的详细信息
 * Get detailed information of specified collection
 */
export async function getCollectionInfo(collectionName: string): Promise<CollectionInfo> {
  const connectionStore = useConnectionStore()
  const response = await request.get<{ status: string; result: CollectionInfo | null; time: number }>(
    `${connectionStore.apiUrl}/collections/${collectionName}`
  )
  return response.data.result!
}

/**
 * 获取集合中的点列表（使用 scroll API）
 * Get points list in collection (using scroll API)
 */
export async function getPoints(
  collectionName: string,
  limit: number = 10,
  offset: number | string | null = null,
  withPayload: boolean = true,
  withVector: boolean = false
): Promise<{ points: Point[]; next_page_offset: string | null }> {
  const connectionStore = useConnectionStore()
  const response = await request.post<{
    status: string
    result: {
      points: Point[]
      next_page_offset: string | null
    } | null
    time: number
  }>(
    `${connectionStore.apiUrl}/collections/${collectionName}/points/scroll`,
    {
      limit,
      offset,
      with_payload: withPayload,
      with_vector: withVector
    }
  )
  const result = response.data.result
  return {
    points: result?.points || [],
    next_page_offset: result?.next_page_offset || null
  }
}

/**
 * 创建集合
 * Create collection
 */
export async function createCollection(
  collectionName: string,
  vectorSize: number,
  distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine'
): Promise<void> {
  const connectionStore = useConnectionStore()
  await request.put(`${connectionStore.apiUrl}/collections/${collectionName}`, {
    vectors: {
      size: vectorSize,
      distance: distance
    }
  })
}

/**
 * 删除集合
 * Delete collection
 */
export async function deleteCollection(collectionName: string): Promise<void> {
  const connectionStore = useConnectionStore()
  await request.delete(`${connectionStore.apiUrl}/collections/${collectionName}`)
}

/**
 * 插入点
 * Insert points
 */
export async function upsertPoints(collectionName: string, points: Point[]): Promise<void> {
  const connectionStore = useConnectionStore()
  await request.put(`${connectionStore.apiUrl}/collections/${collectionName}/points`, {
    points
  })
}

/**
 * 删除点
 * Delete points
 */
export async function deletePoints(collectionName: string, pointIds: (string | number)[]): Promise<void> {
  const connectionStore = useConnectionStore()
  await request.post(`${connectionStore.apiUrl}/collections/${collectionName}/points/delete`, {
    points: pointIds
  })
}

/**
 * 更新集合参数
 * Update collection parameters
 */
export async function updateCollection(
  collectionName: string,
  params: {
    optimizers_config?: any
    hnsw_config?: any
    vectors?: any
    quantization_config?: any
    [key: string]: any
  }
): Promise<void> {
  const connectionStore = useConnectionStore()
  const response = await request.patch(`${connectionStore.apiUrl}/collections/${collectionName}`, params)
  // 检查响应中是否有错误
  // Check if there's an error in the response
  if (response.data.status && response.data.status !== 'ok') {
    const errorMsg = response.data.status.error || 'Failed to update collection'
    throw new Error(errorMsg)
  }
}

/**
 * 向量搜索
 * Vector search
 */
export async function search(
  collectionName: string,
  vector: number[],
  limit: number = 10,
  scoreThreshold: number = 0
): Promise<SearchResult[]> {
  const connectionStore = useConnectionStore()
  const response = await request.post<{ status: string; result: SearchResult[] | null; time: number }>(
    `${connectionStore.apiUrl}/collections/${collectionName}/points/search`,
    {
      vector,
      limit,
      score_threshold: scoreThreshold,
      with_payload: true
    }
  )
  return response.data.result || []
}
