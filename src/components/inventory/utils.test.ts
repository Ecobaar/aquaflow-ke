import { describe, expect, it } from 'vitest'
import { parseStockInput } from './utils'

describe('parseStockInput', () => {
  it('returns an empty object for blank input', () => {
    expect(parseStockInput('  ')).toEqual({})
  })

  it('parses numeric stock values', () => {
    expect(parseStockInput('{"20L": 5, "10L": "3"}')).toEqual({ '20L': 5, '10L': 3 })
  })

  it('coerces non-numeric values to 0', () => {
    expect(parseStockInput('{"20L": "abc"}')).toEqual({ '20L': 0 })
  })

  it('rejects invalid JSON and non-object values', () => {
    expect(() => parseStockInput('{bad')).toThrow()
    expect(() => parseStockInput('[1, 2]')).toThrow()
    expect(() => parseStockInput('5')).toThrow()
  })
})
