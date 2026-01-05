import { useState } from 'react'
import './Cart.css'
import { calculateSubtotal, applyDiscount, type CartItem } from './cartLogic'

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

  return (
    <section className="cart">
      <h2>Giỏ hàng</h2>
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id} className="cart-item">
            <span className="cart-item-name">{item.name}</span>
            <span>{item.quantity}</span>
            <span>{item.price * item.quantity}đ</span>
          </li>
        ))}
      </ul>
      <div className="cart-discount">
        <input
          type="text"
          placeholder="Mã giảm giá"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
      </div>
      <p>Tạm tính: {subtotal}đ</p>
      <p>Sau giảm giá: {discounted}đ</p>
    </section>
  )
}

export default Cart
