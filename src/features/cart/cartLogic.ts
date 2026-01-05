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
