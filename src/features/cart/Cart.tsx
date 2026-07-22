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

  // Ghi chú demo: tổng "đúng" tính độc lập theo công thức chuẩn subtotal -> discount -> tax,
  // để so sánh trực quan với `total` (kết quả thật của calculateTotal) mà không cần tính nhẩm.
  const expectedTotal = Math.round((discounted + tax) * 100) / 100
  const bugDelta = Math.round((total - expectedTotal) * 100) / 100

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

        {bugDelta !== 0 && (
          <div className="cart-debug-note">
            <p className="cart-debug-title">🐛 Ghi chú demo (chỉ để dò bug, không phải UI thật)</p>
            <p>Tổng đúng theo công thức chuẩn (subtotal → discount → tax): {formatMoney(expectedTotal)}</p>
            <p>Tổng đang hiển thị (calculateTotal thực tế): {formatMoney(total)}</p>
            <p>Chênh lệch: {formatMoney(bugDelta)}</p>
            <p className="cart-debug-reason">
              Nguyên nhân: <code>calculateTotal</code> đang tính thuế trên <em>subtotal gốc</em> rồi mới trừ
              thẳng số tiền giảm giá (chưa gồm thuế), thay vì trừ giảm giá trước rồi mới tính thuế trên phần
              đã giảm. Hai cách này chỉ ra kết quả giống nhau khi discount hoặc tax bằng 0.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Cart
