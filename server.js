const mysql = require("mysql2");
const path = require("path");
const version = process.env.APP_VERSION 

const client = require("prom-client");
const register = new client.Registry();

// 🔥 MYSQL POOL (estable)
const db = mysql.createPool({
  host: "mysql",
  user: "root",
  password: "root",
  database: "appdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🔥 ESPERA REAL A MYSQL + CREACIÓN DE TABLA
function initDB(retries = 15) {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.log("⏳ Esperando MySQL...");
      if (retries > 0) {
        return setTimeout(() => initDB(retries - 1), 3000);
      } else {
        return console.error("❌ MySQL no respondió");
      }
    }

    console.log("✅ MySQL listo");

    db.query(`
      CREATE TABLE IF NOT EXISTS registros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        producto VARCHAR(100)
      )
    `, (err) => {
      if (err) {
        console.error("❌ Error creando tabla:", err);
      } else {
        console.log("✅ Tabla lista");
      }
    });
  });
}

initDB();

// 🔹 MÉTRICAS
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total requests",
  registers: [register]
});

// 🔹 EXPRESS
const express = require("express");
const app = express();

app.use(express.json());

// 🔹 FRONT
app.get("/", (req, res) => {
  httpRequestCounter.inc();
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔹 LOGIN
app.post("/login", (req, res) => {
  httpRequestCounter.inc();

  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ message: "Campos requeridos" });
  }

  if (user === "admin" && pass === "1234") {
    return res.json({ message: "Login correcto" });
  }

  res.status(401).json({ message: "Credenciales incorrectas" });
});

// 🔹 FORMULARIO
app.post("/form", (req, res) => {
  httpRequestCounter.inc();

  const { nombre, producto } = req.body;

  if (!nombre || !producto) {
    return res.status(400).json({ message: "Campos incompletos" });
  }

  db.query(
    "INSERT INTO registros (nombre, producto) VALUES (?, ?)",
    [nombre, producto],
    (err) => {
      if (err) {
        console.error("❌ ERROR MYSQL INSERT:", err);
        return res.status(500).json({
          message: "Error al guardar",
          error: err.message
        });
      }

      res.json({
        message: "Guardado en MySQL",
        data: { nombre, producto }
      });
    }
  );
});

// 🔹 OBTENER REGISTROS
app.get("/registros", (req, res) => {
  httpRequestCounter.inc();

  db.query("SELECT * FROM registros", (err, results) => {
    if (err) {
      console.error("❌ ERROR SELECT:", err);
      return res.json([]); // nunca rompe el front
    }

    res.json(results || []);
  });
});

// 🔹 VERSION
app.get("/version", (req, res) => {
  httpRequestCounter.inc();
  res.send(`Versión: ${version}`);
});

// 🔹 METRICS
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// 🔹 SERVER
app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});