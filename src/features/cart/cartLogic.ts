export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

/** Tính tổng tiền hàng (chưa gồm giảm giá, thuế). */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/** Áp dụng % giảm giá lên một số tiền, trả về số tiền sau giảm giá. */
export function applyDiscount(amount: number, discountPercent: number): number {
  return amount * (1 - discountPercent / 100)
}

/** Áp dụng % thuế lên một số tiền, trả về số tiền sau thuế. */
export function calculateTax(amount: number, taxRate: number): number {
  return amount * (1 + taxRate / 100)
}

/** Tính tổng tiền cuối cùng: giảm giá áp dụng trên subtotal, thuế áp dụng trên phần đã giảm giá. */
export function calculateTotal(
  items: CartItem[],
  discountPercent: number,
  taxRate: number
): number {
  const subtotal = calculateSubtotal(items)
  const taxedSubtotal = calculateTax(subtotal, taxRate)
  const discountAmount = subtotal * (discountPercent / 100)
  const total = taxedSubtotal - discountAmount
  return Math.round(total * 100) / 100
}
