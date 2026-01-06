import { useState } from 'react'
import './TodoList.css'

interface Todo {
  id: number
  text: string
  done: boolean
  priority: 'high' | 'normal'
}

const initialTodos: Todo[] = [
  { id: 1, text: 'Học React', done: true, priority: 'normal' },
  { id: 2, text: 'Làm CRUD Todo List', done: false, priority: 'high' },
  { id: 3, text: 'Uống nước', done: false, priority: 'normal' },
]

// note: sắp xếp lại import #48
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  // Create
  const MAX_TEXT_LENGTH = 50
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    if (text.length > MAX_TEXT_LENGTH) {
      alert(`Công việc không được vượt quá ${MAX_TEXT_LENGTH} ký tự!`)
      return
    }
    const nextId = todos.length + 1
    setTodos([...todos, { id: nextId, text, done: false, priority: 'normal' }])
    setInput('')
  }

  // Update (toggle done)
  const toggleTodo = (id: number) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      todo.done = !todo.done
    }
    setTodos(todos)
  }

  // Delete
  const deleteTodo = (id: number) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa công việc này?')
    if (!confirmed) return
    setTodos(todos.filter((t) => t.id !== id))
  }

  // Update (edit text)
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  const saveEdit = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: editingText } : t)))
    setEditingId(null)
    setEditingText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const remaining = todos.filter((t) => !t.done && t.priority === 'high').length

  return (
    <section className="todo-app">
      <h1>Todo List</h1>

      <form className="todo-form" onSubmit={addTodo}>
        <input
          type="text"
          className="todo-input"
          placeholder="Thêm công việc mới..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="todo-add-btn">
          Thêm
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="todo-empty">Chưa có công việc nào.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.done ? 'done' : ''}`}>
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    className="todo-edit-input"
                    value={editingText}
                    autoFocus
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(todo.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <button className="todo-btn save" onClick={() => saveEdit(todo.id)}>
                    Lưu
                  </button>
                  <button className="todo-btn cancel" onClick={cancelEdit}>
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <label className="todo-label">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <span>{todo.text}</span>
                  </label>
                  <button className="todo-btn edit" onClick={() => startEdit(todo)}>
                    Sửa
                  </button>
                  <button className="todo-btn delete" onClick={() => deleteTodo(todo.id)}>
                    Xóa
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <p className="todo-summary">
          Còn {remaining}/{todos.length} việc chưa xong
        </p>
      )}
    </section>
  )
}

export default TodoList
