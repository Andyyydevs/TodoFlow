import express from 'express';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

// Get all todos
router.get('/', (req, res) => {
    const getTodos = db.prepare(`SELECT * FROM todos WHERE user_id = ?`)
    const todos = getTodos.all(req.userid);
    res.json(todos);
});

// Create a new todo
router.post('/', (req, res) => {
    const { task } = req.body;
    const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`);
    const result = insertTodo.run(req.userid, task);

    res.json({ id: result.lastInsertRowid, task, completed: 0 });
});

// Update a todo
router.put('/:id', (req, res) => {
    const { completed } = req.body;
    const { id } = req.params;
    const userid = req.userid;

    const updatedTodo = db.prepare(`UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?`);
    updatedTodo.run(completed, id, userid)
    res.json({ message: 'Todo Updated Successfully' });
});

// Delete a todo
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const userid = req.userid;

    const deleteTodo = db.prepare(`DELETE FROM todos WHERE id = ? AND user_id = ?`);
    deleteTodo.run(id, req.userid)
    res.json({ message: 'Todo Deleted Successfully' });

});

export default router;