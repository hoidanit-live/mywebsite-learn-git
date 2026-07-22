// Script dùng 1 lần để sinh lịch sử demo cho `git bisect run`.
// Tạo 99 commit (27 commit xây tính năng giỏ hàng "Cart" + 1 bug ẩn trong đó,
// và 72 commit filler chỉnh sửa nhỏ các file khác) nối tiếp sau commit setup vitest.
import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function write(relPath, content) {
  const full = path.join(root, relPath)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, content, 'utf8')
}

let commitCount = 0
let commitDate = new Date('2026-01-05T09:00:00')

function commit(message) {
  commitDate = new Date(commitDate.getTime() + 27 * 60 * 1000) // +27 phút mỗi commit
  const iso = commitDate.toISOString()
  // Loại trừ thư mục scripts/ (chứa chính script này) khỏi mọi commit demo.
  execSync('git add -A -- . ":!scripts"', { cwd: root })
  execSync(`git commit -m "${message}" --date="${iso}"`, {
    cwd: root,
    env: { ...process.env, GIT_AUTHOR_DATE: iso, GIT_COMMITTER_DATE: iso },
  })
  commitCount++
  const sha = execSync('git rev-parse HEAD', { cwd: root }).toString().trim()
  return sha
}

// ---------- Nội dung file lũy tiến cho tính năng Cart ----------

const cartLogicSteps = {
  types: `export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}
`,
  subtotal: (prev) => prev + `
/** Tính tổng tiền hàng (chưa gồm giảm giá, thuế). */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
`,
  discount: (prev) => prev + `
/** Áp dụng % giảm giá lên một số tiền, trả về số tiền sau giảm giá. */
export function applyDiscount(amount: number, discountPercent: number): number {
  return amount * (1 - discountPercent / 100)
}
`,
  tax: (prev) => prev + `
/** Áp dụng % thuế lên một số tiền, trả về số tiền sau thuế. */
export function calculateTax(amount: number, taxRate: number): number {
  return amount * (1 + taxRate / 100)
}
`,
  totalGood: (prev) => prev + `
/** Tính tổng tiền cuối cùng: giảm giá áp dụng trên subtotal, thuế áp dụng trên phần đã giảm giá. */
export function calculateTotal(
  items: CartItem[],
  discountPercent: number,
  taxRate: number
): number {
  const subtotal = calculateSubtotal(items)
  const discounted = applyDiscount(subtotal, discountPercent)
  const total = calculateTax(discounted, taxRate)
  return Math.round(total * 100) / 100
}
`,
  docs: (prev) =>
    prev
      .replace(
        '/** Tính tổng tiền hàng (chưa gồm giảm giá, thuế). */',
        '/**\n * Tính tổng tiền hàng (chưa gồm giảm giá, thuế).\n * @param items danh sách sản phẩm trong giỏ\n */'
      )
      .replace(
        '/** Áp dụng % giảm giá lên một số tiền, trả về số tiền sau giảm giá. */',
        '/**\n * Áp dụng % giảm giá lên một số tiền.\n * @returns số tiền sau khi đã trừ giảm giá\n */'
      ),
}

function cartLogicTotalBug(prevContent) {
  return prevContent.replace(
    `export function calculateTotal(
  items: CartItem[],
  discountPercent: number,
  taxRate: number
): number {
  const subtotal = calculateSubtotal(items)
  const discounted = applyDiscount(subtotal, discountPercent)
  const total = calculateTax(discounted, taxRate)
  return Math.round(total * 100) / 100
}`,
    `export function calculateTotal(
  items: CartItem[],
  discountPercent: number,
  taxRate: number
): number {
  const subtotal = calculateSubtotal(items)
  const taxedSubtotal = calculateTax(subtotal, taxRate)
  const discountAmount = subtotal * (discountPercent / 100)
  const total = taxedSubtotal - discountAmount
  return Math.round(total * 100) / 100
}`
  )
}

const testFileBase = `import { describe, it, expect } from 'vitest'
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
%TESTS%
})
`

const testCases = {
  subtotal: `  it('calculateSubtotal tính đúng tổng tiền hàng', () => {
    expect(calculateSubtotal(items)).toBe(650000)
  })
`,
  discount: `  it('applyDiscount trừ đúng % giảm giá', () => {
    expect(applyDiscount(650000, 10)).toBe(585000)
  })
`,
  tax: `  it('calculateTax cộng đúng % thuế', () => {
    expect(calculateTax(585000, 8)).toBeCloseTo(631800, 5)
  })
`,
  total: `  it('calculateTotal: giảm giá áp dụng trước, thuế tính trên phần đã giảm giá', () => {
    expect(calculateTotal(items, 10, 8)).toBeCloseTo(631800, 5)
  })
`,
  emptyCart: `  it('calculateTotal trả về 0 khi giỏ hàng rỗng', () => {
    expect(calculateTotal([], 10, 8)).toBe(0)
  })
`,
}

function buildTestFile(caseKeys) {
  return testFileBase.replace('%TESTS%', caseKeys.map((k) => testCases[k]).join('\n'))
}

const cartCssBase = `.cart {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
`

const cartCssFull = `.cart {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.cart-list {
  list-style: none;
  padding: 0;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.cart-item-name {
  flex: 1;
}

.cart-item-qty {
  width: 48px;
}

.cart-discount {
  margin: 1rem 0;
}

.cart-summary {
  border-top: 1px solid #ddd;
  padding-top: 0.5rem;
}

.cart-total {
  font-weight: bold;
  font-size: 1.1rem;
}

.cart-item-remove {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}
`

// ---------- Filler: các thay đổi nhỏ, thực tế, rải rác toàn repo ----------

const fillerTemplates = [
  { type: 'docs', msg: 'cập nhật ghi chú phát triển' },
  { type: 'chore', msg: 'dọn dẹp code thừa' },
  { type: 'style', msg: 'chỉnh nhỏ giao diện header' },
  { type: 'fix', msg: 'sửa lỗi chính tả' },
  { type: 'chore', msg: 'cập nhật comment cho dễ đọc' },
  { type: 'refactor', msg: 'đổi tên biến cho rõ nghĩa' },
  { type: 'docs', msg: 'thêm ghi chú TODO' },
  { type: 'style', msg: 'chỉnh spacing footer' },
  { type: 'chore', msg: 'cập nhật README' },
  { type: 'fix', msg: 'sửa cảnh báo lint nhỏ' },
  { type: 'style', msg: 'chỉnh màu chữ todo list' },
  { type: 'chore', msg: 'sắp xếp lại import' },
]

function readFile(relPath) {
  return readFileSync(path.join(root, relPath), 'utf8')
}

let fillerCounter = 0
function applyFiller() {
  const template = fillerTemplates[fillerCounter % fillerTemplates.length]
  const targetIdx = fillerCounter % 4
  fillerCounter++

  if (targetIdx === 0) {
    const readmePath = 'README.md'
    const content = existsSync(path.join(root, readmePath)) ? readFile(readmePath) : '# mywebsite\n'
    const marker = '\n## Nhật ký phát triển\n'
    const base = content.includes(marker) ? content : content + marker
    write(readmePath, base + `- #${fillerCounter}: ${template.msg}\n`)
  } else if (targetIdx === 1) {
    const p = 'src/Header.tsx'
    const content = readFile(p)
    if (content.includes('// note:')) {
      write(p, content.replace(/\/\/ note:.*\n/, `// note: ${template.msg} #${fillerCounter}\n`))
    } else {
      write(p, content.replace('function Header() {', `// note: ${template.msg} #${fillerCounter}\nfunction Header() {`))
    }
  } else if (targetIdx === 2) {
    const p = 'src/Footer.tsx'
    const content = readFile(p)
    if (content.includes('// note:')) {
      write(p, content.replace(/\/\/ note:.*\n/, `// note: ${template.msg} #${fillerCounter}\n`))
    } else {
      write(p, content.replace('function Footer() {', `// note: ${template.msg} #${fillerCounter}\nfunction Footer() {`))
    }
  } else {
    const p = 'src/TodoList.tsx'
    const content = readFile(p)
    if (content.includes('// note:')) {
      write(p, content.replace(/\/\/ note:.*\n/, `// note: ${template.msg} #${fillerCounter}\n`))
    } else {
      write(p, content.replace('function TodoList() {', `// note: ${template.msg} #${fillerCounter}\nfunction TodoList() {`))
    }
  }

  return `${template.type}: ${template.msg} #${fillerCounter}`
}

// ---------- Danh sách 27 bước "feature" xây dựng Cart (thứ tự cố định) ----------

let cartLogicContent = ''
let testCaseKeys = []

const featureSteps = [
  {
    msg: 'feat(cart): thêm types cho CartItem',
    run: () => {
      cartLogicContent = cartLogicSteps.types
      write('src/features/cart/cartLogic.ts', cartLogicContent)
    },
  },
  {
    msg: 'feat(cart): thêm hàm calculateSubtotal',
    run: () => {
      cartLogicContent = cartLogicSteps.subtotal(cartLogicContent)
      write('src/features/cart/cartLogic.ts', cartLogicContent)
    },
  },
  {
    msg: 'test(cart): thêm test cho calculateSubtotal',
    run: () => {
      testCaseKeys.push('subtotal')
      write('src/features/cart/cartLogic.test.ts', buildTestFile(testCaseKeys))
    },
  },
  {
    msg: 'feat(cart): thêm hàm applyDiscount',
    run: () => {
      cartLogicContent = cartLogicSteps.discount(cartLogicContent)
      write('src/features/cart/cartLogic.ts', cartLogicContent)
    },
  },
  {
    msg: 'test(cart): thêm test cho applyDiscount',
    run: () => {
      testCaseKeys.push('discount')
      write('src/features/cart/cartLogic.test.ts', buildTestFile(testCaseKeys))
    },
  },
  {
    msg: 'feat(cart): thêm hàm calculateTax',
    run: () => {
      cartLogicContent = cartLogicSteps.tax(cartLogicContent)
      write('src/features/cart/cartLogic.ts', cartLogicContent)
    },
  },
  {
    msg: 'test(cart): thêm test cho calculateTax',
    run: () => {
      testCaseKeys.push('tax')
      write('src/features/cart/cartLogic.test.ts', buildTestFile(testCaseKeys))
    },
  },
  {
    msg: 'feat(cart): thêm hàm calculateTotal tổng hợp subtotal - discount - tax',
    isBaseline: true,
    run: () => {
      cartLogicContent = cartLogicSteps.totalGood(cartLogicContent)
      write('src/features/cart/cartLogic.ts', cartLogicContent)
    },
  },
  {
    msg: 'test(cart): thêm test cho calculateTotal',
    run: () => {
      testCaseKeys.push('total')
      write('src/features/cart/cartLogic.test.ts', buildTestFile(testCaseKeys))
    },
  },
  {
    msg: 'feat(cart): dựng khung component Cart hiển thị danh sách sản phẩm',
    run: () => {
      write('src/features/cart/Cart.css', cartCssBase)
      write(
        'src/features/cart/Cart.tsx',
        `import { useState } from 'react'
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
`
      )
    },
  },
  {
    msg: 'feat(cart): thêm input mã giảm giá vào Cart',
    run: () => {
      const p = 'src/features/cart/Cart.tsx'
      let c = readFile(p)
      c = c.replace(
        "import { calculateSubtotal, type CartItem } from './cartLogic'",
        "import { calculateSubtotal, applyDiscount, type CartItem } from './cartLogic'"
      )
      c = c.replace(
        '  const [items] = useState<CartItem[]>(initialItems)\n  const subtotal = calculateSubtotal(items)',
        `  const [items] = useState<CartItem[]>(initialItems)
  const [discountCode, setDiscountCode] = useState('')
  const discountPercent = discountCode.trim().toUpperCase() === 'SALE10' ? 10 : 0
  const subtotal = calculateSubtotal(items)
  const discounted = applyDiscount(subtotal, discountPercent)`
      )
      c = c.replace(
        '      <p>Tạm tính: {subtotal}đ</p>',
        `      <div className="cart-discount">
        <input
          type="text"
          placeholder="Mã giảm giá"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
      </div>
      <p>Tạm tính: {subtotal}đ</p>
      <p>Sau giảm giá: {discounted}đ</p>`
      )
      write(p, c)
    },
  },
  {
    msg: 'style(cart): thêm CSS cho Cart',
    run: () => {
      write('src/features/cart/Cart.css', cartCssFull)
    },
  },
  {
    msg: 'feat(cart): hiển thị subtotal/discount/tax/total trong Cart',
    run: () => {
      const p = 'src/features/cart/Cart.tsx'
      let c = readFile(p)
      c = c.replace(
        "import { calculateSubtotal, applyDiscount, type CartItem } from './cartLogic'",
        "import {\n  calculateSubtotal,\n  applyDiscount,\n  calculateTax,\n  calculateTotal,\n  type CartItem,\n} from './cartLogic'"
      )
      c = c.replace(
        "const initialItems: CartItem[] = [",
        "const TAX_RATE = 8\n\nconst initialItems: CartItem[] = ["
      )
      c = c.replace(
        '  const discounted = applyDiscount(subtotal, discountPercent)',
        `  const discounted = applyDiscount(subtotal, discountPercent)
  const tax = calculateTax(discounted, TAX_RATE) - discounted
  const total = calculateTotal(items, discountPercent, TAX_RATE)`
      )
      c = c.replace(
        `      <p>Tạm tính: {subtotal}đ</p>
      <p>Sau giảm giá: {discounted}đ</p>`,
        `      <div className="cart-summary">
        <p>Tạm tính: {subtotal}đ</p>
        <p>Giảm giá: {discountPercent}%</p>
        <p>Thuế: {tax}đ</p>
        <p className="cart-total">Tổng cộng: {total}đ</p>
      </div>`
      )
      write(p, c)
    },
  },
  {
    msg: 'feat(app): gắn Cart vào App',
    run: () => {
      write(
        'src/App.tsx',
        `import Header from './Header'
import Footer from './Footer'
import TodoList from './TodoList'
import Cart from './features/cart/Cart'

function App() {
  return (
    <>
      <Header />
      <TodoList />
      <Cart />
      <Footer />
    </>
  )
}

export default App
`
      )
    },
  },
  {
    msg: 'fix(cart): sửa lỗi hiển thị khi giỏ hàng rỗng',
    run: () => {
      const p = 'src/features/cart/Cart.tsx'
      let c = readFile(p)
      c = c.replace(
        `      <ul className="cart-list">
        {items.map((item) => (`,
        `      {items.length === 0 ? (
        <p className="cart-empty">Giỏ hàng trống.</p>
      ) : (
      <ul className="cart-list">
        {items.map((item) => (`
      )
      c = c.replace(
        `        ))}
      </ul>`,
        `        ))}
      </ul>
      )}`
      )
      write(p, c)
    },
  },
  {
    msg: 'feat(cart): thêm chỉnh số lượng sản phẩm trong giỏ',
    run: () => {
      const p = 'src/features/cart/Cart.tsx'
      let c = readFile(p)
      c = c.replace(
        "  const [items] = useState<CartItem[]>(initialItems)",
        "  const [items, setItems] = useState<CartItem[]>(initialItems)"
      )
      c = c.replace(
        "  const total = calculateTotal(items, discountPercent, TAX_RATE)",
        `  const total = calculateTotal(items, discountPercent, TAX_RATE)

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return
    setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }`
      )
      c = c.replace(
        '            <span>{item.quantity}</span>',
        `            <input
              type="number"
              min={1}
              className="cart-item-qty"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
            />`
      )
      write(p, c)
    },
  },
  {
    msg: 'feat(cart): thêm nút xoá sản phẩm khỏi giỏ',
    run: () => {
      const p = 'src/features/cart/Cart.tsx'
      let c = readFile(p)
      c = c.replace(
        `    setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }`,
        `    setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }`
      )
      c = c.replace(
        '            <span>{item.price * item.quantity}đ</span>',
        `            <span>{item.price * item.quantity}đ</span>
            <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
              Xóa
            </button>`
      )
      write(p, c)
    },
  },
  {
    msg: 'style(cart): chỉnh responsive cho Cart',
    run: () => {
      const p = 'src/features/cart/Cart.css'
      let c = readFile(p)
      c += `\n@media (max-width: 480px) {\n  .cart {\n    margin: 1rem;\n  }\n}\n`
      write(p, c)
    },
  },
  {
    msg: 'fix(cart): làm tròn số tiền hiển thị theo định dạng VNĐ',
    run: () => {
      const p = 'src/features/cart/Cart.tsx'
      let c = readFile(p)
      c = c
        .replace('{item.price * item.quantity}đ', "{(item.price * item.quantity).toLocaleString('vi-VN')}đ")
        .replace('{subtotal}đ', "{subtotal.toLocaleString('vi-VN')}đ")
        .replace('{tax}đ', "{tax.toLocaleString('vi-VN')}đ")
        .replace('{total}đ', "{total.toLocaleString('vi-VN')}đ")
      write(p, c)
    },
  },
  {
    msg: 'refactor(cart): tối ưu lại thứ tự tính toán trong calculateTotal',
    isBug: true,
    run: () => {
      cartLogicContent = cartLogicTotalBug(cartLogicContent)
      write('src/features/cart/cartLogic.ts', cartLogicContent)
    },
  },
  {
    msg: 'style(cart): chỉnh màu sắc và spacing cho nút trong Cart',
    run: () => {
      const p = 'src/features/cart/Cart.css'
      let c = readFile(p)
      c = c.replace(
        '.cart-item-remove {\n  background: #f44336;',
        '.cart-item-remove {\n  background: #e53935;\n  font-size: 0.85rem;'
      )
      write(p, c)
    },
  },
  {
    msg: 'feat(cart): thêm empty state rõ ràng hơn khi giỏ hàng trống',
    run: () => {
      const p = 'src/features/cart/Cart.css'
      let c = readFile(p)
      c += `\n.cart-empty {\n  color: #888;\n  font-style: italic;\n}\n`
      write(p, c)
    },
  },
  {
    msg: 'refactor(cart): dọn lại import trong Cart.tsx',
    run: () => {
      const p = 'src/features/cart/Cart.tsx'
      let c = readFile(p)
      c = c.replace(
        `import {
  calculateSubtotal,
  applyDiscount,
  calculateTax,
  calculateTotal,
  type CartItem,
} from './cartLogic'`,
        `import type { CartItem } from './cartLogic'
import { calculateSubtotal, applyDiscount, calculateTax, calculateTotal } from './cartLogic'`
      )
      write(p, c)
    },
  },
  {
    msg: 'docs(cart): thêm JSDoc giải thích các hàm tính tiền',
    run: () => {
      cartLogicContent = cartLogicSteps.docs(cartLogicContent)
      write('src/features/cart/cartLogic.ts', cartLogicContent)
    },
  },
  {
    msg: 'test(cart): thêm test cho trường hợp giỏ hàng rỗng',
    run: () => {
      testCaseKeys.push('emptyCart')
      write('src/features/cart/cartLogic.test.ts', buildTestFile(testCaseKeys))
    },
  },
  {
    msg: 'chore(cart): cập nhật README mô tả tính năng giỏ hàng',
    run: () => {
      const readmePath = 'README.md'
      const content = existsSync(path.join(root, readmePath)) ? readFile(readmePath) : '# mywebsite\n'
      if (!content.includes('## Tính năng')) {
        write(readmePath, content + '\n## Tính năng\n- Giỏ hàng: tính subtotal, giảm giá, thuế và tổng tiền.\n')
      } else {
        write(readmePath, content + '\n')
      }
    },
  },
]

// ---------- Xen kẽ 27 feature step vào 99 slot, phần còn lại là filler ----------

const TOTAL_AFTER_SETUP = 99
const featurePositions = new Set(
  featureSteps.map((_, i) => Math.round(((i + 1) * TOTAL_AFTER_SETUP) / (featureSteps.length + 1)))
)

let featureIdx = 0
let baselineSha = null
let bugSha = null

for (let slot = 1; slot <= TOTAL_AFTER_SETUP; slot++) {
  if (featurePositions.has(slot) && featureIdx < featureSteps.length) {
    const step = featureSteps[featureIdx]
    step.run()
    const sha = commit(step.msg)
    if (step.isBaseline) baselineSha = sha
    if (step.isBug) bugSha = sha
    featureIdx++
  } else {
    const msg = applyFiller()
    commit(msg)
  }
}

while (featureIdx < featureSteps.length) {
  const step = featureSteps[featureIdx]
  step.run()
  const sha = commit(step.msg)
  if (step.isBaseline) baselineSha = sha
  if (step.isBug) bugSha = sha
  featureIdx++
}

const headSha = execSync('git rev-parse HEAD', { cwd: root }).toString().trim()

const summary = `Tổng số commit đã tạo (không tính commit setup vitest): ${commitCount}
Baseline "good" (calculateTotal đúng, ngay trước khi có bug): ${baselineSha}
Bug commit (đã cấy bug vào calculateTotal): ${bugSha}
HEAD hiện tại ("bad"): ${headSha}

Lệnh demo bisect:
  git bisect start
  git bisect bad ${headSha}
  git bisect good ${baselineSha}
  git bisect run npm test
  git bisect reset
`

writeFileSync(path.join(root, 'scripts', 'bisect-demo-notes.txt'), summary, 'utf8')
console.log(summary)
