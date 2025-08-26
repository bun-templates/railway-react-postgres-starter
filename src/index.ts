import index from "./index.html";
import {
  createTodosTable,
  getAllTodos,
  createTodo,
  toggleTodoComplete,
  deleteTodo,
  getTodoStats,
} from "../db";

// Initialize database on startup
await createTodosTable();

const server = Bun.serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Todo API endpoints
    "/api/todos": {
      async GET() {
        try {
          const todos = await getAllTodos();
          return Response.json(todos);
        } catch (error) {
          console.error("Error fetching todos:", error);
          return Response.json({ error: "Failed to fetch todos" }, { status: 500 });
        }
      },
      async POST(req) {
        try {
          const { title } = await req.json();
          if (!title || typeof title !== "string") {
            return Response.json({ error: "Title is required" }, { status: 400 });
          }
          const todo = await createTodo(title);
          return Response.json(todo, { status: 201 });
        } catch (error) {
          console.error("Error creating todo:", error);
          return Response.json({ error: "Failed to create todo" }, { status: 500 });
        }
      },
    },

    "/api/todos/:id": {
      async PUT(req) {
        try {
          const id = parseInt(req.params.id);
          if (isNaN(id)) {
            return Response.json({ error: "Invalid todo ID" }, { status: 400 });
          }
          const todo = await toggleTodoComplete(id);
          if (!todo) {
            return Response.json({ error: "Todo not found" }, { status: 404 });
          }
          return Response.json(todo);
        } catch (error) {
          console.error("Error updating todo:", error);
          return Response.json({ error: "Failed to update todo" }, { status: 500 });
        }
      },
      async DELETE(req) {
        try {
          const id = parseInt(req.params.id);
          if (isNaN(id)) {
            return Response.json({ error: "Invalid todo ID" }, { status: 400 });
          }
          const success = await deleteTodo(id);
          if (!success) {
            return Response.json({ error: "Todo not found" }, { status: 404 });
          }
          return new Response(null, { status: 204 });
        } catch (error) {
          console.error("Error deleting todo:", error);
          return Response.json({ error: "Failed to delete todo" }, { status: 500 });
        }
      },
    },

    "/api/todos/stats": async () => {
      try {
        const stats = await getTodoStats();
        return Response.json(stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
        return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
