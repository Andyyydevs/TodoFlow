import express from 'express';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

// Reigster a new user /auth/register
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Encrypt Password
    const hashedPassword = bcrypt.hashSync(password, 8);
    try {
        const insertUser = db.prepare(`
            INSERT INTO users (username, password) 
            VALUES (?, ?)
        `);
        const result = insertUser.run(username, hashedPassword);

        const defaultTODO = 'Hello! Add your first todo!';
        const insertTODO = db.prepare(`
            INSERT INTO todos (user_id, task)
            VALUES (?, ?)
        `);
        insertTODO.run(result.lastInsertRowid, defaultTODO);

        //Create JWT Token
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });

    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
        return;
    }
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`);
        const user = getUser.get(username);
        if (!user) return res.status(404).send({ message: 'User Not Found' });

        // Check is password is valid
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).send({ message: 'Invalid Password' });

        // Create JWT Token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });

    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
        return;
    }

});

export default router;