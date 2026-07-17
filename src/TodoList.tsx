import { useState } from 'react'
import './TodoList.css'

interface Todo {
  id: number
  text: string
  done: boolean
}

const initialTodos: Todo[] = [
  { id: 1, text: 'Học React', done: true },
  { id: 2, text: 'Làm CRUD Todo List', done: false },
  { id: 3, text: 'Uống nước', done: false },
]

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  // Create
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    const nextId = todos.length ? Math.max(...todos.map((t) => t.id)) + 1 : 1
    setTodos([...todos, { id: nextId, text, done: false }])
    setInput('')
  }

  // Update (toggle done)
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }

  // Delete
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((t) => t.id !== id))
  }

  // Update (edit text)
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  const saveEdit = (id: number) => {
    const text = editingText.trim()
    if (text) {
      setTodos(todos.map((t) => (t.id === id ? { ...t, text } : t)))
    }
    setEditingId(null)
    setEditingText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const remaining = todos.filter((t) => !t.done).length

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
