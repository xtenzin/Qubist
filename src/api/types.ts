// Qdrant 集合信息
// Qdrant collection information
export interface CollectionInfo {
  config: {
    params: {
      vectors: {
        size: number
        distance: string
      }
      hnsw_config?: {
        m: number
        ef_construct: number
      }
    }
    hnsw_config?: {
      m: number
      ef_construct: number
    }
    optimizer_config?: {
      indexed_threshold: number
    }
    wal_config?: {
      wal_capacity_mb: number
    }
  }
  optimizer_status: {
    ok: boolean
  }
  status: string
  vectors_count: number
  indexed_vectors_count: number
  points_count: number
  segments_count: number
  disk_data_size: number
  ram_data_size: number
}

// Qdrant 点数据
// Qdrant point data
export interface Point {
  id: string | number
  vector: number[] | { [key: string]: number[] }
  payload?: { [key: string]: any }
}

// 搜索结果
// Search result
export interface SearchResult {
  id: string | number
  score: number
  payload?: { [key: string]: any }
}

// 集合列表响应
// Collections list response
export interface CollectionsResponse {
  result: {
    collections: Array<{
      name: string
      points_count: number
      vectors_count: number
      indexed_vectors_count: number
      segments_count: number
      status: string
      disk_data_size: number
      ram_data_size: number
      config: any
    }>
  } | null
  status: string
  time: number
}

// 点列表响应
// Points list response
export interface PointsResponse {
  result: {
    points: Point[]
    points_count: number
  } | null
  status: string
  time: number
}

// 集群信息响应
// Cluster info response
export interface ClusterInfoResponse {
  result: {
    status: string
    peer_id: number
    peers: Array<{
      uri: string
      this: boolean
    }>
  } | null
  status: string
  time: number
}
