const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // Use mysql2 with promises
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors()); // Configura CORS
app.use(express.json()); // Para parsear JSON

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "123",
    database: "crud"
});

// Middleware para autenticación
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // No token provided

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // Cambia 'your_jwt_secret' por tu secreto real
        const [results] = await db.query("SELECT status FROM users WHERE id = ?", [decoded.id]);

        if (results.length === 0) return res.sendStatus(404); // Usuario no encontrado
        if (results[0].status === 'blocked' || results[0].status === 'deleted') {
            return res.sendStatus(403); // Usuario bloqueado o eliminado
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.sendStatus(err.name === 'JsonWebTokenError' ? 403 : 500); // Error de token o error del servidor
    }
};

// Ruta para registrar un nuevo usuario
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json("All fields are required");

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
        res.status(201).json("User registered successfully");
    } catch (err) {
        console.error("Error registering the user: ", err);
        res.status(500).json("Error");
    }
});

// Ruta para iniciar sesión
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await db.query("SELECT id, name, password, status FROM users WHERE email = ?", [email]);

        if (results.length === 0) return res.status(401).json("User not found");

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json("Invalid credentials");
        if (user.status === 'blocked') return res.status(403).json("Your account is blocked. Please contact support.");

        await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);
        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' }); // Cambia 'your_jwt_secret' por tu secreto real
        res.json({ token });
    } catch (err) {
        console.error("Error during login query: ", err);
        res.status(500).json("Error");
    }
});

// Ruta para obtener todos los usuarios
app.get("/", authenticateToken, async (req, res) => {
    try {
        const [data] = await db.query("SELECT id, name, email, last_login, registration_time, status FROM users");
        res.json(data);
    } catch (err) {
        console.error("Error querying the database: ", err);
        res.status(500).json("Error");
    }
});

// Ruta para bloquear usuarios
app.post("/block", authenticateToken, async (req, res) => {
    const { ids } = req.body;
    try {
        await db.query("UPDATE users SET status = 'blocked' WHERE id IN (?)", [ids]);
        res.json("Users blocked successfully");
    } catch (err) {
        console.error("Error blocking users: ", err);
        res.status(500).json("Error");
    }
});

// Ruta para desbloquear usuarios
app.post("/unblock", authenticateToken, async (req, res) => {
    const { ids } = req.body;
    try {
        await db.query("UPDATE users SET status = 'active' WHERE id IN (?)", [ids]);
        res.json("Users unblocked successfully");
    } catch (err) {
        console.error("Error unblocking users: ", err);
        res.status(500).json("Error");
    }
});

// Ruta para eliminar usuarios
app.post("/delete", authenticateToken, async (req, res) => {
    const { ids } = req.body;
    try {
        await db.query("DELETE FROM users WHERE id IN (?)", [ids]);
        res.json("Users deleted successfully");
    } catch (err) {
        console.error("Error deleting users: ", err);
        res.status(500).json("Error");
    }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

