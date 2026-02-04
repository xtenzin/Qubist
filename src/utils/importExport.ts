// 数据导入导出工具函数
// Data import/export utility functions
import { ElMessage } from 'element-plus'
import type { Point } from '@/api/types'

/**
 * 导出数据为 JSON 格式
 * Export data as JSON format
 */
export function exportToJSON(points: Point[], fileName: string): void {
  try {
    const dataStr = JSON.stringify(points, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export to JSON failed:', error)
    throw error
  }
}

/**
 * 导出数据为 CSV 格式
 * Export data as CSV format
 */
export function exportToCSV(points: Point[], fileName: string): void {
  try {
    if (points.length === 0) {
      throw new Error('No data to export')
    }

    // CSV 头部
    // CSV header
    const headers = ['ID', 'Vector', 'Payload']
    const rows: string[] = [headers.join(',')]

    // 处理每一行数据
    // Process each row of data
    points.forEach((point) => {
      const id = String(point.id)
      const vector = Array.isArray(point.vector)
        ? JSON.stringify(point.vector).replace(/"/g, '""')
        : ''
      const payload = point.payload
        ? JSON.stringify(point.payload).replace(/"/g, '""')
        : ''

      // CSV 转义：如果包含逗号、引号或换行符，需要用引号包裹
      // CSV escaping: if contains comma, quote or newline, wrap with quotes
      const escapeCSV = (value: string) => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value}"`
        }
        return value
      }

      rows.push([escapeCSV(id), escapeCSV(vector), escapeCSV(payload)].join(','))
    })

    const csvContent = rows.join('\n')
    const dataBlob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export to CSV failed:', error)
    throw error
  }
}

/**
 * 从 JSON 文件导入数据
 * Import data from JSON file
 */
export async function importFromJSON(file: File): Promise<Point[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)

        // 验证数据格式
        // Validate data format
        if (!Array.isArray(data)) {
          reject(new Error('JSON 数据必须是数组格式 / JSON data must be an array'))
          return
        }

        // 验证每个点的格式
        // Validate each point format
        const points: Point[] = []
        for (let i = 0; i < data.length; i++) {
          const item = data[i]
          if (!item || typeof item !== 'object') {
            reject(new Error(`第 ${i + 1} 行数据格式无效 / Row ${i + 1} data format is invalid`))
            return
          }

          // 验证必需字段
          // Validate required fields
          if (item.id === undefined || item.id === null || item.id === '') {
            reject(new Error(`第 ${i + 1} 行缺少 ID 字段 / Row ${i + 1} missing ID field`))
            return
          }

          // 验证向量格式
          // Validate vector format
          if (item.vector !== undefined && !Array.isArray(item.vector)) {
            reject(new Error(`第 ${i + 1} 行向量格式无效 / Row ${i + 1} vector format is invalid`))
            return
          }

          points.push({
            id: item.id,
            vector: item.vector || [],
            payload: item.payload || {}
          })
        }

        resolve(points)
      } catch (error) {
        reject(new Error(`JSON 解析失败: ${error instanceof Error ? error.message : String(error)}`))
      }
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败 / File read failed'))
    }
    reader.readAsText(file)
  })
}

/**
 * 从 CSV 文件导入数据
 * Import data from CSV file
 */
export async function importFromCSV(file: File): Promise<Point[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter((line) => line.trim())

        if (lines.length < 2) {
          reject(new Error('CSV 文件至少需要包含标题行和一行数据 / CSV file must contain at least header row and one data row'))
          return
        }

        // 解析 CSV（简单实现，不支持引号内的逗号）
        // Parse CSV (simple implementation, doesn't support commas in quotes)
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = []
          let current = ''
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim())
              current = ''
            } else {
              current += char
            }
          }
          result.push(current.trim())
          return result
        }

        const headers = parseCSVLine(lines[0])
        const idIndex = headers.findIndex((h) => h.toLowerCase() === 'id')
        const vectorIndex = headers.findIndex((h) => h.toLowerCase() === 'vector')
        const payloadIndex = headers.findIndex((h) => h.toLowerCase() === 'payload')

        if (idIndex === -1) {
          reject(new Error('CSV 文件必须包含 ID 列 / CSV file must contain ID column'))
          return
        }

        const points: Point[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i])
          const id = values[idIndex]?.trim()

          if (!id) {
            reject(new Error(`第 ${i + 1} 行缺少 ID 值 / Row ${i + 1} missing ID value`))
            return
          }

          let vector: number[] = []
          if (vectorIndex !== -1 && values[vectorIndex]) {
            try {
              const vectorStr = values[vectorIndex].replace(/^"|"$/g, '') // 移除引号
              vector = JSON.parse(vectorStr)
              if (!Array.isArray(vector)) {
                throw new Error('Vector is not an array')
              }
            } catch (error) {
              reject(new Error(`第 ${i + 1} 行向量格式无效 / Row ${i + 1} vector format is invalid`))
              return
            }
          }

          let payload: any = {}
          if (payloadIndex !== -1 && values[payloadIndex]) {
            try {
              const payloadStr = values[payloadIndex].replace(/^"|"$/g, '') // 移除引号
              payload = JSON.parse(payloadStr)
            } catch (error) {
              // 如果解析失败，使用空对象
              // If parsing fails, use empty object
              payload = {}
            }
          }

          // 尝试将 ID 转换为数字（如果是数字字符串）
          // Try to convert ID to number (if it's a numeric string)
          let pointId: string | number = id
          if (/^\d+$/.test(id)) {
            pointId = Number(id)
          }

          points.push({
            id: pointId,
            vector,
            payload
          })
        }

        resolve(points)
      } catch (error) {
        reject(new Error(`CSV 解析失败: ${error instanceof Error ? error.message : String(error)}`))
      }
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败 / File read failed'))
    }
    reader.readAsText(file, 'utf-8')
  })
}

/**
 * 根据文件扩展名选择导入函数
 * Select import function based on file extension
 */
export async function importFromFile(file: File): Promise<Point[]> {
  const fileName = file.name.toLowerCase()
  if (fileName.endsWith('.json')) {
    return importFromJSON(file)
  } else if (fileName.endsWith('.csv')) {
    return importFromCSV(file)
  } else {
    throw new Error('不支持的文件格式，请选择 JSON 或 CSV 文件 / Unsupported file format, please select JSON or CSV file')
  }
}
