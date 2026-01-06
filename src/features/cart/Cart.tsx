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
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [discountCode, setDiscountCode] = useState('')
  const discountPercent = discountCode.trim().toUpperCase() === 'SALE10' ? 10 : 0
  const subtotal = calculateSubtotal(items)
  const discounted = applyDiscount(subtotal, discountPercent)
  const tax = calculateTax(discounted, TAX_RATE) - discounted
  const total = calculateTotal(items, discountPercent, TAX_RATE)

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return
    setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

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
            <input
              type="number"
              min={1}
              className="cart-item-qty"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
            />
            <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
            <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
              Xóa
            </button>
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
        <p>Tạm tính: {subtotal.toLocaleString('vi-VN')}đ</p>
        <p>Giảm giá: {discountPercent}%</p>
        <p>Thuế: {tax.toLocaleString('vi-VN')}đ</p>
        <p className="cart-total">Tổng cộng: {total.toLocaleString('vi-VN')}đ</p>
      </div>
    </section>
  )
}

export default Cart
