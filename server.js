const { version } = require("./version");

const client = require("prom-client");
const register = new client.Registry();

// métricas por defecto (CPU, memoria, etc.)
client.collectDefaultMetrics({ register });

// contador de requests
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total requests",
  registers: [register]
});

const express = require("express");
const app = express();

app.use(express.json());

// 🔹 LOGIN
app.post("/login", (req, res) => {
  httpRequestCounter.inc(); // 👈 métrica

  const { user, pass } = req.body;

  if (user === "admin" && pass === "1234") {
    return res.json({ message: "Login correcto" });
  }

  res.status(401).json({ message: "Credenciales incorrectas" });
});

// 🔹 FORMULARIO
app.post("/form", (req, res) => {
  httpRequestCounter.inc(); // 👈 métrica

  const { nombre, producto } = req.body;

  if (!nombre || !producto) {
    return res.status(400).json({ message: "Campos incompletos" });
  }

  res.json({
    message: "Formulario recibido",
    data: { nombre, producto }
  });
});

// 🔹 HOME
app.get("/", (req, res) => {
  httpRequestCounter.inc(); // 👈 métrica

  res.send(`App funcionando - Versión ${version}`);
});

// 🔹 METRICS (Prometheus)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});