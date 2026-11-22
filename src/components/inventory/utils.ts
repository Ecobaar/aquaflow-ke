export const parseStockInput = (value: string): Record<string, number> => {
  if (!value.trim()) return {}
  const parsed = JSON.parse(value)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid stock data')
  }
  return Object.fromEntries(
    Object.entries(parsed).map(([key, qty]) => [key, Number(qty) || 0])
  )
}
