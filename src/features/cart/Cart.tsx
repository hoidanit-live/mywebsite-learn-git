import { useState } from 'react'
import './Cart.css'
import {
  calculateSubtotal,
  applyDiscount,
  calculateTax,
  calculateTotal,
  type CartItem,
} from './cartLogic'

const TAX_RATE = 8

const initialItems: CartItem[] = [
  { id: 1, name: 'Áo thun', price: 150000, quantity: 2 },
  { id: 2, name: 'Quần jeans', price: 350000, quantity: 1 },
]

function Cart() {
  const [items] = useState<CartItem[]>(initialItems)
  const [discountCode, setDiscountCode] = useState('')
  const discountPercent = discountCode.trim().toUpperCase() === 'SALE10' ? 10 : 0
  const subtotal = calculateSubtotal(items)
  const discounted = applyDiscount(subtotal, discountPercent)
  const tax = calculateTax(discounted, TAX_RATE) - discounted
  const total = calculateTotal(items, discountPercent, TAX_RATE)

  return (
    <section className="cart">
      <h2>Giỏ hàng</h2>
      {items.length === 0 ? (
        <p className="cart-empty">Giỏ hàng trống.</p>
      ) : (
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id} className="cart-item">
            <span className="cart-item-name">{item.name}</span>
            <span>{item.quantity}</span>
            <span>{item.price * item.quantity}đ</span>
          </li>
        ))}
      </ul>
      )}
      <div className="cart-discount">
        <input
          type="text"
          placeholder="Mã giảm giá"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
      </div>
      <div className="cart-summary">
        <p>Tạm tính: {subtotal}đ</p>
        <p>Giảm giá: {discountPercent}%</p>
        <p>Thuế: {tax}đ</p>
        <p className="cart-total">Tổng cộng: {total}đ</p>
      </div>
    </section>
  )
}

export default Cart
