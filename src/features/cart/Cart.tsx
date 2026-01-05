import { useState } from 'react'
import './Cart.css'
import { calculateSubtotal, type CartItem } from './cartLogic'

const initialItems: CartItem[] = [
  { id: 1, name: 'Áo thun', price: 150000, quantity: 2 },
  { id: 2, name: 'Quần jeans', price: 350000, quantity: 1 },
]

function Cart() {
  const [items] = useState<CartItem[]>(initialItems)
  const subtotal = calculateSubtotal(items)

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
      <p>Tạm tính: {subtotal}đ</p>
    </section>
  )
}

export default Cart
