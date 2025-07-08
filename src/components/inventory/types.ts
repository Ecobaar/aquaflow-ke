
export interface InventoryItem {
  id: string
  item_name: string
  quantity: number
  unit: string
  date: string
  created_at: string
}

export interface DailyInventorySummary {
  date: string
  opening_stock: any
  received_stock: any
  sales_stock: any
  closing_stock: any
}
