import { useState } from 'react'
import './Cart.css'
import type { CartItem } from './cartLogic'
import { calculateSubtotal, applyDiscount, calculateTax, calculateTotal } from './cartLogic'

const TAX_RATE = 8

const initialItems: CartItem[] = [
  { id: 1, name: 'Áo thun', price: 150000, quantity: 2 },
  { id: 2, name: 'Quần jeans', price: 350000, quantity: 1 },
]

function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

function Cart() {
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [discountCode, setDiscountCode] = useState('')
  const discountPercent = discountCode.trim().toUpperCase() === 'SALE10' ? 10 : 0
  const subtotal = calculateSubtotal(items)
  const discounted = applyDiscount(subtotal, discountPercent)
  const discountAmount = subtotal - discounted
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
      <div className="cart-card">
        <h2 className="cart-title">🛒 Giỏ hàng</h2>

        {items.length === 0 ? (
          <p className="cart-empty">Giỏ hàng trống.</p>
        ) : (
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-unit-price">{formatMoney(item.price)} / sản phẩm</span>
                </div>

                <div className="cart-item-actions">
                  <input
                    type="number"
                    min={1}
                    className="cart-item-qty"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                  />
                  <span className="cart-item-price">{formatMoney(item.price * item.quantity)}</span>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Xóa ${item.name}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="cart-discount">
          <input
            type="text"
            className="cart-discount-input"
            placeholder="Nhập mã giảm giá (thử SALE10)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          {discountPercent > 0 && <span className="cart-discount-badge">-{discountPercent}%</span>}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Tạm tính</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Giảm giá</span>
            <span className="cart-summary-discount">
              {discountAmount > 0 ? `-${formatMoney(discountAmount)}` : formatMoney(0)}
            </span>
          </div>
          <div className="cart-summary-row">
            <span>Thuế ({TAX_RATE}%)</span>
            <span>{formatMoney(tax)}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Tổng cộng</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Cart
