import { describe, it, expect } from 'vitest'
import {
  calculateSubtotal,
  applyDiscount,
  calculateTax,
  calculateTotal,
  type CartItem,
} from './cartLogic'

const items: CartItem[] = [
  { id: 1, name: 'Áo thun', price: 150000, quantity: 2 },
  { id: 2, name: 'Quần jeans', price: 350000, quantity: 1 },
]

describe('cartLogic', () => {
  it('calculateSubtotal tính đúng tổng tiền hàng', () => {
    expect(calculateSubtotal(items)).toBe(650000)
  })

  it('applyDiscount trừ đúng % giảm giá', () => {
    expect(applyDiscount(650000, 10)).toBe(585000)
  })

})
