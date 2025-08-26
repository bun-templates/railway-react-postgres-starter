import { sql } from "bun";

// Todo type definition
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

// Create todos table
export async function createTodosTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Check if any todos exist
  const existingTodos = await sql`SELECT COUNT(*) as count FROM todos`;
  
  // If no todos exist, create the default one
  if (existingTodos[0].count === 0) {
    await sql`
      INSERT INTO todos (title)
      VALUES ('Deploy Bun to Railway')
    `;
  }
}

// Get all todos
export async function getAllTodos(): Promise<Todo[]> {
  return await sql`
    SELECT * FROM todos 
    ORDER BY created_at DESC
  `;
}

// Create a new todo
export async function createTodo(title: string): Promise<Todo> {
  const [todo] = await sql`
    INSERT INTO todos (title)
    VALUES (${title})
    RETURNING *
  `;
  return todo;
}

// Toggle todo completion status
export async function toggleTodoComplete(id: number): Promise<Todo | null> {
  const [todo] = await sql`
    UPDATE todos 
    SET completed = NOT completed,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return todo || null;
}

// Delete a todo
export async function deleteTodo(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM todos 
    WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}

// Get todo statistics
export async function getTodoStats() {
  const [stats] = await sql`
    SELECT 
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE completed = true)::int as completed,
      COUNT(*) FILTER (WHERE completed = false)::int as pending
    FROM todos
  `;
  return {
    total: Number(stats.total),
    completed: Number(stats.completed),
    pending: Number(stats.pending)
  };
}