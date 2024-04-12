// index.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const TODOS_FILE = 'todos.json';

let todos = [];

// Load todos from file on server start
async function loadTodos() {
  try {
    const data = await fs.readFile(TODOS_FILE, 'utf8');
    todos = JSON.parse(data);
  } catch (err) {
    // If file does not exist or cannot be read, initialize with an empty array
    todos = [];
  }
}

// Save todos to file
async function saveTodos() {
  try {
    await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error('Error saving todos:', err);
  }
}

// Middleware to save todos after each request
app.use((req, res, next) => {
  res.on('finish', saveTodos);
  next();
});

// Load todos from file on server start
loadTodos();

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Get a single todo by ID
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(todo => todo.id === id);
  if (todo) {
    res.json(todo);
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

// Create a new todo
app.post('/todos', (req, res) => {
  const { title, description } = req.body;
  const todo = { id: todos.length + 1, title, description, completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// Update a todo
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, completed } = req.body;
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos[index] = { ...todos[index], title, description, completed };
    res.json(todos[index]);
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
