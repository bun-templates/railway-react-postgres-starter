import type React from "react"
import { useState, useEffect, useCallback,useRef } from "react"
import { Plus, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import bunLogo from "@/assets/logo.svg"

interface Todo {
  id: number
  title: string
  description?: string
  completed: boolean
  created_at: string
  updated_at: string
}

interface TodoWithAnimation extends Todo {
  isExiting?: boolean
}

interface TodoStats {
  total: number
  completed: number
  pending: number
}

export default function TodoApp() {
  const [todos, setTodos] = useState<TodoWithAnimation[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TodoStats | null>(null)

  // Fetch todos from API
  const loadTodos = useCallback(async () => {
    try {
      setError(null)
      const [todosRes, statsRes] = await Promise.all([
        fetch("/api/todos"),
        fetch("/api/todos/stats")
      ])

      if (!todosRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const todosData = await todosRes.json()
      const statsData = await statsRes.json()
      
      setTodos(todosData)
      setStats(statsData)
    } catch (err) {
      setError("Failed to load todos. Please try again.")
      console.error("Error loading todos:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  const addTodo = async () => {
    if (!inputValue.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: inputValue.trim() })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create todo")
      }

      const newTodo = await res.json()
      setTodos(prevTodos => [newTodo, ...prevTodos])
      setInputValue("")
      
      // Fetch fresh stats from server
      const statsRes = await fetch("/api/todos/stats")
      if (statsRes.ok) {
        const freshStats = await statsRes.json()
        setStats(freshStats)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add todo")
      console.error("Error adding todo:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTodo = async (id: number) => {
    setError(null)
    
    // Optimistic update
    const originalTodos = [...todos]
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))

    try {
      const res = await fetch(`/api/todos/${id}`, { method: "PUT" })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update todo")
      }

      const updatedTodo = await res.json()
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ))
      
      // Fetch fresh stats from server
      const statsRes = await fetch("/api/todos/stats")
      if (statsRes.ok) {
        const freshStats = await statsRes.json()
        setStats(freshStats)
      }
    } catch (err) {
      // Revert on error
      setTodos(originalTodos)
      setError(err instanceof Error ? err.message : "Failed to update todo")
      console.error("Error toggling todo:", err)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    setError(null)
    
    // Mark as exiting first for animation
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, isExiting: true } : todo
    ))

    // Remove after animation
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/todos/${id}`, { method: "DELETE" })
        
        if (!res.ok && res.status !== 204) {
          const error = await res.json()
          throw new Error(error.error || "Failed to delete todo")
        }

        setTodos(todos.filter(todo => todo.id !== id))
        
        // Fetch fresh stats from server
        const statsRes = await fetch("/api/todos/stats")
        if (statsRes.ok) {
          const freshStats = await statsRes.json()
          setStats(freshStats)
        }
      } catch (err) {
        // Revert animation on error
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, isExiting: false } : todo
        ))
        setError(err instanceof Error ? err.message : "Failed to delete todo")
        console.error("Error deleting todo:", err)
      }
    }, 200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 flex items-center justify-center overflow-hidden">
      <Card className="w-full max-w-md p-6 bg-zinc-900 border-zinc-800">
        <div className="space-y-6">
          <div className="text-center flex flex-col items-center w-full">
            <img src={bunLogo} className="h-10 w-10" alt="Bun Logo" />
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-wide">Bun Todo</h1>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              disabled={isSubmitting}
              className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600"
            />
            <Button 
              onClick={addTodo} 
              size="icon" 
              disabled={isSubmitting}
              className="bg-zinc-700 hover:bg-zinc-600"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Todo List */}
          <div className="space-y-2 max-h-96 overflow-y-auto overscroll-contain">
            {todos.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p className="text-sm">No tasks yet</p>
                <p className="text-xs mt-1">Add one above to get started</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 transform ${
                    todo.isExiting
                      ? "opacity-0 scale-95 translate-x-4"
                      : "opacity-100 scale-100 translate-x-0 animate-in slide-in-from-left-2 fade-in duration-300"
                  } ${
                    todo.completed
                      ? "bg-zinc-800/50 border-zinc-700"
                      : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTodo(todo.id)}
                    className={`h-5 w-5 rounded-full border-2 transition-all ${
                      todo.completed
                        ? "bg-zinc-600 border-zinc-600 text-white hover:bg-zinc-500"
                        : "border-zinc-600 hover:border-zinc-500"
                    }`}
                  >
                    {todo.completed && <Check className="h-3 w-3" />}
                  </Button>

                  <div className="flex-1">
                    <span
                      className={`block transition-all ${
                        todo.completed ? "text-zinc-500 line-through" : "text-zinc-100"
                      }`}
                    >
                      {todo.title}
                    </span>
                    {todo.description && (
                      <span className="text-xs text-zinc-500 mt-1 block">
                        {todo.description}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {stats && stats.total > 0 && (
            <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-800">
              {stats.pending} of {stats.total} remaining
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}