const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // Use mysql2 with promises
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "123",
    database: "crud"
});

// Test database connection
db.getConnection()
    .then(() => console.log("Successfully connected to the database."))
    .catch(err => console.error("Failed to connect to the database:", err));

// Middleware for authentication
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const [results] = await db.query("SELECT status FROM users WHERE id = ?", [decoded.id]);

        if (results.length === 0) return res.sendStatus(404);
        if (results[0].status === 'blocked' || results[0].status === 'deleted') {
            return res.sendStatus(403);
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.sendStatus(err.name === 'JsonWebTokenError' ? 403 : 500);
    }
};

// Define your routes...

app.listen(8081, () => {
    console.log("Server listening on port 8081");
});
